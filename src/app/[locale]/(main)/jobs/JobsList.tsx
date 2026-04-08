"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Job } from "@/types";

type JobsListProps = {
  jobs: Job[];
  locale: string;
  tracks: { id: string; name: string }[];
  currentUserId: string;
};

const TYPE_COLORS: Record<string, string> = {
  job: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  freelance: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  collaboration: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  internship: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

function timeAgo(dateStr: string, isAr: boolean): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return isAr ? "الآن" : "just now";
  if (diffMins < 60) return isAr ? `قبل ${diffMins} دقيقة` : `${diffMins}m ago`;
  if (diffHours < 24) return isAr ? `قبل ${diffHours} ساعة` : `${diffHours}h ago`;
  if (diffDays < 30) return isAr ? `قبل ${diffDays} يوم` : `${diffDays}d ago`;
  return date.toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short", day: "numeric" });
}

function getContactLink(method: string | null, value: string | null): string | null {
  if (!method || !value) return null;
  switch (method) {
    case "whatsapp":
      return `https://wa.me/${value.replace(/[^0-9+]/g, "")}`;
    case "email":
      return `mailto:${value}`;
    case "linkedin":
      return value.startsWith("http") ? value : `https://linkedin.com/in/${value}`;
    default:
      return null;
  }
}

export default function JobsList({ jobs, locale, tracks, currentUserId }: JobsListProps) {
  const isAr = locale === "ar";
  const [filter, setFilter] = useState<string>("all");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localJobs, setLocalJobs] = useState<Job[]>(jobs);
  const [closingId, setClosingId] = useState<string | null>(null);

  const t = {
    all: isAr ? "الكل" : "All",
    job: isAr ? "وظيفة" : "Job",
    freelance: isAr ? "عمل حر" : "Freelance",
    collaboration: isAr ? "تعاون" : "Collaboration",
    internship: isAr ? "تدريب" : "Internship",
    remote: isAr ? "عن بعد" : "Remote",
    company: isAr ? "الشركة" : "Company",
    location: isAr ? "المكان" : "Location",
    salary: isAr ? "نطاق الراتب" : "Salary Range",
    contact: isAr ? "تواصل" : "Contact",
    closePosting: isAr ? "أغلق الإعلان" : "Close Posting",
    open: isAr ? "مفتوح" : "Open",
    closed: isAr ? "مغلق" : "Closed",
    postedBy: isAr ? "نشرها" : "Posted by",
    noJobs: isAr ? "لا توجد فرص حالياً" : "No opportunities found",
    allTracks: isAr ? "كل المسارات" : "All Tracks",
    remoteToggle: isAr ? "عن بعد فقط" : "Remote only",
    showMore: isAr ? "عرض المزيد" : "Show more",
    showLess: isAr ? "عرض أقل" : "Show less",
  };

  const typeLabels: Record<string, string> = {
    job: t.job,
    freelance: t.freelance,
    collaboration: t.collaboration,
    internship: t.internship,
  };

  const contactMethodLabels: Record<string, string> = {
    whatsapp: "WhatsApp",
    email: isAr ? "بريد إلكتروني" : "Email",
    linkedin: "LinkedIn",
  };

  const filtered = localJobs.filter((j) => {
    if (!j.is_open) return false;
    if (filter !== "all" && j.type !== filter) return false;
    if (trackFilter !== "all" && j.track !== trackFilter) return false;
    if (remoteOnly && !j.remote) return false;
    return true;
  });

  async function handleClose(jobId: string) {
    setClosingId(jobId);
    const supabase = createClient();
    const { error } = await supabase
      .from("jobs")
      .update({ is_open: false, updated_at: new Date().toISOString() })
      .eq("id", jobId)
      .eq("author_id", currentUserId);

    if (!error) {
      setLocalJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_open: false } : j))
      );
    }
    setClosingId(null);
  }

  const typeFilters = ["all", "job", "freelance", "collaboration", "internship"];

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === f
                ? "gradient-gold text-background border-transparent"
                : "glass border-border text-muted hover:text-foreground hover:border-border-strong"
            }`}
          >
            {f === "all" ? t.all : typeLabels[f]}
          </button>
        ))}
      </div>

      {/* Track filter + remote toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="glass rounded-xl px-4 py-2 text-sm border border-border bg-transparent text-foreground focus:outline-none focus:border-gold/50"
        >
          <option value="all" className="bg-background">{t.allTracks}</option>
          {tracks.map((tr) => (
            <option key={tr.id} value={tr.id} className="bg-background">{tr.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setRemoteOnly(!remoteOnly)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              remoteOnly ? "bg-gold" : "bg-surface-hover border border-border"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                remoteOnly ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm text-muted">{t.remoteToggle}</span>
        </label>
      </div>

      {/* Jobs list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">💼</div>
            <p className="text-muted">{t.noJobs}</p>
          </div>
        ) : (
          filtered.map((job) => {
            const isExpanded = expandedId === job.id;
            const isAuthor = job.author_id === currentUserId;
            const trackInfo = tracks.find((tr) => tr.id === job.track);
            const contactLink = getContactLink(job.contact_method, job.contact_value);

            return (
              <div key={job.id} className="glass rounded-2xl p-5 sm:p-6 hover:bg-surface-hover transition-all">
                {/* Type badge + close button */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${TYPE_COLORS[job.type] || TYPE_COLORS.job}`}>
                    {typeLabels[job.type] || job.type}
                  </span>
                  {isAuthor && (
                    <button
                      onClick={() => handleClose(job.id)}
                      disabled={closingId === job.id}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 rounded-lg px-3 py-1 transition-colors disabled:opacity-50"
                    >
                      {closingId === job.id ? "..." : t.closePosting}
                    </button>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold mb-1">{job.title}</h2>

                {/* Company */}
                {job.company && (
                  <p className="text-sm text-gold mb-1">{job.company}</p>
                )}

                {/* Location + remote */}
                <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-muted">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {job.location}
                    </span>
                  )}
                  {job.remote && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {t.remote}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mb-3">
                  <p className={`text-sm text-muted leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
                    {job.description}
                  </p>
                  {job.description.length > 200 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : job.id)}
                      className="text-xs text-gold hover:text-gold-light mt-1 transition-colors"
                    >
                      {isExpanded ? t.showLess : t.showMore}
                    </button>
                  )}
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {trackInfo && (
                    <span className="pill text-xs">{trackInfo.name}</span>
                  )}
                  {job.salary_range && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {job.salary_range}
                    </span>
                  )}
                </div>

                {/* Footer: posted by + contact */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <p className="text-xs text-muted">
                    {t.postedBy} <span className="text-foreground font-medium">{job.author_name}</span> · {timeAgo(job.created_at, isAr)}
                  </p>
                  {contactLink && (
                    <a
                      href={contactLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium gradient-gold text-background hover:opacity-90 transition-opacity"
                    >
                      {t.contact}
                      {job.contact_method && (
                        <span className="text-xs opacity-80">({contactMethodLabels[job.contact_method] || job.contact_method})</span>
                      )}
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
