export const defaultLocale = "en" as const;
export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export function isRtl(locale: Locale): boolean {
  return locale === "ar";
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}
