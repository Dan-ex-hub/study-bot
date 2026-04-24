import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const navigate = useNavigate()

    useEffect(() => { setMounted(true) }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.')
            return
        }

        setLoading(true)
        setError('')

        try {
            await loginUser(email.trim(), password)
            navigate('/')
        } catch (err) {
            const msg = err.response?.data?.detail || 'Login failed. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-4 py-10 relative overflow-y-auto overflow-x-hidden">
            {/* Animated background orbs */}
            <div className="gradient-orb w-[500px] h-[500px] bg-indigo-600/20 -top-32 -left-32 animate-pulse-glow" />
            <div className="gradient-orb w-[400px] h-[400px] bg-purple-500/15 bottom-0 right-0 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
            <div className="gradient-orb w-[350px] h-[350px] bg-cyan-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" style={{ animationDelay: '3s' }} />

            {/* Mesh gradient overlay */}
            <div className="absolute inset-0 gradient-bg-mesh opacity-40 pointer-events-none" />

            <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Logo / Header */}
                <div className="text-center mb-10">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-2xl animate-pulse-glow" />
                        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/[0.12] flex items-center justify-center shadow-2xl animate-float">
                            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Welcome back</h1>
                    <p className="text-slate-400 text-base">Sign in to continue your learning journey</p>
                </div>

                {/* Form - Enhanced glassmorphism */}
                <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fadeInUp backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.12] text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all text-sm shadow-inner"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-7">
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.12] text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all text-sm shadow-inner"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="animate-rotate h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign in'}
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                            Create one now
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
