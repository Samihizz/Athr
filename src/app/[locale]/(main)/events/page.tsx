import { redirect } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import EventsList from "./EventsList";

export default async function EventsPage({
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

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  const { data: myRegistrations } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("profile_id", user.id);

  const registeredIds = new Set(myRegistrations?.map((r: { event_id: string }) => r.event_id) || []);

  // Fetch registration counts per event
  const { data: regCounts } = await supabase
    .from("event_registrations")
    .select("event_id");

  const registrationCounts: Record<string, number> = {};
  if (regCounts) {
    for (const r of regCounts as { event_id: string }[]) {
      registrationCounts[r.event_id] = (registrationCounts[r.event_id] || 0) + 1;
    }
  }

  return (
    <>
      <AuthNavbar locale={locale} userName={profile?.full_name || user.email || ""} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "البرامج" : "Events"}
        </h1>
        <p className="text-muted mb-8">
          {isAr ? "اكتشف البرامج وورش العمل الجاية" : "Discover upcoming events and workshops"}
        </p>

        <EventsList
          events={events || []}
          registeredIds={Array.from(registeredIds)}
          registrationCounts={registrationCounts}
          locale={locale}
          tracks={tracks.map((t) => ({ id: t.id, name: isAr ? t.ar.name : t.en.name }))}
          userId={user.id}
        />
      </main>
    </>
  );
}
