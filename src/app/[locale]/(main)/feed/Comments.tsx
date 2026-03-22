"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  body: string;
  created_at: string;
};

/* ── Relative time for comments ── */
function CommentTimeAgo({ date, locale }: { date: string; locale: string }) {
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
    <span className="text-[10px] text-muted" suppressHydrationWarning>
      {text}
    </span>
  );
}

export default function Comments({
  postId,
  locale,
  userId,
  userName,
  userAvatar,
  initialCount,
  onCountChange,
}: {
  postId: string;
  locale: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  initialCount: number;
  onCountChange?: (postId: string, delta: number) => void;
}) {
  const isAr = locale === "ar";
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [count, setCount] = useState(initialCount);

  const t = {
    comments: isAr ? "التعليقات" : "Comments",
    writeComment: isAr ? "اكتب تعليق" : "Write a comment",
    noComments: isAr ? "ما في تعليقات لسه" : "No comments yet",
    delete: isAr ? "احذف" : "Delete",
  };

  function commentLabel(n: number) {
    if (n === 0) return isAr ? "تعليق" : "Comment";
    return isAr ? `${n} تعليق` : `${n} comments`;
  }

  async function loadComments() {
    if (loaded) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    setComments(data || []);
    setLoaded(true);
    setLoading(false);
  }

  function handleToggle() {
    if (!expanded) {
      loadComments();
    }
    setExpanded((prev) => !prev);
  }

  async function handleSubmit() {
    if (!body.trim() || !userId || !userName) return;
    setSubmitting(true);
    const supabase = createClient();

    const commentData = {
      post_id: postId,
      user_id: userId,
      user_name: userName,
      avatar_url: userAvatar || null,
      body: body.trim(),
    };

    const { data, error } = await supabase
      .from("post_comments")
      .insert(commentData)
      .select()
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data]);
      setBody("");
      setCount((c) => c + 1);
      onCountChange?.(postId, 1);
    }

    setSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    const confirmed = confirm(isAr ? "متأكد؟" : "Are you sure?");
    if (!confirmed) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCount((c) => Math.max(0, c - 1));
      onCountChange?.(postId, -1);
    }
  }

  return (
    <div>
      {/* Comment count toggle button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-surface hover:text-foreground transition-colors"
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
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
          />
        </svg>
        <span className="font-medium">{commentLabel(count)}</span>
      </button>

      {/* Expanded comments section */}
      {expanded && (
        <div className="px-4 pb-4 pt-1">
          <div className="border-t border-border pt-3">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted text-center py-3">
                {t.noComments}
              </p>
            ) : (
              <div className="space-y-3 mb-3 max-h-80 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2 group">
                    {/* Avatar */}
                    {comment.avatar_url ? (
                      <Image
                        src={comment.avatar_url}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold/30 to-gold/15 flex items-center justify-center text-[10px] font-bold text-gold flex-shrink-0">
                        {comment.user_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}

                    {/* Comment bubble */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-surface rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate">
                            {comment.user_name}
                          </span>
                          <CommentTimeAgo
                            date={comment.created_at}
                            locale={locale}
                          />
                          {/* Delete button — own comment only */}
                          {userId === comment.user_id && (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="opacity-0 group-hover:opacity-100 ms-auto text-[10px] text-red-400/70 hover:text-red-400 transition-all"
                              title={t.delete}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <p
                          className="text-xs text-foreground/85 mt-0.5 whitespace-pre-line"
                          dir={isAr ? "rtl" : "ltr"}
                        >
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment input */}
            {userId && userName && (
              <div className="flex items-center gap-2 mt-2">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gold/30 to-gold/15 flex items-center justify-center text-[10px] font-bold text-gold flex-shrink-0">
                    {userName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5">
                  <input
                    type="text"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder={t.writeComment}
                    dir={isAr ? "rtl" : "ltr"}
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted focus:outline-none"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!body.trim() || submitting}
                    className="text-gold hover:text-gold-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
