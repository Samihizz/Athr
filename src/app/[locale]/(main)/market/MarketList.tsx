"use client";

import { useState } from "react";
import Image from "next/image";
import type { Service } from "@/types";

type MarketListProps = {
  services: Service[];
  locale: string;
  tracks: { id: string; name: string }[];
  currentUserId: string;
};

const CATEGORIES = [
  "all",
  "design",
  "development",
  "marketing",
  "translation",
  "consulting",
  "tutoring",
  "photography",
  "video",
  "writing",
  "other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  design: "bg-pink-500/15 text-pink-400 border-pink-500/25",
  development: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  marketing: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  translation: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  consulting: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  tutoring: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  photography: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  video: "bg-red-500/15 text-red-400 border-red-500/25",
  writing: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  other: "bg-gray-500/15 text-gray-400 border-gray-500/25",
};

function getContactLink(method: string | null, value: string | null): string | null {
  if (!method || !value) return null;
  switch (method) {
    case "whatsapp":
      return `https://wa.me/${value.replace(/[^0-9+]/g, "")}`;
    case "email":
      return `mailto:${value}`;
    default:
      return null;
  }
}

export default function MarketList({ services, locale, tracks, currentUserId }: MarketListProps) {
  const isAr = locale === "ar";
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const t = {
    all: isAr ? "الكل" : "All",
    design: isAr ? "تصميم" : "Design",
    development: isAr ? "تطوير" : "Development",
    marketing: isAr ? "تسويق" : "Marketing",
    translation: isAr ? "ترجمة" : "Translation",
    consulting: isAr ? "استشارات" : "Consulting",
    tutoring: isAr ? "تدريس" : "Tutoring",
    photography: isAr ? "تصوير" : "Photography",
    video: isAr ? "فيديو" : "Video",
    writing: isAr ? "كتابة" : "Writing",
    other: isAr ? "أخرى" : "Other",
    price: isAr ? "السعر" : "Price",
    fixed: isAr ? "ثابت" : "Fixed",
    hourly: isAr ? "بالساعة" : "Hourly",
    negotiable: isAr ? "قابل للتفاوض" : "Negotiable",
    contact: isAr ? "تواصل" : "Contact",
    noServices: isAr ? "لا توجد خدمات حالياً" : "No services found",
    search: isAr ? "ابحث عن خدمة..." : "Search services...",
  };

  const categoryLabels: Record<string, string> = {
    all: t.all,
    design: t.design,
    development: t.development,
    marketing: t.marketing,
    translation: t.translation,
    consulting: t.consulting,
    tutoring: t.tutoring,
    photography: t.photography,
    video: t.video,
    writing: t.writing,
    other: t.other,
  };

  const priceTypeLabels: Record<string, string> = {
    fixed: t.fixed,
    hourly: t.hourly,
    negotiable: t.negotiable,
  };

  const filtered = services.filter((s) => {
    if (category !== "all" && s.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = s.title?.toLowerCase().includes(q);
      const descMatch = s.description?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="w-full glass rounded-xl px-4 py-3 text-sm border border-border bg-transparent text-foreground placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              category === c
                ? "gradient-gold text-background border-transparent"
                : "glass border-border text-muted hover:text-foreground hover:border-border-strong"
            }`}
          >
            {categoryLabels[c]}
          </button>
        ))}
      </div>

      {/* Services grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-4xl mb-3 opacity-60">
            <svg className="w-12 h-12 mx-auto text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          </div>
          <p className="text-muted">{t.noServices}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => {
            const trackInfo = tracks.find((tr) => tr.id === service.author?.expertise);
            const contactLink = getContactLink(service.contact_method, service.contact_value);

            return (
              <div
                key={service.id}
                className="glass rounded-2xl p-5 hover:bg-surface-hover transition-all flex flex-col"
              >
                {/* Author row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="shrink-0">
                    {service.author?.avatar_url ? (
                      <Image
                        src={service.author.avatar_url}
                        alt=""
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-xl object-cover border border-border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-sm font-bold border border-border">
                        {service.author?.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {service.author?.full_name || (isAr ? "عضو" : "Member")}
                    </p>
                    {trackInfo && (
                      <p className="text-xs text-gold truncate">{trackInfo.name}</p>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold mb-1.5">{service.title}</h3>

                {/* Description */}
                {service.description && (
                  <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-3">
                    {service.description}
                  </p>
                )}

                {/* Category badge */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      CATEGORY_COLORS[service.category] || CATEGORY_COLORS.other
                    }`}
                  >
                    {categoryLabels[service.category] || service.category}
                  </span>
                  {service.price_type && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gold/10 text-gold border border-gold/20">
                      {priceTypeLabels[service.price_type] || service.price_type}
                    </span>
                  )}
                </div>

                {/* Price */}
                {service.price_range && (
                  <div className="flex items-center gap-1.5 text-sm text-muted mb-3">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t.price}: {service.price_range}</span>
                  </div>
                )}

                {/* Spacer to push contact to bottom */}
                <div className="flex-1" />

                {/* Contact button */}
                {contactLink && (
                  <a
                    href={contactLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium gradient-gold text-background hover:opacity-90 transition-opacity"
                  >
                    {t.contact}
                    {service.contact_method === "whatsapp" && (
                      <span className="text-xs opacity-80">(WhatsApp)</span>
                    )}
                    {service.contact_method === "email" && (
                      <span className="text-xs opacity-80">({isAr ? "بريد" : "Email"})</span>
                    )}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
