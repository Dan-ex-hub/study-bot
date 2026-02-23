import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signupUser } from '../api'

export default function Signup() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        if (!username.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all fields.')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            await signupUser(username.trim(), email.trim(), password)
            setSuccess('Account created successfully! Redirecting to login...')
            setTimeout(() => navigate('/login'), 1500)
        } catch (err) {
            const msg = err.response?.data?.detail || 'Signup failed. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create an account</h1>
                    <p className="text-gray-400 text-sm mt-1">Join Study Bot to start learning</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-[#2f2f2f] rounded-2xl p-6 border border-gray-700/30">
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-sm">
                            {success}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="johndoe"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#212121] border border-gray-600/40 text-gray-100 placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-colors text-sm"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#212121] border border-gray-600/40 text-gray-100 placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-colors text-sm"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#212121] border border-gray-600/40 text-gray-100 placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-colors text-sm"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#212121] border border-gray-600/40 text-gray-100 placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-colors text-sm"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>

                    <p className="text-center text-sm text-gray-400 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
