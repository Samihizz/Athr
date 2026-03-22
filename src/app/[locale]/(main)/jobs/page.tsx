import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
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
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">
            {isAr ? "فرص العمل" : "Jobs & Opportunities"}
          </h1>
          <Link
            href={`/${locale}/jobs/create`}
            className="btn-primary text-sm px-5 py-2.5"
          >
            {isAr ? "انشر فرصة" : "Post Opportunity"}
          </Link>
        </div>
        <p className="text-muted mb-8">
          {isAr ? "اكتشف فرص العمل والتعاون من مجتمعك" : "Discover jobs, gigs, and collaboration opportunities from your community"}
        </p>

        <JobsList
          jobs={jobs || []}
          locale={locale}
          tracks={tracks.map((t) => ({ id: t.id, name: isAr ? t.ar.name : t.en.name }))}
          currentUserId={user.id}
        />
      </main>
    </>
  );
}
