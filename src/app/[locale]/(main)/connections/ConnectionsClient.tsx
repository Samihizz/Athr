"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Connection } from "@/types";

type ProfileInfo = {
  id: string;
  full_name: string | null;
  city: string | null;
  expertise: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string | string[] | null;
};

type ConnectionsClientProps = {
  connections: Connection[];
  profileMap: Record<string, ProfileInfo>;
  trackMap: Record<string, string>;
  currentUserId: string;
  locale: string;
};

type Tab = "connected" | "pending" | "sent";

export default function ConnectionsClient({
  connections: initialConnections,
  profileMap,
  trackMap,
  currentUserId,
  locale,
}: ConnectionsClientProps) {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>(profileMap);
  const [activeTab, setActiveTab] = useState<Tab>("connected");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const supabase = createClient();
  const isAr = locale === "ar";

  const t = {
    myConnections: isAr ? "اتصالاتي" : "My Connections",
    pending: isAr ? "طلبات الاتصال" : "Pending Requests",
    sent: isAr ? "طلبات مرسلة" : "Sent Requests",
    viewProfile: isAr ? "عرض الملف" : "View Profile",
    remove: isAr ? "إزالة الاتصال" : "Remove Connection",
    accept: isAr ? "اقبل" : "Accept",
    decline: isAr ? "ارفض" : "Decline",
    cancel: isAr ? "إلغاء الطلب" : "Cancel Request",
    noConnections: isAr ? "ما في اتصالات لسه" : "No connections yet",
    noPending: isAr ? "ما في طلبات" : "No pending requests",
    noSent: isAr ? "ما في طلبات مرسلة" : "No sent requests",
    note: isAr ? "ملاحظة" : "Note",
    editNote: isAr ? "تعديل الملاحظة" : "Edit Note",
    saveNote: isAr ? "حفظ" : "Save",
    connectionCount: (n: number) =>
      isAr ? `${n} اتصال` : `${n} connection${n !== 1 ? "s" : ""}`,
  };

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("connections-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connections",
        },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setConnections((prev) =>
              prev.filter((c) => c.id !== (payload.old as Connection).id)
            );
            return;
          }
          const conn = payload.new as Connection;
          // Only care about connections involving current user
          if (
            conn.requester_id !== currentUserId &&
            conn.receiver_id !== currentUserId
          )
            return;

          // Fetch profile if we don't have it
          const otherId =
            conn.requester_id === currentUserId
              ? conn.receiver_id
              : conn.requester_id;
          if (!profiles[otherId]) {
            const { data } = await supabase
              .from("profiles")
              .select(
                "id, full_name, city, expertise, avatar_url, bio, skills"
              )
              .eq("id", otherId)
              .single();
            if (data) {
              setProfiles((prev) => ({
                ...prev,
                [otherId]: data as ProfileInfo,
              }));
            }
          }

          if (payload.eventType === "INSERT") {
            setConnections((prev) => [conn, ...prev]);
          } else {
            setConnections((prev) =>
              prev.map((c) => (c.id === conn.id ? conn : c))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const connected = connections.filter((c) => c.status === "accepted");
  const pendingReceived = connections.filter(
    (c) => c.status === "pending" && c.receiver_id === currentUserId
  );
  const pendingSent = connections.filter(
    (c) => c.status === "pending" && c.requester_id === currentUserId
  );

  function getOtherProfile(conn: Connection): ProfileInfo | null {
    const otherId =
      conn.requester_id === currentUserId
        ? conn.receiver_id
        : conn.requester_id;
    return profiles[otherId] || null;
  }

  async function acceptConnection(connId: string) {
    setBusy(connId);
    await supabase
      .from("connections")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", connId);
    setConnections((prev) =>
      prev.map((c) =>
        c.id === connId ? { ...c, status: "accepted" as const } : c
      )
    );
    setBusy(null);
  }

  async function declineConnection(connId: string) {
    setBusy(connId);
    await supabase
      .from("connections")
      .update({ status: "declined", updated_at: new Date().toISOString() })
      .eq("id", connId);
    setConnections((prev) => prev.filter((c) => c.id !== connId));
    setBusy(null);
  }

  async function removeConnection(connId: string) {
    setBusy(connId);
    await supabase.from("connections").delete().eq("id", connId);
    setConnections((prev) => prev.filter((c) => c.id !== connId));
    setBusy(null);
  }

  async function saveNote(connId: string) {
    setBusy(connId);
    await supabase
      .from("connections")
      .update({
        note: noteValue.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connId);
    setConnections((prev) =>
      prev.map((c) =>
        c.id === connId ? { ...c, note: noteValue.trim() || null } : c
      )
    );
    setEditingNote(null);
    setNoteValue("");
    setBusy(null);
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "connected", label: t.myConnections, count: connected.length },
    { key: "pending", label: t.pending, count: pendingReceived.length },
    { key: "sent", label: t.sent, count: pendingSent.length },
  ];

  function renderMemberCard(
    conn: Connection,
    actions: React.ReactNode
  ) {
    const profile = getOtherProfile(conn);
    if (!profile) return null;
    const trackName = profile.expertise ? trackMap[profile.expertise] : null;
    const skills =
      typeof profile.skills === "string"
        ? profile.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(profile.skills)
          ? profile.skills
          : [];

    return (
      <div
        key={conn.id}
        className="glass rounded-2xl p-5 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
            {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {profile.full_name || (isAr ? "شفت" : "Member")}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted">
              {profile.city && <span>{profile.city}</span>}
              {trackName && (
                <>
                  <span className="text-border">|</span>
                  <span>{trackName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {skills.slice(0, 3).map((skill: string) => (
              <span
                key={skill}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Note */}
        {conn.note && editingNote !== conn.id && (
          <div className="mb-3 p-2.5 rounded-xl bg-surface border border-border">
            <p className="text-xs text-muted italic">
              &quot;{conn.note}&quot;
            </p>
          </div>
        )}

        {/* Edit note inline */}
        {editingNote === conn.id && (
          <div className="mb-3">
            <textarea
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value.slice(0, 200))}
              rows={2}
              className="w-full rounded-xl bg-surface border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder={
                isAr ? "اكتب ملاحظة..." : "Write a note..."
              }
              autoFocus
              onBlur={() => saveNote(conn.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveNote(conn.id);
                }
              }}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-muted">
                {noteValue.length}/200
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${locale}/members/${profile.id}`}
            className="text-xs px-3 py-1.5 rounded-lg glass hover:bg-surface-hover transition-colors"
          >
            {t.viewProfile}
          </Link>
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Connection count */}
      <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full gradient-gold flex items-center justify-center text-background font-bold text-lg">
          {connected.length}
        </div>
        <div>
          <p className="font-semibold text-sm">
            {t.connectionCount(connected.length)}
          </p>
          {pendingReceived.length > 0 && (
            <p className="text-xs text-gold">
              {pendingReceived.length}{" "}
              {isAr ? "طلب جديد" : "new request(s)"}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 glass rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "gradient-gold text-background"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ms-1.5 text-xs ${
                  activeTab === tab.key
                    ? "text-background/70"
                    : "text-muted"
                }`}
              >
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "connected" && (
        <>
          {connected.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {connected.map((conn) =>
                renderMemberCard(
                  conn,
                  <>
                    <button
                      onClick={() => {
                        setEditingNote(conn.id);
                        setNoteValue(conn.note || "");
                      }}
                      className="text-xs text-gold hover:text-gold-light transition-colors"
                    >
                      {conn.note ? t.editNote : t.note}
                    </button>
                    <button
                      onClick={() => removeConnection(conn.id)}
                      disabled={busy === conn.id}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {t.remove}
                    </button>
                  </>
                )
              )}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">🤝</div>
              <p className="text-muted">{t.noConnections}</p>
            </div>
          )}
        </>
      )}

      {activeTab === "pending" && (
        <>
          {pendingReceived.length > 0 ? (
            <div className="space-y-3">
              {pendingReceived.map((conn) => {
                const profile = getOtherProfile(conn);
                if (!profile) return null;
                const trackName = profile.expertise
                  ? trackMap[profile.expertise]
                  : null;
                return (
                  <div
                    key={conn.id}
                    className="glass rounded-2xl p-5 border-l-4 border-gold"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                        {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">
                          {profile.full_name || (isAr ? "شفت" : "Member")}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          {profile.city && <span>{profile.city}</span>}
                          {trackName && (
                            <>
                              <span className="text-border">|</span>
                              <span>{trackName}</span>
                            </>
                          )}
                        </div>
                        {conn.note && (
                          <p className="text-xs text-muted mt-2 italic">
                            &quot;{conn.note}&quot;
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => acceptConnection(conn.id)}
                            disabled={busy === conn.id}
                            className="text-xs px-4 py-1.5 rounded-lg gradient-gold text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {t.accept}
                          </button>
                          <button
                            onClick={() => declineConnection(conn.id)}
                            disabled={busy === conn.id}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            {t.decline}
                          </button>
                          <Link
                            href={`/${locale}/members/${profile.id}`}
                            className="text-xs text-muted hover:text-foreground transition-colors ms-auto"
                          >
                            {t.viewProfile}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📬</div>
              <p className="text-muted">{t.noPending}</p>
            </div>
          )}
        </>
      )}

      {activeTab === "sent" && (
        <>
          {pendingSent.length > 0 ? (
            <div className="space-y-3">
              {pendingSent.map((conn) => {
                const profile = getOtherProfile(conn);
                if (!profile) return null;
                const trackName = profile.expertise
                  ? trackMap[profile.expertise]
                  : null;
                return (
                  <div
                    key={conn.id}
                    className="glass rounded-2xl p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                        {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">
                          {profile.full_name || (isAr ? "شفت" : "Member")}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          {profile.city && <span>{profile.city}</span>}
                          {trackName && (
                            <>
                              <span className="text-border">|</span>
                              <span>{trackName}</span>
                            </>
                          )}
                        </div>
                        {conn.note && (
                          <p className="text-xs text-muted mt-2 italic">
                            &quot;{conn.note}&quot;
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs px-3 py-1 rounded-lg bg-surface border border-border text-muted">
                            {isAr ? "في الانتظار" : "Pending"}
                          </span>
                          <button
                            onClick={() => removeConnection(conn.id)}
                            disabled={busy === conn.id}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            {t.cancel}
                          </button>
                          <Link
                            href={`/${locale}/members/${profile.id}`}
                            className="text-xs text-muted hover:text-foreground transition-colors ms-auto"
                          >
                            {t.viewProfile}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📤</div>
              <p className="text-muted">{t.noSent}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
