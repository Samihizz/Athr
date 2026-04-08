"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ConnectButton from "@/components/ConnectButton";

type ProfileInfo = {
  id: string;
  full_name: string | null;
  city: string | null;
  expertise: string | null;
  avatar_url: string | null;
};

type Suggestion = ProfileInfo & {
  reason: "city" | "track";
};

type SuggestedConnectionsProps = {
  userId: string;
  userCity: string | null;
  userTrack: string | null;
  locale: string;
  limit?: number;
  layout?: "scroll" | "grid";
};

export default function SuggestedConnections({
  userId,
  userCity,
  userTrack,
  locale,
  limit = 6,
  layout = "scroll",
}: SuggestedConnectionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const isAr = locale === "ar";

  const t = {
    suggested: isAr ? "أعضاء مقترحون" : "Suggested Connections",
    basedOnCity: isAr ? "من مدينتك" : "Based on your city",
    basedOnTrack: isAr ? "من مسارك" : "Based on your track",
    noSuggestions: isAr ? "لا توجد اقتراحات حالياً" : "No suggestions available",
  };

  useEffect(() => {
    fetchSuggestions();
  }, [userId]);

  async function fetchSuggestions() {
    setLoading(true);

    // Get all existing connections (any status except declined)
    const { data: existingConns } = await supabase
      .from("connections")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .neq("status", "declined");

    const connectedIds = new Set<string>();
    connectedIds.add(userId);
    (existingConns || []).forEach((c: { requester_id: string; receiver_id: string }) => {
      connectedIds.add(c.requester_id);
      connectedIds.add(c.receiver_id);
    });

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, city, expertise, avatar_url")
      .neq("id", userId)
      .not("full_name", "is", null)
      .limit(100);

    if (!profiles) {
      setLoading(false);
      return;
    }

    // Filter out already connected
    const available = profiles.filter(
      (p: ProfileInfo) => !connectedIds.has(p.id)
    );

    // Score by match
    const scored: Suggestion[] = [];

    for (const p of available) {
      if (userCity && p.city === userCity) {
        scored.push({ ...p, reason: "city" });
      } else if (userTrack && p.expertise === userTrack) {
        scored.push({ ...p, reason: "track" });
      }
    }

    // If not enough matches, add random others
    if (scored.length < limit) {
      const scoredIds = new Set(scored.map((s) => s.id));
      const remaining = available
        .filter((p: ProfileInfo) => !scoredIds.has(p.id))
        .slice(0, limit - scored.length)
        .map((p: ProfileInfo): Suggestion => ({ ...p, reason: userCity ? "city" : "track" }));
      scored.push(...remaining);
    }

    setSuggestions(scored.slice(0, limit));
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-xl p-4 min-w-[200px] animate-pulse">
            <div className="h-10 w-10 rounded-full bg-surface mx-auto mb-3" />
            <div className="h-4 w-24 bg-surface rounded mx-auto mb-2" />
            <div className="h-3 w-16 bg-surface rounded mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-sm text-muted">{t.noSuggestions}</p>
      </div>
    );
  }

  const containerClass =
    layout === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      : "flex gap-4 overflow-x-auto pb-2 -mx-1 px-1";

  const cardClass =
    layout === "grid"
      ? "glass rounded-xl p-4 text-center hover:bg-surface-hover transition-colors"
      : "glass rounded-xl p-4 min-w-[200px] max-w-[220px] shrink-0 text-center hover:bg-surface-hover transition-colors";

  return (
    <div className={containerClass}>
      {suggestions.map((person) => (
        <div
          key={person.id}
          className={cardClass}
        >
          <Link href={`/${locale}/members/${person.id}`}>
            <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light mx-auto mb-2">
              {person.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <h4 className="font-semibold text-sm truncate hover:text-gold transition-colors">
              {person.full_name || (isAr ? "عضو" : "Member")}
            </h4>
          </Link>

          {/* Reason badge */}
          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold mt-1">
            {person.reason === "city" ? t.basedOnCity : t.basedOnTrack}
          </span>

          <div className="text-xs text-muted mt-1 truncate">
            {person.city && <span>{person.city}</span>}
          </div>

          {person.expertise && (
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light mt-1">
              {person.expertise}
            </span>
          )}

          <div className="mt-3">
            <ConnectButton
              currentUserId={userId}
              targetUserId={person.id}
              locale={locale}
              compact
            />
          </div>
        </div>
      ))}
    </div>
  );
}
