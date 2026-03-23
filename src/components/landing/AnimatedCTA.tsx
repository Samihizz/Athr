"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/animations";

type AnimatedCTAProps = {
  locale: string;
  t: {
    landing: Record<string, string>;
  };
};

export default function AnimatedCTA({ locale, t }: AnimatedCTAProps) {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative card-elevated p-12 sm:p-20 text-center overflow-hidden">
            {/* Animated motion gradient */}
            <div className="absolute inset-0 motion-bg opacity-60" />
            <div className="absolute inset-0 bg-background/30" />

            {/* Floating abstract shapes */}
            <div className="absolute top-8 left-[10%] w-32 h-32 rounded-full bg-gold/[0.08] blur-2xl pointer-events-none" />
            <div className="absolute bottom-8 right-[10%] w-40 h-40 rounded-full bg-primary-light/[0.1] blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                {t.landing.ctaTitle}
              </h2>
              <p className="mt-5 text-muted text-lg max-w-lg mx-auto">
                {t.landing.ctaSubtitle}
              </p>
              <div className="mt-10">
                <Link
                  href={`/${locale}/signup`}
                  className="btn-primary text-base px-10 py-4"
                >
                  {t.landing.ctaButton}
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
