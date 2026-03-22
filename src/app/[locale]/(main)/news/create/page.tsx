import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthNavbar from "@/components/layout/AuthNavbar";
import CreateNewsForm from "./CreateNewsForm";

export default async function CreateNewsPage({
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

  const authorName = profile?.full_name || user.user_metadata?.full_name || user.email || "Member";

  return (
    <>
      <AuthNavbar locale={locale} userName={profile?.full_name || user.email || ""} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "شارك خبر" : "Share News"}
        </h1>
        <p className="text-muted mb-8">
          {isAr ? "شارك خبر مع المجتمع مع رابط المصدر" : "Share news with the community along with the source link"}
        </p>

        <CreateNewsForm locale={locale} userId={user.id} authorName={authorName} />
      </main>
    </>
  );
}
