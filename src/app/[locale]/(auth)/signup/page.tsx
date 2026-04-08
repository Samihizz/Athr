"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MAX_MEMBERS } from "@/lib/constants";
import { generateReferralCode } from "@/lib/referral";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-gold border-t-transparent rounded-full" /></div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

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

  // Referral state
  const [referrerName, setReferrerName] = useState<string | null>(null);

  const isAr = locale === "ar";

  const t = {
    signupTitle: isAr ? "انضم لأثر" : "Join Athr",
    signupSubtitle: isAr ? "أنشئ حسابك وتواصل مع المجتمع" : "Create your account and connect with the community",
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
    invitedBy: isAr ? "تمت الدعوة بواسطة" : "Invited by",
    // Capacity translations
    communityFull: isAr
      ? "الملتقى ممتلئ! سجّل في قائمة الانتظار وسنبلغك عند توفر مكان."
      : "We've reached our 500-member capacity! Join the waitlist to be notified when a spot opens up.",
    memberCount: isAr ? "عضو" : "members",
    waitlistPlaceholder: isAr ? "بريدك الإلكتروني" : "Your email address",
    waitlistButton: isAr ? "سجّل في قائمة الانتظار" : "Join Waitlist",
    waitlistSuccess: isAr ? "تم التسجيل! سنبلغك عند توفر مكان." : "You're on the list! We'll notify you when a spot opens.",
    waitlistComingSoon: isAr ? "قائمة الانتظار قريبًا" : "Waitlist coming soon",
  };

  // Check member count + referrer on mount
  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();

        // Check capacity
        const { count, error } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });

        if (!error && count !== null) {
          setMemberCount(count);
          setIsFull(count >= MAX_MEMBERS);
        }

        // Look up referrer name if ref code present
        if (refCode) {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("referral_code", refCode)
            .single();

          if (referrer?.full_name) {
            setReferrerName(referrer.full_name);
          }
        }
      } catch {
        // If the check fails, allow signup (fail open)
      } finally {
        setCapacityLoading(false);
      }
    }
    init();
  }, [refCode]);

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

    // Generate a referral code for the new user
    const newReferralCode = generateReferralCode(fullName);

    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          referral_code: newReferralCode,
          ...(refCode ? { referred_by: refCode } : {}),
        },
      },
    });

    if (authError) {
      setError(t.errorGeneric);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, the user is auto-confirmed
    // Try to sign in immediately
    if (signUpData.user && !signUpData.user.identities?.length === false) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError) {
        // Process referral inline since we're skipping the callback
        if (refCode) {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("id, referral_count")
            .eq("referral_code", refCode)
            .single();

          if (referrer) {
            await supabase
              .from("profiles")
              .update({ referred_by: refCode })
              .eq("id", signUpData.user.id);

            await supabase
              .from("profiles")
              .update({ referral_count: (referrer.referral_count || 0) + 1 })
              .eq("id", referrer.id);
          }
        }

        // Update referral code on profile
        if (newReferralCode) {
          await supabase
            .from("profiles")
            .update({ referral_code: newReferralCode })
            .eq("id", signUpData.user.id);
        }

        router.push(`/${locale}/dashboard`);
        return;
      }
    }

    // Fallback: if email confirmation is still required, show the old flow
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
        <p className="text-sm text-muted mb-2">{email}</p>
        <p className="text-xs text-muted mb-6">
          {isAr
            ? "بعد ما تأكد الإيميل، ارجع هنا واضغط الزر تحت"
            : "After confirming your email, come back here and tap the button below"}
        </p>
        <Link
          href={`/${locale}/login`}
          className="inline-block w-full py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {isAr ? "تم التأكيد — سجّل دخولك" : "I've confirmed — Log me in"}
        </Link>
        <Link
          href={`/${locale}`}
          className="mt-3 inline-block text-sm text-muted hover:text-gold transition-colors"
        >
          {t.backToHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-8">
      {/* Referral banner */}
      {referrerName && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-gold/10 border border-gold/20 px-4 py-3">
          <div className="shrink-0 h-8 w-8 rounded-full gradient-gold flex items-center justify-center text-background font-bold text-xs">
            {referrerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gold">
              {t.invitedBy} {referrerName}
            </p>
          </div>
        </div>
      )}

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
