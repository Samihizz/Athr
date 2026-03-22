import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PageHeader from "@/components/PageHeader";
import MentorshipContent from "./MentorshipContent";

export default async function MentorshipPage({
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
    .select("full_name, is_admin")
    .eq("id", user.id)
    .single();

  // Fetch eligible mentors: users with bio, education, and experience filled in
  const { data: mentors } = await supabase
    .from("profiles")
    .select("id, full_name, city, expertise, avatar_url, bio, skills, education, experience")
    .not("bio", "is", null)
    .not("education", "is", null)
    .not("experience", "is", null)
    .neq("id", user.id);

  // Fetch my outgoing mentorship requests (as mentee)
  const { data: myRequests } = await supabase
    .from("mentorship_requests")
    .select("*")
    .eq("mentee_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch incoming mentorship requests (as mentor)
  const { data: incomingRequests } = await supabase
    .from("mentorship_requests")
    .select("*")
    .eq("mentor_id", user.id)
    .order("created_at", { ascending: false });

  // Collect all profile IDs we need from requests
  const profileIds = new Set<string>();
  (myRequests || []).forEach((r: Record<string, string>) => {
    profileIds.add(r.mentor_id);
  });
  (incomingRequests || []).forEach((r: Record<string, string>) => {
    profileIds.add(r.mentee_id);
  });
  // Also add mentor IDs for the cards
  (mentors || []).forEach((m: { id: string }) => {
    profileIds.add(m.id);
  });

  type ProfileInfo = {
    id: string;
    full_name: string | null;
    city: string | null;
    expertise: string | null;
    avatar_url: string | null;
    bio: string | null;
    skills: string | string[] | null;
    education: string | null;
    experience: string | null;
  };

  let allProfiles: ProfileInfo[] = [];
  if (profileIds.size > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, city, expertise, avatar_url, bio, skills, education, experience")
      .in("id", Array.from(profileIds));
    allProfiles = (data as ProfileInfo[]) || [];
  }

  // Build profile map
  const profileMap: Record<string, ProfileInfo> = {};
  allProfiles.forEach((p) => {
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
          title={isAr ? "الإرشاد" : "Mentorship"}
          subtitle={
            isAr
              ? "لاقي مرشدين في مسارك أو شارك خبرتك مع الآخرين."
              : "Find experienced mentors in your track or share your knowledge with others."
          }
          coverGradient="linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #6366F1 100%)"
          locale={locale}
        />

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl mt-8">
        <MentorshipContent
          mentors={(mentors as ProfileInfo[]) || []}
          myRequests={myRequests || []}
          incomingRequests={incomingRequests || []}
          profileMap={profileMap}
          trackMap={trackMap}
          currentUserId={user.id}
          locale={locale}
        />
        </div>
      </main>
    </>
  );
}
