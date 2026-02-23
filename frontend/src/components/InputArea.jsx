import { useState, useRef, useEffect } from 'react'

export default function InputArea({ onSend, isLoading }) {
    const [input, setInput] = useState('')
    const textareaRef = useRef(null)

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
        }
    }, [input])

    function handleSubmit(e) {
        e?.preventDefault()
        if (!input.trim() || isLoading) return
        onSend(input)
        setInput('')
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="border-t border-gray-700/30 bg-[#212121] px-4 py-3">
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                    <div className="flex items-end gap-2 bg-[#2f2f2f] rounded-2xl border border-gray-600/30 focus-within:border-gray-500/50 transition-colors px-4 py-2">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a study question..."
                            rows={1}
                            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none text-sm leading-6 max-h-[200px]"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`
                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                ${input.trim() && !isLoading
                                    ? 'bg-white text-black hover:bg-gray-200 cursor-pointer'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }
              `}
                            aria-label="Send message"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </form>
                <p className="text-center text-xs text-gray-500 mt-2">
                    Study Bot can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    )
}
