"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CreateServiceFormProps = {
  locale: string;
  authorId: string;
  tracks: { id: string; name: string }[];
};

export default function CreateServiceForm({ locale, authorId, tracks }: CreateServiceFormProps) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [priceRange, setPriceRange] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [track, setTrack] = useState("");
  const [contactMethod, setContactMethod] = useState("whatsapp");
  const [contactValue, setContactValue] = useState("");

  const t = {
    title: isAr ? "عنوان الخدمة" : "Service Title",
    titlePlaceholder: isAr ? "مثال: تصميم شعارات وهويات بصرية" : "e.g. Logo design & visual identity",
    description: isAr ? "وصف الخدمة" : "Description",
    descPlaceholder: isAr ? "اكتب تفاصيل خدمتك..." : "Describe your service in detail...",
    category: isAr ? "التصنيف" : "Category",
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
    priceRange: isAr ? "نطاق السعر (اختياري)" : "Price Range (optional)",
    pricePlaceholder: isAr ? "مثال: 500-2000 ريال" : "e.g. 500-2000 SAR",
    priceType: isAr ? "نوع التسعير" : "Price Type",
    fixed: isAr ? "ثابت" : "Fixed",
    hourly: isAr ? "بالساعة" : "Hourly",
    negotiable: isAr ? "قابل للتفاوض" : "Negotiable",
    track: isAr ? "المسار" : "Track",
    selectTrack: isAr ? "اختر المسار (اختياري)" : "Select a track (optional)",
    contactMethod: isAr ? "طريقة التواصل" : "Contact Method",
    contactValue: isAr ? "معلومات التواصل" : "Contact Info",
    contactPlaceholder: isAr ? "رقم الواتساب أو البريد الإلكتروني" : "WhatsApp number or email address",
    submit: isAr ? "انشر الخدمة" : "Post Service",
    submitting: isAr ? "جاري النشر..." : "Posting...",
    errorGeneric: isAr ? "حصل خطأ. حاول مرة ثانية" : "Something went wrong. Please try again.",
  };

  const categoryOptions = [
    { value: "design", label: t.design },
    { value: "development", label: t.development },
    { value: "marketing", label: t.marketing },
    { value: "translation", label: t.translation },
    { value: "consulting", label: t.consulting },
    { value: "tutoring", label: t.tutoring },
    { value: "photography", label: t.photography },
    { value: "video", label: t.video },
    { value: "writing", label: t.writing },
    { value: "other", label: t.other },
  ];

  const priceTypeOptions = [
    { value: "fixed", label: t.fixed },
    { value: "hourly", label: t.hourly },
    { value: "negotiable", label: t.negotiable },
  ];

  const contactMethods = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: isAr ? "بريد إلكتروني" : "Email" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("services").insert({
      author_id: authorId,
      title,
      description: description || null,
      category,
      price_range: priceRange || null,
      price_type: priceType,
      track: track || null,
      contact_method: contactMethod,
      contact_value: contactValue,
    });

    if (insertError) {
      setError(t.errorGeneric);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/market`);
    router.refresh();
  }

  const inputClass = "w-full glass rounded-xl px-4 py-3 text-sm border border-border bg-transparent text-foreground placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="glass-strong rounded-xl p-4 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t.title}</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.titlePlaceholder}
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t.description}</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.descPlaceholder}
          className={inputClass + " resize-y"}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.category}</label>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                category === opt.value
                  ? "gradient-gold text-background border-transparent"
                  : "glass border-border text-muted hover:text-foreground hover:border-border-strong"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t.priceRange}</label>
        <input
          type="text"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          placeholder={t.pricePlaceholder}
          className={inputClass}
        />
      </div>

      {/* Price Type */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.priceType}</label>
        <div className="flex flex-wrap gap-2">
          {priceTypeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriceType(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                priceType === opt.value
                  ? "gradient-gold text-background border-transparent"
                  : "glass border-border text-muted hover:text-foreground hover:border-border-strong"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Track */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t.track}</label>
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          className={inputClass}
        >
          <option value="" className="bg-background">{t.selectTrack}</option>
          {tracks.map((tr) => (
            <option key={tr.id} value={tr.id} className="bg-background">{tr.name}</option>
          ))}
        </select>
      </div>

      {/* Contact Method */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.contactMethod}</label>
        <div className="flex flex-wrap gap-2">
          {contactMethods.map((cm) => (
            <button
              key={cm.value}
              type="button"
              onClick={() => setContactMethod(cm.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                contactMethod === cm.value
                  ? "gradient-gold text-background border-transparent"
                  : "glass border-border text-muted hover:text-foreground hover:border-border-strong"
              }`}
            >
              {cm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Value */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t.contactValue}</label>
        <input
          type="text"
          required
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          placeholder={t.contactPlaceholder}
          className={inputClass}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3.5 text-base disabled:opacity-50"
      >
        {loading ? t.submitting : t.submit}
      </button>
    </form>
  );
}
