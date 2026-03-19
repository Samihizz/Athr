"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn, StaggerChildren, StaggerItem, ScaleOnHover } from "@/components/ui/animations";

type Track = {
  id: string;
  icon: string;
  ar: { name: string; description: string };
  en: { name: string; description: string };
};

type AnimatedTracksProps = {
  locale: string;
  isAr: boolean;
  t: {
    landing: Record<string, string>;
  };
  tracks: readonly Track[];
  trackImages: Record<string, string>;
};

export default function AnimatedTracks({
  locale,
  isAr,
  t,
  tracks,
  trackImages,
}: AnimatedTracksProps) {
  return (
    <section id="tracks" className="py-24 sm:py-32 relative">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <div className="pill mx-auto mb-4">
            {isAr ? "المسارات" : "Tracks"}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {t.landing.tracksTitle}
          </h2>
          <p className="mt-4 text-muted text-lg max-w-2xl mx-auto">
            {t.landing.tracksSubtitle}
          </p>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.1}>
          {tracks.map((track) => (
            <StaggerItem key={track.id}>
              <ScaleOnHover>
                <Link
                  href={`/${locale}/tracks/${track.id}`}
                  className="card group overflow-hidden block"
                >
                  {/* Track cover image */}
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={trackImages[track.id]}
                      alt={isAr ? track.ar.name : track.en.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <div className="absolute top-4 start-4">
                      <img
                        src={track.icon}
                        alt=""
                        className="w-8 h-8 rounded"
                      />
                    </div>
                  </div>
                  {/* Track info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold group-hover:text-gold transition-colors">
                      {isAr ? track.ar.name : track.en.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      {isAr ? track.ar.description : track.en.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gold font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {isAr ? "استكشف المسار" : "Explore track"}
                      <svg
                        className="h-3.5 w-3.5 rtl:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </ScaleOnHover>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
