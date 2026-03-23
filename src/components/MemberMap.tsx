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
  x: number;
  y: number;
  count: number;
  members: MapMember[];
};

/*
  City positions based on actual Eastern Region geography.
  Coordinate system: viewBox 0 0 500 600
  Gulf coast runs along the right side, cities positioned accordingly.
*/
const CITY_LAYOUT: Record<string, { x: number; y: number; nameAr: string }> = {
  "Jubail":      { x: 285, y: 95,  nameAr: "الجبيل" },
  "Ras Tanura":  { x: 320, y: 170, nameAr: "رأس تنورة" },
  "Safwa":       { x: 335, y: 210, nameAr: "صفوى" },
  "Qatif":       { x: 350, y: 240, nameAr: "القطيف" },
  "Tarut":       { x: 380, y: 230, nameAr: "تاروت" },
  "Saihat":      { x: 365, y: 265, nameAr: "سيهات" },
  "Dammam":      { x: 340, y: 300, nameAr: "الدمام" },
  "Dhahran":     { x: 310, y: 340, nameAr: "الظهران" },
  "Khobar":      { x: 355, y: 360, nameAr: "الخبر" },
  "Al Ahsa":     { x: 220, y: 480, nameAr: "الأحساء" },
};

function dotRadius(count: number, maxCount: number): number {
  if (count === 0) return 5;
  const min = 6;
  const max = 18;
  return min + (count / Math.max(maxCount, 1)) * (max - min);
}

