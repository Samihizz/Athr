"use client";

import { useState } from "react";

type NewsItem = {
  id: string;
  title_en: string;
  title_ar: string;
  summary_en: string;
  summary_ar: string;
  source: string;
  url: string;
  category: string;
  published_at: string;
  image_url?: string;
};

type Translations = {
  all: string;
  saudiArabia: string;
  sudan: string;
  technology: string;
  business: string;
  readMore: string;
  noNews: string;
  source: string;
};

type NewsContentProps = {
  news: NewsItem[];
  locale: string;
  translations: Translations;
};

const categories = [
  { key: "All", icon: "📰" },
  { key: "Saudi Arabia", icon: "🇸🇦" },
  { key: "Sudan", icon: "🇸🇩" },
  { key: "Technology", icon: "💻" },
  { key: "Business", icon: "💼" },
];

function getCategoryLabel(key: string, translations: Translations): string {
  const map: Record<string, string> = {
    All: translations.all,
    "Saudi Arabia": translations.saudiArabia,
    Sudan: translations.sudan,
    Technology: translations.technology,
    Business: translations.business,
  };
  return map[key] || key;
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(
    locale === "ar" ? "ar-SA" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

export default function NewsContent({ news, locale, translations }: NewsContentProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const isAr = locale === "ar";

  const filtered = activeCategory === "All"
    ? news
    : news.filter((item) => item.category === activeCategory);

  return (
    <>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeCategory === cat.key
                ? "gradient-gold text-background glow-gold"
                : "glass text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{getCategoryLabel(cat.key, translations)}</span>
          </button>
        ))}
      </div>

      {/* News Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, index) => (
            <article
              key={item.id}
              className="glass rounded-2xl overflow-hidden hover:bg-surface-hover transition-all group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Category Badge */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="pill text-xs">
                    {getCategoryLabel(item.category, translations)}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(item.published_at, locale)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base mb-2 leading-snug group-hover:text-gold transition-colors line-clamp-2">
                  {isAr ? item.title_ar : item.title_en}
                </h3>

                {/* Summary */}
                <p className="text-sm text-muted mb-4 line-clamp-3">
                  {isAr ? item.summary_ar : item.summary_en}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted">
                    {translations.source}: {item.source}
                  </span>
                  {item.url && item.url !== "#" && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
                    >
                      {translations.readMore}
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">📰</div>
          <p className="text-muted">{translations.noNews}</p>
        </div>
      )}
    </>
  );
}
