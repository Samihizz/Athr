import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import LocaleProvider from "@/components/LocaleProvider";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
