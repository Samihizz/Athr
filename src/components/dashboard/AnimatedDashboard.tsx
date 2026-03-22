"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
  CountUp,
  PageFadeIn,
} from "@/components/ui/animations";

/* ─── Animated wrapper for the entire dashboard ─── */
export function DashboardFadeIn({ children }: { children: ReactNode }) {
  return <PageFadeIn>{children}</PageFadeIn>;
}

/* ─── Animated stat card ─── */
export function AnimatedStatCard({
  value,
  label,
  suffix,
  icon,
  children,
  className,
}: {
  value?: number;
  label?: string;
  suffix?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <FadeIn className={className} duration={0.4}>
      {children ? (
        children
      ) : (
        <div className="glass rounded-xl p-5 text-center">
          {icon && <div className="flex justify-center mb-2 text-muted">{icon}</div>}
          <div className="text-2xl font-bold text-gradient-gold">
            <CountUp value={value ?? 0} suffix={suffix} />
          </div>
          <div className="text-xs text-muted mt-1">{label}</div>
        </div>
      )}
    </FadeIn>
  );
}

/* ─── Staggered stat row ─── */
export function AnimatedStatsRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <StaggerChildren className={className} stagger={0.08}>
      {children}
    </StaggerChildren>
  );
}

export function AnimatedStatsItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <StaggerItem className={className}>{children}</StaggerItem>;
}

/* ─── Quick links stagger ─── */
export function AnimatedQuickLinks({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <StaggerChildren className={className} stagger={0.06} delay={0.15}>
      {children}
    </StaggerChildren>
  );
}

export function AnimatedQuickLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <StaggerItem className={className}>{children}</StaggerItem>;
}

/* ─── Quick action card with hover glow ─── */
export function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group glass rounded-xl p-5 flex items-start gap-4 border border-transparent hover:border-gold/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(204,163,0,0.08)]"
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-sm leading-tight">{title}</h3>
        <p className="text-xs text-muted mt-1 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

/* ─── Content section fade-in ─── */
export function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <FadeIn className={className} delay={delay}>
      {children}
    </FadeIn>
  );
}

/* ─── Section heading with optional "View All" link ─── */
export function SectionHeader({
  title,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold">{title}</h2>
      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref}
          className="text-sm text-gold hover:text-gold-light transition-colors"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}

/* ─── Profile completion bar ─── */
export function ProfileCompletionBar({
  percentage,
  label,
}: {
  percentage: number;
  label: string;
}) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-medium text-gold">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full gradient-gold transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
