"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getReferralLink } from "@/lib/referral";
import { MAX_MEMBERS } from "@/lib/constants";

interface ReferralCardProps {
  locale: string;
  userId: string;
  referralCode: string | null;
  referralCount: number;
  memberCount: number;
}

interface LeaderboardEntry {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  referral_count: number;
}

export default function ReferralCard({
  locale,
  userId,
  referralCode,
  referralCount: initialCount,
  memberCount,
}: ReferralCardProps) {
  const isAr = locale === "ar";
  const [copied, setCopied] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralCount, setReferralCount] = useState(initialCount);

  const isFull = memberCount >= MAX_MEMBERS;
  const link = referralCode ? getReferralLink(referralCode) : "";
  const whatsappMessage = encodeURIComponent(
    `انضم لأثر — ملتقى المحترفين في الشرقية! ${link}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  const t = {
    title: isAr ? "ادعُ صديقاً" : "Invite Friends",
    yourLink: isAr ? "رابط دعوتك" : "Your referral link",
    copyLink: isAr ? "انسخ الرابط" : "Copy Link",
    copied: isAr ? "تم النسخ!" : "Copied!",
    shareWhatsApp: isAr ? "شارك في الواتساب" : "Share on WhatsApp",
    inviteCount: isAr
      ? `دعوت ${referralCount} صديق`
      : `You've invited ${referralCount} friend${referralCount !== 1 ? "s" : ""}`,
    topReferrers: isAr ? "أكثر الأعضاء دعوةً" : "Top Referrers",
    communityCapacity: isAr ? "سعة الملتقى" : "Community Capacity",
    communityFull: isAr ? "الملتقى امتلأ!" : "Community is full!",
    noCode: isAr ? "جاري إنشاء رابط الدعوة..." : "Generating your referral link...",
  };

  useEffect(() => {
    async function fetchLeaderboard() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, referral_count")
        .gt("referral_count", 0)
        .order("referral_count", { ascending: false })
        .limit(5);

      if (data) {
        setLeaderboard(data as LeaderboardEntry[]);
        // Update own count from fresh data
        const me = data.find((p) => p.id === userId);
        if (me) setReferralCount(me.referral_count);
      }
    }
    fetchLeaderboard();
  }, [userId]);

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const progressPercent = Math.min((memberCount / MAX_MEMBERS) * 100, 100);

  return (
    <div className="glass-strong rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="shrink-0 h-10 w-10 rounded-xl gradient-gold flex items-center justify-center">
          <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg">{t.title}</h3>
          <p className="text-xs text-muted">{t.inviteCount}</p>
        </div>
      </div>

      {/* Community full banner */}
      {isFull && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
          <p className="text-sm font-semibold text-red-400">{t.communityFull}</p>
        </div>
      )}

      {/* Referral link box */}
      {!isFull && referralCode ? (
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted">{t.yourLink}</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl bg-surface border border-border px-4 py-3 text-xs text-foreground truncate font-mono select-all" dir="ltr">
              {link}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t.copied}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  </svg>
                  {t.copyLink}
                </>
              )}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-semibold text-sm hover:bg-[#25D366]/25 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              {t.shareWhatsApp}
            </a>
          </div>
        </div>
      ) : !isFull ? (
        <div className="rounded-xl bg-surface border border-border p-4 text-center">
          <p className="text-sm text-muted">{t.noCode}</p>
        </div>
      ) : null}

      {/* Progress bar: X/500 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted">{t.communityCapacity}</span>
          <span className="text-xs font-semibold text-gold">{memberCount}/{MAX_MEMBERS}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface border border-border">
          <div
            className="h-full rounded-full gradient-gold transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">{t.topReferrers}</h4>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                  entry.id === userId
                    ? "bg-gold/10 border border-gold/20"
                    : "glass"
                }`}
              >
                {/* Rank */}
                <span className="shrink-0 w-6 text-center text-xs font-bold text-gold">
                  {index + 1}
                </span>

                {/* Avatar */}
                {entry.avatar_url ? (
                  <img
                    src={entry.avatar_url}
                    alt=""
                    className="shrink-0 h-8 w-8 rounded-lg object-cover border border-border"
                  />
                ) : (
                  <div className="shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-xs font-bold text-foreground border border-border">
                    {entry.full_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}

                {/* Name */}
                <span className="flex-1 text-sm font-medium truncate">
                  {entry.full_name || (isAr ? "مجهول" : "Anonymous")}
                </span>

                {/* Count */}
                <span className="shrink-0 text-xs font-semibold text-gold">
                  {entry.referral_count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
