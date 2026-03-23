"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

/* ─── Types ─── */
type MapMember = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  expertise: string | null;
};

type CityData = {
  name: string;
  nameAr: string;
  /** SVG x coordinate (percentage of viewBox width) */
  x: number;
  /** SVG y coordinate (percentage of viewBox height) */
  y: number;
  count: number;
  members: MapMember[];
};

/* ─── City positions — abstract layout of Eastern Region ─── */
const CITY_LAYOUT: Record<string, { x: number; y: number; nameAr: string }> = {
  "Jubail":      { x: 48, y: 12, nameAr: "الجبيل" },
  "Ras Tanura":  { x: 62, y: 20, nameAr: "رأس تنورة" },
  "Safwa":       { x: 55, y: 30, nameAr: "صفوى" },
  "Qatif":       { x: 65, y: 35, nameAr: "القطيف" },
  "Tarut":       { x: 75, y: 32, nameAr: "تاروت" },
  "Saihat":      { x: 72, y: 42, nameAr: "سيهات" },
  "Dammam":      { x: 60, y: 50, nameAr: "الدمام" },
  "Dhahran":     { x: 50, y: 58, nameAr: "الظهران" },
  "Khobar":      { x: 68, y: 62, nameAr: "الخبر" },
  "Al Ahsa":     { x: 35, y: 82, nameAr: "الأحساء" },
};

/* ─── Helpers ─── */
function dotSize(count: number, maxCount: number): number {
  if (count === 0) return 6;
  const minR = 4;
  const maxR = 16;
  const ratio = maxCount > 0 ? count / maxCount : 0;
  return minR + ratio * (maxR - minR);
}

