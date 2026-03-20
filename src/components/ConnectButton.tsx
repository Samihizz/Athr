"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Connection } from "@/types";

type ConnectionStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "connected"
  | "loading";

type ConnectButtonProps = {
  currentUserId: string;
  targetUserId: string;
  locale: string;
  compact?: boolean;
};

export default function ConnectButton({
  currentUserId,
  targetUserId,
  locale,
  compact = false,
}: ConnectButtonProps) {
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const isAr = locale === "ar";

  const t = {
    connect: isAr ? "تواصل" : "Connect",
    requestSent: isAr ? "تم الإرسال" : "Request Sent",
    accept: isAr ? "اقبل" : "Accept",
    decline: isAr ? "ارفض" : "Decline",
    connected: isAr ? "متصل ✓" : "Connected ✓",
    cancel: isAr ? "إلغاء الطلب" : "Cancel Request",
    remove: isAr ? "إزالة الاتصال" : "Remove Connection",
    writeNote: isAr ? "اكتب ملاحظة" : "Write a Note",
    sendRequest: isAr ? "أرسل طلب" : "Send Request",
    notePlaceholder: isAr
      ? "اكتب ملاحظة قصيرة (اختياري)..."
      : "Write a short note (optional)...",
    close: isAr ? "إغلاق" : "Close",
  };

  // Fetch connection status
  useEffect(() => {
    if (currentUserId === targetUserId) return;
    async function fetch() {
      const { data } = await supabase
        .from("connections")
        .select("*")
        .or(
          `and(requester_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`
        )
        .neq("status", "declined")
        .limit(1)
        .single();

      if (data) {
        const conn = data as Connection;
        setConnection(conn);
        if (conn.status === "accepted") {
          setStatus("connected");
        } else if (conn.status === "pending") {
          setStatus(
            conn.requester_id === currentUserId
              ? "pending_sent"
              : "pending_received"
          );
        }
      } else {
        setStatus("none");
      }
    }
    fetch();
  }, [currentUserId, targetUserId]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  if (currentUserId === targetUserId) return null;

  async function sendRequest() {
    setBusy(true);
    const { data, error } = await supabase
      .from("connections")
      .insert({
        requester_id: currentUserId,
        receiver_id: targetUserId,
        status: "pending",
        note: note.trim() || null,
      })
      .select()
      .single();

    if (!error && data) {
      setConnection(data as Connection);
      setStatus("pending_sent");
    }
    setNote("");
    setShowNoteModal(false);
    setBusy(false);
  }

  async function acceptRequest() {
    if (!connection) return;
    setBusy(true);
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", connection.id);
    if (!error) {
      setConnection({ ...connection, status: "accepted" });
      setStatus("connected");
    }
    setBusy(false);
  }

  async function declineRequest() {
    if (!connection) return;
    setBusy(true);
    const { error } = await supabase
      .from("connections")
      .update({ status: "declined", updated_at: new Date().toISOString() })
      .eq("id", connection.id);
    if (!error) {
      setConnection(null);
      setStatus("none");
    }
    setBusy(false);
  }

  async function cancelOrRemove() {
    if (!connection) return;
    setBusy(true);
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connection.id);
    if (!error) {
      setConnection(null);
      setStatus("none");
      setShowMenu(false);
    }
    setBusy(false);
  }

  if (status === "loading") {
    return (
      <div
        className={`${compact ? "h-7 w-20" : "h-9 w-28"} rounded-xl bg-surface animate-pulse`}
      />
    );
  }

  const btnBase = compact
    ? "text-xs px-3 py-1.5 rounded-lg"
    : "text-sm px-5 py-2 rounded-xl";

  return (
    <>
      <div className="relative inline-flex items-center gap-2" ref={menuRef}>
        {status === "none" && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowNoteModal(true);
            }}
            disabled={busy}
            className={`${btnBase} gradient-gold text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
          >
            {t.connect}
          </button>
        )}

        {status === "pending_sent" && (
          <>
            <span
              className={`${btnBase} bg-surface border border-border text-muted cursor-default`}
            >
              {t.requestSent}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                cancelOrRemove();
              }}
              disabled={busy}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              {t.cancel}
            </button>
          </>
        )}

        {status === "pending_received" && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                acceptRequest();
              }}
              disabled={busy}
              className={`${btnBase} gradient-gold text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {t.accept}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                declineRequest();
              }}
              disabled={busy}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              {t.decline}
            </button>
          </>
        )}

        {status === "connected" && (
          <>
            <span
              className={`${btnBase} bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default`}
            >
              {t.connected}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-muted hover:text-foreground transition-colors p-1"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01"
                />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute top-full end-0 mt-1 w-44 glass-strong rounded-xl overflow-hidden shadow-xl z-50">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(false);
                    setShowNoteModal(true);
                  }}
                  className="w-full text-start px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  {t.writeNote}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    cancelOrRemove();
                  }}
                  disabled={busy}
                  className="w-full text-start px-4 py-2.5 text-sm text-red-400 hover:bg-surface-hover transition-colors"
                >
                  {t.remove}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNoteModal(false);
          }}
        >
          <div className="glass-strong rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold mb-3">
              {status === "connected" ? t.writeNote : t.connect}
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              placeholder={t.notePlaceholder}
              rows={3}
              className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-1 mb-4">
              <span className="text-xs text-muted">{note.length}/200</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (status === "connected" && connection) {
                    setBusy(true);
                    await supabase
                      .from("connections")
                      .update({
                        note: note.trim() || null,
                        updated_at: new Date().toISOString(),
                      })
                      .eq("id", connection.id);
                    setConnection({
                      ...connection,
                      note: note.trim() || null,
                    });
                    setShowNoteModal(false);
                    setNote("");
                    setBusy(false);
                  } else {
                    sendRequest();
                  }
                }}
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl gradient-gold text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === "connected" ? t.writeNote : t.sendRequest}
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNote("");
                }}
                className="px-4 py-2.5 rounded-xl glass text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
