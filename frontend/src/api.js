import axios from 'axios'

const API_BASE = 'https://study-bot-glj0.onrender.com'

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('study_bot_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor — handle 401 (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired — clear auth and redirect to login
            localStorage.removeItem('study_bot_token')
            localStorage.removeItem('study_bot_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ─── Auth API ────────────────────────────────────────────

export async function signupUser(username, email, password) {
    const res = await api.post('/signup', { username, email, password })
    return res.data
}

export async function loginUser(email, password) {
    const res = await api.post('/login', { email, password })
    const { access_token, user_id, username } = res.data

    // Store auth data
    localStorage.setItem('study_bot_token', access_token)
    localStorage.setItem('study_bot_user', JSON.stringify({ user_id, username, email }))

    return res.data
}

export function logoutUser() {
    localStorage.removeItem('study_bot_token')
    localStorage.removeItem('study_bot_user')
    localStorage.removeItem('study_bot_sessions')
    window.location.href = '/login'
}

export function getStoredUser() {
    try {
        const raw = localStorage.getItem('study_bot_user')
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

export function getStoredToken() {
    return localStorage.getItem('study_bot_token')
}

export function isAuthenticated() {
    return !!getStoredToken()
}

// ─── Session API ─────────────────────────────────────────

export async function fetchSessions() {
    const res = await api.get('/sessions')
    return res.data.sessions
}

export async function fetchSessionMessages(sessionId) {
    const res = await api.get(`/sessions/${sessionId}/messages`)
    return res.data.messages
}

export async function deleteSessionApi(sessionId) {
    const res = await api.delete(`/sessions/${sessionId}`)
    return res.data
}

// ─── Chat API ────────────────────────────────────────────

export async function sendChatMessage(sessionId, question) {
    const res = await api.post('/chat', { session_id: sessionId, question })
    return res.data
}

export async function streamChatMessage(sessionId, question, onToken, model = null) {
    const token = getStoredToken()

    const body = { question, session_id: sessionId }
    if (model) {
        body.model = model
    }

    const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(error.detail || 'Request failed')
    }

    // Get session_id from response header
    const newSessionId = response.headers.get('X-Session-Id')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk
        onToken(chunk, fullResponse)
    }

    return { response: fullResponse, session_id: newSessionId }
}

// ─── User API ────────────────────────────────────────────

export async function fetchCurrentUser() {
    const res = await api.get('/me')
    return res.data
}

export default api
