import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import CreateJobForm from "./CreateJobForm";

export default async function CreateJobPage({
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

  const authorName = profile?.full_name || user.user_metadata?.full_name || user.email || "";

  return (
    <>
      <AuthNavbar locale={locale} userName={authorName} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "انشر فرصة" : "Post Opportunity"}
        </h1>
        <p className="text-muted mb-8">
          {isAr ? "شارك فرصة عمل أو تعاون مع المجتمع" : "Share a job, gig, or collaboration with the community"}
        </p>

        <CreateJobForm
          locale={locale}
          authorId={user.id}
          authorName={authorName}
          tracks={tracks.map((t) => ({ id: t.id, name: isAr ? t.ar.name : t.en.name }))}
        />
      </main>
    </>
  );
}
