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
};

type PendingConnection = Connection & {
  profile: ProfileInfo;
  direction: "incoming" | "outgoing";
};

type PendingRequestsProps = {
  userId: string;
  locale: string;
};

export default function PendingRequests({ userId, locale }: PendingRequestsProps) {
  const [requests, setRequests] = useState<PendingConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const supabase = createClient();
  const isAr = locale === "ar";

  const t = {
    incoming: isAr ? "طلبات واردة" : "Incoming Requests",
    outgoing: isAr ? "طلبات مرسلة" : "Outgoing Requests",
    accept: isAr ? "قبول" : "Accept",
    decline: isAr ? "رفض" : "Decline",
    cancel: isAr ? "إلغاء الطلب" : "Cancel Request",
    noPending: isAr ? "لا توجد طلبات اتصال" : "No pending requests",
    sentTo: isAr ? "طلب مرسل" : "Request sent",
    wantsToConnect: isAr ? "يريد التواصل" : "Wants to connect",
  };

  useEffect(() => {
    fetchPending();
  }, [userId]);

  async function fetchPending() {
    setLoading(true);

    const { data: conns } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!conns || conns.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const otherIds = conns.map((c: Connection) =>
      c.requester_id === userId ? c.receiver_id : c.requester_id
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, city, expertise, avatar_url")
      .in("id", otherIds);

    const profileMap = new Map<string, ProfileInfo>();
    (profiles || []).forEach((p: ProfileInfo) => profileMap.set(p.id, p));

    const merged: PendingConnection[] = conns.map((c: Connection) => {
      const isIncoming = c.receiver_id === userId;
      const otherId = isIncoming ? c.requester_id : c.receiver_id;
      return {
        ...c,
        direction: isIncoming ? "incoming" : "outgoing",
        profile: profileMap.get(otherId) || {
          id: otherId,
          full_name: null,
          city: null,
          expertise: null,
          avatar_url: null,
        },
      };
    });

    setRequests(merged);
    setLoading(false);
  }

  async function acceptRequest(connId: string) {
    setBusy(connId);
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", connId);
    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== connId));
    }
    setBusy(null);
  }

  async function declineRequest(connId: string) {
    setBusy(connId);
    const { error } = await supabase
      .from("connections")
      .update({ status: "declined", updated_at: new Date().toISOString() })
      .eq("id", connId);
    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== connId));
    }
    setBusy(null);
  }

  async function cancelRequest(connId: string) {
    setBusy(connId);
    const { error } = await supabase.from("connections").delete().eq("id", connId);
    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== connId));
    }
    setBusy(null);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
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

  const incoming = requests.filter((r) => r.direction === "incoming");
  const outgoing = requests.filter((r) => r.direction === "outgoing");

  if (requests.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <div className="text-3xl mb-3">📬</div>
        <p className="text-muted">{t.noPending}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Incoming */}
      {incoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">{t.incoming}</h3>
          <div className="space-y-3">
            {incoming.map((req) => (
              <div key={req.id} className="glass rounded-xl p-5 hover:bg-surface-hover transition-colors">
                <div className="flex items-start gap-3">
                  <Link href={`/${locale}/members/${req.profile.id}`}>
                    <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                      {req.profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/members/${req.profile.id}`}
                      className="font-semibold text-sm hover:text-gold transition-colors"
                    >
                      {req.profile.full_name || (isAr ? "عضو" : "Member")}
                    </Link>
                    <p className="text-xs text-gold mt-0.5">{t.wantsToConnect}</p>
                    {req.note && (
                      <p className="text-xs text-muted mt-1 italic">&ldquo;{req.note}&rdquo;</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted mt-1">
                      {req.profile.city && <span>{req.profile.city}</span>}
                      {req.profile.expertise && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">
                          {req.profile.expertise}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => acceptRequest(req.id)}
                      disabled={busy === req.id}
                      className="px-4 py-1.5 rounded-lg gradient-gold text-background text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {t.accept}
                    </button>
                    <button
                      onClick={() => declineRequest(req.id)}
                      disabled={busy === req.id}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      {t.decline}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing */}
      {outgoing.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">{t.outgoing}</h3>
          <div className="space-y-3">
            {outgoing.map((req) => (
              <div key={req.id} className="glass rounded-xl p-5 hover:bg-surface-hover transition-colors">
                <div className="flex items-start gap-3">
                  <Link href={`/${locale}/members/${req.profile.id}`}>
                    <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                      {req.profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/members/${req.profile.id}`}
                      className="font-semibold text-sm hover:text-gold transition-colors"
                    >
                      {req.profile.full_name || (isAr ? "عضو" : "Member")}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">{t.sentTo}</p>
                    {req.note && (
                      <p className="text-xs text-muted mt-1 italic">&ldquo;{req.note}&rdquo;</p>
                    )}
                  </div>
                  <button
                    onClick={() => cancelRequest(req.id)}
                    disabled={busy === req.id}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
