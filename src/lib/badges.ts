import { SupabaseClient } from "@supabase/supabase-js";

export interface Badge {
  id: string;
  emoji: string;
  label_ar: string;
  label_en: string;
  type: "positive" | "neutral" | "funny";
}

const BADGE_DEFINITIONS: Badge[] = [
  {
    id: "inactive_7d",
    emoji: "\u{1F440}",
    label_ar: "\u0628\u0642\u064A\u062A \u0645\u0627 \u0628\u062A\u062C\u064A\u0646\u0627",
    label_en: "Where you been?",
    type: "funny",
  },
  {
    id: "prolific_poster",
    emoji: "\u{1F525}",
    label_ar: "\u0643\u062A\u0631\u062A \u0627\u0644\u0645\u062D\u0644\u0628\u064A\u0629",
    label_en: "Too much!",
    type: "positive",
  },
  {
    id: "couch_potato",
    emoji: "\u{1F6CB}\uFE0F",
    label_ar: "\u0642\u0627\u0639\u062F \u0643\u0646\u0628",
    label_en: "Couch potato",
    type: "funny",
  },
  {
    id: "track_lion",
    emoji: "\u{1F981}",
    label_ar: "\u0623\u0634\u0641\u062A \u0634\u0641\u062A",
    label_en: "Track lion",
    type: "positive",
  },
  {
    id: "networker",
    emoji: "\u{1F91D}",
    label_ar: "\u0644\u0639\u0651\u0627\u0628",
    label_en: "Networker",
    type: "positive",
  },
];

export async function getUserBadges(
  userId: string,
  supabase: SupabaseClient
): Promise<Badge[]> {
  const badges: Badge[] = [];
  const now = new Date();

  // --- 1. Check last login / activity (inactive_7d) ---
  const { data: profile } = await supabase
    .from("profiles")
    .select("updated_at, expertise")
    .eq("id", userId)
    .single();

  const lastActive = profile?.updated_at ? new Date(profile.updated_at) : null;
  const daysSinceActive = lastActive
    ? (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    : null;

  if (daysSinceActive !== null && daysSinceActive >= 7) {
    badges.push(BADGE_DEFINITIONS.find((b) => b.id === "inactive_7d")!);
  }

  // --- 2. Prolific poster: 5+ posts this week ---
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { count: postsThisWeek } = await supabase
    .from("content_posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", weekAgo.toISOString());

  if (postsThisWeek !== null && postsThisWeek >= 5) {
    badges.push(BADGE_DEFINITIONS.find((b) => b.id === "prolific_poster")!);
  }

  // --- 3. Couch potato: no posts in 2+ weeks ---
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const { count: recentPosts } = await supabase
    .from("content_posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", twoWeeksAgo.toISOString());

  if (recentPosts !== null && recentPosts === 0) {
    badges.push(BADGE_DEFINITIONS.find((b) => b.id === "couch_potato")!);
  }

  // --- 4. Track lion: most active in their track this month ---
  if (profile?.expertise) {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Get all posts in this track this month with author info
    const { data: trackPosts } = await supabase
      .from("content_posts")
      .select("author_id")
      .eq("track", profile.expertise)
      .gte("created_at", monthAgo.toISOString());

    if (trackPosts && trackPosts.length > 0) {
      // Count posts per author
      const authorCounts: Record<string, number> = {};
      for (const post of trackPosts) {
        authorCounts[post.author_id] = (authorCounts[post.author_id] || 0) + 1;
      }

      // Find the top author
      let topAuthor = "";
      let topCount = 0;
      for (const [authorId, count] of Object.entries(authorCounts)) {
        if (count > topCount) {
          topCount = count;
          topAuthor = authorId;
        }
      }

      if (topAuthor === userId && topCount >= 2) {
        badges.push(BADGE_DEFINITIONS.find((b) => b.id === "track_lion")!);
      }
    }
  }

  // --- 5. Networker: 10+ accepted connections ---
  const { count: connectionCount } = await supabase
    .from("connections")
    .select("id", { count: "exact", head: true })
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "accepted");

  if (connectionCount !== null && connectionCount >= 10) {
    badges.push(BADGE_DEFINITIONS.find((b) => b.id === "networker")!);
  }

  return badges;
}

/**
 * Check if user has been inactive for 7+ days (for welcome-back banner).
 */
export async function isUserInactive7Days(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("updated_at")
    .eq("id", userId)
    .single();

  if (!profile?.updated_at) return false;

  const lastActive = new Date(profile.updated_at);
  const daysSince =
    (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= 7;
}
