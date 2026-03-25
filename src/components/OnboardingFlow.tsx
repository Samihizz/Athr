"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadAvatar } from "@/lib/supabase/storage";
import { tracks } from "@/lib/tracks";
import TrackIcon from "@/components/TrackIcon";

const cities = [
  "Dammam", "Khobar", "Dhahran", "Jubail", "Qatif",
  "Ras Tanura", "Safwa", "Tarut", "Saihat", "Al Ahsa",
];

interface OnboardingFlowProps {
  locale: string;
  userId: string;
  profileComplete: boolean;
  hasBio: boolean;
  hasExpertise: boolean;
  initialName: string;
  initialAvatarUrl: string;
}

export default function OnboardingFlow({
  locale,
  userId,
  profileComplete,
  hasBio,
  hasExpertise,
  initialName,
  initialAvatarUrl,
}: OnboardingFlowProps) {
  const router = useRouter();
  const isAr = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Form state
  const [fullName, setFullName] = useState(initialName);
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [expertise, setExpertise] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Don't show if profile is already complete or if user dismissed
    const dismissed = localStorage.getItem(`onboarding_done_${userId}`);
    if (profileComplete || (hasBio && hasExpertise) || dismissed) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [profileComplete, hasBio, hasExpertise, userId]);

  function goToStep(next: number) {
    setDirection(next > step ? "forward" : "back");
    setTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setTransitioning(false);
    }, 250);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(isAr ? "حجم الصورة يجب أن يكون أقل من 2 ميجا" : "Image must be less than 2MB");
      return;
    }
    setAvatarUploading(true);
    setError("");
    const url = await uploadAvatar(userId, file);
    if (url) {
      setAvatarUrl(url);
      const supabase = createClient();
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    } else {
      setError(isAr ? "فشل رفع الصورة" : "Failed to upload photo");
    }
    setAvatarUploading(false);
  }

  async function handleSaveProfile() {
    setSaving(true);
    setError("");
    const supabase = createClient();
    const updateData: Record<string, unknown> = {
      profile_complete: true,
    };
    if (fullName) updateData.full_name = fullName;
    if (bio) updateData.bio = bio;
    if (city) updateData.city = city;
    if (expertise) updateData.expertise = expertise;

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (updateError) {
      setError(isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.");
      setSaving(false);
      return;
    }
    setSaving(false);
    goToStep(2);
  }

  function handleSkipProfile() {
    goToStep(2);
  }

  function handleFinish() {
    localStorage.setItem(`onboarding_done_${userId}`, "true");
    setVisible(false);
    router.refresh();
  }

  if (!visible) return null;

  const selectedTrack = tracks.find((t) => t.id === expertise);

  const t = {
    welcomeTitle: isAr ? "حبابك في أثر" : "Welcome to Athr",
    welcomePoem: isAr
      ? "مرحب يا اخويا في خشم الباب..\nمرحب و حبابك..\nرتبنا البيت..\nهنا قعدة كيف..\nو هنا بِركة نور..\nو مع أجمل جار ح نهِدّ السور\nشان تعرف ريح.. موسيقى اللوز\nو نغني نشيد البن و الشاي..\nلحن العصفور.."
      : "",
    welcomeDesc1: isAr
      ? ""
      : "The Eastern Province's professional community for Sudanese talent",
    bullet1: isAr
      ? "تواصل مع شفاتة في مجالك وتبادلوا الخبرات"
      : "Connect with professionals in your field and share expertise",
    bullet2: isAr
      ? "احضر برامج وفعاليات حصرية للمجتمع"
      : "Attend exclusive community events and programs",
    bullet3: isAr
      ? "طوّر مهاراتك من خلال محتوى ومسارات تعليمية"
      : "Grow your skills with curated content and learning tracks",
    getStarted: isAr ? "يلا نبدأ" : "Let's Get Started",
    profileTitle: isAr ? "كمّل ملفك" : "Complete Your Profile",
    profileSubtitle: isAr ? "قول لينا عن نفسك" : "Tell us about yourself",
    fullName: isAr ? "الاسم الكامل" : "Full Name",
    bio: isAr ? "نبذة عنك" : "Bio",
    bioPlaceholder: isAr ? "أخبرنا عن نفسك..." : "Tell us about yourself...",
    city: isAr ? "المدينة" : "City",
    selectCity: isAr ? "اختر مدينتك" : "Select your city",
    selectTrack: isAr ? "اختر مسارك" : "Select your track",
    uploadPhoto: isAr ? "رفع صورة" : "Upload Photo",
    changePhoto: isAr ? "تغيير الصورة" : "Change Photo",
    next: isAr ? "التالي" : "Next",
    skip: isAr ? "بعدين" : "Skip for now",
    doneTitle: isAr ? "حبابك في الضل!" : "You're All Set!",
    doneSubtitle: isAr
      ? "أنت الحين جزء من مجتمع أثر"
      : "You're now part of the Athr community",
    exploreMembers: isAr ? "شوف الشفاتة" : "Explore Members",
    browseEvents: isAr ? "شوف البرامج" : "Browse Events",
    readContent: isAr ? "طالع الشمارات" : "Read Content",
    goToDashboard: isAr ? "خش محل الشغل" : "Go to Dashboard",
    yourTrack: isAr ? "مسارك" : "Your Track",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

      {/* Card */}
      <div
        className="relative w-full max-w-lg glass-strong rounded-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full bg-border">
          <div
            className="h-full gradient-gold transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 pt-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-gold"
                  : i < step
                    ? "w-2 bg-gold/50"
                    : "w-2 bg-border-strong"
              }`}
            />
          ))}
        </div>

        {/* Content area with transitions */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 40px)" }}>
          <div
            className={`transition-all duration-250 ease-out ${
              transitioning
                ? direction === "forward"
                  ? "opacity-0 translate-x-4"
                  : "opacity-0 -translate-x-4"
                : "opacity-100 translate-x-0"
            }`}
          >
            {/* ── Step 0: Welcome ── */}
            {step === 0 && (
              <div className="p-8 text-center">
                <div className="mb-6">
                  <Image
                    src="/6.svg"
                    alt="Athr"
                    width={120}
                    height={40}
                    className="mx-auto mb-4 h-10 w-auto"
                  />
                  <h2 className="text-2xl font-bold text-gradient-gold">
                    {t.welcomeTitle}
                  </h2>
                  {isAr && t.welcomePoem ? (
                    <div className="mt-4 glass rounded-xl p-5" dir="rtl">
                      <p className="text-sm leading-loose text-foreground whitespace-pre-line font-medium">
                        {t.welcomePoem}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted mt-2">{t.welcomeDesc1}</p>
                      <div className="space-y-3 text-start mt-6 mb-2">
                        {[t.bullet1, t.bullet2, t.bullet3].map((text, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 glass rounded-xl p-3"
                          >
                            <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-background">
                              {i + 1}
                            </span>
                            <p className="text-sm">{text}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => goToStep(1)}
                  className="w-full btn-primary mt-4"
                >
                  {t.getStarted}
                </button>
              </div>
            )}

            {/* ── Step 1: Profile ── */}
            {step === 1 && (
              <div className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">{t.profileTitle}</h2>
                  <p className="text-sm text-muted mt-1">{t.profileSubtitle}</p>
                </div>

                {/* Avatar */}
                <div className="flex justify-center mb-5">
                  <div className="relative group">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={fullName || "Avatar"}
                        width={72}
                        height={72}
                        className="h-18 w-18 rounded-2xl object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="h-18 w-18 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-2xl font-bold text-foreground border-2 border-border">
                        {fullName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute inset-0 rounded-2xl bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <span className="text-[10px] font-medium text-foreground">
                        {avatarUploading
                          ? "..."
                          : avatarUrl
                            ? t.changePhoto
                            : t.uploadPhoto}
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Full name */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary-light transition-colors"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t.bio}
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary-light transition-colors resize-none"
                      placeholder={t.bioPlaceholder}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t.city}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary-light transition-colors"
                    >
                      <option value="">{t.selectCity}</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Track selection cards */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.selectTrack}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {tracks.map((track) => (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => setExpertise(track.id)}
                          className={`relative rounded-xl p-3 text-start transition-all duration-200 border ${
                            expertise === track.id
                              ? "border-gold bg-gold/10 glow-gold"
                              : "border-border glass hover:border-border-strong hover:bg-surface-hover"
                          }`}
                        >
                          <TrackIcon trackId={track.id} size={24} className="mb-1.5" />
                          <div className="text-xs font-medium leading-tight">
                            {isAr ? track.ar.name : track.en.name}
                          </div>
                          {expertise === track.id && (
                            <div className="absolute top-2 end-2 h-4 w-4 rounded-full gradient-gold flex items-center justify-center">
                              <svg
                                className="w-2.5 h-2.5 text-background"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400 text-center mt-3">
                    {error}
                  </p>
                )}

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {saving ? "..." : t.next}
                  </button>
                  <button
                    onClick={handleSkipProfile}
                    className="w-full py-3 rounded-xl text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {t.skip}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Done ── */}
            {step === 2 && (
              <div className="p-8 text-center relative overflow-hidden">
                {/* Confetti animation */}
                <div className="onboarding-confetti" aria-hidden="true">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span key={i} className="confetti-piece" />
                  ))}
                </div>

                <div className="mb-6 relative z-10">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full gradient-gold mb-4 animate-pulse-glow">
                    <svg
                      className="w-8 h-8 text-background"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gradient-gold">
                    {t.doneTitle}
                  </h2>
                  <p className="text-sm text-muted mt-2">{t.doneSubtitle}</p>
                </div>

                {/* Selected track */}
                {selectedTrack && (
                  <Link
                    href={`/${locale}/tracks/${selectedTrack.id}`}
                    className="inline-flex items-center gap-2 glass rounded-xl px-4 py-2.5 mb-6 border border-gold/30 hover:bg-surface-hover transition-colors"
                  >
                    <TrackIcon trackId={selectedTrack.id} size={20} />
                    <span className="text-sm font-medium">
                      {t.yourTrack}:{" "}
                      {isAr ? selectedTrack.ar.name : selectedTrack.en.name}
                    </span>
                  </Link>
                )}

                {/* Action cards */}
                <div className="space-y-2.5 mb-6 relative z-10">
                  {[
                    {
                      href: `/${locale}/community`,
                      label: t.exploreMembers,
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      ),
                    },
                    {
                      href: `/${locale}/events`,
                      label: t.browseEvents,
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      ),
                    },
                    {
                      href: `/${locale}/feed`,
                      label: t.readContent,
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
                        </svg>
                      ),
                    },
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center gap-3 glass rounded-xl p-3.5 hover:bg-surface-hover transition-colors text-start"
                    >
                      <div className="shrink-0 h-9 w-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
                        {action.icon}
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                      <svg
                        className={`w-4 h-4 text-muted ms-auto ${isAr ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full btn-primary relative z-10"
                >
                  {t.goToDashboard}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
