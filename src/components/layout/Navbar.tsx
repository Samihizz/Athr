"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
// import ThemeToggle from "@/components/ThemeToggle";

type NavbarProps = {
  locale: string;
  t: {
    common: Record<string, string>;
  };
};

export default function Navbar({ locale, t }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const otherLocale = locale === "ar" ? "en" : "ar";
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll(); // check initial state
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        <div
          className={`flex h-16 items-center justify-between rounded-2xl px-5 transition-all duration-300 ${
            scrolled ? "glass-strong shadow-lg" : "glass"
          }`}
        >
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src="/6.svg"
              alt="Athr — أثر"
              width={160}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: `/${locale}`, label: t.common.home },
              { href: `/${locale}/community`, label: t.common.community },
              { href: `/${locale}/events`, label: t.common.events },
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

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href={`/${otherLocale}`}
              className="text-sm text-muted hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-surface-hover"
            >
              {t.common.language}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="text-sm text-muted hover:text-foreground transition-colors px-4 py-2"
            >
              {t.common.login}
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="btn-primary !py-2.5 !px-6 !text-sm"
            >
              {t.common.signup}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted hover:text-foreground rounded-xl hover:bg-surface-hover transition-colors"
            aria-label="Toggle menu"
          >
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

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="md:hidden mx-4 mt-2"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="glass-strong rounded-2xl p-4 flex flex-col gap-1">
            {[
              { href: `/${locale}`, label: t.common.home },
              { href: `/${locale}/community`, label: t.common.community },
              { href: `/${locale}/events`, label: t.common.events },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-hover transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="section-divider my-2" />
            <Link
              href={`/${otherLocale}`}
              className="px-4 py-3 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-hover transition-colors"
            >
              {t.common.language}
            </Link>
            <Link
              href={`/${locale}/login`}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-hover transition-colors"
            >
              {t.common.login}
            </Link>
            <Link
              href={`/${locale}/signup`}
              onClick={() => setMobileOpen(false)}
              className="mt-2 btn-primary text-center !text-sm"
            >
              {t.common.signup}
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
