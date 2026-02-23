# Study Bot - AI-Powered Study Assistant

An intelligent study chatbot with user authentication, session management, and streaming AI responses. Built with FastAPI backend and React frontend.

---

## 📖 Project Overview

**Study Bot** is an AI-powered study assistant that helps users learn and understand various topics. It features:

- **User Authentication**: Secure signup/login with JWT tokens
- **Chat Sessions**: Organized conversation history per session
- **Streaming Responses**: Real-time word-by-word AI responses
- **Cross-Session Memory**: AI remembers context from all previous conversations
- **Per-User Data Isolation**: Each user's data is securely separated in MongoDB

**Who is this for?** Students, learners, and anyone who wants an AI study companion to help explain concepts, answer questions, and provide educational assistance.

---

## 📁 Project Structure

```
study-bot/
├── app.py                    # FastAPI backend with all API endpoints
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (not committed)
├── .gitignore               # Git ignore rules
│
└── frontend/                 # React frontend application
    ├── index.html           # HTML entry point
    ├── package.json         # Node.js dependencies and scripts
    ├── package-lock.json    # Locked dependency versions
    ├── vite.config.js       # Vite build configuration
    ├── .gitignore           # Git ignore rules for frontend
    │
    └── src/
        ├── main.jsx         # React app entry point
        ├── App.jsx          # Main app component with routing
        ├── index.css        # Global styles and Tailwind CSS
        ├── api.js           # API utility functions and axios config
        │
        └── components/
            ├── ChatWindow.jsx    # Chat message display area
            ├── InputArea.jsx     # Message input with auto-resize
            ├── Login.jsx         # Login page component
            ├── MessageBubble.jsx # Individual message with MathJax
            ├── Sidebar.jsx       # Session list and navigation
            └── Signup.jsx        # Signup page component
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Modern, fast Python web framework for building APIs |
| **LangChain** | Framework for building LLM-powered applications |
| **Groq API** | Fast LLM inference for AI responses |
| **MongoDB** | NoSQL database for storing users and chat history |
| **python-jose** | JWT token generation and validation |
| **bcrypt** | Secure password hashing |
| **Pydantic** | Data validation using Python type annotations |
| **Uvicorn** | ASGI server for running FastAPI |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI library with hooks |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **React Router DOM** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **better-react-mathjax** | Math equation rendering |

---

## ✨ Features

### Authentication
- **Signup**: Create account with username, email, and password
- **Login**: Email/password authentication with JWT tokens
- **Protected Routes**: All chat endpoints require valid JWT
- **Auto Logout**: Token expiration handling

### Chat with AI
- Real-time conversation with AI study assistant
- Context-aware responses based on study topics
- Greeting and identity questions handled

### Streaming Responses
- Word-by-word streaming output
- Real-time display as AI generates response
- Smooth typing animation effect

### Chat History Per Session
- Each conversation organized into sessions
- Session titles auto-generated from first message
- Load previous sessions from sidebar
- Delete unwanted sessions

### Memory Across Sessions
- AI has access to ALL previous conversations
- Natural context awareness without explicit memory
- Remembers user preferences and past topics

### Per-User Data Isolation
- MongoDB stores data with user_id
- Users can only access their own data
- Secure JWT-based authentication

### Math Rendering
- LaTeX math equations rendered beautifully
- Supports inline (`$...$`) and display (`$$...$$`) math
- Works with standard LaTeX syntax

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Required - Get from console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# Required - Get from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Chat?retryWrites=true&w=majority

# Optional - JWT secret (defaults to built-in value)
JWT_SECRET=your_random_secret_key_here
```

### How to Get These Values:

