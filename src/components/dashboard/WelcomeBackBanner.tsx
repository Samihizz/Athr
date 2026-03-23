"use client";

import { useState, useEffect } from "react";

interface WelcomeBackBannerProps {
  firstName: string;
  locale: string;
  userId: string;
}

export default function WelcomeBackBanner({
  firstName,
  locale,
  userId,
}: WelcomeBackBannerProps) {
  const isAr = locale === "ar";
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  const storageKey = `athr_wb_dismissed_${userId}`;

  useEffect(() => {
    const wasDismissed = localStorage.getItem(storageKey);
    if (!wasDismissed) {
      setDismissed(false);
    }
  }, [storageKey]);

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem(storageKey, "1");
  }

  if (dismissed) return null;

  const message = isAr
    ? `\u0628\u0642\u064A\u062A \u0645\u0627 \u0628\u062A\u062C\u064A\u0646\u0627 \u064A\u0627 ${firstName}! \u0627\u0644\u0645\u062C\u062A\u0645\u0639 \u0627\u0634\u062A\u0627\u0642 \u0644\u064A\u0643!`
    : `${firstName}, long time no see! The community missed you!`;

  return (
    <div className="relative overflow-hidden rounded-2xl p-[1px] mb-4">
      {/* Gold gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/50 via-gold-light/30 to-gold/50" />

      {/* Inner content */}
      <div className="relative rounded-2xl glass-strong p-5 sm:p-6">
        {/* Subtle gold glow background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gold/6 via-gold/3 to-transparent pointer-events-none rounded-2xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0">{"\u{1F44B}"}</span>
            <p className="text-sm sm:text-base font-medium text-foreground/90">
              {message}
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="shrink-0 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label="Dismiss"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
