"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadFeedMedia } from "@/lib/supabase/storage";

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
};

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
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Create post state
  const [showCreate, setShowCreate] = useState(false);
  const [newBody, setNewBody] = useState("");
  const [newTrack, setNewTrack] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));

  const filtered = posts.filter((p) => {
    if (trackFilter !== "all" && p.track !== trackFilter) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    return true;
  });

  const t = {
    all: isAr ? "الكل" : "All",
    allCategories: isAr ? "جميع الفئات" : "All Categories",
    pinned: isAr ? "مثبّت" : "Pinned",
    readMore: isAr ? "اقرأ المزيد" : "Read More",
    share: isAr ? "مشاركة" : "Share",
    noPosts: isAr ? "لا يوجد محتوى" : "No content found",
    whatOnMind: isAr ? "قول الفي بالك..." : "Share something with the community...",
    post: isAr ? "نشر" : "Post",
    addPhoto: isAr ? "صورة" : "Photo",
    addVideo: isAr ? "فيديو" : "Video",
    selectTrack: isAr ? "اختر المسار" : "Select track",
  };

  function handleMediaSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert(isAr ? "الحد الأقصى 10 ميجا" : "Max file size is 10MB");
      return;
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function removeMedia() {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handlePost() {
    if (!newBody.trim() || !userId) return;
    setPosting(true);

    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (mediaFile) {
      mediaUrl = await uploadFeedMedia(userId, mediaFile);
      mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
    }

    const supabase = createClient();
    const postData = {
      title_en: newBody.slice(0, 100),
      title_ar: newBody.slice(0, 100),
      body_en: newBody,
      body_ar: newBody,
      category: "community",
      track: newTrack || null,
      author_id: userId,
      is_published: true,
      is_pinned: false,
      media_url: mediaUrl,
      media_type: mediaType,
    };

    const { data, error } = await supabase
      .from("content_posts")
      .insert(postData)
      .select()
      .single();

    if (!error && data) {
      setPosts([{ ...data, author_name: userName, author_avatar: userAvatar } as Post, ...posts]);
      setNewBody("");
      setNewTrack("");
      removeMedia();
      setShowCreate(false);
    }

    setPosting(false);
  }

  function sharePost(post: Post) {
    const title = isAr ? post.title_ar : post.title_en;
    const text = `${title}\n\n${isAr ? "عبر منصة أثر" : "Via Athr Platform"}${post.external_url ? `\n${post.external_url}` : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div>
      {/* Create Post */}
      {userId && (
        <div className="card p-5 mb-8">
          <div className="flex items-center gap-3">
            {userAvatar ? (
              <Image src={userAvatar} alt="" width={40} height={40} className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-sm font-bold">
                {userName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="flex-1 text-start px-4 py-3 rounded-xl bg-surface border border-border text-sm text-muted hover:bg-surface-hover transition-colors"
            >
              {t.whatOnMind}
            </button>
          </div>

          {showCreate && (
            <div className="mt-4 space-y-4">
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={4}
                autoFocus
                className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary-light transition-colors resize-none"
                placeholder={t.whatOnMind}
              />

              {mediaPreview && (
                <div className="relative inline-block">
                  {mediaFile?.type.startsWith("video/") ? (
                    <video src={mediaPreview} className="max-h-48 rounded-xl" controls />
                  ) : (
                    <Image src={mediaPreview} alt="Preview" width={300} height={200} className="max-h-48 w-auto rounded-xl object-cover" />
                  )}
                  <button
                    onClick={removeMedia}
                    className="absolute top-2 end-2 h-7 w-7 rounded-full bg-background/80 text-foreground flex items-center justify-center text-sm hover:bg-background transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-surface border border-border hover:bg-surface-hover transition-colors flex items-center gap-1.5"
                  >
                    🖼️ {t.addPhoto}
                  </button>
                  <select
                    value={newTrack}
                    onChange={(e) => setNewTrack(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs bg-surface border border-border text-muted focus:outline-none"
                  >
                    <option value="">{t.selectTrack}</option>
                    {tracks.map((tr) => (
                      <option key={tr.id} value={tr.id}>{tr.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handlePost}
                  disabled={!newBody.trim() || posting}
                  className="btn-primary !py-2 !px-6 !text-sm disabled:opacity-50"
                >
                  {posting ? "..." : t.post}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setTrackFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${trackFilter === "all" ? "gradient-gold text-background" : "bg-card border border-border hover:border-border-strong"}`}
        >
          {t.all}
        </button>
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => setTrackFilter(track.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${trackFilter === track.id ? "gradient-gold text-background" : "bg-card border border-border hover:border-border-strong"}`}
          >
            {track.name}
          </button>
        ))}
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs transition-colors ${categoryFilter === "all" ? "bg-primary/30 text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {t.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors capitalize ${categoryFilter === cat ? "bg-primary/30 text-foreground" : "text-muted hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Posts */}
      {filtered.length > 0 ? (
        <div className="space-y-5">
          {filtered.map((post) => {
            const title = isAr ? post.title_ar : post.title_en;
            const body = isAr ? post.body_ar : post.body_en;
            return (
              <article key={post.id} className={`card p-6 ${post.is_pinned ? "!border-gold/30" : ""}`}>
                {/* Author row */}
                {post.author_name && (
                  <div className="flex items-center gap-3 mb-4">
                    {post.author_avatar ? (
                      <Image src={post.author_avatar} alt="" width={36} height={36} className="h-9 w-9 rounded-xl object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-xs font-bold">
                        {post.author_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{post.author_name}</p>
                      <p className="text-xs text-muted">
                        {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                    {post.is_pinned && (
                      <span className="ms-auto text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-medium">
                        📌 {t.pinned}
                      </span>
                    )}
                  </div>
                )}

                {!post.author_name && post.is_pinned && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-medium mb-3 inline-block">
                    📌 {t.pinned}
                  </span>
                )}

                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted mt-2 leading-relaxed whitespace-pre-line">{body}</p>

                {/* Media */}
                {post.media_url && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-border">
                    {post.media_type === "video" ? (
                      <video src={post.media_url} controls className="w-full max-h-96 object-contain bg-black" />
                    ) : (
                      <Image src={post.media_url} alt="" width={800} height={500} className="w-full max-h-96 object-cover" />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4">
                  {!post.author_name && (
                    <span className="text-xs text-muted">
                      {new Date(post.created_at).toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  )}
                  {post.category && (
                    <span className="text-[10px] px-2.5 py-1 rounded-xl bg-surface border border-border text-muted capitalize">{post.category}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  {post.external_url && (
                    <a
                      href={post.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-sm text-gold bg-surface border border-border hover:border-gold/30 transition-colors"
                    >
                      {t.readMore} →
                    </a>
                  )}
                  <button
                    onClick={() => sharePost(post)}
                    className="px-3 py-2 rounded-xl text-sm bg-surface border border-border hover:border-border-strong transition-colors"
                  >
                    📤 {t.share}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-muted">{t.noPosts}</p>
        </div>
      )}
    </div>
  );
}
