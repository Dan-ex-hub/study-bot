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
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-20b')

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

  const handleSendMessage = useCallback(async (question) => {
    if (!question.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
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
      }, selectedModel)

      // Update active session ID if backend created a new one
      if (data.session_id && data.session_id !== activeSessionId) {
        setActiveSessionId(data.session_id)
      }

      // Refresh sessions list to show the new/updated session
      const serverSessions = await fetchSessions()
      setSessions(serverSessions)
    } catch (err) {
      console.error('Chat API error:', err)
      const errorMsg = err.message || 'Something went wrong. Please try again.'
      setError(errorMsg)
      // Remove the empty assistant message on error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }, [activeSessionId, isLoading, messages.length, selectedModel])

  const activeSession = sessions.find(s => s.session_id === activeSessionId)

  return (
    <div className="flex h-screen bg-[#212121] text-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-30 h-full transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'}
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
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50 bg-[#212121]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-medium text-gray-300 truncate">
            {activeSession?.title || 'New Chat'}
          </h1>
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
        <InputArea onSend={handleSendMessage} isLoading={isLoading} />
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
