import { redirect } from "next/navigation";
import Link from "next/link";
import { type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PageHeader from "@/components/PageHeader";
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
      <main className="pt-20 pb-16">
        <PageHeader
          title={isAr ? "الفعاليات" : "Events"}
          subtitle={
            isAr
              ? "ورش عمل ولقاءات وفعاليات تشبيك عشان تطوّر مهاراتك وتوسّع دائرتك."
              : "Workshops, meetups, and networking events designed to grow your skills and expand your circle."
          }

          coverGradient="linear-gradient(135deg, #CCA300 0%, #E6BE2E 40%, #D4880F 100%)"
          locale={locale}
        />

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl mt-8">
          <div className="flex items-center justify-end mb-6">
            <Link
              href={`/${locale}/events/create`}
              className="gradient-gold text-background px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {isAr ? "أنشئ فعالية" : "Create Event"}
            </Link>
          </div>

          <EventsList
            events={events || []}
            registeredIds={Array.from(registeredIds)}
            registrationCounts={registrationCounts}
            locale={locale}
            tracks={tracks.map((t) => ({ id: t.id, name: isAr ? t.ar.name : t.en.name }))}
            userId={user.id}
          />
        </div>
      </main>
    </>
  );
}
