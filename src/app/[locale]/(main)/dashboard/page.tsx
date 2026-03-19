import Link from "next/link";
import { redirect } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { tracks, ATHR_COMMUNITY_WHATSAPP } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import OnboardingFlow from "@/components/OnboardingFlow";
import WhatsAppGroupCard, { CommunityWhatsAppCard } from "@/components/WhatsAppGroupCard";
import CalendarDownloadButton from "@/components/dashboard/CalendarDownloadButton";
import {
  DashboardFadeIn,
  AnimatedStatCard,
  AnimatedStatsRow,
  AnimatedStatsItem,
  AnimatedQuickLinks,
  AnimatedQuickLink,
  AnimatedSection,
} from "@/components/dashboard/AnimatedDashboard";

export default async function DashboardPage({
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
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: stats } = await supabase
    .from("community_stats")
    .select("*")
    .single();

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(3);

  const { data: recentPosts } = await supabase
    .from("content_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(2);

  // Fetch user's event registrations for calendar icon
  const { data: myRegistrations } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("profile_id", user.id);
  const registeredEventIds = new Set(myRegistrations?.map((r: { event_id: string }) => r.event_id) || []);

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email;
  const userTrack = tracks.find((t) => t.id === profile?.expertise);

  const t = {
    welcome: isAr ? `حبابك، ${displayName}` : `Welcome, ${displayName}`,
    subtitle: isAr ? "إليك آخر المستجدات في مجتمعك" : "Here's what's happening in your community",
    stats: isAr ? "إحصائيات المجتمع" : "Community Stats",
    members: isAr ? "شفت" : "Members",
    mentors: isAr ? "خبير" : "Mentors",
    upcoming: isAr ? "البرامج الجاية" : "Upcoming Events",
    noEvents: isAr ? "ما في برامج جاية" : "No upcoming events",
    latestContent: isAr ? "آخر الشمارات" : "Latest Content",
    noPosts: isAr ? "ما في شمارات لسه" : "No content yet",
    announcements: isAr ? "الإعلانات" : "Announcements",
    viewAll: isAr ? "عرض الكل" : "View All",
    yourTrack: isAr ? "مسارك" : "Your Track",
    completeProfile: isAr ? "أكمل ملفك الشخصي" : "Complete Your Profile",
    completeProfileDesc: isAr ? "أضف معلوماتك عشان نوصلك بالشفاتة المناسبين" : "Add your info to connect with the right members",
    quickLinks: isAr ? "روابط سريعة" : "Quick Links",
    events: isAr ? "البرامج" : "Events",
    community: isAr ? "الشفاتة في المنطقة" : "Member Directory",
    feed: isAr ? "الشمارات" : "Content Feed",
    editProfile: isAr ? "تعديل الملف" : "Edit Profile",
    news: isAr ? "الأخبار" : "News",
    trackGroup: isAr ? "قروب مسارك" : "Your Track Group",
  };

  return (
    <>
      <AuthNavbar locale={locale} userName={displayName} userId={user.id} isAdmin={profile?.is_admin} />
      <OnboardingFlow
        locale={locale}
        userId={user.id}
        profileComplete={!!profile?.profile_complete}
        hasBio={!!profile?.bio}
        hasExpertise={!!profile?.expertise}
        initialName={displayName || ""}
        initialAvatarUrl={(profile?.avatar_url as string) || ""}
      />
      <DashboardFadeIn>
        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          {/* Header */}
          <AnimatedSection className="mb-8">
            <h1 className="text-3xl font-bold">{t.welcome}</h1>
            <p className="mt-2 text-muted">{t.subtitle}</p>
          </AnimatedSection>

          {/* Announcements */}
          {announcements && announcements.length > 0 && (
            <AnimatedSection className="mb-8 space-y-3" delay={0.05}>
              {announcements.map((a: Record<string, string>) => (
                <div key={a.id} className="glass-strong rounded-xl p-4 border-l-4 border-gold">
                  <h3 className="font-semibold text-gold">{isAr ? a.title_ar : a.title_en}</h3>
                  <p className="text-sm text-muted mt-1">{isAr ? a.body_ar : a.body_en}</p>
                </div>
              ))}
            </AnimatedSection>
          )}

          {/* Complete profile nudge */}
          {!profile?.profile_complete && !profile?.bio && (
            <AnimatedSection delay={0.1}>
              <Link
                href={`/${locale}/edit-profile`}
                className="block mb-8 glass rounded-xl p-6 border border-gold/30 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">✏️</div>
                  <div>
                    <h3 className="font-semibold">{t.completeProfile}</h3>
                    <p className="text-sm text-muted mt-1">{t.completeProfileDesc}</p>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          )}

          {/* Stats row */}
          <AnimatedStatsRow className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <AnimatedStatsItem>
              <AnimatedStatCard value={stats?.total_members || 0} label={t.members} />
            </AnimatedStatsItem>
            <AnimatedStatsItem>
              <AnimatedStatCard value={stats?.mentors || 0} label={t.mentors} />
            </AnimatedStatsItem>
            {userTrack && (
              <AnimatedStatsItem className="col-span-2">
                <div className="glass rounded-xl p-5 text-center">
                  <img src={userTrack.icon} alt="" className="w-8 h-8 rounded mx-auto" />
                  <div className="text-xs text-muted mt-1">{t.yourTrack}: {isAr ? userTrack.ar.name : userTrack.en.name}</div>
                </div>
              </AnimatedStatsItem>
            )}
          </AnimatedStatsRow>

          {/* Quick links */}
          <AnimatedQuickLinks className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
            {[
              { href: `/${locale}/events`, icon: "📅", label: t.events },
              { href: `/${locale}/community`, icon: "👥", label: t.community },
              { href: `/${locale}/feed`, icon: "📰", label: t.feed },
              { href: `/${locale}/news`, icon: "🗞️", label: t.news },
              { href: `/${locale}/edit-profile`, icon: "✏️", label: t.editProfile },
            ].map((link) => (
              <AnimatedQuickLink key={link.href}>
                <Link
                  href={link.href}
                  className="glass rounded-xl p-4 text-center hover:bg-surface-hover transition-colors block"
                >
                  <div className="text-xl mb-1">{link.icon}</div>
                  <div className="text-xs font-medium">{link.label}</div>
                </Link>
              </AnimatedQuickLink>
            ))}
          </AnimatedQuickLinks>

          {/* WhatsApp Groups */}
          <AnimatedSection className="mb-10 space-y-4" delay={0.15}>
            {userTrack && (
              <div>
                <h2 className="text-lg font-bold mb-3">{t.trackGroup}</h2>
                <WhatsAppGroupCard
                  trackName={isAr ? userTrack.ar.name : userTrack.en.name}
                  trackIcon={userTrack.icon}
                  whatsappLink={userTrack.whatsappGroup}
                  locale={locale}
                />
              </div>
            )}
            <CommunityWhatsAppCard whatsappLink={ATHR_COMMUNITY_WHATSAPP} locale={locale} />
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <AnimatedSection delay={0.1}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t.upcoming}</h2>
                <Link href={`/${locale}/events`} className="text-sm text-gold hover:text-gold-light transition-colors">{t.viewAll}</Link>
              </div>
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event: Record<string, string>) => (
                    <div key={event.id} className="glass rounded-xl p-4 hover:bg-surface-hover transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{event.title}</h3>
                          {event.location && <p className="text-xs text-muted mt-1">{event.location}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {registeredEventIds.has(event.id) && (
                            <CalendarDownloadButton
                              event={event}
                              label={isAr ? "أضف للتقويم" : "Add to Calendar"}
                            />
                          )}
                          <div className="shrink-0 text-center">
                            <div className="text-xs text-muted">
                              {new Date(event.event_date).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short" })}
                            </div>
                            <div className="text-lg font-bold text-gold">
                              {new Date(event.event_date).getDate()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-8 text-center">
                  <p className="text-sm text-muted">{t.noEvents}</p>
                </div>
              )}
            </AnimatedSection>

            {/* Recent Content */}
            <AnimatedSection delay={0.2}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t.latestContent}</h2>
                <Link href={`/${locale}/feed`} className="text-sm text-gold hover:text-gold-light transition-colors">{t.viewAll}</Link>
              </div>
              {recentPosts && recentPosts.length > 0 ? (
                <div className="space-y-3">
                  {recentPosts.map((post: Record<string, string>) => (
                    <Link key={post.id} href={`/${locale}/feed`} className="block glass rounded-xl p-4 hover:bg-surface-hover transition-colors">
                      <h3 className="font-semibold text-sm">{isAr ? post.title_ar : post.title_en}</h3>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{isAr ? post.body_ar : post.body_en}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-8 text-center">
                  <p className="text-sm text-muted">{t.noPosts}</p>
                </div>
              )}
            </AnimatedSection>
          </div>
        </main>
      </DashboardFadeIn>
    </>
  );
}
