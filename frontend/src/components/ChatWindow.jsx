import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import { LogoMark } from './Logo'

const AVAILABLE_MODELS = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', icon: '⚡', tag: 'Fast & smart' },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout Vision', icon: '👁️', tag: 'Reads images' },
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', icon: '🧠', tag: 'Legacy' },
]

const QUICK_PROMPTS = [
    { icon: '⚛️', text: 'Explain quantum mechanics simply', category: 'Physics' },
    { icon: '🧮', text: 'Help me understand calculus derivatives', category: 'Math' },
    { icon: '🧬', text: 'Summarize how DNA replication works', category: 'Biology' },
    { icon: '📜', text: 'Explain the French Revolution', category: 'History' },
    { icon: '💻', text: 'Teach me Python basics', category: 'Coding' },
    { icon: '🌍', text: 'What causes climate change?', category: 'Science' },
]

export default function ChatWindow({ messages, isLoading, error, username, selectedModel, onModelChange, onRetry }) {
    const bottomRef = useRef(null)
    const [mounted, setMounted] = useState(false)
    const [showScrollButton, setShowScrollButton] = useState(false)
    const scrollContainerRef = useRef(null)
    const isUserScrolledUp = useRef(false)
    const lastMessageCount = useRef(0)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        const currentCount = messages.length
        const isNewMessage = currentCount !== lastMessageCount.current
        if (isNewMessage) {
            lastMessageCount.current = currentCount
            isUserScrolledUp.current = false
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        } else if (!isUserScrolledUp.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'instant' })
        }
    }, [messages, isLoading])

    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
            isUserScrolledUp.current = !isNearBottom
            setShowScrollButton(!isNearBottom && messages.length > 0)
        }
        container.addEventListener('scroll', handleScroll, { passive: true })
        return () => container.removeEventListener('scroll', handleScroll)
    }, [messages.length])

    const scrollToBottom = () => {
        isUserScrolledUp.current = false
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleQuickPrompt = (text) => {
        window.dispatchEvent(new CustomEvent('quick-suggestion', { detail: text }))
    }

    const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0]

    return (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6 relative">
            <div className="absolute inset-0 mesh-bg opacity-25 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Model selector */}
                <div className="flex justify-end mb-6 animate-fadeInDown">
                    <div className="relative">
                        <select
                            value={selectedModel}
                            onChange={(e) => onModelChange(e.target.value)}
                            className="appearance-none bg-white/[0.05] text-slate-200 text-sm font-medium rounded-full px-5 py-2.5 pr-11 border border-[var(--line-strong)] focus:outline-none focus:border-sky-400/40 cursor-pointer hover:bg-white/[0.08] transition-all backdrop-blur-xl"
                        >
                            {AVAILABLE_MODELS.map((m) => (
                                <option key={m.id} value={m.id} className="bg-[var(--surface-2)] text-slate-200">
                                    {m.icon} {m.name} — {m.tag}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <svg className="w-4 h-4 text-[var(--text-mute)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Empty state */}
                {messages.length === 0 && !isLoading && !error && (
                    <div className={`flex flex-col items-center justify-center min-h-[58vh] text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <LogoMark size={88} className="mb-8 animate-float shadow-2xl" />

                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
                            Hey <span className="brand-text animate-gradient">{username || 'there'}</span>! 👋
                        </h2>
                        <p className="text-[var(--text-dim)] text-base max-w-xl mb-2 leading-relaxed">
                            I'm StudyBot, your AI learning companion running on{' '}
                            <span className="text-sky-300 font-semibold">{currentModel.name}</span>.
                        </p>
                        <p className="text-[var(--text-mute)] text-sm mb-10">Pick a prompt below or ask me anything ✨</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full px-2">
                            {QUICK_PROMPTS.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleQuickPrompt(p.text)}
                                    className="group px-4 py-4 rounded-2xl bg-white/[0.03] border border-[var(--line)] hover:bg-white/[0.06] hover:border-sky-400/30 transition-all text-left hover:-translate-y-0.5"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{p.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-bold text-sky-300/90 uppercase tracking-wider mb-1">{p.category}</div>
                                            <div className="text-sm text-slate-300 group-hover:text-white transition-colors leading-snug">{p.text}</div>
                                        </div>
                                    </div>
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

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-start mb-6 mt-4 animate-fadeInUp">
                        <div className="flex gap-3 items-start">
                            <LogoMark size={40} className="flex-shrink-0 animate-pulse" />
                            <div className="bg-white/[0.04] rounded-2xl rounded-bl-md px-6 py-4 border border-[var(--line)] backdrop-blur-sm min-w-[90px]">
                                <div className="flex gap-2 items-center h-6">
                                    <span className="typing-dot w-2.5 h-2.5 bg-teal-400 rounded-full" />
                                    <span className="typing-dot w-2.5 h-2.5 bg-sky-400 rounded-full" />
                                    <span className="typing-dot w-2.5 h-2.5 bg-indigo-400 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error with retry */}
                {error && (
                    <div className="flex justify-center mb-6 animate-fadeInUp">
                        <div className="bg-rose-500/[0.08] border border-rose-500/30 text-rose-200 rounded-2xl px-5 py-4 text-sm max-w-md backdrop-blur-sm shadow-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white mb-0.5">Couldn't get a response</div>
                                    <div className="text-rose-200/80">{error}</div>
                                    {onRetry && (
                                        <button
                                            onClick={onRetry}
                                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Try again
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-28 right-6 sm:right-8 w-11 h-11 rounded-full btn-brand flex items-center justify-center animate-fadeInUp z-20"
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
