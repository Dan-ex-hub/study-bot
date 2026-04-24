import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

const AVAILABLE_MODELS = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', icon: '⚡' },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B Vision', icon: '👁️' },
    // Legacy models (may not work with current API)
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (Legacy)', icon: '🔧' },
]

const QUICK_PROMPTS = [
    { icon: '📚', text: 'Explain quantum mechanics', category: 'Physics' },
    { icon: '🧮', text: 'Help with calculus derivatives', category: 'Math' },
    { icon: '🧬', text: 'Summarize DNA replication', category: 'Biology' },
    { icon: '📜', text: 'Explain the French Revolution', category: 'History' },
    { icon: '💻', text: 'Teach me Python basics', category: 'Programming' },
    { icon: '🌍', text: 'Climate change causes', category: 'Science' },
]

export default function ChatWindow({ messages, isLoading, error, username, selectedModel, onModelChange }) {
    const bottomRef = useRef(null)
    const [mounted, setMounted] = useState(false)
    const [showScrollButton, setShowScrollButton] = useState(false)
    const scrollContainerRef = useRef(null)

    useEffect(() => { setMounted(true) }, [])

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    // Show/hide scroll to bottom button
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
            setShowScrollButton(!isNearBottom && messages.length > 0)
        }

        container.addEventListener('scroll', handleScroll)
        return () => container.removeEventListener('scroll', handleScroll)
    }, [messages.length])

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleQuickPrompt = (text) => {
        const event = new CustomEvent('quick-suggestion', { detail: text })
        window.dispatchEvent(event)
    }

    const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0]

    return (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6 relative">
            {/* Subtle mesh gradient background */}
            <div className="absolute inset-0 gradient-bg-mesh opacity-20 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Model selector - Enhanced */}
                <div className="flex justify-end mb-8 animate-fadeInDown">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <select
                            value={selectedModel}
                            onChange={(e) => onModelChange(e.target.value)}
                            className="
                                relative appearance-none bg-white/[0.05] text-slate-200 text-sm font-medium 
                                rounded-full px-5 py-2.5 pr-12 border border-white/[0.1] 
                                focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.08]
                                cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.15]
                                transition-all duration-300 shadow-lg backdrop-blur-xl
                            "
                        >
                            {AVAILABLE_MODELS.map((model) => (
                                <option key={model.id} value={model.id} className="bg-[#1A1A24] text-slate-200">
                                    {model.icon} {model.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50 animate-pulse" />
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty state - Enhanced welcome */}
                {messages.length === 0 && !isLoading && (
                    <div className={`flex flex-col items-center justify-center min-h-[60vh] text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {/* Animated icon */}
                        <div className="relative mb-10">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-3xl animate-pulse-glow" />
                            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/[0.1] flex items-center justify-center shadow-2xl animate-float">
                                <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            {/* Orbiting particles */}
                            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-cyan-400/60 animate-bounce-subtle" />
                            <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-purple-400/60 animate-bounce-subtle" style={{ animationDelay: '0.5s' }} />
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                            Hey <span className="gradient-text-vibrant animate-gradient">{username || 'there'}</span>! 👋
                        </h2>
                        <p className="text-slate-400 text-base max-w-xl mb-4 leading-relaxed">
                            I'm your AI study companion, powered by <span className="text-indigo-400 font-semibold">{currentModel.name}</span>.
                            Ask me anything about your studies and I'll help you learn with clarity and precision.
                        </p>
                        <p className="text-slate-500 text-sm mb-12">
                            Try one of these quick prompts to get started ✨
                        </p>

                        {/* Quick prompt cards - Enhanced grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full px-4">
                            {QUICK_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleQuickPrompt(prompt.text)}
                                    className="
                                        group relative px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08]
                                        hover:bg-white/[0.06] hover:border-indigo-500/30
                                        transition-all duration-300 text-left
                                        hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10
                                        active:scale-[0.98]
                                    "
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            {prompt.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                                                {prompt.category}
                                            </div>
                                            <div className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                                {prompt.text}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="space-y-1">
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} index={index} />
                    ))}
                </div>

                {/* Loading indicator - Enhanced */}
                {isLoading && (
                    <div className="flex justify-start mb-6 mt-4 animate-fadeInUp">
                        <div className="flex gap-3 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white border border-indigo-400/20 shadow-lg shadow-indigo-500/30 animate-pulse">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div className="bg-white/[0.04] rounded-2xl rounded-bl-md px-6 py-4 border border-white/[0.08] backdrop-blur-sm min-w-[100px]">
                                <div className="flex gap-2 items-center h-6">
                                    <span className="typing-dot w-2.5 h-2.5 bg-indigo-400 rounded-full shadow-lg shadow-indigo-500/50"></span>
                                    <span className="typing-dot w-2.5 h-2.5 bg-purple-400 rounded-full shadow-lg shadow-purple-500/50"></span>
                                    <span className="typing-dot w-2.5 h-2.5 bg-pink-400 rounded-full shadow-lg shadow-pink-500/50"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error message - Enhanced */}
                {error && (
                    <div className="flex justify-center mb-6 animate-fadeInUp">
                        <div className="bg-red-500/[0.1] border border-red-500/30 text-red-300 rounded-2xl px-6 py-4 text-sm max-w-md backdrop-blur-sm shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-semibold mb-1">Oops! Something went wrong</div>
                                    <div className="text-red-200/80">{error}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="
                        fixed bottom-24 right-8 w-12 h-12 rounded-full
                        bg-indigo-600 hover:bg-indigo-500 text-white
                        shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40
                        flex items-center justify-center
                        transition-all duration-300 hover:scale-110 active:scale-95
                        animate-fadeInUp z-20
                    "
                    aria-label="Scroll to bottom"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            )}
        </div>
    )
}
