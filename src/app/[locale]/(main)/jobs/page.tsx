import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PageHeader from "@/components/PageHeader";
import JobsList from "./JobsList";

export default async function JobsPage({
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

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AuthNavbar locale={locale} userName={profile?.full_name || user.email || ""} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-20 pb-16">
        <PageHeader
          title={isAr ? "فرص العمل" : "Jobs & Opportunities"}
          subtitle={
            isAr
              ? "لاقي وظايف وفرص عمل حر وتعاون من المجتمع."
              : "Find jobs, freelance gigs, and collaboration opportunities posted by the community."
          }
          coverGradient="linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #F97316 100%)"
          locale={locale}
        />

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl mt-8">
          <div className="flex items-center justify-end mb-6">
            <Link
              href={`/${locale}/jobs/create`}
              className="btn-primary text-sm px-5 py-2.5"
            >
              {isAr ? "انشر فرصة" : "Post Opportunity"}
            </Link>
          </div>

        <JobsList
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
