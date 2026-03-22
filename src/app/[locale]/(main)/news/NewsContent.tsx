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

type UserNewsItem = {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  summary: string | null;
  source_url: string;
  category: string;
  image_url: string | null;
  created_at: string;
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
  userNews: UserNewsItem[];
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

const userNewsCategoryMap: Record<string, string> = {
  saudi_arabia: "Saudi Arabia",
  sudan: "Sudan",
  technology: "Technology",
  business: "Business",
  general: "All",
};

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

function getUserNewsCategoryLabel(category: string, translations: Translations): string {
  const map: Record<string, string> = {
    saudi_arabia: translations.saudiArabia,
    sudan: translations.sudan,
    technology: translations.technology,
    business: translations.business,
    general: translations.all,
  };
  return map[category] || category;
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(
    locale === "ar" ? "ar-SA" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function NewsContent({ news, userNews, locale, translations }: NewsContentProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const isAr = locale === "ar";

  const filtered = activeCategory === "All"
    ? news
    : news.filter((item) => item.category === activeCategory);

  const filteredUserNews = activeCategory === "All"
    ? userNews
    : userNews.filter((item) => userNewsCategoryMap[item.category] === activeCategory);

  const communityTitle = isAr ? "أخبار المجتمع" : "Community News";
  const curatedTitle = isAr ? "أخبار منتقاة" : "Curated News";
  const sourceLabel = isAr ? "المصدر" : "Source";

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

      {/* Community News Section */}
      {filteredUserNews.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">{communityTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUserNews.map((item, index) => (
              <article
                key={item.id}
                className="glass rounded-2xl overflow-hidden hover:bg-surface-hover transition-all group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="pill text-xs">
                      {getUserNewsCategoryLabel(item.category, translations)}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDate(item.created_at, locale)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-base mb-2 leading-snug group-hover:text-gold transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  {item.summary && (
                    <p className="text-sm text-muted mb-4 line-clamp-3">
                      {item.summary}
                    </p>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full gradient-gold flex items-center justify-center">
                      <span className="text-[10px] text-background font-bold">
                        {item.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-muted">{item.author_name}</span>
                  </div>

                  {/* Source Link */}
                  <div className="pt-3 border-t border-border">
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-gold hover:text-gold-light transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="font-medium">{sourceLabel}:</span>
                      <span className="truncate">{getDomain(item.source_url)}</span>
                      <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Curated News Section */}
      {filtered.length > 0 && filteredUserNews.length > 0 && (
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center">
            <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">{curatedTitle}</h2>
        </div>
      )}

      {/* Curated News Grid */}
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
      ) : filteredUserNews.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">📰</div>
          <p className="text-muted">{translations.noNews}</p>
        </div>
      ) : null}
    </>
  );
}
