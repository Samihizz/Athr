"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadFeedMedia } from "@/lib/supabase/storage";

type TrackPost = {
  id: string;
  body_en: string;
  body_ar: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  media_url?: string | null;
  media_type?: string | null;
};

function TimeAgo({ date, locale }: { date: string; locale: string }) {
  const isAr = locale === "ar";
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let text: string;
  if (mins < 1) text = isAr ? "لسه" : "Just now";
  else if (mins < 60) text = isAr ? `قبل ${mins} دقيقة` : `${mins}m ago`;
  else if (hrs < 24) text = isAr ? `قبل ${hrs} ساعة` : `${hrs}h ago`;
  else if (days === 1) text = isAr ? "أمس" : "Yesterday";
  else if (days < 7) text = isAr ? `قبل ${days} يوم` : `${days}d ago`;
  else text = new Date(date).toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "short", day: "numeric" });

  return <span className="text-xs text-muted" suppressHydrationWarning>{text}</span>;
}

export default function TrackFeed({
  trackId,
  trackName,
  locale,
  userId,
  userName,
  userAvatar,
  initialPosts,
}: {
  trackId: string;
  trackName: string;
  locale: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  initialPosts: TrackPost[];
}) {
  const isAr = locale === "ar";
  const [posts, setPosts] = useState(initialPosts);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePost() {
    if (!body.trim() || posting) return;
    setPosting(true);

    try {
      const supabase = createClient();

      let media_url = null;
      let media_type = null;
      if (mediaFile) {
        media_url = await uploadFeedMedia(userId, mediaFile);
        media_type = mediaFile.type.startsWith("video") ? "video" : "image";
      }

      const { data, error } = await supabase
        .from("content_posts")
        .insert({
          body_en: body,
          body_ar: body,
          title_en: "",
          title_ar: "",
          track: trackId,
          author_id: userId,
          author_name: userName,
          author_avatar: userAvatar || null,
          is_published: true,
          category: "discussion",
          media_url,
          media_type,
        })
        .select()
        .single();

      if (!error && data) {
        setPosts((prev) => [
          {
            id: data.id,
            body_en: data.body_en,
            body_ar: data.body_ar,
            author_name: userName,
            author_avatar: userAvatar,
            created_at: data.created_at,
            media_url: data.media_url,
            media_type: data.media_type,
          },
          ...prev,
        ]);
        setBody("");
        setMediaFile(null);
        setMediaPreview(null);
      }
    } finally {
      setPosting(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      {/* Composer */}
      <div className="glass-strong rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          {userAvatar ? (
            <Image src={userAvatar} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold/40 to-gold/20 flex items-center justify-center text-sm font-bold text-gold shrink-0">
              {userName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={isAr ? `شارك شي مع مجتمع ${trackName}...` : `Share something with ${trackName}...`}
              className="w-full bg-transparent border-none outline-none text-sm resize-none min-h-[60px] placeholder:text-muted/60"
              dir={isAr ? "rtl" : "ltr"}
            />

            {mediaPreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden">
                {mediaFile?.type.startsWith("video") ? (
                  <video src={mediaPreview} className="w-full max-h-[200px] object-cover rounded-xl" controls />
                ) : (
                  <img src={mediaPreview} alt="" className="w-full max-h-[200px] object-cover rounded-xl" />
                )}
                <button
                  onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                  className="absolute top-2 end-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center text-sm hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
            <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg text-muted hover:bg-surface hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </button>
          </div>
          <button
            onClick={handlePost}
            disabled={!body.trim() || posting}
            className="px-5 py-2 rounded-xl text-sm font-medium gradient-gold text-background disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/20 transition-all"
          >
            {posting ? (isAr ? "جاري النشر..." : "Posting...") : (isAr ? "أنشر" : "Post")}
          </button>
        </div>
      </div>

      {/* Posts list */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => {
            const postBody = isAr ? (post.body_ar || post.body_en) : (post.body_en || post.body_ar);
            return (
              <article key={post.id} className="glass-strong rounded-2xl overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center gap-3">
                    {post.author_avatar ? (
                      <Image src={post.author_avatar} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gold/40 to-gold/20 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                        {post.author_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{post.author_name}</p>
                      <TimeAgo date={post.created_at} locale={locale} />
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <p className="text-sm leading-relaxed whitespace-pre-line" dir={isAr ? "rtl" : "ltr"}>{postBody}</p>
                </div>
                {post.media_url && (
                  <div className="border-t border-border">
                    {post.media_type === "video" ? (
                      <video src={post.media_url} controls className="w-full max-h-[400px] object-contain bg-black" />
                    ) : (
                      <Image src={post.media_url} alt="" width={800} height={400} className="w-full max-h-[400px] object-cover" />
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-muted text-sm">{isAr ? "كن أول من ينشر في المسار ده!" : "Be the first to post in this track!"}</p>
        </div>
      )}
    </div>
  );
}