/* ─── Main Map ─── */
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

  const cityMap = new Map<string, CityData>();
  for (const [name, layout] of Object.entries(CITY_LAYOUT)) {
    cityMap.set(name, { name, nameAr: layout.nameAr, x: layout.x, y: layout.y, count: 0, members: [] });
  }
  for (const m of members) {
    if (!m.city) continue;
    const city = cityMap.get(m.city);
    if (city) { city.count++; city.members.push(m); }
  }
  const cities = Array.from(cityMap.values());
  const maxCount = Math.max(...cities.map((c) => c.count), 1);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setActiveCity(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeCityData = activeCity ? cityMap.get(activeCity) : null;

  return (
    <div ref={containerRef} className="glass rounded-2xl p-4 sm:p-6 mb-8">
      <h2 className="text-lg font-bold mb-4">
        {isAr ? "خريطة الشفاتة" : "Member Map"}
      </h2>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* SVG Map */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[400px]">
          <svg viewBox="0 0 500 600" className="w-full h-full" style={{ maxHeight: 500 }}>
            <defs>
              <radialGradient id="goldGrad" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#E6BE2E" />
                <stop offset="100%" stopColor="#CCA300" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Water pattern */}
              <pattern id="waterPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 10 Q5 8 10 10 Q15 12 20 10" fill="none" stroke="rgba(24,0,173,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Persian Gulf (water) — right side */}
            <path
              d="M390 0 L500 0 L500 600 L390 600 Q400 550 395 500 Q385 450 400 400 Q410 370 400 340 Q390 310 400 280 Q410 250 405 220 Q400 190 410 160 Q415 130 405 100 Q395 70 400 40 Q405 20 390 0Z"
              fill="rgba(24,0,173,0.08)"
            />
            <path
              d="M390 0 L500 0 L500 600 L390 600 Q400 550 395 500 Q385 450 400 400 Q410 370 400 340 Q390 310 400 280 Q410 250 405 220 Q400 190 410 160 Q415 130 405 100 Q395 70 400 40 Q405 20 390 0Z"
              fill="url(#waterPattern)"
            />

            {/* Gulf label */}
            <text x="450" y="300" textAnchor="middle" fill="rgba(24,0,173,0.2)" fontSize="12" fontWeight="600" transform="rotate(90, 450, 300)">
              {isAr ? "الخليج العربي" : "Arabian Gulf"}
            </text>

            {/* Eastern Region land outline */}
            <path
              d="M50 30 Q120 20 200 25 Q260 30 300 60 Q320 75 290 95 Q310 120 325 150 Q340 180 345 200 Q350 220 360 235 Q370 250 365 270 Q360 290 350 305 Q340 320 330 340 Q345 355 365 370 Q380 385 375 400 Q365 420 340 440 Q310 460 280 480 Q250 500 230 510 Q200 525 170 530 Q130 535 90 520 Q60 505 50 480 Q40 440 45 400 Q50 350 48 300 Q45 250 48 200 Q50 150 48 100 Q46 60 50 30Z"
              fill="rgba(240,237,232,0.03)"
              stroke="rgba(204,163,0,0.15)"
              strokeWidth="1.2"
            />

            {/* Internal region lines (roads/borders) */}
            <path d="M290 95 L340 300" fill="none" stroke="rgba(204,163,0,0.06)" strokeWidth="0.8" strokeDasharray="4 4" />
            <path d="M340 300 L355 360" fill="none" stroke="rgba(204,163,0,0.06)" strokeWidth="0.8" strokeDasharray="4 4" />
            <path d="M310 340 L220 480" fill="none" stroke="rgba(204,163,0,0.06)" strokeWidth="0.8" strokeDasharray="4 4" />
            <path d="M285 95 L340 170 L350 240" fill="none" stroke="rgba(204,163,0,0.06)" strokeWidth="0.8" strokeDasharray="4 4" />

            {/* City dots + labels */}
            {cities.map((city) => {
              const r = dotRadius(city.count, maxCount);
              const isActive = activeCity === city.name;

              return (
                <g key={city.name}>
                  {/* Pulse ring for active cities */}
                  {city.count > 0 && (
                    <circle
                      cx={city.x} cy={city.y} r={r + 6}
                      fill="none"
                      stroke="rgba(204,163,0,0.15)"
                      strokeWidth="1"
                      className={isActive ? "animate-ping" : ""}
                      style={{ animationDuration: "2s" }}
                    />
                  )}

                  {/* Glow circle */}
                  {city.count > 0 && (
                    <circle
                      cx={city.x} cy={city.y} r={r + 3}
                      fill="none"
                      stroke="rgba(204,163,0,0.12)"
                      strokeWidth="0.5"
                    />
                  )}

                  {/* Main dot */}
                  <circle
                    cx={city.x} cy={city.y} r={r}
                    fill={city.count > 0 ? "url(#goldGrad)" : "rgba(255,255,255,0.06)"}
                    stroke={isActive ? "#E6BE2E" : city.count > 0 ? "rgba(204,163,0,0.4)" : "rgba(255,255,255,0.1)"}
                    strokeWidth={isActive ? "2" : "1"}
                    className="cursor-pointer transition-all duration-200 hover:brightness-125"
                    filter={city.count > 0 ? "url(#glow)" : undefined}
                    onMouseEnter={(e) => {
                      const svg = (e.target as SVGCircleElement).closest("svg")!;
                      const rect = svg.getBoundingClientRect();
                      const vb = svg.viewBox.baseVal;
                      const px = rect.left + ((city.x - vb.x) / vb.width) * rect.width;
                      const py = rect.top + ((city.y - vb.y) / vb.height) * rect.height;
                      setTooltip({ city: city.name, nameAr: city.nameAr, count: city.count, x: px, y: py });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => setActiveCity(isActive ? null : city.name)}
                  />

                  {/* City label */}
                  <text
                    x={city.x}
                    y={city.y + r + 14}
                    textAnchor="middle"
                    fill="rgba(240,237,232,0.5)"
                    fontSize="10"
                    fontWeight="500"
                    className="pointer-events-none select-none"
                  >
                    {isAr ? city.nameAr : city.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{ left: tooltip.x, top: tooltip.y - 52, transform: "translateX(-50%)" }}
            >
              <div className="glass-strong rounded-lg px-3 py-2 text-center whitespace-nowrap border border-gold/20 shadow-lg">
                <div className="text-xs font-semibold">{isAr ? tooltip.nameAr : tooltip.city}</div>
                <div className="text-[10px] text-gold">{tooltip.count} {isAr ? "شفت" : "members"}</div>
              </div>
            </div>
          )}
        </div>

        {/* Expanded city member list */}
        {activeCityData && activeCityData.count > 0 && (
          <div className="lg:w-72 shrink-0 glass-strong rounded-xl p-4 border border-border-strong animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{isAr ? activeCityData.nameAr : activeCityData.name}</h3>
              <span className="text-xs text-gold">{activeCityData.count} {isAr ? "شفت" : "members"}</span>
            </div>
            <div className="space-y-2.5">
              {activeCityData.members.slice(0, 5).map((m) => (
                <Link key={m.id} href={`/${locale}/members/${m.id}`} className="flex items-center gap-2.5 group">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
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
                {isAr ? `و ${activeCityData.count - 5} آخرين — شوف الكل` : `and ${activeCityData.count - 5} others — View All`}
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
  const cityMap = new Map<string, number>();
  for (const name of Object.keys(CITY_LAYOUT)) cityMap.set(name, 0);
  for (const m of members) {
    if (m.city && cityMap.has(m.city)) cityMap.set(m.city, (cityMap.get(m.city) || 0) + 1);
  }
  const maxCount = Math.max(...Array.from(cityMap.values()), 1);
  const totalMembers = members.length;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{isAr ? "خريطة الشفاتة" : "Member Map"}</h3>
        <Link href={`/${locale}/community`} className="text-xs text-gold hover:text-gold-light transition-colors">
          {isAr ? "شوف الكل" : "View Map"}
        </Link>
      </div>
      <div className="relative">
        <svg viewBox="0 0 500 600" className="w-full" style={{ maxHeight: 180 }}>
          {/* Simplified land outline */}
          <path
            d="M50 30 Q120 20 200 25 Q260 30 300 60 Q320 75 290 95 Q310 120 325 150 Q340 180 345 200 Q350 220 360 235 Q370 250 365 270 Q360 290 350 305 Q340 320 330 340 Q345 355 365 370 Q380 385 375 400 Q365 420 340 440 Q310 460 280 480 Q250 500 230 510 Q200 525 170 530 Q130 535 90 520 Q60 505 50 480 Q40 440 45 400 Q50 350 48 300 Q45 250 48 200 Q50 150 48 100 Q46 60 50 30Z"
            fill="rgba(240,237,232,0.02)"
            stroke="rgba(204,163,0,0.1)"
            strokeWidth="1"
          />
          {/* Gulf water */}
          <path
            d="M390 0 L500 0 L500 600 L390 600 Q400 550 395 500 Q385 450 400 400 Q410 370 400 340 Q390 310 400 280 Q410 250 405 220 Q400 190 410 160 Q415 130 405 100 Q395 70 400 40 Q405 20 390 0Z"
            fill="rgba(24,0,173,0.05)"
          />
          {Object.entries(CITY_LAYOUT).map(([name, layout]) => {
            const count = cityMap.get(name) || 0;
            const r = dotRadius(count, maxCount) * 0.7;
            return (
              <circle
                key={name} cx={layout.x} cy={layout.y} r={r}
                fill={count > 0 ? "#CCA300" : "rgba(255,255,255,0.06)"}
                style={{ filter: count > 0 ? "drop-shadow(0 0 3px rgba(204,163,0,0.3))" : "none" }}
              />
            );
          })}
        </svg>
        <div className="absolute bottom-2 left-3 text-xs text-muted">
          <span className="text-gold font-bold">{totalMembers}</span> {isAr ? "شفت في الشرقية" : "in Eastern Region"}
        </div>
      </div>
    </div>
  );
}
