"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type TrackMessage = {
  id: string;
  track_id: string;
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  body: string;
  created_at: string;
};

type TrackChatProps = {
  trackId: string;
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  locale: string;
};

function detectArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

function relativeTime(dateStr: string, isAr: boolean): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return isAr ? "الحين" : "now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return isAr ? `${m} د` : `${m}m`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return isAr ? `${h} س` : `${h}h`;
  }
  const d = Math.floor(diff / 86400);
  return isAr ? `${d} ي` : `${d}d`;
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase() || "?";
}

export default function TrackChat({
  trackId,
  userId,
  userName,
  avatarUrl,
  locale,
}: TrackChatProps) {
  const isAr = locale === "ar";
  const [messages, setMessages] = useState<TrackMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  const t = {
    title: isAr ? "دردشة المسار" : "Track Chat",
    placeholder: isAr ? "اكتب رسالة..." : "Type a message...",
    send: isAr ? "إرسال" : "Send",
    online: isAr ? "شفت أونلاين" : "online",
    delete: isAr ? "حذف" : "Delete",
    noMessages: isAr ? "ما في رسائل لسه — كن أول واحد!" : "No messages yet — be the first!",
  };

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Update localStorage visit timestamp whenever messages load
  const updateVisitTimestamp = useCallback(() => {
    try {
      localStorage.setItem(`track-chat-visit-${trackId}`, new Date().toISOString());
    } catch {
      // localStorage unavailable
    }
  }, [trackId]);

  // Fetch initial messages + subscribe to realtime
  useEffect(() => {
    const supabase = supabaseRef.current;

    // Fetch last 50 messages
    async function fetchMessages() {
      const { data } = await supabase
        .from("track_messages")
        .select("*")
        .eq("track_id", trackId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setMessages(data.reverse());
      }
    }

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`track-chat-${trackId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "track_messages",
          filter: `track_id=eq.${trackId}`,
        },
        (payload) => {
          const newMsg = payload.new as TrackMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "track_messages",
          filter: `track_id=eq.${trackId}`,
        },
        (payload) => {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setMessages((prev) => prev.filter((m) => m.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Update visit timestamp when messages load
  useEffect(() => {
    if (messages.length > 0) {
      updateVisitTimestamp();
    }
  }, [messages.length, updateVisitTimestamp]);

  // Calculate online count (unique users in last 5 min)
  useEffect(() => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const recentUsers = new Set(
      messages
        .filter((m) => new Date(m.created_at).getTime() > fiveMinAgo)
        .map((m) => m.user_id)
    );
    setOnlineCount(recentUsers.size);
  }, [messages]);

  // Send message
  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setInput("");

    const supabase = supabaseRef.current;
    const { error } = await supabase.from("track_messages").insert({
      track_id: trackId,
      user_id: userId,
      user_name: userName,
      avatar_url: avatarUrl || null,
      body: trimmed,
    });

    if (error) {
      // Restore input on error
      setInput(trimmed);
    }

    setSending(false);
  }

  // Delete message
  async function handleDelete(messageId: string) {
    const supabase = supabaseRef.current;
    await supabase.from("track_messages").delete().eq("id", messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }

  return (
    <div className="card-elevated flex flex-col overflow-hidden" style={{ height: "500px" }}>
      {/* Header */}
      <div className="gradient-gold px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Chat icon */}
          <svg className="h-5 w-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div>
            <h3 className="font-bold text-background text-sm">{t.title}</h3>
          </div>
        </div>
        {onlineCount > 0 && (
          <div className="flex items-center gap-1.5 text-background/80 text-xs">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {onlineCount} {t.online}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted text-sm">{t.noMessages}</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.user_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
            >
              <div className={`flex gap-2 max-w-[85%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                  {msg.avatar_url ? (
                    <img
                      src={msg.avatar_url}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-light border border-border">
                      {getInitial(msg.user_name)}
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className="flex flex-col gap-0.5">
                  {/* Name + time */}
                  <div className={`flex items-center gap-2 text-xs ${isOwn ? "justify-end" : "justify-start"}`}>
                    <span className="text-muted font-medium">{msg.user_name}</span>
                    <span className="text-muted/60">{relativeTime(msg.created_at, isAr)}</span>
                  </div>

                  <div className="relative">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        isOwn
                          ? "gradient-gold text-background"
                          : "glass text-foreground"
                      }`}
                      dir={detectArabic(msg.body) ? "rtl" : "ltr"}
                    >
                      {msg.body}
                    </div>

                    {/* Delete button (own messages only) */}
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center h-5 w-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                        title={t.delete}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 bg-surface rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted border border-border focus:border-gold focus:outline-none transition-colors"
            dir={detectArabic(input) ? "rtl" : "ltr"}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="gradient-gold rounded-xl px-4 py-3 text-background font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
            aria-label={t.send}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
