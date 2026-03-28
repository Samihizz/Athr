"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const { locale } = useParams<{ locale: string }>();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAr = locale === "ar";
  const t = {
    title: isAr ? "استعادة كلمة المرور" : "Reset Your Password",
    subtitle: isAr
      ? "أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور"
      : "Enter your email and we'll send you a link to reset your password",
    email: isAr ? "البريد الإلكتروني" : "Email Address",
    sendButton: isAr ? "إرسال رابط الاستعادة" : "Send Reset Link",
    backToLogin: isAr ? "العودة لتسجيل الدخول" : "Back to Login",
    successTitle: isAr ? "تم الإرسال!" : "Check Your Email!",
    successMessage: isAr
      ? "إذا كان هناك حساب مرتبط بهذا البريد، ستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور"
      : "If an account exists with that email, you'll receive a password reset link shortly",
    errorGeneric: isAr
      ? "حدث خطأ، حاول مرة أخرى"
      : "Something went wrong. Please try again.",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?locale=${locale}&type=recovery`,
      }
    );

    if (resetError) {
      setError(t.errorGeneric);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="glass-strong rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">{t.successTitle}</h1>
        <p className="text-sm text-muted mb-6">{t.successMessage}</p>
        <Link
          href={`/${locale}/login`}
          className="inline-block px-6 py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {t.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 text-sm text-muted">{t.subtitle}</p>
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

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "..." : t.sendButton}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link
          href={`/${locale}/login`}
          className="text-gold hover:text-gold-light font-medium transition-colors"
        >
          {t.backToLogin}
        </Link>
      </p>
    </div>
  );
}
