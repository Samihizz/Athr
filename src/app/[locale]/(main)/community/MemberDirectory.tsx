"use client";

import { useState } from "react";
import Link from "next/link";
import ConnectButton from "@/components/ConnectButton";

type Member = {
  id: string;
  full_name: string | null;
  bio: string | null;
  city: string | null;
  expertise: string | null;
  role: string | null;
  skills: string | string[] | null;
  avatar_url: string | null;
};

export default function MemberDirectory({
  members,
  locale,
  tracks,
  currentUserId,
}: {
  members: Member[];
  locale: string;
  tracks: { id: string; name: string }[];
  currentUserId?: string;
}) {
  const isAr = locale === "ar";
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const cities = Array.from(new Set(members.map((m) => m.city).filter(Boolean))) as string[];

  const filtered = members.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        m.full_name?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q) ||
        (typeof m.skills === "string" ? m.skills.toLowerCase().includes(q) : Array.isArray(m.skills) && m.skills.some((s) => s.toLowerCase().includes(q)));
      if (!match) return false;
    }
    if (trackFilter !== "all" && m.expertise !== trackFilter) return false;
    if (cityFilter !== "all" && m.city !== cityFilter) return false;
    return true;
  });

  const getTrackName = (expertise: string | null) => {
    if (!expertise) return null;
    const track = tracks.find((t) => t.id === expertise);
    return track?.name || null;
  };

  const getSkills = (skills: string | string[] | null): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return String(skills).split(",").map((s: string) => s.trim()).filter(Boolean);
  };

  const t = {
    search: isAr ? "ابحث بالاسم أو المهارة..." : "Search by name or skill...",
    all: isAr ? "الكل" : "All",
    allCities: isAr ? "جميع المدن" : "All Cities",
    allTracks: isAr ? "جميع المسارات" : "All Tracks",
    noResults: isAr ? "لا توجد نتائج" : "No members found",
    results: isAr ? `${filtered.length} عضو` : `${filtered.length} members`,
    viewProfile: isAr ? "الملف" : "View",
  };

  return (
    <div>
      {/* Search & Filters — horizontal scrollable bar */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="min-w-[200px] flex-1 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
        />
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="shrink-0 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">{t.allTracks}</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>{track.name}</option>
          ))}
        </select>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="shrink-0 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">{t.allCities}</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">{t.results}</p>
      </div>

      {/* Member list — row layout */}
      {filtered.length > 0 ? (
        <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
          {filtered.map((member) => {
            const trackName = getTrackName(member.expertise);
            const skills = getSkills(member.skills);

            return (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-surface-hover transition-colors"
              >
                {/* Avatar + info */}
                <Link
                  href={`/${locale}/members/${member.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  {/* Avatar */}
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover shrink-0 border border-border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                      {member.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}

                  {/* Name, track, city */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate hover:text-gold transition-colors">
                        {member.full_name || (isAr ? "عضو" : "Member")}
                      </span>
                      {trackName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold-light font-medium shrink-0">
                          {trackName}
                        </span>
                      )}
                      {member.city && (
                        <span className="text-xs text-muted shrink-0">
                          {member.city}
                        </span>
                      )}
                    </div>

                    {/* Skills pills */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {skills.slice(0, 4).map((skill: string) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light"
                          >
                            {skill}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-muted">
                            +{skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0 sm:ml-auto pl-15 sm:pl-0">
                  <Link
                    href={`/${locale}/members/${member.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors text-foreground font-medium"
                  >
                    {t.viewProfile}
                  </Link>
                  {currentUserId && currentUserId !== member.id && (
                    <ConnectButton
                      currentUserId={currentUserId}
                      targetUserId={member.id}
                      locale={locale}
                      compact
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted">{t.noResults}</p>
        </div>
      )}
    </div>
  );
}
