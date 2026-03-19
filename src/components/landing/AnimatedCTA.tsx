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
            <div className="absolute inset-0 gradient-hero" />
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="relative">
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
