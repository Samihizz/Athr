import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PageHeader from "@/components/PageHeader";
import MarketTabs from "./MarketTabs";

export default async function MarketPage({
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

  const [{ data: services }, { data: jobs }] = await Promise.all([
    supabase
      .from("services")
      .select("*, author:profiles!author_id(full_name, avatar_url, expertise)")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("jobs")
      .select("*")
      .eq("is_open", true)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <AuthNavbar locale={locale} userName={profile?.full_name || user.email || ""} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-20 pb-16">
        <PageHeader
          title={isAr ? "السوق" : "Market"}
          subtitle={
            isAr
              ? "اكتشف خدمات وفرص عمل من أعضاء المجتمع واعرض خدماتك للآخرين."
              : "Discover services and job opportunities from the community."
          }
          coverGradient="linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #DC2626 100%)"
          locale={locale}
        />

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl mt-8">
          <MarketTabs
            services={services || []}
            jobs={jobs || []}
            locale={locale}
            tracks={tracks.map((t) => ({ id: t.id, name: isAr ? t.ar.name : t.en.name }))}
            currentUserId={user.id}
          />
        </div>
      </main>
    </>
  );
}
