import { redirect } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { tracks, ATHR_COMMUNITY_WHATSAPP } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import MemberDirectory from "./MemberDirectory";
import WhatsAppGroupCard, { CommunityWhatsAppCard } from "@/components/WhatsAppGroupCard";

export default async function CommunityPage({
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

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, bio, city, expertise, role, skills, avatar_url")
    .order("created_at", { ascending: false });

  return (
    <>
      <AuthNavbar locale={locale} userName={profile?.full_name || user.email || ""} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "الشفاتة في المنطقة" : "Member Directory"}
        </h1>
        <p className="text-muted mb-8">
          {isAr ? "تواصل مع الشفاتة في المنطقة" : "Connect with community members"}
        </p>

        {/* Community WhatsApp Groups */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">
            {isAr ? "قروبات المجتمع" : "Community Groups"}
          </h2>

          <div className="mb-6">
            <CommunityWhatsAppCard whatsappLink={ATHR_COMMUNITY_WHATSAPP} locale={locale} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {tracks.map((track) => (
              <WhatsAppGroupCard
                key={track.id}
                trackName={isAr ? track.ar.name : track.en.name}
                trackIcon={track.icon}
                whatsappLink={track.whatsappGroup}
                locale={locale}
                variant="compact"
              />
            ))}
          </div>
        </section>

        <MemberDirectory
          members={members || []}
          locale={locale}
          tracks={tracks.map((t) => ({ id: t.id, name: isAr ? t.ar.name : t.en.name }))}
          currentUserId={user.id}
        />
      </main>
    </>
  );
}
