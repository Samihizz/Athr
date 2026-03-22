import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PageHeader from "@/components/PageHeader";
import ConnectionsClient from "./ConnectionsClient";

export default async function ConnectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_admin, city, expertise")
    .eq("id", user.id)
    .single();

  // Fetch all connections involving the user (not declined)
  const { data: connections } = await supabase
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .neq("status", "declined")
    .order("updated_at", { ascending: false });

  // Collect all profile IDs we need
  const profileIds = new Set<string>();
  (connections || []).forEach((c: Record<string, string>) => {
    if (c.requester_id !== user.id) profileIds.add(c.requester_id);
    if (c.receiver_id !== user.id) profileIds.add(c.receiver_id);
  });

  // Fetch profiles for connected users
  type ProfileInfo = {
    id: string;
    full_name: string | null;
    city: string | null;
    expertise: string | null;
    avatar_url: string | null;
    bio: string | null;
    skills: string | string[] | null;
  };

  let profiles: ProfileInfo[] = [];
  if (profileIds.size > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, city, expertise, avatar_url, bio, skills")
      .in("id", Array.from(profileIds));
    profiles = (data as ProfileInfo[]) || [];
  }

  // Build profile map
  const profileMap: Record<string, ProfileInfo> = {};
  profiles.forEach((p) => {
    profileMap[p.id] = p;
  });

  // Build track name map
  const trackMap: Record<string, string> = {};
  tracks.forEach((t) => {
    trackMap[t.id] = isAr ? t.ar.name : t.en.name;
  });

  return (
    <>
      <AuthNavbar
        locale={locale}
        userName={profile?.full_name || user.email || ""}
        userId={user.id}
        isAdmin={profile?.is_admin}
      />
      <main className="pt-20 pb-16">
        <PageHeader
          title={isAr ? "شبكتي" : "Connections"}
          subtitle={
            isAr
              ? "شبكتك المهنية في مجتمع أثر."
              : "Your professional network within the Athr community."
          }
          icon="🤝"
          coverGradient="linear-gradient(135deg, #1800AD 0%, #CCA300 50%, #E6BE2E 100%)"
          locale={locale}
        />

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl mt-8">
          <ConnectionsClient
            connections={connections || []}
            profileMap={profileMap}
            trackMap={trackMap}
            currentUserId={user.id}
            locale={locale}
            userCity={profile?.city || null}
            userTrack={profile?.expertise || null}
          />
        </div>
      </main>
    </>
  );
}
