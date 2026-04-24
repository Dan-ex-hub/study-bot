import { useState, useMemo } from 'react'
import { logoutUser } from '../api'

export default function Sidebar({
    sessions,
    activeSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    username,
    sessionsLoading,
}) {
    const [hoveredId, setHoveredId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)

    // Filter sessions based on search query
    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return sessions
        const query = searchQuery.toLowerCase()
        return sessions.filter(session =>
            session.title?.toLowerCase().includes(query)
        )
    }, [sessions, searchQuery])

    // Group sessions by date
    const grouped = groupByDate(filteredSessions)

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            logoutUser()
        }
    }

    return (
        <div className="w-80 h-full flex flex-col relative overflow-hidden">
            {/* Glass background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0F] via-[#13131A] to-[#0B0B0F] border-r border-white/[0.06]" />
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/5 opacity-50" />

            {/* Header with New Chat button */}
            <div className="relative z-10 p-5 border-b border-white/[0.06]">
                <button
                    onClick={onNewChat}
                    className="
                        w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl
                        bg-gradient-to-r from-indigo-600 to-purple-600
                        hover:from-indigo-500 hover:to-purple-500
                        text-white font-semibold text-sm
                        transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                        shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40
                        group
                    "
                >
                    <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span>New Chat</span>
                </button>
            </div>

            {/* Search bar */}
            <div className="relative z-10 px-5 pt-4 pb-3">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="
                            w-full px-4 py-2.5 pl-10 rounded-xl
                            bg-white/[0.04] border border-white/[0.08]
                            text-slate-200 placeholder-slate-500 text-sm
                            focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06]
                            transition-all duration-300
                        "
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Sessions list */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4">
                {sessionsLoading ? (
                    <div className="px-3 py-12 text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-purple-500/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-pink-500/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <p className="text-sm text-slate-500">Loading conversations...</p>
                    </div>
                ) : Object.keys(grouped).length > 0 ? (
                    Object.entries(grouped).map(([label, groupSessions]) => (
                        <div key={label} className="mb-6">
                            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
                                {label}
                            </div>
                            <div className="space-y-1">
                                {groupSessions.map(session => (
                                    <div
                                        key={session.session_id}
                                        className={`
                                            group relative flex items-center rounded-xl cursor-pointer
                                            transition-all duration-200
                                            ${session.session_id === activeSessionId
                                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/15 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                                                : 'text-slate-300 hover:bg-white/[0.04] hover:text-white border border-transparent hover:border-white/[0.06]'
                                            }
                                        `}
                                        onClick={() => onSelectSession(session.session_id)}
                                        onMouseEnter={() => setHoveredId(session.session_id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        <div className="flex-1 px-4 py-3 text-sm truncate font-medium flex items-center gap-2">
                                            <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span className="truncate">{session.title || 'New Chat'}</span>
                                        </div>
                                        {/* Delete button */}
                                        {(hoveredId === session.session_id || session.session_id === activeSessionId) && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (confirm('Delete this conversation?')) {
                                                        onDeleteSession(session.session_id)
                                                    }
                                                }}
                                                className="
                                                    absolute right-2 p-2 rounded-lg
                                                    hover:bg-red-500/20 text-slate-400 hover:text-red-400
                                                    transition-all duration-200 hover:scale-110
                                                "
                                                aria-label="Delete chat"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : searchQuery ? (
                    <div className="px-3 py-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-400 mb-1">No conversations found</p>
                        <p className="text-xs text-slate-600">Try a different search term</p>
                    </div>
                ) : (
                    <div className="px-3 py-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-400 mb-1">No conversations yet</p>
                        <p className="text-xs text-slate-600">Start a new chat to begin!</p>
                    </div>
                )}
            </div>

            {/* Footer with user info */}
            <div className="relative z-10 p-4 border-t border-white/[0.06]">
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="
                            w-full flex items-center justify-between px-3 py-3 rounded-xl
                            hover:bg-white/[0.04] transition-all duration-200
                            group
                        "
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 border border-indigo-400/20 shadow-lg shadow-indigo-500/20">
                                {username ? username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0 text-left">
                                <div className="text-sm text-slate-200 font-semibold truncate">
                                    {username || 'User'}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Online
                                </div>
                            </div>
                        </div>
                        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* User menu dropdown */}
                    {showUserMenu && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-[#1A1A24]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl animate-fadeInUp">
                            <button
                                onClick={handleLogout}
                                className="
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    text-sm text-slate-300 hover:text-red-400
                                    hover:bg-red-500/10 transition-all duration-200
                                    group
                                "
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="font-medium">Logout</span>
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
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    for (const session of sessions) {
        const date = new Date(session.updated_at || session.created_at)
        let label
        if (date >= today) {
            label = 'Today'
        } else if (date >= yesterday) {
            label = 'Yesterday'
        } else if (date >= weekAgo) {
            label = 'Previous 7 Days'
        } else if (date >= monthAgo) {
            label = 'Previous Month'
        } else {
            label = 'Older'
        }
        if (!groups[label]) groups[label] = []
        groups[label].push(session)
    }

    return groups
}
