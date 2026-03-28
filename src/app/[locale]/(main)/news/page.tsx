import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PageHeader from "@/components/PageHeader";
import NewsContent from "./NewsContent";

export type UserNewsItem = {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  summary: string | null;
  source_url: string;
  category: string;
  image_url: string | null;
  created_at: string;
};

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  let news = [];
  try {
    const res = await fetch(`${baseUrl}/api/news`, { next: { revalidate: 3600 } });
    if (res.ok) {
      news = await res.json();
    }
  } catch {
    news = [];
  }

  // Fetch community-submitted news
  const { data: userNews } = await supabase
    .from("user_news")
    .select("*")
    .order("created_at", { ascending: false });

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
      <main className="pt-20 pb-16">
        <PageHeader
          title={isAr ? "الأخبار" : "News"}
          subtitle={
            isAr
              ? "آخر الأخبار من السعودية والسودان وعالم التقنية."
              : "Latest news from Saudi Arabia, Sudan, and the tech world — curated and community-shared."
          }

          coverGradient="linear-gradient(135deg, #059669 0%, #0D9488 40%, #14B8A6 100%)"
          locale={locale}
        />

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl mt-8">
          <div className="flex items-center justify-end mb-6">
            <Link
              href={`/${locale}/news/create`}
              className="gradient-gold text-background px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {isAr ? "شارك خبر" : "Share News"}
            </Link>
          </div>

          <NewsContent news={news} userNews={(userNews as UserNewsItem[]) || []} locale={locale} translations={t} />
        </div>
      </main>
    </>
  );
}
