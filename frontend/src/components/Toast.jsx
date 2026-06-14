import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) {
        // Safe no-op fallback so callers never crash if used outside provider
        return { notify: () => { }, success: () => { }, error: () => { }, info: () => { }, dismiss: () => { } }
    }
    return ctx
}

const ICONS = {
    success: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    error: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    info: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
}

const STYLES = {
    success: { ring: 'border-emerald-400/30', icon: 'text-emerald-300 bg-emerald-400/15', bar: 'bg-emerald-400' },
    error: { ring: 'border-rose-400/30', icon: 'text-rose-300 bg-rose-400/15', bar: 'bg-rose-400' },
    info: { ring: 'border-sky-400/30', icon: 'text-sky-300 bg-sky-400/15', bar: 'bg-sky-400' },
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const idRef = useRef(0)

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const notify = useCallback((message, type = 'info', opts = {}) => {
        const id = ++idRef.current
        const duration = opts.duration ?? 5000
        setToasts((prev) => [...prev, { id, message, type, title: opts.title, action: opts.action }])
        if (duration > 0) {
            setTimeout(() => dismiss(id), duration)
        }
        return id
    }, [dismiss])

    const api = {
        notify,
        dismiss,
        success: (msg, opts) => notify(msg, 'success', opts),
        error: (msg, opts) => notify(msg, 'error', opts),
        info: (msg, opts) => notify(msg, 'info', opts),
    }

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[min(92vw,380px)] pointer-events-none">
                {toasts.map((t) => {
                    const s = STYLES[t.type] || STYLES.info
                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto relative overflow-hidden glass-card rounded-2xl px-4 py-3.5 flex items-start gap-3 animate-toast ${s.ring}`}
                            role="alert"
                        >
                            <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${s.icon}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {ICONS[t.type] || ICONS.info}
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                {t.title && <div className="text-sm font-semibold text-white mb-0.5">{t.title}</div>}
                                <div className="text-sm text-[var(--text-dim)] break-words">{t.message}</div>
                                {t.action && (
                                    <button
                                        onClick={() => { t.action.onClick?.(); dismiss(t.id) }}
                                        className="mt-2 text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors"
                                    >
                                        {t.action.label}
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => dismiss(t.id)}
                                className="flex-shrink-0 text-[var(--text-mute)] hover:text-white transition-colors p-1 -mr-1 -mt-1"
                                aria-label="Dismiss"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className={`absolute bottom-0 left-0 h-0.5 ${s.bar} opacity-60`} style={{ width: '100%' }} />
                        </div>
                    )
                })}
            </div>
        </ToastContext.Provider>
    )
}

export default ToastProvider
