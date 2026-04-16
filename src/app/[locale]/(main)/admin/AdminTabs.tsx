"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { CommunityStats } from "@/types";
import { createClient } from "@/lib/supabase/client";
import VerifiedBadge from "@/components/VerifiedBadge";

type Member = {
  id: string;
  full_name: string | null;
  email: string | null;
  city: string | null;
  expertise: string | null;
  role: string | null;
  is_admin: boolean;
  profile_complete: boolean;
  avatar_url: string | null;
  verified: boolean;
  created_at: string;
};

type Event = Record<string, unknown>;
type Post = Record<string, unknown>;
type Announcement = Record<string, unknown>;

type SortField = "full_name" | "created_at";
type SortDir = "asc" | "desc";

export default function AdminTabs({
  members: initialMembers,
  events,
  posts,
  announcements,
  stats,
  locale,
  currentUserId,
}: {
  members: Member[];
  events: Event[];
  posts: Post[];
  announcements: Announcement[];
  stats: CommunityStats | null;
  locale: string;
  currentUserId: string;
}) {
  const isAr = locale === "ar";
  const [tab, setTab] = useState<"overview" | "members" | "events" | "posts" | "announcements">("overview");

  // Member management state
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    type: "remove" | "remove-bulk";
    member?: Member;
    count?: number;
  } | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Loading states
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const supabase = createClient();

  const tabs = [
    { id: "overview" as const, label: isAr ? "نظرة عامة" : "Overview" },
    { id: "members" as const, label: isAr ? "الأعضاء" : "Members" },
    { id: "events" as const, label: isAr ? "الفعاليات" : "Events" },
    { id: "posts" as const, label: isAr ? "المنشورات" : "Posts" },
    { id: "announcements" as const, label: isAr ? "الإعلانات" : "Announcements" },
  ];

  // ── Filtering + Sorting ──
  const filteredMembers = useMemo(() => {
    let result = members;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.city?.toLowerCase().includes(q) ||
          m.expertise?.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let valA: string;
      let valB: string;
      if (sortField === "full_name") {
        valA = (a.full_name || "").toLowerCase();
        valB = (b.full_name || "").toLowerCase();
      } else {
        valA = a.created_at;
        valB = b.created_at;
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [members, search, sortField, sortDir]);

  // ── Toast helper ──
  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Toggle sort ──
  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  // ── Select all/none ──
  function toggleSelectAll() {
    if (selected.size === filteredMembers.filter((m) => m.id !== currentUserId).length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredMembers.filter((m) => m.id !== currentUserId).map((m) => m.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Remove member ──
  async function removeMember(memberId: string) {
    setLoadingAction(memberId);
    const { error } = await supabase.rpc("admin_delete_user", { target_user_id: memberId });
    setLoadingAction(null);

    if (error) {
      showToast(isAr ? "حدث خطأ في الحذف" : "Failed to remove member", "error");
      console.error("Delete error:", error);
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
      showToast(isAr ? "تم إزالة العضو" : "Member removed", "success");
    }
    setConfirmModal(null);
  }

  // ── Bulk remove ──
  async function bulkRemove() {
    setLoadingAction("bulk-remove");
    const ids = Array.from(selected);
    const errors: string[] = [];

    for (const id of ids) {
      const { error } = await supabase.rpc("admin_delete_user", { target_user_id: id });
      if (error) errors.push(id);
    }

    setLoadingAction(null);

    if (errors.length > 0) {
      showToast(isAr ? "حدث خطأ في حذف بعض الأعضاء" : `Failed to remove ${errors.length} member(s)`, "error");
    } else {
      setMembers((prev) => prev.filter((m) => !selected.has(m.id)));
      setSelected(new Set());
      showToast(isAr ? `تم إزالة ${ids.length} عضو` : `Removed ${ids.length} members`, "success");
    }
    setConfirmModal(null);
  }

  // ── Toggle verified ──
  async function toggleVerified(member: Member) {
    const newVal = !member.verified;
    setLoadingAction(`verify-${member.id}`);
    const { error } = await supabase
      .from("profiles")
      .update({ verified: newVal })
      .eq("id", member.id);
    setLoadingAction(null);

    if (error) {
      showToast(isAr ? "حدث خطأ" : "Failed to update", "error");
    } else {
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, verified: newVal } : m)));
      showToast(
        newVal
          ? isAr ? "تم توثيق العضو" : "Member verified"
          : isAr ? "تم إلغاء التوثيق" : "Verification removed",
        "success"
      );
    }
  }

  // ── Bulk verify ──
  async function bulkVerify() {
    setLoadingAction("bulk-verify");
    const ids = Array.from(selected);
    const { error } = await supabase.from("profiles").update({ verified: true }).in("id", ids);
    setLoadingAction(null);

    if (error) {
      showToast(isAr ? "حدث خطأ" : "Failed to verify", "error");
    } else {
      setMembers((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, verified: true } : m)));
      setSelected(new Set());
      showToast(isAr ? `تم توثيق ${ids.length} عضو` : `Verified ${ids.length} members`, "success");
    }
  }

  // ── CSV Export ──
  function exportMembersCSV() {
    const headers = ["Name", "Email", "City", "Track", "Role", "Verified", "Joined"];
    const rows = members.map((m) => [
      m.full_name || "",
      m.email || "",
      m.city || "",
      m.expertise || "",
      m.role || "",
      m.verified ? "Yes" : "No",
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

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-xl border transition-all animate-fade-in-up ${
            toast.type === "success"
              ? "bg-green-900/80 border-green-700/50 text-green-200"
              : "bg-red-900/80 border-red-700/50 text-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-3">
              {isAr ? "متأكد؟" : "Are you sure?"}
            </h3>
            <p className="text-muted text-sm mb-6">
              {confirmModal.type === "remove" && confirmModal.member
                ? isAr
                  ? `متأكد تبي تشيل ${confirmModal.member.full_name || "هذا العضو"}؟`
                  : `Are you sure you want to remove ${confirmModal.member.full_name || "this member"}?`
                : isAr
                  ? `متأكد تبي تشيل ${confirmModal.count} عضو؟`
                  : `Are you sure you want to remove ${confirmModal.count} members?`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg glass text-sm hover:bg-surface-hover transition-colors"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === "remove" && confirmModal.member) {
                    removeMember(confirmModal.member.id);
                  } else {
                    bulkRemove();
                  }
                }}
                disabled={!!loadingAction}
                className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loadingAction
                  ? isAr ? "جاري الحذف..." : "Removing..."
                  : isAr ? "شيل العضو" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <StatCard label={isAr ? "إجمالي الأعضاء" : "Total Members"} value={stats.total_members} />
            <StatCard label={isAr ? "الخبراء" : "Mentors"} value={stats.mentors} />
            <StatCard label={isAr ? "البرامج" : "Events"} value={events.length} />
            <StatCard label={isAr ? "المنشورات" : "Posts"} value={posts.length} />
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
          {/* Header row: count + search + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gradient-gold">{members.length}</span>
              <span className="text-sm text-muted">{isAr ? "عضو" : "members"}</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? "ابحث عن عضو..." : "Search members..."}
                className="w-full px-4 py-2.5 rounded-xl glass text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <>
                  <button
                    onClick={bulkVerify}
                    disabled={!!loadingAction}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-gold/20 text-gold hover:bg-gold/30 transition-colors disabled:opacity-50"
                  >
                    {loadingAction === "bulk-verify"
                      ? "..."
                      : isAr
                        ? `وثّق (${selected.size})`
                        : `Verify (${selected.size})`}
                  </button>
                  <button
                    onClick={() => setConfirmModal({ type: "remove-bulk", count: selected.size })}
                    disabled={!!loadingAction}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-red-900/40 text-red-400 hover:bg-red-900/60 transition-colors disabled:opacity-50"
                  >
                    {isAr ? `شيل (${selected.size})` : `Remove (${selected.size})`}
                  </button>
                </>
              )}
              <button
                onClick={exportMembersCSV}
                className="px-4 py-2 rounded-lg glass text-sm font-medium hover:bg-surface-hover transition-colors"
              >
                {isAr ? "تصدير CSV" : "Export CSV"}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto glass rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-3 px-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredMembers.filter((m) => m.id !== currentUserId).length > 0 &&
                        selected.size === filteredMembers.filter((m) => m.id !== currentUserId).length
                      }
                      onChange={toggleSelectAll}
                      className="rounded accent-gold"
                    />
                  </th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "العضو" : "Member"}</th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "البريد" : "Email"}</th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "المدينة" : "City"}</th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "المسار" : "Track"}</th>
                  <th className="text-start py-3 px-3 font-medium">
                    <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      {isAr ? "انضم" : "Joined"} <span className="text-[10px]">{sortIcon("created_at")}</span>
                    </button>
                  </th>
                  <th className="text-start py-3 px-3 font-medium">{isAr ? "موثّق" : "Verified"}</th>
                  <th className="text-end py-3 px-3 font-medium">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => {
                  const isSelf = m.id === currentUserId;
                  return (
                    <tr key={m.id} className="border-b border-border/30 hover:bg-surface-hover transition-colors group">
                      {/* Checkbox */}
                      <td className="py-3 px-3">
                        {!isSelf && (
                          <input
                            type="checkbox"
                            checked={selected.has(m.id)}
                            onChange={() => toggleSelect(m.id)}
                            className="rounded accent-gold"
                          />
                        )}
                      </td>

                      {/* Avatar + Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface border border-border shrink-0">
                            {m.avatar_url ? (
                              <Image
                                src={m.avatar_url}
                                alt={m.full_name || ""}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted font-medium">
                                {(m.full_name || "?")[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleSort("full_name")}
                              className="font-medium hover:text-gold transition-colors text-start"
                            >
                              {m.full_name || "—"}
                            </button>
                            {m.verified && <VerifiedBadge size={14} />}
                            {m.is_admin && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3 text-muted text-xs">{m.email || "—"}</td>

                      {/* City */}
                      <td className="py-3 px-3 text-muted">{m.city || "—"}</td>

                      {/* Track */}
                      <td className="py-3 px-3">
                        {m.expertise ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary-light">
                            {m.expertise}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="py-3 px-3 text-muted text-xs">
                        {new Date(m.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Verified toggle */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleVerified(m)}
                          disabled={loadingAction === `verify-${m.id}`}
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            m.verified ? "bg-gold/60" : "bg-surface-hover border border-border"
                          }`}
                          title={isAr ? (m.verified ? "موثّق" : "وثّق") : (m.verified ? "Verified" : "Verify")}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              m.verified ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-end">
                        {!isSelf && (
                          <button
                            onClick={() => setConfirmModal({ type: "remove", member: m })}
                            disabled={!!loadingAction}
                            className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
                            title={isAr ? "شيل العضو" : "Remove Member"}
                          >
                            {/* Trash icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted">
                      {isAr ? "لم يتم العثور على أعضاء" : "No members found"}
                    </td>
                  </tr>
                )}
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
