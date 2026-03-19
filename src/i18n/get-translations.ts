import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./locales/en.json").then((m) => m.default),
  ar: () => import("./locales/ar.json").then((m) => m.default),
};

export async function getTranslations(locale: Locale) {
  return dictionaries[locale]();
}
