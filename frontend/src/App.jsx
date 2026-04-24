import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  isAuthenticated,
  getStoredUser,
  fetchSessions,
  fetchSessionMessages,
  deleteSessionApi,
  streamChatMessage,
} from './api'
import Login from './components/Login'
import Signup from './components/Signup'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InputArea from './components/InputArea'

// Protected route wrapper
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Auth route wrapper (redirect to home if already logged in)
function AuthRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }
  return children
}

function ChatLayout() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile')

  const user = getStoredUser()

  // Load sessions from backend on mount
  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    setSessionsLoading(true)
    try {
      const serverSessions = await fetchSessions()
      setSessions(serverSessions)

      // If there are sessions, select the most recent one
      if (serverSessions.length > 0) {
        const latest = serverSessions[0] // already sorted by updated_at desc
        setActiveSessionId(latest.session_id)
        await loadSessionMessages(latest.session_id)
      }
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setSessionsLoading(false)
    }
  }

  async function loadSessionMessages(sessionId) {
    try {
      const msgs = await fetchSessionMessages(sessionId)
      setMessages(msgs)
    } catch (err) {
      console.error('Failed to load messages:', err)
      setMessages([])
    }
  }

  function createNewChat() {
    setActiveSessionId(null)  // No session ID yet - backend will create one
    setMessages([])
    setError(null)
  }

  async function selectSession(sessionId) {
    setActiveSessionId(sessionId)
    setError(null)
    await loadSessionMessages(sessionId)
  }

  async function deleteSession(sessionId) {
    try {
      await deleteSessionApi(sessionId)
      setSessions(prev => prev.filter(s => s.session_id !== sessionId))

      if (sessionId === activeSessionId) {
        const remaining = sessions.filter(s => s.session_id !== sessionId)
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].session_id)
          await loadSessionMessages(remaining[0].session_id)
        } else {
          createNewChat()
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const handleSendMessage = useCallback(async (question, imageData = null) => {
    if (!question.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: question.trim() + (imageData ? ' [Image attached]' : ''),
      timestamp: new Date().toISOString(),
      has_image: !!imageData,
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Add empty assistant message that will be updated as tokens stream in
    const assistantIndex = messages.length + 1
    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toISOString() }])

    try {
      // Stream the response
      const data = await streamChatMessage(activeSessionId, question.trim(), (token, fullResponse) => {
        // Update the assistant message as tokens come in
        setMessages(prev => {
          const updated = [...prev]
          updated[assistantIndex] = { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() }
          return updated
        })
      }, selectedModel, imageData)

      // Update active session ID if backend created a new one
      if (data.session_id && data.session_id !== activeSessionId) {
        setActiveSessionId(data.session_id)
      }

      // Refresh sessions list to show the new/updated session
      const serverSessions = await fetchSessions()
      setSessions(serverSessions)
    } catch (err) {
      console.error('Chat API error:', err)
      const errorMsg = err.message || err.response?.data?.detail || 'Something went wrong. Please try again.'
      setError(errorMsg)
      // Remove the empty assistant message on error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }, [activeSessionId, isLoading, messages.length, selectedModel])

  const activeSession = sessions.find(s => s.session_id === activeSessionId)

  return (
    <div className="flex bg-[#0B0B0F] text-slate-100 relative overflow-hidden" style={{ height: '100dvh' }}>
      {/* Animated background orbs */}
      <div className="gradient-orb w-[700px] h-[700px] bg-indigo-600/15 -top-48 -left-48 animate-pulse-glow pointer-events-none hidden lg:block" />
      <div className="gradient-orb w-[600px] h-[600px] bg-purple-600/12 bottom-0 right-0 animate-pulse-glow pointer-events-none hidden lg:block" style={{ animationDelay: '2s' }} />
      <div className="gradient-orb w-[500px] h-[500px] bg-cyan-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow pointer-events-none hidden lg:block" style={{ animationDelay: '4s' }} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-20 lg:hidden transition-opacity duration-300 animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative z-30 h-full transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            selectSession(id)
            setSidebarOpen(false)
          }}
          onNewChat={createNewChat}
          onDeleteSession={deleteSession}
          username={user?.username}
          sessionsLoading={sessionsLoading}
        />
      </div>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative" style={{ height: '100dvh' }}>
        {/* Top bar - Enhanced glassmorphism */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white/[0.03] backdrop-blur-2xl border-b border-white/[0.06] z-10 shadow-lg shadow-black/5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-white/[0.08] transition-all duration-200 hover:scale-105 active:scale-95 text-slate-400 hover:text-white"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-slate-200 truncate">
                  {activeSession?.title || 'New Chat'}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>AI Assistant Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Session info badge */}
          {activeSession && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>{activeSession.message_count || messages.length} messages</span>
            </div>
          )}
        </div>

        {/* Chat window */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={error}
          username={user?.username}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />

        {/* Input area */}
        <div className="bg-white/[0.02] backdrop-blur-2xl border-t border-white/[0.06] shadow-2xl shadow-black/10">
          <InputArea onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <Signup />
            </AuthRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
