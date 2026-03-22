import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthNavbar from "@/components/layout/AuthNavbar";
import CreateEventForm from "./CreateEventForm";

export default async function CreateEventPage({
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

  return (
    <>
      <AuthNavbar locale={locale} userName={profile?.full_name || user.email || ""} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "أنشئ فعالية" : "Create Event"}
        </h1>
        <p className="text-muted mb-8">
          {isAr ? "أنشئ فعالية جديدة للمجتمع" : "Create a new event for the community"}
        </p>

        <CreateEventForm locale={locale} userId={user.id} />
      </main>
    </>
  );
}
