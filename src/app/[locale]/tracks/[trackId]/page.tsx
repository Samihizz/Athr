import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/get-translations";
import { tracks, getTrackById } from "@/lib/tracks";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppGroupCard from "@/components/WhatsAppGroupCard";

const trackImages: Record<string, string> = {
  ai: "/images/tracks/ai.svg",
  creative: "/images/tracks/creative.svg",
  business: "/images/tracks/business.svg",
  marketing: "/images/tracks/marketing.svg",
  finance: "/images/tracks/finance.svg",
  tech: "/images/tracks/tech.svg",
};

export function generateStaticParams() {
  const params: { locale: string; trackId: string }[] = [];
  for (const locale of ["ar", "en"]) {
    for (const track of tracks) {
      params.push({ locale, trackId: track.id });
    }
  }
  return params;
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string }>;
}) {
  const { locale, trackId } = await params;
  const track = getTrackById(trackId);
  if (!track) notFound();

  const t = await getTranslations(locale as Locale);
  const isAr = locale === "ar";
  const supabase = await createClient();

  // Fetch mentors in this track
  const { data: mentors } = await supabase
    .from("profiles")
    .select("id, full_name, bio, city, skills")
    .eq("expertise", trackId)
    .eq("is_mentor", true)
    .limit(6);

  // Fetch upcoming events for this track
  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, event_date, location")
    .eq("track", trackId)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(4);

  // Fetch recent content posts for this track
  const { data: posts } = await supabase
    .from("content_posts")
    .select("id, title_en, title_ar, body_en, body_ar, created_at, author_id")
    .eq("track", trackId)
    .order("created_at", { ascending: false })
    .limit(4);

  const trackName = isAr ? track.ar.name : track.en.name;
  const trackDesc = isAr ? track.ar.description : track.en.description;

  const labels = {
    mentors: isAr ? "الخبراء في المسار ده" : "Mentors in This Track",
    events: isAr ? "البرامج الجاية" : "Upcoming Events",
    posts: isAr ? "آخر الشمارات" : "Latest Content",
    noMentors: isAr ? "ما في خبراء لسه في المسار ده" : "No mentors in this track yet",
    noEvents: isAr ? "ما في برامج جاية" : "No upcoming events",
    noPosts: isAr ? "ما في شمارات لسه" : "No content yet",
    beFirst: isAr ? "كن أول من ينضم لهذا المسار!" : "Be the first to join this track!",
    joinTrack: isAr ? "انضم لهذا المسار" : "Join This Track",
    viewProfile: isAr ? "عرض الملف" : "View Profile",
    backToTracks: isAr ? "جميع المسارات" : "All Tracks",
  };

  return (
    <>
      <Navbar locale={locale} t={t} />

      {/* Hero with cover image */}
      <section className="relative pt-20 overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full">
          <Image
            src={trackImages[trackId] || trackImages.ai}
            alt={trackName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24">
          <Link
            href={`/${locale}#tracks`}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
          >
            <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {labels.backToTracks}
          </Link>

          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl card-elevated flex items-center justify-center shrink-0 p-2">
              <img src={track.icon} alt="" className="w-12 h-12 rounded" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{trackName}</h1>
              <p className="mt-3 text-lg text-muted max-w-2xl">{trackDesc}</p>
            </div>
          </div>

          <Link
            href={`/${locale}/signup`}
            className="mt-8 btn-primary inline-flex"
          >
            {labels.joinTrack}
          </Link>

          {/* WhatsApp Group Card */}
          <div className="mt-8">
            <WhatsAppGroupCard
              trackName={trackName}
              trackIcon={track.icon}
              whatsappLink={track.whatsappGroup}
              locale={locale}
            />
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">{labels.mentors}</h2>

          {mentors && mentors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="card p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary-light mb-3">
                    {mentor.full_name?.charAt(0) || "?"}
                  </div>
                  <h3 className="font-semibold">{mentor.full_name}</h3>
                  {mentor.city && (
                    <p className="text-xs text-muted mt-1">{mentor.city}</p>
                  )}
                  {mentor.bio && (
                    <p className="text-sm text-muted mt-2 line-clamp-2">{mentor.bio}</p>
                  )}
                  {mentor.skills && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(mentor.skills as string[]).slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-muted">{labels.noMentors}</p>
              <p className="text-sm text-muted mt-1">{labels.beFirst}</p>
            </div>
          )}
        </div>
      </section>

      {/* Events */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">{labels.events}</h2>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <div key={event.id} className="card p-6 hover:bg-surface-hover transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-muted mt-1 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    <div className="shrink-0 glass rounded-xl px-3 py-2 text-center min-w-[60px]">
                      <div className="text-xs text-muted">
                        {new Date(event.event_date).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short" })}
                      </div>
                      <div className="text-lg font-bold text-gold">
                        {new Date(event.event_date).getDate()}
                      </div>
                    </div>
                  </div>
                  {event.location && (
                    <p className="text-xs text-muted mt-3 flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-muted">{labels.noEvents}</p>
            </div>
          )}
        </div>
      </section>

      {/* Content Posts */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">{labels.posts}</h2>

          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="card p-6 hover:bg-surface-hover transition-colors">
                  <h3 className="font-semibold">{isAr ? post.title_ar : post.title_en}</h3>
                  <p className="text-sm text-muted mt-2 line-clamp-2">
                    {isAr ? post.body_ar : post.body_en}
                  </p>
                  <p className="text-xs text-muted mt-3">
                    {new Date(post.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-muted">{labels.noPosts}</p>
            </div>
          )}
        </div>
      </section>

      <Footer locale={locale} t={t} />
    </>
  );
}
