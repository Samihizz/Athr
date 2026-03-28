"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAr = locale === "ar";
  const t = {
    title: isAr ? "كلمة مرور جديدة" : "Set New Password",
    subtitle: isAr ? "اختر كلمة مرور جديدة لحسابك" : "Choose a new password for your account",
    password: isAr ? "كلمة المرور الجديدة" : "New Password",
    confirmPassword: isAr ? "تأكيد كلمة المرور" : "Confirm Password",
    saveButton: isAr ? "حفظ كلمة المرور" : "Save Password",
    successTitle: isAr ? "تم التحديث!" : "Password Updated!",
    successMessage: isAr
      ? "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول"
      : "Your password has been changed successfully. You can now log in.",
    loginButton: isAr ? "تسجيل الدخول" : "Log In",
    errorMismatch: isAr ? "كلمات المرور غير متطابقة" : "Passwords don't match",
    errorShort: isAr ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
    errorGeneric: isAr ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong. Please try again.",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t.errorShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.errorMismatch);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">{t.successTitle}</h1>
        <p className="text-sm text-muted mb-6">{t.successMessage}</p>
        <Link
          href={`/${locale}/login`}
          className="inline-block px-6 py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {t.loginButton}
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
          {loading ? "..." : t.saveButton}
        </button>
      </form>
    </div>
  );
}