/* ─── Component ─── */
export default function MemberMap({
  members,
  locale,
}: {
  members: MapMember[];
  locale: string;
}) {
  const isAr = locale === "ar";
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    city: string;
    nameAr: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Build city data */
  const cityMap = new Map<string, CityData>();
  for (const [name, layout] of Object.entries(CITY_LAYOUT)) {
    cityMap.set(name, {
      name,
      nameAr: layout.nameAr,
      x: layout.x,
      y: layout.y,
      count: 0,
      members: [],
    });
  }
  for (const m of members) {
    if (!m.city) continue;
    const city = cityMap.get(m.city);
    if (city) {
      city.count++;
      city.members.push(m);
    }
  }
  const cities = Array.from(cityMap.values());
  const maxCount = Math.max(...cities.map((c) => c.count), 1);
  const totalMembers = members.length;

  /* Close expanded city on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveCity(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeCityData = activeCity ? cityMap.get(activeCity) : null;

  return (
    <div ref={containerRef} className="glass rounded-2xl p-4 sm:p-6 mb-8">
      {/* Title */}
      <h2 className="text-lg font-bold mb-4">
        {isAr ? "خريطة الشفاتة" : "Member Map"}
      </h2>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* SVG Map */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[380px]">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ maxHeight: 420 }}
          >
            {/* Background shape — abstract Eastern Region coastline */}
            <path
              d="M80 5 Q85 15, 82 25 Q80 32, 83 38 Q86 45, 80 52 Q78 58, 82 65 Q84 72, 78 80 Q72 88, 60 95 Q45 98, 30 92 Q18 86, 15 75 Q12 60, 18 45 Q22 30, 28 18 Q35 8, 50 5 Q65 3, 80 5Z"
              fill="rgba(24, 0, 173, 0.08)"
              stroke="rgba(204, 163, 0, 0.15)"
              strokeWidth="0.4"
            />

            {/* Coastline accent */}
            <path
              d="M80 5 Q85 15, 82 25 Q80 32, 83 38 Q86 45, 80 52 Q78 58, 82 65 Q84 72, 78 80"
              fill="none"
              stroke="rgba(204, 163, 0, 0.25)"
              strokeWidth="0.3"
              strokeDasharray="1 1"
            />

            {/* City dots + labels */}
            {cities.map((city) => {
              const r = dotSize(city.count, maxCount);
              const isActive = activeCity === city.name;
              const svgR = r * 0.28; // scale for viewBox

              return (
                <g key={city.name}>
                  {/* Glow ring */}
                  {city.count > 0 && (
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={svgR + 1.5}
                      fill="none"
                      stroke="rgba(204, 163, 0, 0.2)"
                      strokeWidth="0.3"
                      className={isActive ? "animate-pulse-glow" : ""}
                    />
                  )}

                  {/* Main dot */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={svgR}
                    fill={city.count > 0 ? "url(#goldGradient)" : "rgba(255,255,255,0.1)"}
                    stroke={isActive ? "#E6BE2E" : "rgba(204, 163, 0, 0.5)"}
                    strokeWidth={isActive ? "0.6" : "0.3"}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      filter: city.count > 0 ? "drop-shadow(0 0 3px rgba(204, 163, 0, 0.4))" : "none",
                    }}
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGCircleElement).closest("svg")!.getBoundingClientRect();
                      const px = rect.left + (city.x / 100) * rect.width;
                      const py = rect.top + (city.y / 100) * rect.height;
                      setTooltip({
                        city: city.name,
                        nameAr: city.nameAr,
                        count: city.count,
                        x: px,
                        y: py,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => setActiveCity(isActive ? null : city.name)}
                  />

                  {/* City name label */}
                  <text
                    x={city.x}
                    y={city.y + svgR + 3}
                    textAnchor="middle"
                    fill="rgba(240, 237, 232, 0.6)"
                    fontSize="2.5"
                    fontWeight="500"
                    className="pointer-events-none select-none"
                  >
                    {isAr ? city.nameAr : city.name}
                  </text>

                  {/* Count badge */}
                  {city.count > 0 && (
                    <text
                      x={city.x}
                      y={city.y + 0.8}
                      textAnchor="middle"
                      fill="#050510"
                      fontSize={svgR > 2.5 ? "2.2" : "1.8"}
                      fontWeight="700"
                      className="pointer-events-none select-none"
                    >
                      {city.count}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <radialGradient id="goldGradient" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#E6BE2E" />
                <stop offset="100%" stopColor="#CCA300" />
              </radialGradient>
            </defs>
          </svg>

          {/* Center stat overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gradient-gold">
                {totalMembers}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {isAr
                  ? "شفت في الشرقية"
                  : "members in the Eastern Region"}
              </div>
            </div>
          </div>

          {/* Tooltip (positioned via portal-style absolute) */}
          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{
                left: tooltip.x,
                top: tooltip.y - 48,
                transform: "translateX(-50%)",
              }}
            >
              <div className="glass-strong rounded-lg px-3 py-1.5 text-center whitespace-nowrap border border-border-strong">
                <div className="text-xs font-semibold">
                  {isAr ? tooltip.nameAr : tooltip.city}
                </div>
                <div className="text-[10px] text-gold">
                  {tooltip.count} {isAr ? "شفت" : "members"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expanded city member list */}
        {activeCityData && activeCityData.count > 0 && (
          <div className="lg:w-72 shrink-0 glass-strong rounded-xl p-4 border border-border-strong animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">
                {isAr ? activeCityData.nameAr : activeCityData.name}
              </h3>
              <span className="text-xs text-gold">
                {activeCityData.count} {isAr ? "شفت" : "members"}
              </span>
            </div>

            <div className="space-y-2.5">
              {activeCityData.members.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  href={`/${locale}/members/${m.id}`}
                  className="flex items-center gap-2.5 group"
                >
                  {m.avatar_url ? (
                    <img
                      src={m.avatar_url}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-light shrink-0">
                      {m.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="text-sm truncate group-hover:text-gold transition-colors">
                    {m.full_name || (isAr ? "شفت" : "Member")}
                  </span>
                </Link>
              ))}
            </div>

            {activeCityData.count > 5 && (
              <Link
                href={`/${locale}/community?city=${encodeURIComponent(activeCityData.name)}`}
                className="block mt-3 text-xs text-gold hover:text-gold-light transition-colors text-center"
              >
                {isAr
                  ? `و ${activeCityData.count - 5} آخرين — شوف الكل`
                  : `and ${activeCityData.count - 5} others — View All`}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Compact version for dashboard ─── */
export function MemberMapCompact({
  members,
  locale,
}: {
  members: MapMember[];
  locale: string;
}) {
  const isAr = locale === "ar";

  /* Build city counts */
  const cityMap = new Map<string, number>();
  for (const [name] of Object.entries(CITY_LAYOUT)) {
    cityMap.set(name, 0);
  }
  for (const m of members) {
    if (m.city && cityMap.has(m.city)) {
      cityMap.set(m.city, (cityMap.get(m.city) || 0) + 1);
    }
  }
  const maxCount = Math.max(...Array.from(cityMap.values()), 1);
  const totalMembers = members.length;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">
          {isAr ? "خريطة الشفاتة" : "Member Map"}
        </h3>
        <Link
          href={`/${locale}/community`}
          className="text-xs text-gold hover:text-gold-light transition-colors"
        >
          {isAr ? "شوف الكل" : "View Map"}
        </Link>
      </div>

      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: 180 }}>
          {/* Simplified background */}
          <path
            d="M80 5 Q85 15, 82 25 Q80 32, 83 38 Q86 45, 80 52 Q78 58, 82 65 Q84 72, 78 80 Q72 88, 60 95 Q45 98, 30 92 Q18 86, 15 75 Q12 60, 18 45 Q22 30, 28 18 Q35 8, 50 5 Q65 3, 80 5Z"
            fill="rgba(24, 0, 173, 0.06)"
            stroke="rgba(204, 163, 0, 0.1)"
            strokeWidth="0.3"
          />

          {Object.entries(CITY_LAYOUT).map(([name, layout]) => {
            const count = cityMap.get(name) || 0;
            const r = dotSize(count, maxCount) * 0.22;
            return (
              <circle
                key={name}
                cx={layout.x}
                cy={layout.y}
                r={r}
                fill={count > 0 ? "#CCA300" : "rgba(255,255,255,0.08)"}
                style={{
                  filter: count > 0 ? "drop-shadow(0 0 2px rgba(204, 163, 0, 0.3))" : "none",
                }}
              />
            );
          })}
        </svg>

        {/* Center stat */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xl font-bold text-gradient-gold">{totalMembers}</div>
            <div className="text-[10px] text-muted">
              {isAr ? "شفت في الشرقية" : "in Eastern Region"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
