import { useState } from 'react'
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

    // Group sessions by date
    const grouped = groupByDate(sessions)

    return (
        <div className="w-64 h-full bg-[#171717] flex flex-col border-r border-gray-700/30">
            {/* New Chat button */}
            <div className="p-3">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-600/40 hover:bg-gray-700/40 transition-colors text-sm text-gray-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Chat
                </button>
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                {sessionsLoading ? (
                    <div className="px-3 py-8 text-center text-sm text-gray-500">
                        Loading conversations...
                    </div>
                ) : Object.keys(grouped).length > 0 ? (
                    Object.entries(grouped).map(([label, groupSessions]) => (
                        <div key={label} className="mb-3">
                            <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {label}
                            </div>
                            {groupSessions.map(session => (
                                <div
                                    key={session.session_id}
                                    className={`
                    group relative flex items-center rounded-lg cursor-pointer mb-0.5
                    ${session.session_id === activeSessionId
                                            ? 'bg-gray-700/50 text-white'
                                            : 'text-gray-300 hover:bg-gray-700/30'
                                        }
                  `}
                                    onClick={() => onSelectSession(session.session_id)}
                                    onMouseEnter={() => setHoveredId(session.session_id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    <div className="flex-1 px-3 py-2 text-sm truncate">
                                        {session.title || 'New Chat'}
                                    </div>
                                    {/* Delete button */}
                                    {(hoveredId === session.session_id || session.session_id === activeSessionId) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDeleteSession(session.session_id)
                                            }}
                                            className="absolute right-1 p-1 rounded hover:bg-gray-600/50 text-gray-400 hover:text-gray-200 transition-colors"
                                            aria-label="Delete chat"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="px-3 py-8 text-center text-sm text-gray-500">
                        No conversations yet.<br />Start a new chat!
                    </div>
                )}
            </div>

            {/* Footer with user info and logout */}
            <div className="p-3 border-t border-gray-700/30">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {username ? username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-sm text-gray-300 truncate">
                            {username || 'User'}
                        </span>
                    </div>
                    <button
                        onClick={logoutUser}
                        className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0"
                        title="Logout"
                        aria-label="Logout"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
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

    for (const session of sessions) {
        const date = new Date(session.updated_at || session.created_at)
        let label
        if (date >= today) {
            label = 'Today'
        } else if (date >= yesterday) {
            label = 'Yesterday'
        } else if (date >= weekAgo) {
            label = 'Previous 7 Days'
        } else {
            label = 'Older'
        }
        if (!groups[label]) groups[label] = []
        groups[label].push(session)
    }

    return groups
}
