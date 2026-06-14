import { Component } from 'react'
import { LogoMark } from './Logo'

// Catches rendering errors anywhere in the tree and shows a recovery screen
// instead of a blank white page.
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] Caught error:', error, info)
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null })
        window.location.reload()
    }

    handleHome = () => {
        this.setState({ hasError: false, error: null })
        window.location.href = '/'
    }

    render() {
        if (!this.state.hasError) return this.props.children

        return (
            <div className="min-h-screen mesh-bg flex items-center justify-center px-4 relative overflow-hidden">
                <div className="aurora-blob w-[480px] h-[480px] bg-rose-500/20 -top-32 -right-32 animate-aurora" />
                <div className="aurora-blob w-[420px] h-[420px] bg-sky-500/15 bottom-0 left-0 animate-aurora" style={{ animationDelay: '2s' }} />

                <div className="glass-card rounded-3xl p-8 sm:p-10 max-w-md w-full text-center relative z-10 animate-scaleIn">
                    <div className="flex justify-center mb-6">
                        <LogoMark size={56} />
                    </div>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-400/15 text-rose-300 mb-5 mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Something broke</h1>
                    <p className="text-[var(--text-dim)] text-sm mb-6 leading-relaxed">
                        StudyBot hit an unexpected error and couldn't render this view.
                        Your data is safe — try reloading the app.
                    </p>

                    {this.state.error?.message && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-left">
                            <code className="text-xs text-rose-300/90 break-words">
                                {String(this.state.error.message).slice(0, 240)}
                            </code>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={this.handleHome}
                            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-sm transition-all"
                        >
                            Go Home
                        </button>
                        <button
                            onClick={this.handleReload}
                            className="flex-1 py-3 rounded-xl btn-brand font-semibold text-sm"
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
