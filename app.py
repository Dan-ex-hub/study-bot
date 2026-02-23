import os
import uuid
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pymongo import MongoClient
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import bcrypt
from jose import JWTError, jwt

load_dotenv()

# ─── Config ───────────────────────────────────────────────
groq_api_key = os.getenv("GROQ_API_KEY")
mongodb_uri = os.getenv("MONGODB_URI")
SECRET_KEY = os.getenv("JWT_SECRET", "study-bot-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# ─── MongoDB ──────────────────────────────────────────────
client = MongoClient(mongodb_uri)
db = client["Chat"]
chat_collection = db["users"]       # chat messages
accounts_collection = db["accounts"] # user accounts

# ─── FastAPI App ──────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ─── Auth Utilities ───────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = accounts_collection.find_one({"user_id": user_id})
    if user is None:
        raise credentials_exception
    return {"user_id": user["user_id"], "username": user["username"], "email": user["email"]}


# ─── Pydantic Models ─────────────────────────────────────
class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    model: Optional[str] = None


class NewSessionRequest(BaseModel):
    pass


# ─── LLM Setup ───────────────────────────────────────────
DEFAULT_MODEL = "openai/gpt-oss-20b"

def get_llm(model: Optional[str] = None):
    """Get ChatGroq instance with the specified model."""
    model_name = model or DEFAULT_MODEL
    return ChatGroq(api_key=groq_api_key, model=model_name)


def get_chat_history(user_id: str, session_id: str):
    """Get ALL chat history for this user across ALL sessions."""
    chats = chat_collection.find(
        {"user_id": user_id}
    ).sort("timestamp", 1)
    history = []
    for chat in chats:
        history.append((chat["role"], chat["message"]))
    return history


# ─── Routes ──────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "Welcome to the Study Bot API! Use the /chat endpoint to interact with the chatbot."}


# ─── Auth Routes ─────────────────────────────────────────

@app.post("/signup")
def signup(request: SignupRequest):
    # Check if email already exists
    existing = accounts_collection.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Check if username already exists
    existing_username = accounts_collection.find_one({"username": request.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken."
        )

    user_id = str(uuid.uuid4())
    accounts_collection.insert_one({
        "user_id": user_id,
        "username": request.username,
        "email": request.email.lower(),
        "hashed_password": hash_password(request.password),
        "created_at": datetime.utcnow(),
    })

    return {"message": "Account created successfully.", "user_id": user_id}


@app.post("/login")
def login(request: LoginRequest):
    user = accounts_collection.find_one({"email": request.email.lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"user_id": user["user_id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user["user_id"],
        "username": user["username"],
    }


@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "email": current_user["email"],
    }


# ─── Session Routes ──────────────────────────────────────

@app.get("/sessions")
def get_sessions(current_user: dict = Depends(get_current_user)):
    """Get all chat sessions for the current user."""
    user_id = current_user["user_id"]

    # Get distinct session_ids for this user
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$session_id",
            "first_message": {"$first": "$message"},
            "first_role": {"$first": "$role"},
            "created_at": {"$min": "$timestamp"},
            "updated_at": {"$max": "$timestamp"},
            "message_count": {"$sum": 1},
        }},
        {"$sort": {"updated_at": -1}},
    ]

    sessions = list(chat_collection.aggregate(pipeline))
    result = []
    for s in sessions:
        # Use the first user message as the title
        title = s["first_message"][:50] if s["first_role"] == "user" else "New Chat"
        if len(s["first_message"]) > 50:
            title += "..."
        result.append({
            "session_id": s["_id"],
            "title": title,
            "created_at": s["created_at"].isoformat() if s["created_at"] else None,
            "updated_at": s["updated_at"].isoformat() if s["updated_at"] else None,
            "message_count": s["message_count"],
        })

    return {"sessions": result}


@app.get("/sessions/{session_id}/messages")
def get_session_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get all messages for a specific session."""
    user_id = current_user["user_id"]
    messages = list(
        chat_collection.find(
            {"user_id": user_id, "session_id": session_id},
            {"_id": 0, "role": 1, "message": 1, "timestamp": 1}
        ).sort("timestamp", 1)
    )

    result = []
    for msg in messages:
        result.append({
            "role": msg["role"],
            "content": msg["message"],
            "timestamp": msg["timestamp"].isoformat() if msg.get("timestamp") else None,
        })

    return {"messages": result}


@app.delete("/sessions/{session_id}")
def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Delete all messages in a session."""
    user_id = current_user["user_id"]
    result = chat_collection.delete_many({"user_id": user_id, "session_id": session_id})
    return {"deleted_count": result.deleted_count}


# ─── Chat Route (Protected) ──────────────────────────────

@app.post("/chat")
def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    session_id = request.session_id or str(uuid.uuid4())
    model = request.model or DEFAULT_MODEL

    history = get_chat_history(user_id, session_id)

    system_message = (
        "You are an AI-powered study chatbot that helps users with study topics and your name is StudyBot. "
        "You do not answer questions unrelated to studying except for greetings and "
        "questions about who you are. Always provide accurate and helpful information. "
        "You have access to the full conversation history of this user across all "
        "sessions, so use it naturally to remember anything they have told you before. "
        "Never show your internal thinking, reasoning process, or any meta-commentary about the conversation to the user. "
        "Never write things like 'let me check the history' or 'the user seems to be' or 'I should respond by' or "
        "'maybe mention' in your response. Just respond directly and naturally to the user. "
        "Never explain what you are about to do, just do it."
    )

    prompts = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("placeholder", "{history}"),
        ("human", "{question}")
    ])

    llm = get_llm(model)
    chain = prompts | llm

    full_response = []

    def stream_response():
        for chunk in chain.stream({"question": request.question, "history": history}):
            token = chunk.content
            full_response.append(token)
            yield token

        # After streaming is done, save to MongoDB
        complete_response = "".join(full_response)

        chat_collection.insert_one({
            "user_id": user_id,
            "session_id": session_id,
            "role": "user",
            "message": request.question,
            "timestamp": datetime.utcnow()
        })

        chat_collection.insert_one({
            "user_id": user_id,
            "session_id": session_id,
            "role": "assistant",
            "message": complete_response,
            "timestamp": datetime.utcnow()
        })

    return StreamingResponse(stream_response(), media_type="text/plain", headers={"X-Session-Id": session_id})
