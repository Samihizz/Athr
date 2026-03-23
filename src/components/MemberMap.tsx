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
  City positions traced from Google Maps of the Eastern Region.
  viewBox: 0 0 600 700

  Geography reference (from the screenshot):
  - Coastline runs diagonally from upper-right (Jubail area) curving down
    to mid-right (Dammam/Khobar), then coast continues south
  - Jubail: upper area, slightly inland
  - Ras Tanura: peninsula jutting right into the Gulf
  - Qatif: below Ras Tanura, near coast
  - Dammam: right side, on the coast
  - Khobar: just below Dammam, on the coast
  - Bahrain: island to the far right of Khobar
  - Abqaiq: inland, south-west
  - Al Ahsa/Hofuf: far south, very inland (left side)
*/
const CITY_LAYOUT: Record<string, { x: number; y: number; nameAr: string }> = {
  "Jubail":      { x: 230, y: 105, nameAr: "الجبيل" },
  "Ras Tanura":  { x: 350, y: 195, nameAr: "رأس تنورة" },
  "Safwa":       { x: 310, y: 240, nameAr: "صفوى" },
  "Qatif":       { x: 330, y: 275, nameAr: "القطيف" },
  "Tarut":       { x: 375, y: 260, nameAr: "تاروت" },
  "Saihat":      { x: 360, y: 295, nameAr: "سيهات" },
  "Dammam":      { x: 395, y: 330, nameAr: "الدمام" },
  "Dhahran":     { x: 365, y: 365, nameAr: "الظهران" },
  "Khobar":      { x: 410, y: 385, nameAr: "الخبر" },
  "Al Ahsa":     { x: 195, y: 600, nameAr: "الأحساء" },
};

function dotRadius(count: number, maxCount: number): number {
  if (count === 0) return 5;
  const min = 6;
  const max = 18;
  return min + (count / Math.max(maxCount, 1)) * (max - min);
}

/* ─── Shared SVG Geography ─── */
/* Coastline traced to match real Eastern Region from Google Maps */
const COASTLINE_PATH = "M280 0 Q270 30 250 55 Q235 80 240 100 Q250 120 270 135 Q300 150 330 160 Q360 175 380 190 Q395 200 390 215 Q380 225 370 235 Q365 245 370 255 Q380 265 390 275 Q405 290 415 305 Q425 320 430 335 Q435 350 440 365 Q445 380 450 395 Q455 410 455 430 Q450 455 440 475 Q425 495 410 510 Q390 530 370 545 Q345 560 320 575 Q295 590 270 600 L270 700 L600 700 L600 0 Z";

const LAND_OUTLINE_PATH = "M280 0 Q270 30 250 55 Q235 80 240 100 Q250 120 270 135 Q300 150 330 160 Q360 175 380 190 Q395 200 390 215 Q380 225 370 235 Q365 245 370 255 Q380 265 390 275 Q405 290 415 305 Q425 320 430 335 Q435 350 440 365 Q445 380 450 395 Q455 410 455 430 Q450 455 440 475 Q425 495 410 510 Q390 530 370 545 Q345 560 320 575 Q295 590 270 600 L200 650 Q150 660 100 650 Q60 640 30 610 Q10 585 5 550 Q0 510 5 470 Q10 430 10 390 Q8 350 5 310 Q3 270 5 230 Q8 190 10 150 Q12 110 15 70 Q20 35 40 15 Q80 0 130 0 Z";

/* Bahrain island — small island shape to the right of Khobar */
const BAHRAIN_PATH = "M490 370 Q495 365 502 363 Q510 362 515 368 Q520 375 518 385 Q515 395 510 400 Q505 405 498 404 Q492 400 490 393 Q488 385 488 378 Q489 372 490 370 Z";

/* Road lines connecting major cities */
const ROAD_PATHS = [
  "M230 105 L290 145 Q320 160 350 195",           // Jubail → Ras Tanura
  "M350 195 L330 240 L340 275",                     // Ras Tanura → Qatif
  "M340 275 L380 310 L395 330",                     // Qatif → Dammam
  "M395 330 L405 360 L410 385",                     // Dammam → Khobar
  "M365 365 L300 430 Q250 510 195 600",             // Dhahran → Al Ahsa
  "M395 330 L365 365",                               // Dammam → Dhahran
];

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
          <svg viewBox="0 0 600 700" className="w-full h-full" style={{ maxHeight: 520 }}>
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
              {/* Water wave pattern */}
              <pattern id="waterWaves" x="0" y="0" width="30" height="12" patternUnits="userSpaceOnUse">
                <path d="M0 6 Q7.5 3 15 6 Q22.5 9 30 6" fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="0.6" />
              </pattern>
              {/* Sand texture for land */}
              <pattern id="sandTexture" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.3" fill="rgba(204,163,0,0.04)" />
                <circle cx="6" cy="5" r="0.3" fill="rgba(204,163,0,0.03)" />
              </pattern>
            </defs>

            {/* Background — entire area is water (Gulf) */}
            <rect x="0" y="0" width="600" height="700" fill="rgba(14,116,144,0.06)" />
            <rect x="0" y="0" width="600" height="700" fill="url(#waterWaves)" />

            {/* Land mass — Eastern Region */}
            <path
              d={LAND_OUTLINE_PATH}
              fill="rgba(240,237,232,0.05)"
              stroke="rgba(204,163,0,0.2)"
              strokeWidth="1.5"
            />
            <path d={LAND_OUTLINE_PATH} fill="url(#sandTexture)" />

            {/* Coastline highlight */}
            <path
              d={COASTLINE_PATH}
              fill="none"
              stroke="rgba(56,189,248,0.12)"
              strokeWidth="2"
            />

            {/* Bahrain island */}
            <path
              d={BAHRAIN_PATH}
              fill="rgba(240,237,232,0.04)"
              stroke="rgba(204,163,0,0.15)"
              strokeWidth="1"
            />
            <text
              x="505" y="420"
              textAnchor="middle"
              fill="rgba(240,237,232,0.25)"
              fontSize="9"
              fontWeight="500"
            >
              {isAr ? "البحرين" : "Bahrain"}
            </text>

            {/* Gulf label — rotated along the water */}
            <text
              x="530" y="250"
              textAnchor="middle"
              fill="rgba(56,189,248,0.15)"
              fontSize="14"
              fontWeight="600"
              transform="rotate(75, 530, 250)"
            >
              {isAr ? "الخليج العربي" : "Arabian Gulf"}
            </text>

            {/* Roads connecting cities */}
            {ROAD_PATHS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(204,163,0,0.08)"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
            ))}

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
        <svg viewBox="0 0 600 700" className="w-full" style={{ maxHeight: 200 }}>
          {/* Water background */}
          <rect x="0" y="0" width="600" height="700" fill="rgba(14,116,144,0.04)" />

          {/* Land mass */}
          <path
            d={LAND_OUTLINE_PATH}
            fill="rgba(240,237,232,0.04)"
            stroke="rgba(204,163,0,0.12)"
            strokeWidth="1"
          />

          {/* Bahrain */}
          <path d={BAHRAIN_PATH} fill="rgba(240,237,232,0.03)" stroke="rgba(204,163,0,0.1)" strokeWidth="0.8" />

          {/* City dots */}
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
