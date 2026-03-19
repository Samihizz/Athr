"use client";

interface WhatsAppGroupCardProps {
  trackName: string;
  trackIcon?: string;
  whatsappLink: string;
  locale: string;
  /** Compact variant for grids, full variant for track pages */
  variant?: "full" | "compact";
}

export default function WhatsAppGroupCard({
  trackName,
  trackIcon,
  whatsappLink,
  locale,
  variant = "full",
}: WhatsAppGroupCardProps) {
  const isAr = locale === "ar";
  const hasLink = !!whatsappLink;

  const joinLabel = isAr ? "خش قروب الواتساب" : "Join WhatsApp Group";
  const comingSoon = isAr ? "قريباً" : "Coming Soon";
  const joinShort = isAr ? "خش" : "Join";

  if (variant === "compact") {
    return (
      <div className="glass rounded-2xl p-4 flex flex-col items-center text-center gap-3 hover:bg-surface-hover transition-colors">
        {trackIcon && (
          <img src={trackIcon} alt="" className="w-8 h-8 rounded" />
        )}
        <h3 className="font-semibold text-sm leading-tight">{trackName}</h3>
        {hasLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "#25D366", color: "#fff" }}
          >
            <WhatsAppIcon size={14} />
            {joinShort}
          </a>
        ) : (
          <span className="text-xs text-muted px-3 py-2 rounded-xl bg-surface border border-border">
            {comingSoon}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 flex items-center gap-5">
      {/* WhatsApp icon circle */}
      <div
        className="shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(37, 211, 102, 0.12)" }}
      >
        <WhatsAppIcon size={28} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg leading-tight">{trackName}</h3>
        <p className="text-sm text-muted mt-0.5">
          {isAr ? "قروب واتساب المسار" : "Track WhatsApp Group"}
        </p>
      </div>

      {hasLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: "#25D366",
            color: "#fff",
            boxShadow: "0 0 20px rgba(37, 211, 102, 0.2)",
          }}
        >
          <WhatsAppIcon size={18} />
          {joinLabel}
        </a>
      ) : (
        <span className="shrink-0 text-sm text-muted px-5 py-2.5 rounded-xl bg-surface border border-border">
          {comingSoon}
        </span>
      )}
    </div>
  );
}

/** Separate card for the general Athr community group */
export function CommunityWhatsAppCard({
  whatsappLink,
  locale,
}: {
  whatsappLink: string;
  locale: string;
}) {
  const isAr = locale === "ar";
  const hasLink = !!whatsappLink;

  return (
    <div className="glass-strong rounded-2xl p-6 border-l-4 border-[#25D366] flex items-center gap-5">
      <div
        className="shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(37, 211, 102, 0.12)" }}
      >
        <WhatsAppIcon size={28} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg leading-tight">
          {isAr ? "قروب مجتمع أثر" : "Athr Community Group"}
        </h3>
        <p className="text-sm text-muted mt-0.5">
          {isAr ? "القروب العام لجميع الشفاتة" : "General group for all members"}
        </p>
      </div>

      {hasLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: "#25D366",
            color: "#fff",
            boxShadow: "0 0 20px rgba(37, 211, 102, 0.2)",
          }}
        >
          <WhatsAppIcon size={18} />
          {isAr ? "خش قروب الواتساب" : "Join WhatsApp Group"}
        </a>
      ) : (
        <span className="shrink-0 text-sm text-muted px-5 py-2.5 rounded-xl bg-surface border border-border">
          {isAr ? "قريباً" : "Coming Soon"}
        </span>
      )}
    </div>
  );
}

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
        fill="#25D366"
      />
    </svg>
  );
}
