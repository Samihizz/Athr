"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MAX_MEMBERS } from "@/lib/constants";

export default function SignupPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Capacity state
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [capacityLoading, setCapacityLoading] = useState(true);
  const [isFull, setIsFull] = useState(false);

  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const isAr = locale === "ar";

  const t = {
    signupTitle: isAr ? "انضم لأثر" : "Join Athr",
    signupSubtitle: isAr ? "أنشئ حسابك وتواصل مع ناس الشرقية" : "Create your account and connect with the community",
    fullName: isAr ? "الاسم الكامل" : "Full Name",
    email: isAr ? "البريد الإلكتروني" : "Email Address",
    password: isAr ? "كلمة المرور" : "Password",
    confirmPassword: isAr ? "تأكيد كلمة المرور" : "Confirm Password",
    signupButton: isAr ? "إنشاء حساب" : "Create Account",
    hasAccount: isAr ? "لديك حساب بالفعل؟" : "Already have an account?",
    login: isAr ? "تسجيل الدخول" : "Log In",
    agreeTerms: isAr ? "بالتسجيل، أنت توافق على الشروط وسياسة الخصوصية" : "By signing up, you agree to our Terms and Privacy Policy",
    passwordMismatch: isAr ? "كلمات المرور غير متطابقة" : "Passwords do not match",
    passwordShort: isAr ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
    errorGeneric: isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.",
    checkEmail: isAr ? "تحقق من بريدك الإلكتروني لتأكيد حسابك" : "Check your email to confirm your account",
    backToHome: isAr ? "العودة للرئيسية" : "Back to Home",
    // Capacity translations
    communityFull: isAr
      ? "الملتقى امتلأ! سجّل في قائمة الانتظار وبنبلغك لمن يفتح مكان."
      : "We've reached our 500-member capacity! Join the waitlist to be notified when a spot opens up.",
    memberCount: isAr ? "شفت" : "members",
    waitlistPlaceholder: isAr ? "بريدك الإلكتروني" : "Your email address",
    waitlistButton: isAr ? "سجّل في قائمة الانتظار" : "Join Waitlist",
    waitlistSuccess: isAr ? "تم التسجيل! بنبلغك لمن يفتح مكان." : "You're on the list! We'll notify you when a spot opens.",
    waitlistComingSoon: isAr ? "قائمة الانتظار قريبًا" : "Waitlist coming soon",
  };

  // Check member count on mount
  useEffect(() => {
    async function checkCapacity() {
      try {
        const supabase = createClient();
        const { count, error } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });

        if (!error && count !== null) {
          setMemberCount(count);
          setIsFull(count >= MAX_MEMBERS);
        }
      } catch {
        // If the check fails, allow signup (fail open)
      } finally {
        setCapacityLoading(false);
      }
    }
    checkCapacity();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    if (password.length < 6) {
      setError(t.passwordShort);
      return;
    }

    setLoading(true);

    // Re-check capacity before submitting
    const supabase = createClient();
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (count !== null && count >= MAX_MEMBERS) {
      setMemberCount(count);
      setIsFull(true);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?locale=${locale}`,
      },
    });

    if (authError) {
      setError(t.errorGeneric);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  // Loading state while checking capacity
  if (capacityLoading) {
    return (
      <div className="glass-strong rounded-2xl p-8 text-center">
        <div className="h-8 w-8 mx-auto rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // Community full state
  if (isFull) {
    return (
      <div className="glass-strong rounded-2xl p-8 text-center max-w-md mx-auto">
        {/* Member count badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6">
          <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
          <span className="text-sm font-semibold text-gold">
            {memberCount ?? MAX_MEMBERS}/{MAX_MEMBERS} {t.memberCount}
          </span>
        </div>

        {/* Lock icon */}
        <div className="text-5xl mb-4">🔒</div>

        <h2 className="text-xl font-bold mb-3">
          {isAr ? "الملتقى امتلأ!" : "Community Full"}
        </h2>

        <p className="text-sm text-muted leading-relaxed mb-8">
          {t.communityFull}
        </p>

        {/* Capacity progress bar */}
        <div className="w-full h-2 rounded-full bg-surface border border-border mb-8">
          <div className="h-full rounded-full gradient-gold" style={{ width: "100%" }} />
        </div>

        {/* Waitlist - V1: coming soon message */}
        {!waitlistSubmitted ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder={t.waitlistPlaceholder}
                className="flex-1 rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={() => {
                  if (waitlistEmail) setWaitlistSubmitted(true);
                }}
                className="px-5 py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                {t.waitlistButton}
              </button>
            </div>
            <p className="text-xs text-muted">{t.waitlistComingSoon}</p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
            <p className="text-sm text-gold font-medium">{t.waitlistSuccess}</p>
          </div>
        )}

        {/* Back to home */}
        <Link
          href={`/${locale}`}
          className="mt-6 inline-block text-sm text-gold hover:text-gold-light transition-colors"
        >
          {t.backToHome}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-strong rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-bold mb-2">{t.checkEmail}</h2>
        <p className="text-sm text-muted">{email}</p>
        <Link
          href={`/${locale}`}
          className="mt-6 inline-block text-sm text-gold hover:text-gold-light transition-colors"
        >
          {t.backToHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{t.signupTitle}</h1>
        <p className="mt-2 text-sm text-muted">{t.signupSubtitle}</p>
        {/* Subtle member count indicator */}
        {memberCount !== null && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{memberCount}/{MAX_MEMBERS} {t.memberCount}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
            {t.fullName}
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            {t.email}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            {t.password}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
            {t.confirmPassword}
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "..." : t.signupButton}
        </button>

        <p className="text-xs text-muted text-center">{t.agreeTerms}</p>
      </form>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-muted">
        {t.hasAccount}{" "}
        <Link
          href={`/${locale}/login`}
          className="text-gold hover:text-gold-light font-medium transition-colors"
        >
          {t.login}
        </Link>
      </p>
    </div>
  );
}
