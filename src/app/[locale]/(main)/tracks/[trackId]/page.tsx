import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { tracks, getTrackById } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PageHeader from "@/components/PageHeader";
import WhatsAppGroupCard from "@/components/WhatsAppGroupCard";
import TrackFeed from "./TrackFeed";

const trackGradients: Record<string, string> = {
  ai: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
  creative: "linear-gradient(135deg, #EC4899 0%, #F43F5E 50%, #E11D48 100%)",
  business: "linear-gradient(135deg, #F59E0B 0%, #EAB308 50%, #CA8A04 100%)",
  marketing: "linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #0D9488 100%)",
  finance: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #0891B2 100%)",
  tech: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #7C3AED 100%)",
};

function parseSkills(skills: string | string[] | null): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // If JSON parse fails, try comma-separated
    return skills.split(",").map((s: string) => s.trim()).filter(Boolean);
  }
  return [];
}

export default async function AuthTrackPage({
  params,
}: {
  params: Promise<{ locale: string; trackId: string }>;
}) {
  const { locale, trackId } = await params;
  const track = getTrackById(trackId);
  if (!track) notFound();

  const isAr = locale === "ar";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_admin, avatar_url")
    .eq("id", user.id)
    .single();

  // Fetch members in this track
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, bio, city, skills, avatar_url")
    .eq("expertise", trackId)
    .limit(12);

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
    .select("id, title_en, title_ar, body_en, body_ar, created_at, author_id, author_name, author_avatar, track, media_url, media_type")
    .eq("track", trackId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  // Build track feed posts
  const trackFeedPosts = (posts || []).map((p) => ({
    id: p.id,
    body_en: p.body_en || "",
    body_ar: p.body_ar || "",
    author_name: p.author_name || "",
    author_avatar: p.author_avatar || undefined,
    created_at: p.created_at,
    media_url: p.media_url,
    media_type: p.media_type,
  }));

  const trackName = isAr ? track.ar.name : track.en.name;
  const trackDesc = isAr ? track.ar.description : track.en.description;

  const labels = {
    members: isAr ? "أعضاء المسار" : "Track Members",
    events: isAr ? "فعاليات المسار" : "Track Events",
    posts: isAr ? "منشورات المسار" : "Track Posts",
    noMembers: isAr ? "لا يوجد أعضاء في هذا المسار بعد" : "No members in this track yet",
    noEvents: isAr ? "لا توجد فعاليات قادمة" : "No upcoming events",
    noPosts: isAr ? "لا توجد منشورات بعد" : "No posts yet",
    viewProfile: isAr ? "عرض الملف" : "View Profile",
    allTracks: isAr ? "كل المسارات" : "All Tracks",
  };

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
          title={trackName}
          subtitle={trackDesc}
          coverGradient={trackGradients[trackId] || trackGradients.tech}
          locale={locale}
        />

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl mt-6">
          {/* Back to tracks */}
          <Link
            href={`/${locale}/tracks`}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
          >
            <svg
              className="h-4 w-4 rtl:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {labels.allTracks}
          </Link>

          {/* WhatsApp Group */}
          <div className="mb-10">
            <WhatsAppGroupCard
              trackName={trackName}
              trackId={track.id}
              whatsappLink={track.whatsappGroup}
              locale={locale}
            />
          </div>



          {/* Track Members */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{labels.members}</h2>

            {members && members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {members.map((member) => {
                  const skillsList = parseSkills(member.skills);
                  return (
                    <Link
                      key={member.id}
                      href={`/${locale}/members/${member.id}`}
                      className="card p-5 flex flex-col gap-3 hover:border-primary-light/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                          {member.full_name?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {member.full_name}
                          </h3>
                          {member.city && (
                            <p className="text-xs text-muted">{member.city}</p>
                          )}
                        </div>
                      </div>
                      {member.bio && (
                        <p className="text-xs text-muted line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                      {skillsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skillsList.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="card p-10 text-center">
                <p className="text-muted">{labels.noMembers}</p>
              </div>
            )}
          </section>

          {/* Track Events */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{labels.events}</h2>

            {events && events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="card p-5 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 glass rounded-xl px-3 py-2 text-center min-w-[60px]">
                        <div className="text-xs text-muted">
                          {new Date(event.event_date).toLocaleDateString(
                            isAr ? "ar-SA" : "en-US",
                            { month: "short" }
                          )}
                        </div>
                        <div className="text-lg font-bold text-gold">
                          {new Date(event.event_date).getDate()}
                        </div>
                      </div>
                    </div>
                    {event.location && (
                      <p className="text-xs text-muted mt-3 flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
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
          </section>

          {/* Track Feed — members can post here */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{labels.posts}</h2>
            <TrackFeed
              trackId={trackId}
              trackName={trackName}
              locale={locale}
              userId={user.id}
              userName={profile?.full_name || user.email || ""}
              userAvatar={profile?.avatar_url as string | undefined}
              initialPosts={trackFeedPosts}
            />
          </section>
        </div>
      </main>
    </>
  );
}
