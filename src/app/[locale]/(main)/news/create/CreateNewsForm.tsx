"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  { value: "general", en: "General", ar: "عام" },
  { value: "saudi_arabia", en: "Saudi Arabia", ar: "السعودية" },
  { value: "sudan", en: "Sudan", ar: "السودان" },
  { value: "technology", en: "Technology", ar: "التقنية" },
  { value: "business", en: "Business", ar: "الأعمال" },
];

export default function CreateNewsForm({
  locale,
  userId,
  authorName,
}: {
  locale: string;
  userId: string;
  authorName: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [category, setCategory] = useState("general");
  const [imageUrl, setImageUrl] = useState("");

  const t = {
    title: isAr ? "عنوان الخبر" : "News Title",
    summary: isAr ? "ملخص (اختياري)" : "Summary (optional)",
    sourceUrl: isAr ? "رابط المصدر" : "Source URL",
    pasteSource: isAr ? "الصق رابط المصدر" : "Paste source link",
    category: isAr ? "التصنيف" : "Category",
    imageUrl: isAr ? "رابط الصورة (اختياري)" : "Image URL (optional)",
    submit: isAr ? "شارك الخبر" : "Share News",
    submitting: isAr ? "جاري المشاركة..." : "Sharing...",
    cancel: isAr ? "إلغاء" : "Cancel",
    sourceHint: isAr ? "الرابط يظهر للأعضاء كمصدر موثوق" : "The link will be shown to members as a verified source",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(isAr ? "عنوان الخبر مطلوب" : "News title is required");
      return;
    }
    if (!sourceUrl.trim()) {
      setError(isAr ? "رابط المصدر مطلوب" : "Source URL is required");
      return;
    }

    // Basic URL validation
    try {
      new URL(sourceUrl);
    } catch {
      setError(isAr ? "رابط المصدر غير صحيح" : "Invalid source URL");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("user_news").insert({
        author_id: userId,
        author_name: authorName,
        title: title.trim(),
        summary: summary.trim() || null,
        source_url: sourceUrl.trim(),
        category,
        image_url: imageUrl.trim() || null,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      router.push(`/${locale}/news`);
      router.refresh();
    } catch {
      setError(isAr ? "حدث خطأ، حاول مرة ثانية" : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t.title} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isAr ? "مثال: السعودية تطلق برنامج جديد..." : "e.g. Saudi Arabia launches new program..."}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted"
          required
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.summary}</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder={isAr ? "ملخص قصير للخبر..." : "Brief summary of the news..."}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted resize-none"
        />
      </div>

      {/* Source URL */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t.sourceUrl} <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder={t.pasteSource}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted"
          required
        />
        <p className="text-xs text-muted mt-1.5 flex items-center gap-1">
          <svg className="w-3 h-3 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {t.sourceHint}
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.category}</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {isAr ? cat.ar : cat.en}
            </option>
          ))}
        </select>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.imageUrl}</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl font-semibold text-sm gradient-gold text-background hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? t.submitting : t.submit}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/news`)}
          className="px-6 py-3 rounded-xl font-medium text-sm glass hover:bg-surface-hover transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
