import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
    isAuthenticated,
    getStoredUser,
    fetchSessions,
    fetchSessionMessages,
    deleteSessionApi,
    streamChatMessage,
    getErrorMessage,
} from './api'
import Login from './components/Login'
import Signup from './components/Signup'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InputArea from './components/InputArea'
import NotFound from './components/NotFound'
import { LogoMark } from './components/Logo'
import { useToast } from './components/Toast'

function ProtectedRoute({ children }) {
    if (!isAuthenticated()) return <Navigate to="/login" replace />
    return children
}

function AuthRoute({ children }) {
    if (isAuthenticated()) return <Navigate to="/chat" replace />
    return children
}

function ChatLayout() {
    const { sessionId: routeSessionId } = useParams()
    const navigate = useNavigate()
    const toast = useToast()

    const [sessions, setSessions] = useState([])
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sessionsLoading, setSessionsLoading] = useState(true)
    const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile')

    const activeSessionId = routeSessionId || null
    const lastRequest = useRef(null)
    const user = getStoredUser()

    // Load the sessions list once on mount
    useEffect(() => {
        let cancelled = false
        async function load() {
            setSessionsLoading(true)
            try {
                const list = await fetchSessions()
                if (!cancelled) setSessions(list)
            } catch (err) {
                if (!cancelled) toast.error(getErrorMessage(err, 'Could not load your conversations.'))
            } finally {
                if (!cancelled) setSessionsLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Load messages whenever the active session in the URL changes
    useEffect(() => {
        let cancelled = false
        async function loadMessages() {
            if (!activeSessionId) {
                setMessages([])
                return
            }
            try {
                const msgs = await fetchSessionMessages(activeSessionId)
                if (!cancelled) setMessages(msgs)
            } catch (err) {
                if (!cancelled) {
                    setMessages([])
                    toast.error(getErrorMessage(err, 'Could not load this conversation.'))
                }
            }
        }
        setError(null)
        loadMessages()
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSessionId])

    const refreshSessions = useCallback(async () => {
        try {
            const list = await fetchSessions()
            setSessions(list)
        } catch {
            /* non-critical — sidebar will refresh next time */
        }
    }, [])

    function createNewChat() {
        setError(null)
        setMessages([])
        navigate('/chat')
        setSidebarOpen(false)
    }

    function selectSession(id) {
        setError(null)
        navigate(`/chat/${id}`)
        setSidebarOpen(false)
    }

    async function deleteSession(id) {
        try {
            await deleteSessionApi(id)
            setSessions((prev) => prev.filter((s) => s.session_id !== id))
            toast.success('Conversation deleted.')
            if (id === activeSessionId) {
                const remaining = sessions.filter((s) => s.session_id !== id)
                if (remaining.length > 0) navigate(`/chat/${remaining[0].session_id}`)
                else navigate('/chat')
            }
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to delete the conversation.'))
        }
    }

    const sendMessage = useCallback(async (question, imageData = null) => {
        const trimmed = question.trim()
        if ((!trimmed && !imageData) || isLoading) return

        lastRequest.current = { question: trimmed, imageData }
        setError(null)

        const userMessage = {
            role: 'user',
            content: trimmed + (imageData ? ' [Image attached]' : ''),
            timestamp: new Date().toISOString(),
            has_image: !!imageData,
        }

        setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: '', timestamp: new Date().toISOString() }])
        setIsLoading(true)

        const assistantIndex = messages.length + 1

        try {
            const data = await streamChatMessage(activeSessionId, trimmed, (token, fullResponse) => {
                setMessages((prev) => {
                    const updated = [...prev]
                    updated[assistantIndex] = { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() }
                    return updated
                })
            }, selectedModel, imageData)

            // If backend created a new session, reflect it in the URL
            if (data.session_id && data.session_id !== activeSessionId) {
                navigate(`/chat/${data.session_id}`, { replace: true })
            }
            refreshSessions()
        } catch (err) {
            const msg = getErrorMessage(err, 'Something went wrong while contacting StudyBot.')
            setError(msg)
            toast.error(msg, { title: 'Message failed' })
            // Drop the empty assistant placeholder
            setMessages((prev) => prev.slice(0, -1))
        } finally {
            setIsLoading(false)
        }
    }, [activeSessionId, isLoading, messages.length, selectedModel, navigate, refreshSessions, toast])

    const handleRetry = useCallback(() => {
        const last = lastRequest.current
        if (last) sendMessage(last.question, last.imageData)
    }, [sendMessage])

    const activeSession = sessions.find((s) => s.session_id === activeSessionId)

    return (
        <div className="flex bg-[var(--bg)] text-slate-100 relative overflow-hidden" style={{ height: '100dvh' }}>
            <div className="aurora-blob w-[680px] h-[680px] bg-teal-600/12 -top-48 -left-48 animate-aurora pointer-events-none hidden lg:block" />
            <div className="aurora-blob w-[560px] h-[560px] bg-indigo-600/10 bottom-0 right-0 animate-aurora pointer-events-none hidden lg:block" style={{ animationDelay: '3s' }} />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-20 lg:hidden animate-fadeIn" onClick={() => setSidebarOpen(false)} />
            )}

            <div className={`fixed lg:relative z-30 h-full transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <Sidebar
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={selectSession}
                    onNewChat={createNewChat}
                    onDeleteSession={deleteSession}
                    username={user?.username}
                    sessionsLoading={sessionsLoading}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative" style={{ height: '100dvh' }}>
                {/* Top bar */}
                <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-white/[0.03] backdrop-blur-2xl border-b border-[var(--line)] z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2.5 rounded-xl hover:bg-white/[0.08] transition-all text-[var(--text-dim)] hover:text-white"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-3 min-w-0">
                            <LogoMark size={38} className="flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-sm font-bold text-slate-200 truncate">{activeSession?.title || 'New Chat'}</h1>
                                <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>StudyBot online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {activeSession && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-[var(--line)] text-xs text-[var(--text-dim)]">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span>{activeSession.message_count || messages.length} messages</span>
                        </div>
                    )}
                </div>

                <ChatWindow
                    messages={messages}
                    isLoading={isLoading}
                    error={error}
                    username={user?.username}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    onRetry={handleRetry}
                />

                <div className="bg-white/[0.02] backdrop-blur-2xl border-t border-[var(--line)]">
                    <InputArea onSend={sendMessage} isLoading={isLoading} />
                </div>
            </div>
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatLayout /></ProtectedRoute>} />
                <Route path="/chat/:sessionId" element={<ProtectedRoute><ChatLayout /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}
