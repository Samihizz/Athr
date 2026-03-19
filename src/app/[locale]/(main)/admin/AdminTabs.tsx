"use client";

import { useState } from "react";
import type { CommunityStats } from "@/types";

type Member = {
  id: string;
  full_name: string | null;
  email: string | null;
  city: string | null;
  expertise: string | null;
  role: string | null;
  is_mentor: boolean;
  is_admin: boolean;
  profile_complete: boolean;
  created_at: string;
};

type Event = Record<string, unknown>;
type Post = Record<string, unknown>;
type Announcement = Record<string, unknown>;

export default function AdminTabs({
  members,
  events,
  posts,
  announcements,
  stats,
  locale,
}: {
  members: Member[];
  events: Event[];
  posts: Post[];
  announcements: Announcement[];
  stats: CommunityStats | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [tab, setTab] = useState<"overview" | "members" | "events" | "posts" | "announcements">("overview");

  const tabs = [
    { id: "overview" as const, label: isAr ? "نظرة عامة" : "Overview" },
    { id: "members" as const, label: isAr ? "الشفاتة" : "Members" },
    { id: "events" as const, label: isAr ? "البرامج" : "Events" },
    { id: "posts" as const, label: isAr ? "الشمارات" : "Posts" },
    { id: "announcements" as const, label: isAr ? "الإعلانات" : "Announcements" },
  ];

  function exportMembersCSV() {
    const headers = ["Name", "Email", "City", "Expertise", "Role", "Mentor", "Joined"];
    const rows = members.map((m) => [
      m.full_name || "",
      m.email || "",
      m.city || "",
      m.expertise || "",
      m.role || "",
      m.is_mentor ? "Yes" : "No",
      new Date(m.created_at).toLocaleDateString("en-US"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `athr-members-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "gradient-gold text-background" : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label={isAr ? "إجمالي الشفاتة" : "Total Members"} value={stats.total_members} />
            <StatCard label={isAr ? "الخبراء" : "Mentors"} value={stats.mentors} />
            <StatCard label={isAr ? "البرامج" : "Events"} value={events.length} />
            <StatCard label={isAr ? "الشمارات" : "Posts"} value={posts.length} />
          </div>
          <h3 className="text-lg font-semibold mb-4">{isAr ? "توزيع المسارات" : "Track Distribution"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <StatCard label="AI & Emerging Tech" value={stats.track_ai} />
            <StatCard label="Creative & Freelancing" value={stats.track_creative} />
            <StatCard label="Business" value={stats.track_business} />
            <StatCard label="Marketing" value={stats.track_marketing} />
            <StatCard label="Finance" value={stats.track_finance} />
            <StatCard label="Tech & Dev" value={stats.track_tech} />
          </div>
          <h3 className="text-lg font-semibold mb-4">{isAr ? "توزيع المدن" : "City Distribution"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Dammam" value={stats.city_dammam} />
            <StatCard label="Khobar" value={stats.city_khobar} />
            <StatCard label="Al Ahsa" value={stats.city_alahsa} />
            <StatCard label="Dhahran" value={stats.city_dhahran} />
          </div>
        </div>
      )}

      {/* Members */}
      {tab === "members" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">{members.length} {isAr ? "شفت" : "members"}</p>
            <button
              onClick={exportMembersCSV}
              className="px-4 py-2 rounded-lg glass text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              {isAr ? "تصدير CSV" : "Export CSV"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "الاسم" : "Name"}</th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "البريد" : "Email"}</th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "المدينة" : "City"}</th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "المسار" : "Track"}</th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "الدور" : "Role"}</th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "انضم" : "Joined"}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span>{m.full_name || "—"}</span>
                        {m.is_mentor && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold">M</span>}
                        {m.is_admin && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/30 text-primary-light">A</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted">{m.email || "—"}</td>
                    <td className="py-3 px-3 text-muted">{m.city || "—"}</td>
                    <td className="py-3 px-3 text-muted">{m.expertise || "—"}</td>
                    <td className="py-3 px-3 text-muted">{m.role || "—"}</td>
                    <td className="py-3 px-3 text-muted">{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events */}
      {tab === "events" && (
        <div>
          <p className="text-sm text-muted mb-4">{events.length} {isAr ? "فعالية" : "events"}</p>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((e) => (
                <div key={e.id as string} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{e.title as string}</h3>
                      <p className="text-xs text-muted mt-1">
                        {new Date(e.event_date as string).toLocaleDateString(isAr ? "ar-EG" : "en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                        {e.location ? ` · ${e.location as string}` : ""}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-surface text-muted">{e.track as string || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center text-muted">{isAr ? "لا توجد فعاليات" : "No events"}</div>
          )}
        </div>
      )}

      {/* Posts */}
      {tab === "posts" && (
        <div>
          <p className="text-sm text-muted mb-4">{posts.length} {isAr ? "منشور" : "posts"}</p>
          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id as string} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{isAr ? (p.title_ar as string) : (p.title_en as string)}</h3>
                      <p className="text-xs text-muted mt-1">
                        {new Date(p.created_at as string).toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {` · ${p.category}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.is_pinned ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold">📌</span> : null}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.is_published ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                        {p.is_published ? (isAr ? "منشور" : "Published") : (isAr ? "مسودة" : "Draft")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center text-muted">{isAr ? "لا يوجد محتوى" : "No posts"}</div>
          )}
        </div>
      )}

      {/* Announcements */}
      {tab === "announcements" && (
        <div>
          <p className="text-sm text-muted mb-4">{announcements.length} {isAr ? "إعلان" : "announcements"}</p>
          {announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id as string} className="glass rounded-xl p-4">
                  <h3 className="font-semibold">{isAr ? (a.title_ar as string) : (a.title_en as string)}</h3>
                  <p className="text-sm text-muted mt-1">{isAr ? (a.body_ar as string) : (a.body_en as string)}</p>
                  <p className="text-xs text-muted mt-2">
                    {new Date(a.created_at as string).toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center text-muted">{isAr ? "لا توجد إعلانات" : "No announcements"}</div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-gradient-gold">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}
