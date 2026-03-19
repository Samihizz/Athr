"use client";

import { FadeIn, StaggerChildren, StaggerItem, CountUp } from "@/components/ui/animations";

type AnimatedStatsProps = {
  stats: { value: string; label: string }[];
};

export default function AnimatedStats({ stats }: AnimatedStatsProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="card-elevated p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 start-0 w-full h-full gradient-hero opacity-50" />
            <StaggerChildren className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center" stagger={0.12}>
              {stats.map((stat) => {
                const isFraction = stat.value.includes("/");
                const hasPlus = stat.value.includes("+");
                const numericValue = parseInt(stat.value.replace(/[^0-9]/g, ""));
                return (
                  <StaggerItem key={stat.label}>
                    <div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-gradient-gold">
                        {isFraction ? (
                          stat.value
                        ) : (
                          <CountUp
                            value={numericValue}
                            suffix={hasPlus ? "+" : ""}
                          />
                        )}
                      </div>
                      <div className="mt-2 text-sm text-muted">{stat.label}</div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerChildren>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
