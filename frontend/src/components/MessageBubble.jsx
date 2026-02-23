import { useState } from 'react'
import { MathJax, MathJaxContext } from 'better-react-mathjax'

// Separate component for code blocks with copy button
function CodeBlock({ children }) {
    const [copied, setCopied] = useState(false)
    const codeText = String(children)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={handleCopy}
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: copied ? '#4ade80' : '#9ca3af',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    zIndex: 1
                }}
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <code style={{
                display: 'block',
                fontFamily: 'monospace',
                fontSize: '0.85em',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#e2e8f0',
                paddingTop: '8px'
            }}>
                {children}
            </code>
        </div>
    )
}

// Convert LaTeX delimiters to MathJax compatible format
function prepareMathContent(text) {
    if (!text) return text

    let result = text

    // Convert \[...\] to $$...$$ for display math
    result = result.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')

    // Convert \(...\) to $...$ for inline math
    result = result.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')

    return result
}

// Parse content and extract math expressions
function parseContent(text) {
    if (!text) return []

    const prepared = prepareMathContent(text)
    const parts = []
    let lastIndex = 0

    // Match display math $$...$$
    const displayMathRegex = /\$\$([\s\S]*?)\$\$/g
    // Match inline math $...$
    const inlineMathRegex = /\$([^\$\n]+?)\$/g

    // Collect all matches
    const matches = []

    let match
    // Find display math
    while ((match = displayMathRegex.exec(prepared)) !== null) {
        matches.push({ type: 'display', math: match[1], start: match.index, end: match.index + match[0].length })
    }
    // Find inline math
    while ((match = inlineMathRegex.exec(prepared)) !== null) {
        // Skip if already captured as display math
        const isOverlap = matches.some(m => match.index >= m.start && match.index < m.end)
        if (!isOverlap) {
            matches.push({ type: 'inline', math: match[1], start: match.index, end: match.index + match[0].length })
        }
    }

    // Sort by position
    matches.sort((a, b) => a.start - b.start)

    // Build parts array
    for (const m of matches) {
        if (m.start > lastIndex) {
            parts.push({ type: 'text', content: prepared.slice(lastIndex, m.start) })
        }
        parts.push({ type: m.type, math: m.math })
        lastIndex = m.end
    }

    if (lastIndex < prepared.length) {
        parts.push({ type: 'text', content: prepared.slice(lastIndex) })
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: prepared }]
}

// Render text with markdown formatting
function renderText(text) {
    if (!text) return ''

    let result = text

    // Escape HTML
    result = result
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')

    // Bold **text**
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

    // Italic *text*
    result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')

    // Code blocks ```code```
    result = result.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre style="background:#1e1e2e;border-radius:8px;padding:12px;margin:8px 0;overflow-x:auto;"><code>$2</code></pre>')

    // Inline code `code`
    result = result.replace(/`([^`]+)`/g, '<code style="background:rgba(100,100,150,0.3);padding:2px 6px;border-radius:4px;color:#f472b6;font-family:monospace;font-size:0.9em;">$1</code>')

    // Line breaks
    result = result.replace(/\n/g, '<br/>')

    return result
}

// MathJax configuration for dark theme
const mathJaxConfig = {
    tex: {
        inlineMath: [['$', '$']],
        displayMath: [['$$', '$$']],
        processEscapes: true,
    },
    svg: {
        fontCache: 'global',
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    }
}

// Component to render message content with MathJax
function MessageContent({ content }) {
    const parts = parseContent(content)

    return (
        <MathJaxContext config={mathJaxConfig}>
            <div className="markdown-body">
                {parts.map((part, index) => {
                    if (part.type === 'display') {
                        return (
                            <MathJax key={index} dynamic>
                                {"$$" + part.math + "$$"}
                            </MathJax>
                        )
                    } else if (part.type === 'inline') {
                        return (
                            <MathJax key={index} dynamic inline>
                                {"$" + part.math + "$"}
                            </MathJax>
                        )
                    } else {
                        return (
                            <span
                                key={index}
                                dangerouslySetInnerHTML={{ __html: renderText(part.content) }}
                            />
                        )
                    }
                })}
            </div>
        </MathJaxContext>
    )
}

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user'

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                    className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}
                    `}
                >
                    {isUser ? 'U' : 'AI'}
                </div>

                {/* Message content */}
                <div
                    className={`
                        rounded-2xl px-4 py-3 text-sm leading-relaxed
                        ${isUser
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-[#2f2f2f] text-gray-100 rounded-bl-md'
                        }
                    `}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <MessageContent content={message.content} />
                    )}
                </div>
            </div>
        </div>
    )
}
