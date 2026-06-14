import { useState, useRef, useEffect } from 'react'
import { useToast } from './Toast'

const MAX_CHARS = 5000
const MAX_IMAGE_MB = 4

export default function InputArea({ onSend, isLoading }) {
    const [input, setInput] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)
    const toast = useToast()

    useEffect(() => {
        const ta = textareaRef.current
        if (ta) {
            ta.style.height = 'auto'
            ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
        }
    }, [input])

    useEffect(() => {
        const handleSuggestion = (e) => {
            setInput(e.detail)
            textareaRef.current?.focus()
        }
        window.addEventListener('quick-suggestion', handleSuggestion)
        return () => window.removeEventListener('quick-suggestion', handleSuggestion)
    }, [])

    useEffect(() => { textareaRef.current?.focus() }, [])

    function handleImageSelect(e) {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (PNG, JPG, etc.).')
            e.target.value = ''
            return
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            toast.error(`Image is too large. Max size is ${MAX_IMAGE_MB}MB.`)
            e.target.value = ''
            return
        }
        setSelectedImage(file)
        const reader = new FileReader()
        reader.onload = (ev) => setImagePreview(ev.target.result)
        reader.onerror = () => toast.error('Failed to read the image. Try another file.')
        reader.readAsDataURL(file)
    }

    function removeImage() {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    function imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result.split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    async function handleSubmit(e) {
        e?.preventDefault()
        if ((!input.trim() && !selectedImage) || isLoading) return
        if (input.length > MAX_CHARS) {
            toast.error(`Message is too long. Keep it under ${MAX_CHARS} characters.`)
            return
        }

        let imageData = null
        if (selectedImage) {
            try {
                imageData = await imageToBase64(selectedImage)
            } catch {
                toast.error('Could not process the image. Please try again.')
                return
            }
        }

        onSend(input, imageData)
        setInput('')
        removeImage()
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const charCount = input.length
    const isNearLimit = charCount > 4000
    const canSend = (input.trim() || selectedImage) && !isLoading && charCount <= MAX_CHARS

    return (
        <div className="relative px-4 py-5">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                    {imagePreview && (
                        <div className="mb-3 relative inline-block">
                            <div className="relative rounded-xl overflow-hidden border border-sky-400/30 bg-white/[0.04]">
                                <img src={imagePreview} alt="Selected" className="max-w-xs max-h-32 object-cover" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white transition-colors"
                                    title="Remove image"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-xs text-[var(--text-mute)] mt-1">📎 Image will be sent with your message</p>
                        </div>
                    )}

                    <div
                        className={`flex items-end gap-2.5 rounded-2xl px-4 py-3.5 bg-white/[0.04] backdrop-blur-xl border transition-all duration-300 ${isFocused ? 'border-sky-400/40 bg-white/[0.06] shadow-lg shadow-sky-500/5' : 'border-[var(--line-strong)]'
                            }`}
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Ask me anything about your studies... (Shift + Enter for a new line)"
                            rows={1}
                            className="flex-1 bg-transparent text-slate-100 placeholder-[var(--text-mute)] resize-none outline-none text-[0.9375rem] leading-7 max-h-[200px] min-h-[28px]"
                            disabled={isLoading}
                        />

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {isNearLimit && (
                                <div className={`text-xs font-medium px-1 ${charCount > MAX_CHARS ? 'text-rose-400' : 'text-amber-400'}`}>
                                    {charCount}/{MAX_CHARS}
                                </div>
                            )}

                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[var(--text-mute)] hover:text-slate-200 border border-[var(--line)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                title="Attach image"
                                disabled={isLoading}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>

                            {(input.trim() || selectedImage) && !isLoading && (
                                <button
                                    type="button"
                                    onClick={() => { setInput(''); removeImage(); textareaRef.current?.focus() }}
                                    className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[var(--text-mute)] hover:text-slate-200 border border-[var(--line)] transition-all hover:scale-105 active:scale-95"
                                    title="Clear"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={!canSend}
                                className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-300 min-w-[44px] min-h-[44px] ${canSend ? 'btn-brand cursor-pointer' : 'bg-white/[0.05] text-[var(--text-mute)] cursor-not-allowed border border-[var(--line)]'
                                    }`}
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <svg className="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 px-2">
                        <p className="text-xs text-[var(--text-mute)]">
                            StudyBot can make mistakes. Verify important info.{selectedImage && ' • Image attached'}
                        </p>
                        <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--text-mute)]">
                            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-[var(--line)] font-mono">Enter</kbd> send</span>
                            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-[var(--line)] font-mono">Shift+Enter</kbd> new line</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
