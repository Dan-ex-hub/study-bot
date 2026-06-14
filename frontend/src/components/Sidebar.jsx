import { useState, useMemo } from 'react'
import { logoutUser } from '../api'
import { LogoFull } from './Logo'

export default function Sidebar({
    sessions,
    activeSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    username,
    sessionsLoading,
    onClose,
}) {
    const [hoveredId, setHoveredId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)

    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return sessions
        const q = searchQuery.toLowerCase()
        return sessions.filter((s) => s.title?.toLowerCase().includes(q))
    }, [sessions, searchQuery])

    const grouped = groupByDate(filteredSessions)

    const handleLogout = () => {
        if (confirm('Sign out of StudyBot?')) logoutUser()
    }

    return (
        <div className="w-80 h-full flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-soft)] via-[var(--surface)] to-[var(--bg-soft)] border-r border-[var(--line)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-indigo-500/5 opacity-60 pointer-events-none" />

            {/* Brand header */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-4">
                <LogoFull size={38} />
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-lg text-[var(--text-mute)] hover:text-white hover:bg-white/5 transition-all"
                        aria-label="Close sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* New chat */}
            <div className="relative z-10 px-5 pb-3">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl btn-brand font-semibold text-sm group"
                >
                    <svg className="w-4.5 h-4.5 w-[18px] h-[18px] group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    New Chat
                </button>
            </div>

            {/* Search */}
            <div className="relative z-10 px-5 pb-3">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/[0.035] border border-[var(--line)] text-slate-200 placeholder-[var(--text-mute)] text-sm focus:outline-none focus:border-sky-400/40 focus:bg-white/[0.05] transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-mute)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)] hover:text-slate-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Sessions */}
            <div className="relative z-10 flex-1 overflow-y-auto px-3 pb-4">
                {sessionsLoading ? (
                    <div className="px-3 py-12 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-3">
                            <span className="typing-dot w-2 h-2 rounded-full bg-teal-400" />
                            <span className="typing-dot w-2 h-2 rounded-full bg-sky-400" />
                            <span className="typing-dot w-2 h-2 rounded-full bg-indigo-400" />
                        </div>
                        <p className="text-sm text-[var(--text-mute)]">Loading conversations...</p>
                    </div>
                ) : Object.keys(grouped).length > 0 ? (
                    Object.entries(grouped).map(([label, groupSessions]) => (
                        <div key={label} className="mb-5">
                            <div className="px-3 py-1.5 text-[11px] font-bold text-[var(--text-mute)] uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-sky-400/60" />
                                {label}
                            </div>
                            <div className="space-y-0.5">
                                {groupSessions.map((session) => {
                                    const active = session.session_id === activeSessionId
                                    return (
                                        <div
                                            key={session.session_id}
                                            className={`group relative flex items-center rounded-xl cursor-pointer transition-all duration-200 border ${active
                                                ? 'bg-gradient-to-r from-teal-500/15 to-sky-500/10 text-white border-sky-400/25'
                                                : 'text-slate-300 hover:bg-white/[0.04] hover:text-white border-transparent'
                                                }`}
                                            onClick={() => onSelectSession(session.session_id)}
                                            onMouseEnter={() => setHoveredId(session.session_id)}
                                            onMouseLeave={() => setHoveredId(null)}
                                        >
                                            <div className="flex-1 px-3.5 py-2.5 text-sm truncate font-medium flex items-center gap-2.5 min-w-0">
                                                <svg className={`w-4 h-4 flex-shrink-0 ${active ? 'text-sky-300' : 'text-[var(--text-mute)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span className="truncate">{session.title || 'New Chat'}</span>
                                            </div>
                                            {(hoveredId === session.session_id || active) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (confirm('Delete this conversation? This cannot be undone.')) onDeleteSession(session.session_id)
                                                    }}
                                                    className="absolute right-2 p-1.5 rounded-lg hover:bg-rose-500/20 text-[var(--text-mute)] hover:text-rose-300 transition-all hover:scale-110"
                                                    aria-label="Delete conversation"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="px-3 py-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-indigo-500/10 border border-[var(--line)] flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">{searchQuery ? '🔍' : '💬'}</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-1">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
                        <p className="text-xs text-[var(--text-mute)]">{searchQuery ? 'Try a different search' : 'Start a new chat to begin!'}</p>
                    </div>
                )}
            </div>

            {/* User footer */}
            <div className="relative z-10 p-4 border-t border-[var(--line)]">
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu((v) => !v)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg">
                                {username ? username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0 text-left">
                                <div className="text-sm text-slate-100 font-semibold truncate">{username || 'User'}</div>
                                <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Online
                                </div>
                            </div>
                        </div>
                        <svg className={`w-4 h-4 text-[var(--text-mute)] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showUserMenu && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-[var(--surface-2)]/95 backdrop-blur-xl border border-[var(--line-strong)] shadow-2xl animate-fadeInUp">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="font-medium">Sign out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function groupByDate(sessions) {
    const groups = {}
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1)

    for (const session of sessions) {
        const date = new Date(session.updated_at || session.created_at)
        let label
        if (date >= today) label = 'Today'
        else if (date >= yesterday) label = 'Yesterday'
        else if (date >= weekAgo) label = 'Previous 7 Days'
        else if (date >= monthAgo) label = 'Previous Month'
        else label = 'Older'
        if (!groups[label]) groups[label] = []
        groups[label].push(session)
    }
    return groups
}
