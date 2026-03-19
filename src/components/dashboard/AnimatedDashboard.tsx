"use client";

import { type ReactNode } from "react";
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
  children,
  className,
}: {
  value?: number;
  label?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <FadeIn className={className} duration={0.4}>
      {children ? (
        children
      ) : (
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-gradient-gold">
            <CountUp value={value ?? 0} />
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
