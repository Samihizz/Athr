"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { downloadICS } from "@/lib/calendar";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  track: string | null;
};

function getCountdown(eventDate: string, isAr: boolean): string | null {
  const now = new Date();
  const target = new Date(eventDate);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs < 0) return null;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return isAr ? "اليوم" : "Today";
  if (diffDays === 1) return isAr ? "بكرة" : "Tomorrow";
  if (diffDays <= 30) return isAr ? `بعد ${diffDays} يوم` : `In ${diffDays} days`;
  return null;
}

export default function EventsList({
  events,
  registeredIds: initialRegistered,
  registrationCounts,
  locale,
  tracks,
  userId,
}: {
  events: EventItem[];
  registeredIds: string[];
  registrationCounts: Record<string, number>;
  locale: string;
  tracks: { id: string; name: string }[];
  userId: string;
}) {
  const isAr = locale === "ar";
  const [registered, setRegistered] = useState<Set<string>>(new Set(initialRegistered));
  const [filter, setFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const now = new Date().toISOString();
  const upcoming = events.filter((e) => e.event_date >= now);
  const past = events.filter((e) => e.event_date < now);

  const filteredUpcoming = filter === "all" ? upcoming : upcoming.filter((e) => e.track === filter);
  const filteredPast = filter === "all" ? past : past.filter((e) => e.track === filter);

  async function handleRegister(eventId: string) {
    setLoadingId(eventId);
    const supabase = createClient();

    if (registered.has(eventId)) {
      await supabase.from("event_registrations").delete().eq("event_id", eventId).eq("member_id", userId);
      setRegistered((prev) => { const s = new Set(prev); s.delete(eventId); return s; });
    } else {
      await supabase.from("event_registrations").insert({ event_id: eventId, member_id: userId });
      setRegistered((prev) => new Set(prev).add(eventId));
    }
    setLoadingId(null);
  }

  const t = {
    upcoming: isAr ? "القادمة" : "Upcoming",
    past: isAr ? "السابقة" : "Past",
    all: isAr ? "الكل" : "All",
    register: isAr ? "سجّل" : "Register",
    registered: isAr ? "مسجّل" : "Registered",
    noEvents: isAr ? "لا توجد فعاليات" : "No events found",
    shareWhatsApp: isAr ? "مشاركة" : "Share",
    addToCalendar: isAr ? "أضف للتقويم" : "Add to Calendar",
    copyLink: isAr ? "انسخ الرابط" : "Copy Link",
    linkCopied: isAr ? "تم النسخ" : "Link Copied",
    xRegistered: (n: number) => isAr ? `${n} مسجّل` : `${n} registered`,
  };

  function shareEvent(event: EventItem) {
    const text = `${event.title}\n${new Date(event.event_date).toLocaleDateString(isAr ? "ar-EG" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}${event.location ? `\n📍 ${event.location}` : ""}\n\n${isAr ? "عبر منصة أثر" : "Via Athr Platform"}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function handleCalendarDownload(event: EventItem) {
    downloadICS({
      title: event.title,
      description: event.description || undefined,
      location: event.location || undefined,
      startDate: event.event_date,
    });
  }

  function handleCopyLink(eventId: string) {
    const url = `${window.location.origin}/${locale}/events#${eventId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(eventId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div>
      {/* Track filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${filter === "all" ? "gradient-gold text-background" : "glass hover:bg-surface-hover"}`}
        >
          {t.all}
        </button>
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => setFilter(track.id)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${filter === track.id ? "gradient-gold text-background" : "glass hover:bg-surface-hover"}`}
          >
            {track.name}
          </button>
        ))}
      </div>

      {/* Upcoming */}
      <h2 className="text-xl font-bold mb-4">{t.upcoming}</h2>
      {filteredUpcoming.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {filteredUpcoming.map((event) => {
            const countdown = getCountdown(event.event_date, isAr);
            const regCount = registrationCounts[event.id] || 0;

            return (
              <div key={event.id} id={event.id} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    {event.description && <p className="text-sm text-muted mt-1 line-clamp-2">{event.description}</p>}
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted">
                      <span>{new Date(event.event_date).toLocaleDateString(isAr ? "ar-EG" : "en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {event.location && <span>📍 {event.location}</span>}
                      {regCount > 0 && (
                        <span className="text-gold/80">👥 {t.xRegistered(regCount)}</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 glass rounded-xl px-3 py-2 text-center">
                    <div className="text-xs text-muted">{new Date(event.event_date).toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "short" })}</div>
                    <div className="text-lg font-bold text-gold">{new Date(event.event_date).getDate()}</div>
                    {countdown && (
                      <div className="text-[10px] text-gold/70 mt-0.5 whitespace-nowrap">{countdown}</div>
                    )}
                  </div>
                </div>

                {/* Register button */}
                <div className="mt-4">
                  <button
                    onClick={() => handleRegister(event.id)}
                    disabled={loadingId === event.id}
                    className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                      registered.has(event.id)
                        ? "bg-green-900/30 text-green-400 border border-green-800"
                        : "gradient-gold text-background hover:opacity-90"
                    }`}
                  >
                    {loadingId === event.id ? "..." : registered.has(event.id) ? `✓ ${t.registered}` : t.register}
                  </button>
                </div>

                {/* Share row: WhatsApp + Calendar + Copy Link */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => shareEvent(event)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs hover:bg-surface-hover transition-colors"
                    title="WhatsApp"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <span>{t.shareWhatsApp}</span>
                  </button>
                  <button
                    onClick={() => handleCalendarDownload(event)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs hover:bg-surface-hover transition-colors"
                    title={t.addToCalendar}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
                    <span>{t.addToCalendar}</span>
                  </button>
                  <button
                    onClick={() => handleCopyLink(event.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs hover:bg-surface-hover transition-colors"
                    title={t.copyLink}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    <span>{copiedId === event.id ? t.linkCopied : t.copyLink}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl p-10 text-center mb-12">
          <p className="text-muted">{t.noEvents}</p>
        </div>
      )}

      {/* Past */}
      {filteredPast.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">{t.past}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
            {filteredPast.map((event) => (
              <div key={event.id} className="glass rounded-2xl p-6">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-xs text-muted mt-2">
                  {new Date(event.event_date).toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                  {event.location && ` · ${event.location}`}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
