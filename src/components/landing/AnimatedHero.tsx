"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
  CountUp,
} from "@/components/ui/animations";
import FloatingOrbs from "@/components/FloatingOrbs";

type AnimatedHeroProps = {
  locale: string;
  isAr: boolean;
  t: {
    landing: Record<string, string>;
  };
  stats: { value: string; label: string }[];
};

export default function AnimatedHero({
  locale,
  isAr,
  t,
  stats,
}: AnimatedHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Floating abstract blur orbs */}
      <FloatingOrbs variant="hero" />

      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div>
            <FadeIn delay={0.1}>
              <div className="pill">
                {isAr ? "ناس الشرقية 🇸🇦" : "🇸🇦 Eastern Region Community"}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                {t.landing.heroTitle}
                <br />
                <span className="text-gradient-gold">
                  {t.landing.heroTitleAccent}
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.35}>
              <p className="mt-6 text-lg text-muted leading-relaxed max-w-lg">
                {t.landing.heroSubtitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={`/${locale}/signup`} className="btn-primary">
                  {t.landing.heroCta}
                </Link>
                <a href="#tracks" className="btn-secondary">
                  {t.landing.heroSecondaryCta}
                </a>
              </div>
            </FadeIn>

            {/* Mini stats row */}
            <StaggerChildren className="mt-12 flex flex-wrap gap-8" delay={0.6} stagger={0.12}>
              {stats.map((stat) => {
                const isFraction = stat.value.includes("/");
                const hasPlus = stat.value.includes("+");
                const numericValue = parseInt(stat.value.replace(/[^0-9]/g, ""));
                return (
                  <StaggerItem key={stat.label}>
                    <div>
                      <div className="text-2xl font-bold text-gradient-gold">
                        {isFraction ? (
                          stat.value
                        ) : (
                          <CountUp
                            value={numericValue}
                            suffix={hasPlus ? "+" : ""}
                          />
                        )}
                      </div>
                      <div className="text-sm text-muted">{stat.label}</div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerChildren>
          </div>

          {/* Right: Hero mockup with glow */}
          <FadeIn delay={0.4} y={0}>
            <div className="relative">
              <div className="img-glow animate-float">
                <Image
                  src="/images/hero-mockup.svg"
                  alt="Athr Platform"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Floating accent card — liquid glass */}
              <div className="absolute -bottom-4 -start-4 sm:-start-8 card-elevated p-4 animate-pulse-glow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-gold flex items-center justify-center text-background font-bold text-sm">
                    6
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {isAr ? "مسارات متخصصة" : "Expert Tracks"}
                    </div>
                    <div className="text-xs text-muted">
                      {isAr
                        ? "من الذكاء الاصطناعي إلى الأعمال"
                        : "From AI to Business"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
