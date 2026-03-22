"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadFeedMedia } from "@/lib/supabase/storage";

export default function PostComposer({
  locale,
  userId,
  userName,
  userAvatar,
  tracks,
  onPostCreated,
}: {
  locale: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  tracks: { id: string; name: string }[];
  onPostCreated: (post: any) => void;
}) {
  const isAr = locale === "ar";
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const [track, setTrack] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = {
    placeholder: isAr ? "قول الفي بالك..." : "What's on your mind?",
    post: isAr ? "انشر" : "Post",
    photo: isAr ? "صورة / فيديو" : "Photo / Video",
    selectTrack: isAr ? "المسار" : "Track",
  };

  const autoGrow = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

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

  async function handleSubmit() {
    if (!body.trim()) return;
    setPosting(true);

    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (mediaFile) {
      mediaUrl = await uploadFeedMedia(userId, mediaFile);
      mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
    }

    const autoTitle = body.trim().slice(0, 50);
    const supabase = createClient();

    const postData = {
      title_en: autoTitle,
      title_ar: autoTitle,
      body_en: isAr ? "" : body,
      body_ar: isAr ? body : "",
      category: "community",
      track: track || null,
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
      onPostCreated({
        ...data,
        author_name: userName,
        author_avatar: userAvatar,
        reaction_count: 0,
        user_reacted: false,
      });
      setBody("");
      setTrack("");
      removeMedia();
      setExpanded(false);
    }

    setPosting(false);
  }

  return (
    <div className="glass-strong rounded-2xl p-4 mb-6">
      {/* Collapsed state */}
      <div className="flex items-center gap-3">
        {userAvatar ? (
          <Image
            src={userAvatar}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover border-2 border-border"
          />
        ) : (
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gold/40 to-gold/20 flex items-center justify-center text-sm font-bold text-gold">
            {userName?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}

        {!expanded ? (
          <button
            onClick={() => {
              setExpanded(true);
              setTimeout(() => textareaRef.current?.focus(), 50);
            }}
            className="flex-1 text-start px-4 py-3 rounded-full bg-surface border border-border text-sm text-muted hover:bg-surface-hover transition-colors"
          >
            {t.placeholder}
          </button>
        ) : (
          <span className="text-sm font-medium">{userName}</span>
        )}
      </div>

      {/* Expanded composer */}
      {expanded && (
        <div className="mt-3 space-y-3">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              autoGrow(e.target);
            }}
            rows={3}
            autoFocus
            className="w-full bg-transparent text-foreground text-sm leading-relaxed placeholder:text-muted focus:outline-none resize-none min-h-[80px]"
            placeholder={t.placeholder}
            dir={isAr ? "rtl" : "ltr"}
          />

          {/* Media preview */}
          {mediaPreview && (
            <div className="relative">
              {mediaFile?.type.startsWith("video/") ? (
                <video
                  src={mediaPreview}
                  className="w-full max-h-64 rounded-xl object-cover"
                  controls
                />
              ) : (
                <Image
                  src={mediaPreview}
                  alt="Preview"
                  width={600}
                  height={400}
                  className="w-full max-h-64 rounded-xl object-cover"
                />
              )}
              <button
                onClick={removeMedia}
                className="absolute top-2 end-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm text-foreground flex items-center justify-center text-sm hover:bg-background transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Action bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:bg-surface hover:text-foreground transition-colors"
              >
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                  />
                </svg>
                {t.photo}
              </button>

              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs bg-transparent border-none text-muted focus:outline-none cursor-pointer hover:text-foreground transition-colors"
              >
                <option value="">{t.selectTrack}</option>
                {tracks.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {tr.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!body.trim() || posting}
              className="px-6 py-2 rounded-lg text-sm font-semibold gradient-gold text-background disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {posting ? "..." : t.post}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
