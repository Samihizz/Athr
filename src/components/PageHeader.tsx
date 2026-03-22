interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  coverGradient?: string;
  locale: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  coverGradient = "linear-gradient(135deg, #1800AD 0%, #CCA300 100%)",
  locale,
}: PageHeaderProps) {
  const isAr = locale === "ar";

  return (
    <div
      className="relative w-full overflow-hidden rounded-b-3xl"
      style={{ minHeight: "200px" }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: coverGradient }}
      />

      {/* Decorative dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative diagonal lines */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.4) 40px, rgba(255,255,255,0.4) 41px)",
        }}
      />

      {/* Decorative geometric shapes */}
      <div className="absolute top-6 right-8 w-32 h-32 rounded-full border border-white/[0.08] opacity-60" />
      <div className="absolute bottom-4 right-24 w-20 h-20 rounded-full border border-white/[0.06] opacity-40" />
      <div className="absolute top-12 left-[60%] w-16 h-16 rotate-45 border border-white/[0.06] opacity-30" />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

      {/* Content */}
      <div
        className={`relative z-10 flex items-center justify-between px-6 sm:px-8 lg:px-10 py-10 sm:py-12 max-w-7xl mx-auto ${
          isAr ? "flex-row-reverse text-right" : ""
        }`}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-white/70 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {icon && (
          <div
            className={`hidden sm:flex shrink-0 items-center justify-center w-20 h-20 rounded-2xl glass-strong ${
              isAr ? "ml-0 mr-6" : "mr-0 ml-6"
            }`}
          >
            <span className="text-4xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
