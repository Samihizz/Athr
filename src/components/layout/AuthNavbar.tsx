"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { logout } from "@/app/[locale]/(auth)/logout/actions";
import NotificationBell from "@/components/NotificationBell";

type AuthNavbarProps = {
  locale: string;
  userName: string;
  userId: string;
  isAdmin?: boolean;
};

export default function AuthNavbar({ locale, userName, userId, isAdmin }: AuthNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const otherLocale = locale === "ar" ? "en" : "ar";
  const isAr = locale === "ar";

  const t = {
    dashboard: isAr ? "محل الشغل" : "Dashboard",
    tracks: isAr ? "المسارات" : "Tracks",
    events: isAr ? "البرامج" : "Events",
    community: isAr ? "ناس الشرقية" : "Community",
    feed: isAr ? "الشمارات" : "Feed",
    connections: isAr ? "اتصالاتي" : "Connections",
    mentorship: isAr ? "الإرشاد" : "Mentorship",
    jobs: isAr ? "فرص" : "Jobs",
    news: isAr ? "الأخبار" : "News",
    profile: isAr ? "ملفي الشخصي" : "My Profile",
    editProfile: isAr ? "تعديل الملف" : "Edit Profile",
    admin: isAr ? "لوحة الإدارة" : "Admin Panel",
    logout: isAr ? "تسجيل الخروج" : "Log Out",
    language: isAr ? "English" : "العربية",
  };

  const initial = userName?.charAt(0)?.toUpperCase() || "?";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex h-16 items-center justify-between rounded-2xl glass px-5">
          <Link href={`/${locale}/dashboard`} className="flex items-center">
            <Image src="/6.svg" alt="Athr" width={200} height={64} className="h-14 w-auto" priority />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              { href: `/${locale}/dashboard`, label: t.dashboard },
              { href: `/${locale}/tracks`, label: t.tracks },
              { href: `/${locale}/events`, label: t.events },
              { href: `/${locale}/community`, label: t.community },
              { href: `/${locale}/connections`, label: t.connections },
              { href: `/${locale}/mentorship`, label: t.mentorship },
              { href: `/${locale}/jobs`, label: t.jobs },
              { href: `/${locale}/feed`, label: t.feed },
              { href: `/${locale}/news`, label: t.news },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-hover transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href={`/${otherLocale}/dashboard`}
              className="text-sm text-muted hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-surface-hover"
            >
              {t.language}
            </Link>

            <NotificationBell locale={locale} userId={userId} />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/40 to-primary/20 text-sm font-bold text-foreground flex items-center justify-center hover:from-primary/50 hover:to-primary/30 transition-all border border-border"
              >
                {initial}
              </button>

              {userMenuOpen && (
                <div className="absolute end-0 mt-2 w-52 glass-strong rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium truncate">{userName}</p>
                  </div>
                  <div className="py-1.5">
                    <Link href={`/${locale}/profile`} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors">{t.profile}</Link>
                    <Link href={`/${locale}/edit-profile`} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors">{t.editProfile}</Link>
                    {isAdmin && (
                      <Link href={`/${locale}/admin`} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gold hover:bg-surface-hover transition-colors">{t.admin}</Link>
                    )}
                    <div className="section-divider my-1.5 mx-4" />
                    <form action={() => logout(locale)}>
                      <button type="submit" className="w-full text-start px-4 py-2.5 text-sm text-red-400 hover:bg-surface-hover transition-colors">{t.logout}</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-muted hover:text-foreground rounded-xl hover:bg-surface-hover transition-colors" aria-label="Toggle menu">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden mx-4 mt-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="glass-strong rounded-2xl p-4 flex flex-col gap-1">
            {[
              { href: `/${locale}/dashboard`, label: t.dashboard },
              { href: `/${locale}/tracks`, label: t.tracks },
              { href: `/${locale}/events`, label: t.events },
              { href: `/${locale}/community`, label: t.community },
              { href: `/${locale}/connections`, label: t.connections },
              { href: `/${locale}/mentorship`, label: t.mentorship },
              { href: `/${locale}/jobs`, label: t.jobs },
              { href: `/${locale}/feed`, label: t.feed },
              { href: `/${locale}/news`, label: t.news },
            ].map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-hover">{link.label}</Link>
            ))}
            <div className="section-divider my-2" />
            <div className="px-4 py-2">
              <NotificationBell locale={locale} userId={userId} />
            </div>
            <Link href={`/${locale}/profile`} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-hover">{t.profile}</Link>
            <Link href={`/${locale}/edit-profile`} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-hover">{t.editProfile}</Link>
            {isAdmin && (
              <Link href={`/${locale}/admin`} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-gold rounded-xl hover:bg-surface-hover">{t.admin}</Link>
            )}
            <Link href={`/${otherLocale}/dashboard`} className="px-4 py-3 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-hover">{t.language}</Link>
            <form action={() => logout(locale)}>
              <button type="submit" className="w-full text-start px-4 py-3 text-sm text-red-400 rounded-xl hover:bg-surface-hover">{t.logout}</button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
