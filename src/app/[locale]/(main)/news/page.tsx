import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthNavbar from "@/components/layout/AuthNavbar";
import NewsContent from "./NewsContent";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email;

  // Fetch news from the API route
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  let news = [];
  try {
    const res = await fetch(`${baseUrl}/api/news`, { next: { revalidate: 3600 } });
    if (res.ok) {
      news = await res.json();
    }
  } catch {
    news = [];
  }

  const t = {
    title: isAr ? "الأخبار" : "News",
    subtitle: isAr ? "آخر الأخبار المهمة للمهنيين السودانيين في السعودية" : "Latest news relevant to Sudanese professionals in Saudi Arabia",
    all: isAr ? "الكل" : "All",
    saudiArabia: isAr ? "السعودية" : "Saudi Arabia",
    sudan: isAr ? "السودان" : "Sudan",
    technology: isAr ? "التقنية" : "Technology",
    business: isAr ? "الأعمال" : "Business",
    readMore: isAr ? "اقرأ المزيد" : "Read More",
    noNews: isAr ? "ما في أخبار حالياً" : "No news available at the moment",
    source: isAr ? "المصدر" : "Source",
    backToDashboard: isAr ? "العودة للرئيسية" : "Back to Dashboard",
  };

  return (
    <>
      <AuthNavbar locale={locale} userName={displayName} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl gradient-gold flex items-center justify-center">
              <svg className="h-5 w-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t.title}</h1>
              <p className="text-muted text-sm mt-1">{t.subtitle}</p>
            </div>
          </div>
        </div>

        <NewsContent news={news} locale={locale} translations={t} />
      </main>
    </>
  );
}
