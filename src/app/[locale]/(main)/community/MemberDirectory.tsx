"use client";

import { useState } from "react";
import Link from "next/link";

type Member = {
  id: string;
  full_name: string | null;
  bio: string | null;
  city: string | null;
  expertise: string | null;
  role: string | null;
  skills: string[] | null;
  is_mentor: boolean;
  avatar_url: string | null;
};

export default function MemberDirectory({
  members,
  locale,
  tracks,
}: {
  members: Member[];
  locale: string;
  tracks: { id: string; name: string }[];
}) {
  const isAr = locale === "ar";
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [mentorOnly, setMentorOnly] = useState(false);

  const cities = Array.from(new Set(members.map((m) => m.city).filter(Boolean))) as string[];

  const filtered = members.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        m.full_name?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q) ||
        m.skills?.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (trackFilter !== "all" && m.expertise !== trackFilter) return false;
    if (cityFilter !== "all" && m.city !== cityFilter) return false;
    if (mentorOnly && !m.is_mentor) return false;
    return true;
  });

  const t = {
    search: isAr ? "ابحث بالاسم أو المهارة..." : "Search by name or skill...",
    all: isAr ? "الكل" : "All",
    allCities: isAr ? "جميع المدن" : "All Cities",
    mentorsOnly: isAr ? "الخبراء بس" : "Mentors Only",
    mentor: isAr ? "خبير" : "Mentor",
    noResults: isAr ? "ما في نتائج" : "No members found",
    results: isAr ? `${filtered.length} شفت` : `${filtered.length} members`,
  };

  return (
    <div>
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="flex-1 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
        />
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">{t.all}</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>{track.name}</option>
          ))}
        </select>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">{t.allCities}</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">{t.results}</p>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={mentorOnly}
            onChange={(e) => setMentorOnly(e.target.checked)}
            className="rounded accent-gold"
          />
          {t.mentorsOnly}
        </label>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <Link
              key={member.id}
              href={`/${locale}/members/${member.id}`}
              className="glass rounded-2xl p-5 hover:bg-surface-hover transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                  {member.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate group-hover:text-gold transition-colors">
                    {member.full_name || (isAr ? "شفت" : "Member")}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {member.city && <span>{member.city}</span>}
                    {member.is_mentor && (
                      <span className="px-1.5 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-medium">
                        {t.mentor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {member.bio && (
                <p className="text-xs text-muted line-clamp-2 mb-3">{member.bio}</p>
              )}
              {member.skills && member.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted">{t.noResults}</p>
        </div>
      )}
    </div>
  );
}
