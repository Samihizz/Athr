import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import CreateServiceForm from "./CreateServiceForm";

export default async function CreateServicePage({
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
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "انشر خدمة" : "Post a Service"}
        </h1>
        <p className="text-muted mb-8">
          {isAr ? "اعرض خدماتك على أعضاء المجتمع" : "Showcase your services to the community"}
        </p>

        <CreateServiceForm
          locale={locale}
          authorId={user.id}
          tracks={tracks.map((t) => ({ id: t.id, name: isAr ? t.ar.name : t.en.name }))}
        />
      </main>
    </>
  );
}
