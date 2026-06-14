import axios from 'axios'

const PROD_API = 'https://web-production-9e6e7.up.railway.app'
const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API : 'http://localhost:8000')).replace(/\/$/, '')

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
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Normalize any error (axios, fetch, thrown Error) into a friendly message.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
    if (!error) return fallback

    // Network / no response
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return 'Network error — check your connection or the server may be offline.'
    }

    const status = error.response?.status
    const detail = error.response?.data?.detail

    if (detail) {
        return typeof detail === 'string' ? detail : (detail[0]?.msg || fallback)
    }
    if (status === 429) return 'Too many requests. Please slow down and try again shortly.'
    if (status === 500) return 'The server ran into a problem. Please try again in a moment.'
    if (status === 503) return 'Service temporarily unavailable. Please try again shortly.'

    return error.message || fallback
}

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

export async function streamChatMessage(sessionId, question, onToken, model = null, imageData = null) {
    const token = getStoredToken()

    const body = { question, session_id: sessionId }
    if (model) {
        body.model = model
    }
    if (imageData) {
        body.image_data = imageData
    }

    let response
    try {
        response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })
    } catch (networkErr) {
        throw new Error('Network error — check your connection or the server may be down.')
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(error.detail || 'Request failed')
    }

    // Get session_id from response header
    const newSessionId = response.headers.get('X-Session-Id')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''
    let lastUpdateTime = 0
    const UPDATE_THROTTLE = 50 // Update every 50ms to reduce jittering

    while (true) {
        const { done, value } = await reader.read()
        if (done) {
            // Final update with complete response
            onToken('', fullResponse)
            break
        }

        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk
        
        // Throttle updates to reduce jittering
        const now = Date.now()
        if (now - lastUpdateTime >= UPDATE_THROTTLE) {
            onToken(chunk, fullResponse)
            lastUpdateTime = now
        }
    }

    return { response: fullResponse, session_id: newSessionId }
}

// ─── User API ────────────────────────────────────────────

export async function fetchCurrentUser() {
    const res = await api.get('/me')
    return res.data
}

export default api
