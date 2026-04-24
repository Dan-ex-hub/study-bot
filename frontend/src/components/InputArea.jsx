import { useState, useRef, useEffect } from 'react'

export default function InputArea({ onSend, isLoading }) {
    const [input, setInput] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
        }
    }, [input])

    // Listen for quick suggestion clicks from ChatWindow
    useEffect(() => {
        const handleSuggestion = (e) => {
            setInput(e.detail)
            textareaRef.current?.focus()
        }
        window.addEventListener('quick-suggestion', handleSuggestion)
        return () => window.removeEventListener('quick-suggestion', handleSuggestion)
    }, [])

    // Auto-focus on mount
    useEffect(() => {
        textareaRef.current?.focus()
    }, [])

    // Handle image selection
    function handleImageSelect(e) {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file)
            
            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => setImagePreview(e.target.result)
            reader.readAsDataURL(file)
        }
    }

    // Remove selected image
    function removeImage() {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Convert image to base64
    function imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                // Remove the data:image/jpeg;base64, prefix
                const base64 = reader.result.split(',')[1]
                resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    async function handleSubmit(e) {
        e?.preventDefault()
        if (!input.trim() || isLoading) return
        
        let imageData = null
        if (selectedImage) {
            try {
                imageData = await imageToBase64(selectedImage)
            } catch (error) {
                console.error('Error converting image to base64:', error)
                return
            }
        }
        
        onSend(input, imageData)
        setInput('')
        removeImage()
        
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

    const charCount = input.length
    const isNearLimit = charCount > 4000

    return (
        <div className="relative px-4 py-5">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                    {/* Image preview */}
                    {imagePreview && (
                        <div className="mb-3 relative inline-block">
                            <div className="relative rounded-xl overflow-hidden border border-indigo-500/30 bg-white/[0.04] backdrop-blur-xl">
                                <img 
                                    src={imagePreview} 
                                    alt="Selected" 
                                    className="max-w-xs max-h-32 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                                    title="Remove image"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Image will be sent with your message</p>
                        </div>
                    )}

                    {/* Main input container */}
                    <div
                        className={`
                            flex items-end gap-3 rounded-2xl px-5 py-4
                            bg-white/[0.04] backdrop-blur-xl border
                            transition-all duration-300 shadow-xl
                            ${isFocused
                                ? 'border-indigo-500/40 bg-white/[0.06] shadow-indigo-500/10'
                                : 'border-white/[0.1] shadow-black/20'
                            }
                        `}
                    >
                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Ask me anything about your studies... (Shift + Enter for new line)"
                            rows={1}
                            className="
                                flex-1 bg-transparent text-slate-100 placeholder-slate-500
                                resize-none outline-none text-[0.9375rem] leading-7
                                max-h-[200px] min-h-[28px]
                            "
                            disabled={isLoading}
                        />

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Character count (when near limit) */}
                            {isNearLimit && (
                                <div className={`text-xs font-medium px-2 ${charCount > 5000 ? 'text-red-400' : 'text-amber-400'}`}>
                                    {charCount}/5000
                                </div>
                            )}

                            {/* Image upload button */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="
                                    p-2.5 rounded-xl
                                    bg-white/[0.05] hover:bg-white/[0.1]
                                    text-slate-400 hover:text-slate-200
                                    border border-white/[0.08]
                                    transition-all duration-200
                                    hover:scale-105 active:scale-95
                                "
                                title="Upload image"
                                disabled={isLoading}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>

                            {/* Clear button (when has text or image) */}
                            {(input.trim() || selectedImage) && !isLoading && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInput('')
                                        removeImage()
                                        textareaRef.current?.focus()
                                    }}
                                    className="
                                        p-2.5 rounded-xl
                                        bg-white/[0.05] hover:bg-white/[0.1]
                                        text-slate-400 hover:text-slate-200
                                        border border-white/[0.08]
                                        transition-all duration-200
                                        hover:scale-105 active:scale-95
                                    "
                                    title="Clear"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            {/* Send button */}
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading || charCount > 5000}
                                className={`
                                    relative overflow-hidden p-2.5 rounded-xl flex items-center justify-center
                                    transition-all duration-300 min-w-[44px] min-h-[44px]
                                    ${input.trim() && !isLoading && charCount <= 5000
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 cursor-pointer'
                                        : 'bg-white/[0.05] text-slate-500 cursor-not-allowed border border-white/[0.08]'
                                    }
                                `}
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <svg className="w-5 h-5 animate-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Helper text */}
                    <div className="flex items-center justify-between mt-3 px-2">
                        <p className="text-xs text-slate-600 tracking-wide">
                            Study Bot can make mistakes. Verify important information. {selectedImage && '• Image will be analyzed'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                            <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-500 font-mono">Enter</kbd> to send</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-500 font-mono">Shift + Enter</kbd> for new line</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
