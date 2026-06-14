import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, getErrorMessage } from '../api'
import { LogoMark } from './Logo'
import { useToast } from './Toast'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const navigate = useNavigate()
    const toast = useToast()

    useEffect(() => { setMounted(true) }, [])

    function validate() {
        if (!email.trim() || !password.trim()) return 'Please fill in all fields.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.'
        return ''
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const v = validate()
        if (v) { setError(v); return }

        setLoading(true)
        setError('')
        try {
            const data = await loginUser(email.trim(), password)
            toast.success(`Welcome back, ${data.username}! 🎉`)
            navigate('/chat')
        } catch (err) {
            const msg = getErrorMessage(err, 'Login failed. Please check your credentials.')
            setError(msg)
            toast.error(msg, { title: 'Login failed' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-10 relative overflow-y-auto overflow-x-hidden">
            <div className="aurora-blob w-[520px] h-[520px] bg-teal-500/18 -top-40 -left-40 animate-aurora" />
            <div className="aurora-blob w-[440px] h-[440px] bg-indigo-500/16 bottom-0 right-0 animate-aurora" style={{ animationDelay: '2s' }} />
            <div className="aurora-blob w-[380px] h-[380px] bg-sky-500/14 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-aurora" style={{ animationDelay: '4s' }} />

            <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex flex-col items-center text-center mb-9">
                    <LogoMark size={68} className="mb-5 shadow-2xl animate-float" />
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back 👋</h1>
                    <p className="text-[var(--text-dim)] text-sm">Sign in to continue learning with StudyBot</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-7 sm:p-8">
                    {error && (
                        <div className="mb-6 px-4 py-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm animate-fadeInUp flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="field"
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="field pr-12"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)] hover:text-slate-200 transition-colors"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl btn-brand font-bold text-sm">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2.5">
                                <svg className="animate-spin-slow h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign in'}
                    </button>

                    <p className="text-center text-sm text-[var(--text-mute)] mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-sky-300 hover:text-sky-200 transition-colors font-semibold">
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
