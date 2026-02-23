import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

const AVAILABLE_MODELS = [
    { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B' },
    { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B' },
    { id: 'qwen/qwen3-32b', name: 'Qwen3 32B' },
]

export default function ChatWindow({ messages, isLoading, error, username, selectedModel, onModelChange }) {
    const bottomRef = useRef(null)

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    const currentModelName = AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'GPT-OSS 20B'

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto">
                {/* Model selector dropdown */}
                <div className="flex justify-end mb-4">
                    <div className="relative">
                        <select
                            value={selectedModel}
                            onChange={(e) => onModelChange(e.target.value)}
                            className="appearance-none bg-[#2f2f2f] text-gray-300 text-sm rounded-lg px-3 py-1.5 pr-8 border border-gray-600/50 focus:outline-none focus:border-emerald-500/50 cursor-pointer hover:bg-[#3a3a3a] transition-colors"
                        >
                            {AVAILABLE_MODELS.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Empty state - Welcome message */}
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-200 mb-2">
                            Welcome, <span className="text-emerald-400">{username || 'User'}</span>!
                        </h2>
                        <p className="text-gray-400 text-sm max-w-md">
                            I'm your Study Bot. Ask me anything about your study topics and I'll help you learn.
                        </p>
                    </div>
                )}

                {/* Messages */}
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                                AI
                            </div>
                            <div className="bg-[#2f2f2f] rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex gap-1.5 items-center h-5">
                                    <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                                    <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                                    <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="flex justify-center mb-4">
                        <div className="bg-red-900/30 border border-red-700/50 text-red-300 rounded-xl px-4 py-3 text-sm max-w-md">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    )
}
