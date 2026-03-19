"use client";

import { FadeIn, StaggerChildren, StaggerItem, ScaleOnHover } from "@/components/ui/animations";
import type { ReactNode } from "react";

type AnimatedFeaturesProps = {
  t: {
    landing: Record<string, string>;
  };
  features: { icon: ReactNode; color: string }[];
};

export default function AnimatedFeatures({ t, features }: AnimatedFeaturesProps) {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 gradient-subtle" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {t.landing.featuresTitle}
          </h2>
          <p className="mt-4 text-muted text-lg max-w-2xl mx-auto">
            {t.landing.featuresSubtitle}
          </p>
        </FadeIn>

        {/* Bento Grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
          {features.map(({ icon, color }, i) => {
            const titleKey = `feature${i + 1}Title` as keyof typeof t.landing;
            const descKey = `feature${i + 1}Desc` as keyof typeof t.landing;
            return (
              <StaggerItem key={i}>
                <ScaleOnHover>
                  <div className="card p-6 group">
                    <div
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform`}
                    >
                      {icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t.landing[titleKey]}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {t.landing[descKey]}
                    </p>
                  </div>
                </ScaleOnHover>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