1. **GROQ_API_KEY**:
   - Go to [console.groq.com](https://console.groq.com)
   - Sign up/Login
   - Create an API key
   - Copy the key

2. **MONGODB_URI**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Whitelist your IP (or use 0.0.0.0/0 for all)
   - Get connection string and replace `<password>` with your database user password

3. **JWT_SECRET** (Optional):
   - Generate a random string (32+ characters)
   - Used for signing JWT tokens

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

```bash
# 1. Navigate to project root
cd study-bot

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file with your credentials
# (See Environment Variables section above)

# 6. Run the backend server
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: `http://localhost:8000`

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

### Connect to MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user (username & password)
3. Network Access → Add IP → Allow Access from Anywhere (0.0.0.0/0)
4. Connect → Connect your application → Copy connection string
5. Replace `<password>` with your database user password
6. Add to `.env` as `MONGODB_URI`

---

## 🌐 Deploy Backend on Render

### Step-by-Step Instructions

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/study-bot.git
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

4. **Configure Build Settings**
   - **Name**: study-bot-api (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: `.` (leave empty or use root)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn app:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables**
   - Scroll to "Environment Variables"
   - Add:
     - `GROQ_API_KEY` = your_groq_api_key
     - `MONGODB_URI` = your_mongodb_connection_string
     - `JWT_SECRET` = your_random_secret_key

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your API will be at: `https://your-app-name.onrender.com`

---

## 🎨 Deploy Frontend on Vercel

### Step-by-Step Instructions

1. **Update API URL**
   
   Edit `frontend/src/api.js` and update the base URL:
   ```javascript
   const API_BASE_URL = 'https://your-app-name.onrender.com'
   ```

2. **Push to GitHub** (if not already done)

3. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Set Root Directory to `frontend`
   - Click "Deploy"

4. **Your frontend will be at**: `https://your-project.vercel.app`

### Alternative: Deploy on Netlify

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy on Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `frontend/dist` folder
   - Or connect GitHub for auto-deploy

---

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| GET | `/` | Welcome message | - | `{message: string}` |
| POST | `/signup` | Create new account | `{username, email, password}` | `{message, user_id}` |
| POST | `/login` | Authenticate user | `{email, password}` | `{access_token, token_type, user_id, username}` |

### Protected Endpoints (Require JWT Token)

Include header: `Authorization: Bearer <token>`

| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| GET | `/me` | Get current user info | - | `{user_id, username, email}` |
| GET | `/sessions` | Get all chat sessions | - | `{sessions: [...]}` |
| GET | `/sessions/{session_id}/messages` | Get messages in session | - | `{messages: [...]}` |
| DELETE | `/sessions/{session_id}` | Delete a session | - | `{deleted_count: number}` |
| POST | `/chat` | Send message to AI | `{question, session_id?}` | StreamingResponse |

### Chat Endpoint Details

**POST /chat**
```javascript
// Request
{
  "question": "Explain quantum computing",
  "session_id": "optional-existing-session-id"  // Optional, creates new if omitted
}

// Response: Streaming text
// Headers include: X-Session-Id for new sessions
```

---

## ⚠️ Common Errors and Fixes

### 1. "Module not found" Error
**Problem**: Python dependencies not installed
**Fix**: 
```bash
pip install -r requirements.txt
```

### 2. MongoDB Connection Error
**Problem**: Cannot connect to MongoDB
**Fix**:
- Check if IP is whitelisted in MongoDB Atlas
- Verify connection string is correct
- Ensure password is URL-encoded if it contains special characters

### 3. CORS Error in Frontend
**Problem**: API requests blocked by browser
**Fix**: Backend already has CORS enabled for all origins. If issues persist, check if backend is running.

### 4. JWT Token Invalid
**Problem**: "Invalid or expired token" error
**Fix**:
- Token expires in 24 hours - login again
- Ensure token is sent in Authorization header as `Bearer <token>`

### 5. Groq API Error
**Problem**: "Invalid API key" or rate limiting
**Fix**:
- Verify GROQ_API_KEY in .env
- Check if you have API credits/quota

### 6. Frontend Not Connecting to Backend
**Problem**: API calls failing
**Fix**:
- Ensure backend is running on port 8000
- Check API_BASE_URL in `frontend/src/api.js`
- For production, update to deployed backend URL

### 7. npm install Fails
**Problem**: Node module installation errors
**Fix**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 8. Port Already in Use
**Problem**: Port 8000 or 5173 already used
**Fix**:
```bash
# Backend - use different port
python -m uvicorn app:app --port 8001

# Frontend - Vite will auto-switch to next available port
npm run dev
```

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues or questions, please open an issue on GitHub.
