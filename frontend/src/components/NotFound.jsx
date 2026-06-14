import { useNavigate } from 'react-router-dom'
import { LogoMark } from './Logo'
import { isAuthenticated } from '../api'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen mesh-bg flex items-center justify-center px-4 relative overflow-hidden">
            <div className="aurora-blob w-[500px] h-[500px] bg-teal-500/18 -top-40 -left-32 animate-aurora" />
            <div className="aurora-blob w-[420px] h-[420px] bg-indigo-500/16 bottom-0 right-0 animate-aurora" style={{ animationDelay: '2.5s' }} />

            <div className="relative z-10 text-center max-w-md animate-fadeInUp">
                <div className="flex justify-center mb-8">
                    <LogoMark size={64} className="animate-float" />
                </div>

                <div className="text-[6rem] leading-none font-black brand-text mb-2 select-none">404</div>
                <h1 className="text-2xl font-bold text-white mb-3">Lost in the syllabus 📚</h1>
                <p className="text-[var(--text-dim)] text-sm mb-8 leading-relaxed">
                    This page doesn't exist. Let's get you back to studying.
                </p>

                <button
                    onClick={() => navigate(isAuthenticated() ? '/chat' : '/login')}
                    className="px-7 py-3 rounded-xl btn-brand font-semibold text-sm inline-flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to StudyBot
                </button>
            </div>
        </div>
    )
}
