"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CreateJobFormProps = {
  locale: string;
  authorId: string;
  authorName: string;
  tracks: { id: string; name: string }[];
};

export default function CreateJobForm({ locale, authorId, authorName, tracks }: CreateJobFormProps) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("job");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [track, setTrack] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [contactMethod, setContactMethod] = useState("whatsapp");
  const [contactValue, setContactValue] = useState("");

  const t = {
    title: isAr ? "عنوان الفرصة" : "Opportunity Title",
    titlePlaceholder: isAr ? "مثال: مطلوب مصمم UI/UX" : "e.g. Looking for a UI/UX Designer",
    description: isAr ? "الوصف" : "Description",
    descPlaceholder: isAr ? "اكتب تفاصيل الفرصة..." : "Describe the opportunity in detail...",
    type: isAr ? "نوع الفرصة" : "Opportunity Type",
    job: isAr ? "وظيفة" : "Job",
    freelance: isAr ? "عمل حر" : "Freelance",
    collaboration: isAr ? "تعاون" : "Collaboration",
    internship: isAr ? "تدريب" : "Internship",
    company: isAr ? "الشركة (اختياري)" : "Company (optional)",
    companyPlaceholder: isAr ? "اسم الشركة" : "Company name",
    location: isAr ? "المكان" : "Location",
    locationPlaceholder: isAr ? "مثال: الرياض" : "e.g. Riyadh",
    remote: isAr ? "عن بعد" : "Remote",
    track: isAr ? "المسار" : "Track",
    selectTrack: isAr ? "اختر المسار" : "Select a track",
    salary: isAr ? "نطاق الراتب (اختياري)" : "Salary Range (optional)",
    salaryPlaceholder: isAr ? "مثال: 5000-8000 ريال" : "e.g. 5000-8000 SAR",
    contactMethod: isAr ? "طريقة التواصل" : "Contact Method",
    contactValue: isAr ? "معلومات التواصل" : "Contact Info",
    contactPlaceholder: isAr ? "رقم الواتساب أو البريد أو رابط لينكدان" : "WhatsApp number, email, or LinkedIn URL",
    submit: isAr ? "انشر الفرصة" : "Post Opportunity",
    submitting: isAr ? "جاري النشر..." : "Posting...",
    errorGeneric: isAr ? "حصل خطأ. حاول مرة ثانية" : "Something went wrong. Please try again.",
  };

  const typeOptions = [
    { value: "job", label: t.job },
    { value: "freelance", label: t.freelance },
    { value: "collaboration", label: t.collaboration },
    { value: "internship", label: t.internship },
  ];

  const contactMethods = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: isAr ? "بريد إلكتروني" : "Email" },
    { value: "linkedin", label: "LinkedIn" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("jobs").insert({
      author_id: authorId,
      author_name: authorName,
      title,
      description,
      type,
      company: company || null,
      location: location || null,
      remote,
      track: track || null,
      salary_range: salaryRange || null,
      contact_method: contactMethod,
      contact_value: contactValue,
    });

    if (insertError) {
      setError(t.errorGeneric);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/jobs`);
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
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.descPlaceholder}
          className={inputClass + " resize-y"}
        />
      </div>

      {/* Type radio buttons */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.type}</label>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                type === opt.value
                  ? "gradient-gold text-background border-transparent"
                  : "glass border-border text-muted hover:text-foreground hover:border-border-strong"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t.company}</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder={t.companyPlaceholder}
          className={inputClass}
        />
      </div>

      {/* Location + Remote toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">{t.location}</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t.locationPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t.remote}</label>
          <div className="flex items-center gap-3 h-[46px]">
            <div
              onClick={() => setRemote(!remote)}
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${
                remote ? "bg-gold" : "bg-surface-hover border border-border"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${
                  remote ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm text-muted">{remote ? (isAr ? "نعم" : "Yes") : (isAr ? "لا" : "No")}</span>
          </div>
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

      {/* Salary range */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t.salary}</label>
        <input
          type="text"
          value={salaryRange}
          onChange={(e) => setSalaryRange(e.target.value)}
          placeholder={t.salaryPlaceholder}
          className={inputClass}
        />
      </div>

      {/* Contact method */}
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

      {/* Contact value */}
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
