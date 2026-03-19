import Image from "next/image";
import Link from "next/link";
import { type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/get-translations";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations(locale as Locale);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header */}
      <header className="p-4 sm:p-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href={`/${locale}`}>
            <Image
              src="/6.svg"
              alt="Athr — أثر"
              width={160}
              height={52}
              className="h-11 w-auto"
              priority
            />
          </Link>
          <Link
            href={`/${locale === "ar" ? "en" : "ar"}/login`}
            className="text-sm text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border"
          >
            {t.common.language}
          </Link>
        </div>
      </header>

      {/* Background effects */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-8">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-60 h-60 bg-gold/8 rounded-full blur-[100px]" />
        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
