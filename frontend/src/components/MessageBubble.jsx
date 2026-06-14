import { useState, useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { LogoMark } from './Logo'

const mathJaxConfig = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
    },
    svg: { fontCache: 'global', scale: 1.15 },
    options: {
        enableMenu: false,
        renderActions: { addMenu: [] },
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process',
    },
    startup: { typeset: false },
}

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
            <div className="flex items-center justify-between px-4 py-2 bg-[#04070E]/90 border border-sky-400/20 rounded-t-xl">
                <span className="text-xs font-medium text-sky-300 uppercase tracking-wider">{language}</span>
                <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${copied ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                        }`}
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
                <code className={className}>{children}</code>
            </pre>
        </div>
    )
}

const InlineCode = ({ children }) => (
    <code className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/25 font-mono text-sm">{children}</code>
)

const processContent = (content) => {
    if (!content) return content
    const parts = content.split(/(\$\$[\s\S]*?\$\$)/g)
    return parts.map((part) => (part.startsWith('$$') && part.endsWith('$$') ? `\n\n${part}\n\n` : part)).join('')
}

const MessageContent = ({ content }) => {
    const processedContent = useMemo(() => processContent(content), [content])
    const markdownComponents = useMemo(() => ({
        code({ inline, className, children, ...props }) {
            return inline ? <InlineCode {...props}>{children}</InlineCode> : <CodeBlock className={className} {...props}>{children}</CodeBlock>
        },
        p({ children, node }) {
            const hasCodeBlock = node?.children?.some((child) => child.type === 'element' && child.tagName === 'code')
            return hasCodeBlock ? <>{children}</> : <p>{children}</p>
        },
    }), [])

    return (
        <div className="markdown-body prose prose-invert max-w-none">
            <MathJax dynamic hideUntilTypeset="first">
                <ReactMarkdown components={markdownComponents}>{processedContent}</ReactMarkdown>
            </MathJax>
        </div>
    )
}

function MessageActions({ message }) {
    const [showActions, setShowActions] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(message.content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }, [message.content])

    return (
        <div className="relative" onMouseEnter={() => setShowActions(true)} onMouseLeave={() => setShowActions(false)}>
            <div className={`absolute -top-10 right-0 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[var(--surface-2)]/95 backdrop-blur-xl border border-white/10 shadow-xl transition-all ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                }`}>
                <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Copy message">
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
            </div>
        </div>
    )
}

export default function MessageBubble({ message, index = 0 }) {
    const isUser = message.role === 'user'

    return useMemo(() => (
        <MathJaxContext config={mathJaxConfig}>
            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-fadeInUp`} style={{ animationDelay: `${Math.min(index * 0.04, 0.25)}s` }}>
                <div className={`flex gap-3 max-w-[88%] sm:max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'} relative`}>
                    {/* Avatar */}
                    {isUser ? (
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg border border-sky-400/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    ) : (
                        <LogoMark size={40} className="flex-shrink-0 shadow-lg" />
                    )}

                    <div className="flex-1 min-w-0 relative">
                        <div className={`rounded-2xl px-5 py-4 text-[0.9375rem] leading-relaxed shadow-xl transition-all ${isUser
                            ? 'bg-gradient-to-br from-sky-600 to-indigo-600 text-white rounded-br-md border border-sky-400/20'
                            : 'bg-white/[0.04] text-slate-100 rounded-bl-md border border-[var(--line)] backdrop-blur-sm hover:bg-white/[0.06]'
                            }`}>
                            {isUser ? (
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            ) : (
                                <div className="streaming-message"><MessageContent content={message.content} /></div>
                            )}
                        </div>

                        {!isUser && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MessageActions message={message} />
                            </div>
                        )}

                        {message.timestamp && (
                            <div className={`mt-1.5 text-xs text-[var(--text-mute)] ${isUser ? 'text-right' : 'text-left'}`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MathJaxContext>
    ), [message, index, isUser])
}
