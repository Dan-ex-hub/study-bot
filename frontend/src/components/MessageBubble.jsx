import { useState, useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { MathJax, MathJaxContext } from 'better-react-mathjax'

// MathJax configuration
const mathJaxConfig = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
    },
    svg: {
        fontCache: 'global',
        scale: 1.2,
    },
    options: {
        enableMenu: false,
        renderActions: {
            addMenu: [],
        },
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process',
    },
    startup: {
        typeset: false,
    },
}

// Code block component with copy functionality
function CodeBlock({ children, className }) {
    const [copied, setCopied] = useState(false)
    const language = className?.replace('language-', '') || 'text'
    const codeText = String(children).replace(/\n$/, '')

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(codeText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }, [codeText])

    return (
        <div className="relative group my-4">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0A0A0F]/90 border border-indigo-500/20 rounded-t-xl">
                <span className="text-xs font-medium text-indigo-300 uppercase tracking-wider">
                    {language}
                </span>
                <button
                    onClick={handleCopy}
                    className={`
                        flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200
                        ${copied
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                        }
                    `}
                >
                    {copied ? (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="!mt-0 !rounded-t-none overflow-x-auto">
                <code className={className}>
                    {children}
                </code>
            </pre>
        </div>
    )
}

// Inline code component
const InlineCode = ({ children }) => (
    <code className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-mono text-sm">
        {children}
    </code>
)

// Process content to wrap display math in proper blocks
const processContent = (content) => {
    if (!content) return content
    
    // Split by display math ($$...$$) and wrap each in a div
    const parts = content.split(/($$[\s\S]*?$$)/g)
    return parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            // Display math - wrap in a centered box
            return `\n\n${part}\n\n`
        }
        return part
    }).join('')
}

// Message content with markdown and math support
const MessageContent = ({ content }) => {
    // Memoize processed content to prevent unnecessary re-processing during streaming
    const processedContent = useMemo(() => processContent(content), [content])
    
    // Memoize markdown components to prevent re-creation on every render
    const markdownComponents = useMemo(() => ({
        code({ node, inline, className, children, ...props }) {
            return inline ? (
                <InlineCode {...props}>{children}</InlineCode>
            ) : (
                <CodeBlock className={className} {...props}>
                    {children}
                </CodeBlock>
            )
        },
        // Prevent <pre> from being wrapped in <p>
        p({ children, node }) {
            const hasCodeBlock = node?.children?.some(
                child => child.type === 'element' && child.tagName === 'code'
            )
            if (hasCodeBlock) {
                return <>{children}</>
            }
            return <p>{children}</p>
        },
    }), [])
    
    return (
        <div className="markdown-body prose prose-invert max-w-none">
            <MathJax dynamic hideUntilTypeset="first">
                <ReactMarkdown components={markdownComponents}>
                    {processedContent}
                </ReactMarkdown>
            </MathJax>
        </div>
    )
}

// Message actions (copy, regenerate, etc.)
function MessageActions({ message, onCopy, onRegenerate }) {
    const [showActions, setShowActions] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(message.content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            onCopy?.()
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }, [message.content, onCopy])

    const handleMouseEnter = useCallback(() => setShowActions(true), [])
    const handleMouseLeave = useCallback(() => setShowActions(false), [])

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={`
                    absolute -top-10 right-0 flex items-center gap-1 px-2 py-1.5 rounded-lg
                    bg-[#1A1A24]/95 backdrop-blur-xl border border-white/10 shadow-xl
                    transition-all duration-200
                    ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                `}
            >
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Copy message"
                >
                    {copied ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
                {message.role === 'assistant' && onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Regenerate response"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}

export default function MessageBubble({ message, index = 0, onRegenerate }) {
    const isUser = message.role === 'user'

    // Memoize the message bubble to prevent unnecessary re-renders during streaming
    return useMemo(() => (
        <MathJaxContext config={mathJaxConfig}>
            <div
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-fadeInUp`}
                style={{ 
                    animationDelay: `${Math.min(index * 0.05, 0.3)}s`,
                    willChange: 'transform, opacity' // Optimize for animations
                }}
            >
                <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} relative`}>
                    {/* Avatar */}
                    <div
                        className={`
                            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg
                            transition-transform duration-300 group-hover:scale-110
                            ${isUser
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30 border border-blue-400/20'
                                : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-indigo-500/30 border border-indigo-400/20'
                            }
                        `}
                    >
                        {isUser ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        )}
                    </div>

                    {/* Message content */}
                    <div className="flex-1 min-w-0 relative">
                        <div
                            className={`
                                rounded-2xl px-5 py-4 text-[0.9375rem] leading-relaxed shadow-xl
                                transition-all duration-300 message-bubble
                                ${isUser
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md shadow-blue-500/20 border border-blue-400/20'
                                    : 'bg-white/[0.04] text-slate-100 rounded-bl-md border border-white/[0.08] backdrop-blur-sm shadow-black/20 hover:bg-white/[0.06] hover:border-white/[0.12]'
                                }
                            `}
                        >
                            {isUser ? (
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            ) : (
                                <div className="streaming-message">
                                    <MessageContent content={message.content} />
                                </div>
                            )}
                        </div>

                        {/* Message actions - only show on hover */}
                        {!isUser && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <MessageActions message={message} onRegenerate={onRegenerate} />
                            </div>
                        )}

                        {/* Timestamp */}
                        {message.timestamp && (
                            <div className={`mt-2 text-xs text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MathJaxContext>
    ), [message, index, onRegenerate, isUser])
}