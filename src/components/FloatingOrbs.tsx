"use client";

/**
 * Abstract floating blur objects that create depth and atmosphere.
 * Renders differently based on variant: "hero" for landing page,
 * "page" for inner pages, "subtle" for dashboard sections.
 */

type FloatingOrbsProps = {
  variant?: "hero" | "page" | "subtle";
};

export default function FloatingOrbs({ variant = "page" }: FloatingOrbsProps) {
  if (variant === "hero") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large purple orb — top left */}
        <div
          className="floating-orb floating-orb-purple-lg"
          style={{ top: "-10%", left: "-8%" }}
        />
        {/* Gold orb — top right */}
        <div
          className="floating-orb floating-orb-gold-md"
          style={{ top: "5%", right: "-5%" }}
        />
        {/* Blue orb — center right */}
        <div
          className="floating-orb floating-orb-blue-lg"
          style={{ top: "40%", right: "10%" }}
        />
        {/* Small purple orb — bottom left */}
        <div
          className="floating-orb floating-orb-purple-sm"
          style={{ bottom: "10%", left: "15%" }}
        />
        {/* Small gold orb — bottom center */}
        <div
          className="floating-orb floating-orb-gold-sm"
          style={{ bottom: "5%", left: "45%" }}
        />
      </div>
    );
  }

  if (variant === "subtle") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="floating-orb floating-orb-purple-sm"
          style={{ top: "-15%", right: "10%", opacity: 0.4 }}
        />
        <div
          className="floating-orb floating-orb-gold-sm"
          style={{ bottom: "-10%", left: "5%", opacity: 0.3 }}
        />
      </div>
    );
  }

  // variant === "page"
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Top-right purple */}
      <div
        className="floating-orb floating-orb-purple-lg"
        style={{ top: "-15%", right: "-10%" }}
      />
      {/* Bottom-left gold */}
      <div
        className="floating-orb floating-orb-gold-md"
        style={{ bottom: "10%", left: "-8%" }}
      />
      {/* Mid-right blue */}
      <div
        className="floating-orb floating-orb-purple-sm"
        style={{ top: "50%", right: "20%" }}
      />
    </div>
  );
}
