"use client";

import Link from "next/link";
import { FadeIn, StaggerChildren, StaggerItem, ScaleOnHover } from "@/components/ui/animations";
import TrackIcon from "@/components/TrackIcon";

type Track = {
  id: string;
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
};

/** Subtle gradient backgrounds per track, matching each track's accent color */
const trackGradients: Record<string, string> = {
  ai:        "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.15) 0%, transparent 60%), linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(15,15,25,0.9) 100%)",
  creative:  "radial-gradient(ellipse at 30% 20%, rgba(236,72,153,0.15) 0%, transparent 60%), linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(15,15,25,0.9) 100%)",
  business:  "radial-gradient(ellipse at 30% 20%, rgba(245,158,11,0.15) 0%, transparent 60%), linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(15,15,25,0.9) 100%)",
  marketing: "radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.15) 0%, transparent 60%), linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(15,15,25,0.9) 100%)",
  finance:   "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.15) 0%, transparent 60%), linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(15,15,25,0.9) 100%)",
  tech:      "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 60%), linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(15,15,25,0.9) 100%)",
};

export default function AnimatedTracks({
  locale,
  isAr,
  t,
  tracks,
}: AnimatedTracksProps) {
  return (
    <section id="tracks" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute top-20 left-[5%] w-64 h-64 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-[8%] w-48 h-48 rounded-full bg-gold/[0.04] blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
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
                  className="card group block"
                >
                  {/* Track visual header with gradient + icon */}
                  <div
                    className="relative h-44 overflow-hidden rounded-t-xl flex items-center justify-center"
                    style={{ background: trackGradients[track.id] ?? trackGradients.ai }}
                  >
                    {/* Decorative grid pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                      }}
                    />
                    {/* Centered track icon */}
                    <div className="relative transition-transform duration-500 group-hover:scale-110">
                      <TrackIcon trackId={track.id} size={64} />
                    </div>
                    {/* Bottom fade into card body */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
                  </div>
                  {/* Track info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold group-hover:text-gold transition-colors duration-300">
                      {isAr ? track.ar.name : track.en.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      {isAr ? track.ar.description : track.en.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gold font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
