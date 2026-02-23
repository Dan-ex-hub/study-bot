# Study Bot — AI-Powered Study Assistant

An intelligent study chatbot with user authentication, session management, and real-time streaming AI responses. Built with FastAPI and React.

## 🔗 Live Demo

| | Link |
|--|------|
| **Frontend** | [https://study-bot-seven.vercel.app](https://study-bot-delta.vercel.app/login) |
| **Backend** | [https://study-bot-glj0.onrender.com](https://study-bot-glj0.onrender.com) |

---

## Project Structure

```
study-bot/
├── app.py                    # FastAPI backend — all API endpoints
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (not committed)
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api.js
        └── components/
            ├── ChatWindow.jsx
            ├── InputArea.jsx
            ├── Login.jsx
            ├── MessageBubble.jsx
            ├── Sidebar.jsx
            └── Signup.jsx
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Python web framework for building APIs |
| LangChain | Framework for LLM-powered applications |
| Groq API | Fast LLM inference for AI responses |
| MongoDB | NoSQL database for chat history and accounts |
| python-jose | JWT token generation and validation |
| bcrypt | Secure password hashing |
| Uvicorn | ASGI server for running FastAPI |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first CSS framework |
| React Router DOM | Client-side routing |
| Axios | HTTP client |
| better-react-mathjax | Math equation rendering |

---

## Features

- **Authentication** — Signup and login with JWT tokens, protected routes
- **AI Chat** — Study-focused chatbot powered by Groq LLM
- **Streaming Responses** — Word-by-word real-time output like ChatGPT
- **Chat Sessions** — Conversations organized by session with auto-generated titles
- **Cross-Session Memory** — AI has access to all previous conversations naturally
- **Math Rendering** — LaTeX equations rendered beautifully via MathJax
- **Per-User Data Isolation** — Each user's data is securely separated in MongoDB

---

## Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Chat
JWT_SECRET=your_random_secret_key_here
```

| Variable | Where to Get |
|----------|-------------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `MONGODB_URI` | MongoDB Atlas → Connect → Connection String |
| `JWT_SECRET` | Any random string, 32+ characters |

---

## Running Locally

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas account

### Backend

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Runs at: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at: `http://localhost:5173`

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/signup` | Create account — `{username, email, password}` |
| POST | `/login` | Authenticate — `{email, password}` → returns JWT token |

### Protected (require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user info |
| GET | `/sessions` | Get all sessions for current user |
| GET | `/sessions/{session_id}/messages` | Get messages in a session |
| DELETE | `/sessions/{session_id}` | Delete a session |
| POST | `/chat` | Send message — `{question, session_id?}` → StreamingResponse |

---

## Common Errors

| Error | Fix |
|-------|-----|
| MongoDB connection failed | Check IP whitelist in Atlas — allow `0.0.0.0/0` |
| Invalid or expired token | Token lasts 24 hours — log in again |
| Groq API error | Verify `GROQ_API_KEY` in `.env` |
| Frontend not connecting | Check `API_BASE_URL` in `frontend/src/api.js` |
| Port already in use | Change port: `--port 8001` for backend, Vite auto-switches |

---

## License

MIT License — open source and free to use.