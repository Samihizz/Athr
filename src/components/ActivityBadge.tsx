import type { Badge } from "@/lib/badges";

interface ActivityBadgeProps {
  badge: Badge;
  locale: string;
  size?: "sm" | "md";
}

export default function ActivityBadge({
  badge,
  locale,
  size = "md",
}: ActivityBadgeProps) {
  const isAr = locale === "ar";
  const label = isAr ? badge.label_ar : badge.label_en;
  const isPositive = badge.type === "positive";

  const sizeClasses =
    size === "sm" ? "text-[11px] px-2.5 py-1 gap-1" : "text-xs px-3 py-1.5 gap-1.5";

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        backdrop-blur-md transition-all duration-200
        ${sizeClasses}
        ${
          isPositive
            ? "bg-gold/12 text-gold-light border border-gold/25 hover:bg-gold/18 hover:border-gold/35"
            : "bg-surface text-muted border border-border hover:bg-surface-hover hover:border-border-strong"
        }
      `}
      title={`${badge.emoji} ${label}`}
    >
      <span className="leading-none">{badge.emoji}</span>
      <span className="leading-tight">{label}</span>
    </span>
  );
}

interface BadgeRowProps {
  badges: Badge[];
  locale: string;
  size?: "sm" | "md";
}

export function BadgeRow({ badges, locale, size = "md" }: BadgeRowProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <ActivityBadge key={badge.id} badge={badge} locale={locale} size={size} />
      ))}
    </div>
  );
}
