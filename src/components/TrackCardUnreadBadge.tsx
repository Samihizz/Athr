"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  trackId: string;
};

export default function TrackCardUnreadBadge({ trackId }: Props) {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const lastVisit = localStorage.getItem(`track-chat-visit-${trackId}`);
        if (!lastVisit) {
          // Never visited — check if any messages exist
          const supabase = createClient();
          const { count } = await supabase
            .from("track_messages")
            .select("id", { count: "exact", head: true })
            .eq("track_id", trackId);
          if (count && count > 0) setHasUnread(true);
          return;
        }

        const supabase = createClient();
        const { count } = await supabase
          .from("track_messages")
          .select("id", { count: "exact", head: true })
          .eq("track_id", trackId)
          .gt("created_at", lastVisit);

        if (count && count > 0) setHasUnread(true);
      } catch {
        // Ignore errors
      }
    }

    check();
  }, [trackId]);

  if (!hasUnread) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-gold" />
    </span>
  );
}
