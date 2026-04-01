"use client";

import Link from "next/link";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
  CountUp,
} from "@/components/ui/animations";
import MeshGradientBackground from "./MeshGradientBackground";

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
      {/* Morphing mesh gradient background */}
      <MeshGradientBackground />

      {/* Subtle bottom fade to blend into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #050510 0%, transparent 100%)",
        }}
      />

      {/* Content — centered text over the constellation */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full z-10 text-center">
        <FadeIn delay={0.1}>
          <div className="pill inline-block">
            {isAr ? "ناس الشرقية 🇸🇦" : "🇸🇦 Eastern Region Community"}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight">
            {t.landing.heroTitle}
            <br />
            <span className="text-gradient-gold">
              {t.landing.heroTitleAccent}
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.35}>
          <p className="mt-6 text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto">
            {t.landing.heroSubtitle}
          </p>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/signup`} className="btn-primary">
              {t.landing.heroCta}
            </Link>
            <a href="#tracks" className="btn-secondary">
              {t.landing.heroSecondaryCta}
            </a>
          </div>
        </FadeIn>

        {/* Mini stats row */}
        <StaggerChildren
          className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-12"
          delay={0.6}
          stagger={0.12}
        >
          {stats.map((stat) => {
            const isFraction = stat.value.includes("/");
            const hasPlus = stat.value.includes("+");
            const numericValue = parseInt(stat.value.replace(/[^0-9]/g, ""));
            return (
              <StaggerItem key={stat.label}>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gradient-gold">
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
    </section>
  );
}
