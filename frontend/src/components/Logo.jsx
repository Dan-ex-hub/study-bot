// StudyBot brand mark — a graduation cap fused with a chat spark.
// Reusable across login, sidebar, top bar, empty states, etc.

export function LogoMark({ size = 40, className = '' }) {
    return (
        <div
            className={`relative flex items-center justify-center rounded-2xl overflow-hidden ${className}`}
            style={{ width: size, height: size }}
        >
            <div className="absolute inset-0 brand-gradient" />
            <div className="absolute inset-0 bg-black/10" />
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                className="relative"
                style={{ width: size * 0.56, height: size * 0.56 }}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* graduation cap */}
                <path d="M2 8.5 12 4l10 4.5-10 4.5L2 8.5Z" />
                <path d="M6 10.7v3.8c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5v-3.8" />
                <path d="M21 9v4" />
            </svg>
        </div>
    )
}

export function LogoFull({ size = 40, subtitle = true, className = '' }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <LogoMark size={size} />
            <div className="leading-tight">
                <div className="font-extrabold tracking-tight text-white text-lg">
                    Study<span className="brand-text">Bot</span>
                </div>
                {subtitle && (
                    <div className="text-[11px] text-[var(--text-mute)] font-medium tracking-wide">
                        AI Learning Companion
                    </div>
                )}
            </div>
        </div>
    )
}

export default LogoFull
