import type { TrackId } from "@/lib/tracks";

const trackSvgs: Record<string, React.ReactNode> = {
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 0 1 1h1a4 4 0 0 1 0 8h-1a1 1 0 0 0-1 1v1a4 4 0 0 1-8 0v-1a1 1 0 0 0-1-1H6a4 4 0 0 1 0-8h1a1 1 0 0 0 1-1V6a4 4 0 0 1 4-4z" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  creative: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  business: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  marketing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6z" />
      <polyline points="22,10 12,16 2,10" />
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  tech: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  ),
};

const trackColors: Record<string, { color: string; glow: string }> = {
  ai:        { color: "#A78BFA", glow: "rgba(139, 92, 246, 0.25)" },
  creative:  { color: "#F472B6", glow: "rgba(236, 72, 153, 0.25)" },
  business:  { color: "#FBBF24", glow: "rgba(245, 158, 11, 0.25)" },
  marketing: { color: "#34D399", glow: "rgba(16, 185, 129, 0.25)" },
  finance:   { color: "#60A5FA", glow: "rgba(59, 130, 246, 0.25)" },
  tech:      { color: "#818CF8", glow: "rgba(99, 102, 241, 0.25)" },
};

interface TrackIconProps {
  trackId: string;
  /** Icon size in px. Default 48 */
  size?: number;
  className?: string;
}

export default function TrackIcon({ trackId, size = 48, className = "" }: TrackIconProps) {
  const svg = trackSvgs[trackId];
  const colors = trackColors[trackId] ?? { color: "#A78BFA", glow: "rgba(139,92,246,0.25)" };
  const iconSize = Math.round(size * 0.46);
  const radius = Math.round(size * 0.29);

  return (
    <div
      className={`shrink-0 flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: `0 0 24px ${colors.glow}`,
        color: colors.color,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: iconSize,
          height: iconSize,
        }}
      >
        {svg}
      </div>
    </div>
  );
}
