"use client";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  coverGradient?: string;
  locale: string;
}

export default function PageHeader({
  title,
  subtitle,
  locale,
}: PageHeaderProps) {
  const isAr = locale === "ar";

  return (
    <div
      className="relative w-full overflow-hidden rounded-b-3xl noise-overlay"
      style={{ minHeight: "220px" }}
    >
      {/* Animated motion mesh gradient background */}
      <div className="absolute inset-0 motion-bg" />

      {/* Subtle noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating abstract shapes */}
      <div className="absolute top-4 right-[15%] w-40 h-40 rounded-full bg-white/[0.03] blur-xl" />
      <div className="absolute bottom-2 left-[10%] w-28 h-28 rounded-full bg-gold/[0.06] blur-2xl" />
      <div className="absolute top-1/2 right-[5%] w-20 h-20 rounded-full bg-primary-light/[0.08] blur-xl" />

      {/* Glass overlay fade to page background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-transparent" />

      {/* Content */}
      <div
        className={`relative z-10 px-6 sm:px-8 lg:px-10 py-12 sm:py-14 max-w-7xl mx-auto ${
          isAr ? "text-right" : ""
        }`}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
