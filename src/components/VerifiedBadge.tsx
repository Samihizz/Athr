/**
 * Gold checkmark badge shown next to verified members' names.
 * Usage: <VerifiedBadge /> or <VerifiedBadge size={18} />
 */
export default function VerifiedBadge({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label="Verified"
      role="img"
    >
      {/* Shield / badge shape */}
      <path
        d="M12 1L3 5V11C3 17.075 6.75 22.35 12 23.5C17.25 22.35 21 17.075 21 11V5L12 1Z"
        fill="url(#gold-gradient)"
      />
      {/* Checkmark */}
      <path
        d="M9.5 12.5L11 14.5L15 9.5"
        stroke="#050510"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="gold-gradient" x1="3" y1="1" x2="21" y2="23.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CCA300" />
          <stop offset="0.5" stopColor="#E6BE2E" />
          <stop offset="1" stopColor="#CCA300" />
        </linearGradient>
      </defs>
    </svg>
  );
}
