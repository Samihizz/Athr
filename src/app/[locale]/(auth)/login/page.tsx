"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PAUSED = true;

function PausedNotice({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <div className="glass-strong rounded-2xl p-8 text-center">
      <div className="text-5xl mb-5">🔐</div>
      <h1 className="text-xl font-bold mb-3">
        {isAr ? "المنصة متوقفة مؤقتاً" : "Platform Paused"}
      </h1>
      <p className="text-sm text-muted leading-relaxed mb-8">
        {isAr
          ? "أثر متوقف مؤقتاً عن قبول أعضاء جدد. سنعود قريباً بكل ما هو جديد."
          : "Athr is temporarily paused. We'll be back soon with exciting updates."}
      </p>
      <Link
        href={`/${locale}`}
        className="inline-block w-full py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        {isAr ? "العودة للرئيسية" : "Back to Home"}
      </Link>
    </div>
  );
}

export default function LoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAr = locale === "ar";

  if (PAUSED) return <PausedNotice locale={locale} />;
  const t = {
    loginTitle: isAr ? "مرحباً بك" : "Welcome Back",
    loginSubtitle: isAr ? "سجّل الدخول إلى حسابك في أثر" : "Log in to your Athr account",
    email: isAr ? "البريد الإلكتروني" : "Email Address",
    password: isAr ? "كلمة المرور" : "Password",
    forgotPassword: isAr ? "نسيت كلمة المرور؟" : "Forgot password?",
    loginButton: isAr ? "تسجيل الدخول" : "Log In",
    noAccount: isAr ? "ليس لديك حساب؟" : "Don't have an account?",
    signup: isAr ? "إنشاء حساب" : "Sign Up",
    errorInvalid: isAr ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(t.errorInvalid);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/feed`);
    router.refresh();
  }

  return (
    <div className="glass-strong rounded-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{t.loginTitle}</h1>
        <p className="mt-2 text-sm text-muted">{t.loginSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium">
              {t.password}
            </label>
            <Link href={`/${locale}/forgot-password`} className="text-xs text-gold hover:text-gold-light transition-colors">
              {t.forgotPassword}
            </Link>
          </div>
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

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "..." : t.loginButton}
        </button>
      </form>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-muted">
        {t.noAccount}{" "}
        <Link
          href={`/${locale}/signup`}
          className="text-gold hover:text-gold-light font-medium transition-colors"
        >
          {t.signup}
        </Link>
      </p>
    </div>
  );
}
