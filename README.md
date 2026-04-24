# 📚 StudyBot — AI-Powered Study Assistant

## 🌐 Live Deployment

| Service  | URL |
|----------|-----|
| Frontend | [study-bot-gamma.vercel.app](https://study-bot-gamma.vercel.app) |
| Backend  | [web-production-9e6e7.up.railway.app](https://web-production-9e6e7.up.railway.app) |

---

An AI-powered study chatbot built with **FastAPI**, **React**, **Groq LLMs**, and **MongoDB**. Supports multi-session chat history, math formula rendering, image analysis via vision models, and streaming responses.

---

## ✨ Features

- 🔐 **Auth** — JWT-based signup/login
- 💬 **Streaming Chat** — Real-time token streaming from Groq LLMs
- 🧠 **Multi-Session History** — Persistent chat sessions stored in MongoDB
- 🔢 **Math Rendering** — MathJax support for inline (`$...$`) and display (`$$...$$`) formulas
- 🖼️ **Image Analysis** — Upload images for vision model analysis
- 🤖 **Model Selector** — Switch between Llama 3.3 70B, Llama 4 Scout Vision, GPT OSS 120B
- 📱 **Responsive UI** — Glassmorphism dark theme, mobile-friendly

---

## 🗂️ Project Structure

```
study-bot/
├── app.py                  # FastAPI backend — all routes, auth, chat, streaming
├── requirements.txt        # Python dependencies
├── Procfile                # Railway/Heroku start command
├── runtime.txt             # Python version for deployment
├── .env                    # Environment variables (never committed)
├── .gitignore
│
└── frontend/               # React + Vite frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── vercel.json         # Vercel deployment config
    └── src/
        ├── main.jsx
        ├── App.jsx         # Root component, routing, state management
        ├── api.js          # All API calls (auth, sessions, streaming chat)
        ├── index.css       # Global styles, animations, glassmorphism
        └── components/
            ├── Login.jsx         # Login page
            ├── Signup.jsx        # Signup page
            ├── Sidebar.jsx       # Session list, search, new chat
            ├── ChatWindow.jsx    # Chat UI, model selector, quick prompts
            ├── MessageBubble.jsx # Message rendering, MathJax, code blocks
            └── InputArea.jsx     # Text input, image upload, send button
```

---

## 🤖 Available Models

| Model | Type | Parameters |
|-------|------|-----------|
| `llama-3.3-70b-versatile` | Text | 70B |
| `meta-llama/llama-4-scout-17b-16e-instruct` | Vision + Text | 17B (MoE) |
| `openai/gpt-oss-120b` | Text (Legacy) | 120B |

---

## 🛠️ Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key — [console.groq.com](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/Code-with-Danie/chatbot.git
cd chatbot
```

### 2. Backend setup

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in your values (see Environment Variables section)

# Start backend
uvicorn app:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Start frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
GROQ_API_KEY=gsk_...          # Your Groq API key
MONGODB_URI=mongodb://...     # MongoDB connection string
JWT_SECRET=your-secret-key    # Strong random string for JWT signing
```

### Frontend (`.env.local` for dev, set in Vercel for prod)

```env
VITE_API_URL=https://your-backend.railway.app
```

---

## 🚀 Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo** → select this repo
3. Railway auto-detects Python via `Procfile`
4. Add a **MongoDB** plugin: New → Database → MongoDB
5. Set environment variables in Railway dashboard:
   ```
   GROQ_API_KEY=your_key
   MONGODB_URI=${{MongoDB.MONGO_URL}}
   JWT_SECRET=your_strong_secret
   ```
6. Deploy — Railway gives you a public URL like `https://chatbot-production.up.railway.app`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** → import this repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. Deploy — Vercel gives you a URL like `https://studybot.vercel.app`

### Backend CORS Update

After deploying the frontend, update the CORS in `app.py` to allow your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "http://localhost:5173",
    ],
    ...
)
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/signup` | ❌ | Create account |
| `POST` | `/login` | ❌ | Login, returns JWT |
| `GET` | `/me` | ✅ | Get current user |
| `GET` | `/sessions` | ✅ | List all chat sessions |
| `GET` | `/sessions/{id}/messages` | ✅ | Get messages in a session |
| `DELETE` | `/sessions/{id}` | ✅ | Delete a session |
| `POST` | `/chat` | ✅ | Send message, streams response |

### Chat Request Body

```json
{
  "question": "Explain Newton's second law",
  "session_id": "optional-uuid",
  "model": "llama-3.3-70b-versatile",
  "image_data": "base64-encoded-image-optional"
}
```

---

## 🖼️ Image Analysis

To use image analysis:
1. Select **Llama 4 Scout 17B Vision** from the model dropdown
2. Click the 📷 image button in the input area
3. Select an image (max 4MB)
4. Type your question and send

Images are converted to base64 and sent directly to the vision model — they are not permanently stored in MongoDB.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | FastAPI, Python 3.11 |
| AI | Groq API (LangChain + direct client) |
| Database | MongoDB (via PyMongo) |
| Auth | JWT (python-jose) + bcrypt |
| Math | MathJax (better-react-mathjax) |
| Markdown | react-markdown |
| Deployment | Railway (backend) + Vercel (frontend) |

---

## 📄 License

MIT
