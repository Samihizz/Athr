"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Connection } from "@/types";
import ConnectionNote from "./ConnectionNote";

type ProfileInfo = {
  id: string;
  full_name: string | null;
  city: string | null;
  expertise: string | null;
  avatar_url: string | null;
};

type ConnectionWithProfile = Connection & {
  profile: ProfileInfo;
};

type ConnectionsListProps = {
  userId: string;
  locale: string;
};

export default function ConnectionsList({ userId, locale }: ConnectionsListProps) {
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const supabase = createClient();
  const isAr = locale === "ar";

  const t = {
    noConnections: isAr ? "ليس لديك اتصالات بعد" : "No connections yet",
    editNote: isAr ? "تعديل الملاحظة" : "Edit Note",
    addNote: isAr ? "أضف ملاحظة" : "Add Note",
    remove: isAr ? "فك الاتصال" : "Disconnect",
    note: isAr ? "ملاحظة" : "Note",
    viewProfile: isAr ? "عرض الملف" : "View Profile",
    exploreCommunity: isAr ? "تصفح المجتمع" : "Explore Community",
  };

  useEffect(() => {
    fetchConnections();
  }, [userId]);

  async function fetchConnections() {
    setLoading(true);

    // Get all accepted connections
    const { data: conns } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq("status", "accepted")
      .order("updated_at", { ascending: false });

    if (!conns || conns.length === 0) {
      setConnections([]);
      setLoading(false);
      return;
    }

    // Get the other user's profile for each connection
    const otherIds = conns.map((c: Connection) =>
      c.requester_id === userId ? c.receiver_id : c.requester_id
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, city, expertise, avatar_url")
      .in("id", otherIds);

    const profileMap = new Map<string, ProfileInfo>();
    (profiles || []).forEach((p: ProfileInfo) => profileMap.set(p.id, p));

    const merged = conns.map((c: Connection) => {
      const otherId = c.requester_id === userId ? c.receiver_id : c.requester_id;
      return {
        ...c,
        profile: profileMap.get(otherId) || {
          id: otherId,
          full_name: null,
          city: null,
          expertise: null,
          avatar_url: null,
        },
      };
    });

    setConnections(merged);
    setLoading(false);
  }

  async function removeConnection(connId: string) {
    setBusy(connId);
    const { error } = await supabase.from("connections").delete().eq("id", connId);
    if (!error) {
      setConnections((prev) => prev.filter((c) => c.id !== connId));
    }
    setBusy(null);
  }

  async function saveNote(connId: string, note: string) {
    setBusy(connId);
    const { error } = await supabase
      .from("connections")
      .update({ note: note || null, updated_at: new Date().toISOString() })
      .eq("id", connId);
    if (!error) {
      setConnections((prev) =>
        prev.map((c) => (c.id === connId ? { ...c, note: note || null } : c))
      );
    }
    setEditingNoteId(null);
    setBusy(null);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-surface" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-surface rounded" />
                <div className="h-3 w-24 bg-surface rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <div className="text-3xl mb-3">🤝</div>
        <p className="text-muted mb-4">{t.noConnections}</p>
        <Link
          href={`/${locale}/community`}
          className="inline-block px-5 py-2 rounded-xl gradient-gold text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t.exploreCommunity}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {connections.map((conn) => (
          <div key={conn.id} className="glass rounded-xl p-5 hover:bg-surface-hover transition-colors">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <Link href={`/${locale}/members/${conn.profile.id}`}>
                <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                  {conn.profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${locale}/members/${conn.profile.id}`}
                  className="font-semibold text-sm hover:text-gold transition-colors"
                >
                  {conn.profile.full_name || (isAr ? "عضو" : "Member")}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  {conn.profile.city && <span>{conn.profile.city}</span>}
                  {conn.profile.expertise && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">
                      {conn.profile.expertise}
                    </span>
                  )}
                </div>

                {/* Note */}
                {conn.note && (
                  <p className="text-xs text-muted mt-2 italic">
                    {t.note}: {conn.note}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Edit note */}
                <button
                  onClick={() => setEditingNoteId(conn.id)}
                  className="p-2 text-muted hover:text-foreground rounded-lg hover:bg-surface-hover transition-colors"
                  title={conn.note ? t.editNote : t.addNote}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                {/* Remove */}
                <button
                  onClick={() => removeConnection(conn.id)}
                  disabled={busy === conn.id}
                  className="p-2 text-muted hover:text-red-400 rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50"
                  title={t.remove}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Note Modal */}
      {editingNoteId && (
        <ConnectionNote
          locale={locale}
          initialNote={connections.find((c) => c.id === editingNoteId)?.note || ""}
          onSave={(note) => saveNote(editingNoteId, note)}
          onCancel={() => setEditingNoteId(null)}
        />
      )}
    </>
  );
}
