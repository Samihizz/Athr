"use client";

import { useEffect } from "react";
import { type Locale, getDirection } from "@/i18n/config";
import ThemeProvider from "./ThemeProvider";

export default function LocaleProvider({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale as Locale);
  }, [locale]);

  return <ThemeProvider>{children}</ThemeProvider>;
}
