"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import PostComposer from "./PostComposer";

type Post = {
  id: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  category: string;
  track: string | null;
  is_pinned: boolean;
  external_url: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  reaction_count?: number;
  user_reacted?: boolean;
};

/* ── Relative time ── */
function TimeAgo({ date, locale }: { date: string; locale: string }) {
  const isAr = locale === "ar";
  const [text, setText] = useState("");

  const compute = useCallback(() => {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return isAr ? "لسه" : "Just now";
    if (mins < 60) return isAr ? `قبل ${mins} دقيقة` : `${mins}m ago`;
    if (hrs < 24) return isAr ? `قبل ${hrs} ساعة` : `${hrs}h ago`;
    if (days === 1) return isAr ? "أمس" : "Yesterday";
    if (days < 7) return isAr ? `قبل ${days} يوم` : `${days}d ago`;
    return new Date(date).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [date, isAr]);

  useEffect(() => {
    setText(compute());
    const id = setInterval(() => setText(compute()), 60000);
    return () => clearInterval(id);
  }, [compute]);

  return (
    <span className="text-xs text-muted" suppressHydrationWarning>
      {text}
    </span>
  );
}

/* ── Reaction Button ── */
function ReactionButton({
  postId,
  userId,
  initialCount,
  initialReacted,
  locale,
}: {
  postId: string;
  userId?: string;
  initialCount: number;
  initialReacted: boolean;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [reacted, setReacted] = useState(initialReacted);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  async function toggle() {
    if (!userId) return;
    const supabase = createClient();

    if (reacted) {
      setReacted(false);
      setCount((c) => Math.max(0, c - 1));
      await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
    } else {
      setReacted(true);
      setCount((c) => c + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
      await supabase
        .from("post_reactions")
        .insert({ post_id: postId, user_id: userId, reaction: "like" });
    }
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        reacted
          ? "text-red-400 hover:bg-red-400/10"
          : "text-muted hover:bg-surface hover:text-foreground"
      }`}
    >
      <span className={`text-lg ${animating ? "heart-pop" : ""}`}>
        {reacted ? "❤️" : "🤍"}
      </span>
      <span className="font-medium">
        {count > 0 ? count : ""}{" "}
        {isAr ? "عجبني" : "Like"}
      </span>
    </button>
  );
}

/* ── Main Feed ── */
export default function ContentFeed({
  posts: initialPosts,
  locale,
  tracks,
  userId,
  userName,
  userAvatar,
}: {
  posts: Post[];
  locale: string;
  tracks: { id: string; name: string }[];
  userId?: string;
  userName?: string;
  userAvatar?: string;
}) {
  const isAr = locale === "ar";
  const [posts, setPosts] = useState(initialPosts);
  const [trackFilter, setTrackFilter] = useState("all");
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const BODY_LIMIT = 300;

  const t = {
    all: isAr ? "الكل" : "All",
    pinned: isAr ? "مثبّت" : "Pinned",
    readMore: isAr ? "اقرأ المزيد" : "Read more",
    share: isAr ? "شارك" : "Share",
    noPosts: isAr ? "لا يوجد محتوى بعد" : "No posts yet",
    beFirst: isAr ? "كن أول من ينشر!" : "Be the first to share something!",
  };

  const filtered = posts.filter((p) => {
    if (trackFilter !== "all" && p.track !== trackFilter) return false;
    return true;
  });

  function handlePostCreated(newPost: Post) {
    setPosts((prev) => [newPost, ...prev]);
  }

  function toggleExpand(id: string) {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function sharePost(post: Post) {
    const body = isAr ? post.body_ar : post.body_en;
    const text = `${body?.slice(0, 120) || ""}...\n\n${
      isAr ? "عبر منصة أثر" : "Via Athr Platform"
    }`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function getTrackName(trackId: string | null) {
    if (!trackId) return null;
    return tracks.find((t) => t.id === trackId)?.name || null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Post Composer */}
      {userId && userName && (
        <PostComposer
          locale={locale}
          userId={userId}
          userName={userName}
          userAvatar={userAvatar}
          tracks={tracks}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTrackFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            trackFilter === "all"
              ? "gradient-gold text-background"
              : "bg-surface border border-border text-muted hover:border-border-strong hover:text-foreground"
          }`}
        >
          {t.all}
        </button>
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => setTrackFilter(track.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              trackFilter === track.id
                ? "gradient-gold text-background"
                : "bg-surface border border-border text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            {track.name}
          </button>
        ))}
      </div>

      {/* Posts stream */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((post) => {
            const body = isAr ? post.body_ar : post.body_en;
            const isLong = body && body.length > BODY_LIMIT;
            const isExpanded = expandedPosts.has(post.id);
            const displayBody =
              isLong && !isExpanded
                ? body.slice(0, BODY_LIMIT) + "..."
                : body;
            const trackName = getTrackName(post.track);

            return (
              <article
                key={post.id}
                className={`glass-strong rounded-2xl overflow-hidden ${
                  post.is_pinned ? "ring-1 ring-gold/20" : ""
                }`}
              >
                {/* Header: avatar + name + time */}
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-start gap-3">
                    {post.author_avatar ? (
                      <Image
                        src={post.author_avatar}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold/40 to-gold/20 flex items-center justify-center text-sm font-bold text-gold flex-shrink-0">
                        {post.author_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">
                          {post.author_name || (isAr ? "مجهول" : "Anonymous")}
                        </span>
                        {trackName && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary-light font-medium whitespace-nowrap">
                            {trackName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <TimeAgo date={post.created_at} locale={locale} />
                        {post.is_pinned && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-medium">
                            {t.pinned}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-4 pb-3">
                  <p
                    className="text-sm leading-relaxed whitespace-pre-line text-foreground/90"
                    dir={isAr ? "rtl" : "ltr"}
                  >
                    {displayBody}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="text-sm font-medium text-gold hover:text-gold-light transition-colors mt-1"
                    >
                      {isExpanded
                        ? isAr
                          ? "أقل"
                          : "Show less"
                        : t.readMore}
                    </button>
                  )}
                </div>

                {/* Media */}
                {post.media_url && (
                  <div className="border-t border-b border-border">
                    {post.media_type === "video" ? (
                      <video
                        src={post.media_url}
                        controls
                        className="w-full max-h-[500px] object-contain bg-black"
                      />
                    ) : (
                      <Image
                        src={post.media_url}
                        alt=""
                        width={800}
                        height={500}
                        className="w-full max-h-[500px] object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Reaction count summary */}
                {(post.reaction_count ?? 0) > 0 && (
                  <div className="px-4 py-2 flex items-center gap-1.5 text-xs text-muted">
                    <span className="text-sm">❤️</span>
                    <span>{post.reaction_count}</span>
                  </div>
                )}

                {/* Actions bar */}
                <div className="px-2 py-1 border-t border-border flex items-center">
                  <ReactionButton
                    postId={post.id}
                    userId={userId}
                    initialCount={post.reaction_count ?? 0}
                    initialReacted={post.user_reacted ?? false}
                    locale={locale}
                  />

                  <button
                    onClick={() => sharePost(post)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-surface hover:text-foreground transition-colors ms-auto"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                      />
                    </svg>
                    {t.share}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">✍️</p>
          <p className="text-muted text-sm">{t.noPosts}</p>
          <p className="text-muted/60 text-xs mt-1">{t.beFirst}</p>
        </div>
      )}
    </div>
  );
}
