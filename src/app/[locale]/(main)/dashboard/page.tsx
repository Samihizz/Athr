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
  QuickActionCard,
  SectionHeader,
  ProfileCompletionBar,
} from "@/components/dashboard/AnimatedDashboard";
import SuggestedConnections from "@/components/connections/SuggestedConnections";
import ReferralCard from "@/components/ReferralCard";
import { getUserBadges, isUserInactive7Days } from "@/lib/badges";
import { BadgeRow } from "@/components/ActivityBadge";
import WelcomeBackBanner from "@/components/dashboard/WelcomeBackBanner";

/* ─── SVG Icons (inline, no emoji) ─── */
function IconUsers({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function IconCalendar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function IconDocument({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function IconLink({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-1.061 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  );
}

function IconPen({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function IconBriefcase({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
    </svg>
  );
}

function IconAcademicCap({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}

function IconNewspaper({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
    </svg>
  );
}

function IconUserGroup({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}

function IconStorefront({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
    </svg>
  );
}

function IconMegaphone({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.75.75 0 0 1-1.021-.27l-.112-.194a8.305 8.305 0 0 1-.732-1.628m1.999-2.582a23.67 23.67 0 0 0 3.498-3.592A23.417 23.417 0 0 0 17.5 7.5c0-1.318-.22-2.586-.627-3.77a.75.75 0 0 0-.709-.508h-.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-.75c-.621 0-1.125-.504-1.125-1.125V4.347A.75.75 0 0 0 11.04 3.6a24.096 24.096 0 0 0-.7.155" />
    </svg>
  );
}

/* ─── Profile completion calculator ─── */
function calcProfileCompletion(profile: Record<string, unknown> | null): number {
  if (!profile) return 0;
  const fields = ["full_name", "bio", "expertise", "city", "avatar_url"];
  const filled = fields.filter((f) => !!profile[f]).length;
  return Math.round((filled / fields.length) * 100);
}

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

  // Parallelize ALL Supabase queries for performance
  const [
    { data: profile },
    { data: stats },
    { data: upcomingEvents },
    { data: recentPosts },
    { data: announcements },
    { data: pendingConnections },
    { data: acceptedConnections },
    { data: myRegistrations },
    { data: allMembers },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("community_stats").select("*").single(),
    supabase.from("events").select("*").gte("event_date", new Date().toISOString()).order("event_date", { ascending: true }).limit(3),
    supabase.from("content_posts").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(3),
    supabase.from("announcements").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(2),
    supabase.from("connections").select("id").eq("receiver_id", user.id).eq("status", "pending"),
    supabase.from("connections").select("id").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "accepted"),
    supabase.from("event_registrations").select("event_id").eq("profile_id", user.id),
    supabase.from("profiles").select("id, full_name, avatar_url, city, expertise"),
  ]);

  const pendingConnectionCount = pendingConnections?.length || 0;
  const connectionCount = acceptedConnections?.length || 0;
  const registeredEventIds = new Set(myRegistrations?.map((r: { event_id: string }) => r.event_id) || []);

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email;
  const firstName = (displayName || "").split(" ")[0];
  const userTrack = tracks.find((t) => t.id === profile?.expertise);
  const profileCompletion = calcProfileCompletion(profile);

  // Activity badges (parallel)
  const [userBadges, showWelcomeBack] = await Promise.all([
    getUserBadges(user.id, supabase),
    isUserInactive7Days(user.id, supabase),
  ]);

  const t = {
    welcomeBack: isAr ? `حبابك يا ${firstName}` : `Welcome back, ${firstName}`,
    subtitle: isAr ? "إليك آخر المستجدات في مجتمعك" : "Here's what's happening in your community",
    members: isAr ? "عضو" : "Members",
    events: isAr ? "فعالية" : "Events",
    posts: isAr ? "شمار" : "Posts",
    connections: isAr ? "اتصال" : "Connections",
    quickActions: isAr ? "اختصارات" : "Quick Actions",
    createPost: isAr ? "أنشر شمار" : "Create Post",
    createPostDesc: isAr ? "شارك خبرتك مع المجتمع" : "Share your expertise with the community",
    browseJobs: isAr ? "تصفح الفرص" : "Browse Jobs",
    browseJobsDesc: isAr ? "اكتشف فرص العمل المتاحة" : "Discover available opportunities",
    browseMarket: isAr ? "سوق الشرقية" : "Eastern Market",
    browseMarketDesc: isAr ? "اكتشف خدمات أعضاء المجتمع" : "Discover community services",
    findMentors: isAr ? "ابحث عن مرشد" : "Find Mentors",
    findMentorsDesc: isAr ? "تواصل مع خبراء في مجالك" : "Connect with experts in your field",
    createEvent: isAr ? "أنشئ فعالية" : "Create Event",
    createEventDesc: isAr ? "نظم لقاء أو ورشة عمل" : "Organize a meetup or workshop",
    myConnections: isAr ? "الفِرد" : "My Connections",
    myConnectionsDesc: isAr ? "تابع شبكة علاقاتك" : "Manage your network",
    shareNews: isAr ? "شارك خبر" : "Share News",
    shareNewsDesc: isAr ? "أضف خبر يهم المجتمع" : "Post news for the community",
    suggestedConnections: isAr ? "فِرد مقترحين" : "Suggested Connections",
    upcomingEvents: isAr ? "الفعاليات الجاية" : "Upcoming Events",
    noEvents: isAr ? "ما في فعاليات جاية" : "No upcoming events",
    recentPosts: isAr ? "آخر الشمارات" : "Recent Posts",
    noPosts: isAr ? "ما في شمارات لسه" : "No posts yet",
    announcementsTitle: isAr ? "الإعلانات" : "Announcements",
    whatsappGroups: isAr ? "قروبات واتساب" : "WhatsApp Groups",
    trackGroup: isAr ? "قروب مسارك" : "Your Track Group",
    viewAll: isAr ? "عرض الكل" : "View All",
    profileCompletion: isAr ? "اكتمال الملف الشخصي" : "Profile completion",
    completeProfile: isAr ? "أكمل ملفك الشخصي" : "Complete your profile",
    pendingRequests: isAr ? "طلبات اتصال جديدة" : "Pending requests",
    register: isAr ? "سجل" : "Register",
    addToCal: isAr ? "أضف للتقويم" : "Add to Calendar",
    myBadges: isAr ? "أوسمتك" : "Your Badges",
    noBadges: isAr ? "ما عندك أوسمة لسه — كن أكثر نشاطاً!" : "No badges yet — get more active!",
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
        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-6">

          {/* ── 0. Welcome Back Banner (inactive 7+ days) ── */}
          {showWelcomeBack && (
            <WelcomeBackBanner
              firstName={firstName}
              locale={locale}
              userId={user.id}
            />
          )}

          {/* ── 1. Welcome Banner ── */}
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-2xl glass-strong p-6 sm:p-8">
              {/* Subtle gold gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold/8 via-gold/4 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold">{t.welcomeBack}</h1>
                    <p className="mt-1.5 text-sm text-muted">{t.subtitle}</p>

                    {/* Track badge + city */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {userTrack && (
                        <span className="pill text-xs">
                          <img src={userTrack.icon} alt="" className="w-4 h-4 rounded" />
                          {isAr ? userTrack.ar.name : userTrack.en.name}
                        </span>
                      )}
                      {profile?.city && (
                        <span className="text-xs text-muted">{profile.city as string}</span>
                      )}
                    </div>
                  </div>

                  {/* Pending connections badge */}
                  {pendingConnectionCount > 0 && (
                    <Link
                      href={`/${locale}/connections`}
                      className="shrink-0 flex items-center gap-2 glass rounded-xl px-4 py-2.5 border border-gold/30 hover:bg-surface-hover transition-colors"
                    >
                      <div className="h-7 w-7 rounded-full gradient-gold flex items-center justify-center text-background font-bold text-xs">
                        {pendingConnectionCount}
                      </div>
                      <span className="text-xs font-medium">{t.pendingRequests}</span>
                    </Link>
                  )}
                </div>

                {/* Profile completion bar */}
                {profileCompletion < 100 && (
                  <Link href={`/${locale}/edit-profile`} className="block mt-4 group">
                    <ProfileCompletionBar
                      percentage={profileCompletion}
                      label={t.profileCompletion}
                    />
                    <p className="text-xs text-gold mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {t.completeProfile} &rarr;
                    </p>
                  </Link>
                )}
              </div>
            </div>
          </AnimatedSection>

          {/* ── 2. Quick Stats Row ── */}
          <AnimatedStatsRow className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnimatedStatsItem>
              <AnimatedStatCard
                value={stats?.total_members || 0}
                suffix="/500"
                label={t.members}
                icon={<IconUsers className="w-5 h-5" />}
              />
            </AnimatedStatsItem>
            <AnimatedStatsItem>
              <AnimatedStatCard
                value={upcomingEvents?.length || 0}
                label={t.events}
                icon={<IconCalendar className="w-5 h-5" />}
              />
            </AnimatedStatsItem>
            <AnimatedStatsItem>
              <AnimatedStatCard
                value={recentPosts?.length || 0}
                label={t.posts}
                icon={<IconDocument className="w-5 h-5" />}
              />
            </AnimatedStatsItem>
            <AnimatedStatsItem>
              <Link href={`/${locale}/connections`} className="block">
                <AnimatedStatCard
                  value={connectionCount}
                  label={t.connections}
                  icon={<IconLink className="w-5 h-5" />}
                />
              </Link>
            </AnimatedStatsItem>
          </AnimatedStatsRow>

          {/* ── 3. Quick Actions Grid ── */}
          <AnimatedSection delay={0.1}>
            <SectionHeader title={t.quickActions} />
            <AnimatedQuickLinks className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatedQuickLink>
                <QuickActionCard
                  href={`/${locale}/feed`}
                  icon={<IconPen className="w-5 h-5" />}
                  title={t.createPost}
                  description={t.createPostDesc}
                />
              </AnimatedQuickLink>
              <AnimatedQuickLink>
                <QuickActionCard
                  href={`/${locale}/jobs`}
                  icon={<IconBriefcase className="w-5 h-5" />}
                  title={t.browseJobs}
                  description={t.browseJobsDesc}
                />
              </AnimatedQuickLink>
              <AnimatedQuickLink>
                <QuickActionCard
                  href={`/${locale}/market`}
                  icon={<IconStorefront className="w-5 h-5" />}
                  title={t.browseMarket}
                  description={t.browseMarketDesc}
                />
              </AnimatedQuickLink>
              <AnimatedQuickLink>
                <QuickActionCard
                  href={`/${locale}/mentorship`}
                  icon={<IconAcademicCap className="w-5 h-5" />}
                  title={t.findMentors}
                  description={t.findMentorsDesc}
                />
              </AnimatedQuickLink>
              <AnimatedQuickLink>
                <QuickActionCard
                  href={`/${locale}/events/create`}
                  icon={<IconCalendar className="w-5 h-5" />}
                  title={t.createEvent}
                  description={t.createEventDesc}
                />
              </AnimatedQuickLink>
              <AnimatedQuickLink>
                <QuickActionCard
                  href={`/${locale}/connections`}
                  icon={<IconUserGroup className="w-5 h-5" />}
                  title={t.myConnections}
                  description={t.myConnectionsDesc}
                />
              </AnimatedQuickLink>
              <AnimatedQuickLink>
                <QuickActionCard
                  href={`/${locale}/news/create`}
                  icon={<IconNewspaper className="w-5 h-5" />}
                  title={t.shareNews}
                  description={t.shareNewsDesc}
                />
              </AnimatedQuickLink>
            </AnimatedQuickLinks>
          </AnimatedSection>

          {/* ── 4. Suggested Connections ── */}
          <AnimatedSection delay={0.15}>
            <SectionHeader
              title={t.suggestedConnections}
              viewAllHref={`/${locale}/connections`}
              viewAllLabel={t.viewAll}
            />
            <SuggestedConnections
              userId={user.id}
              userCity={profile?.city || null}
              userTrack={profile?.expertise || null}
              locale={locale}
              limit={6}
              layout="scroll"
            />
          </AnimatedSection>

          {/* ── 5. Two-Column Layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left column (wider) */}
            <div className="lg:col-span-3 space-y-6">

              {/* Upcoming Events */}
              <AnimatedSection delay={0.18}>
                <SectionHeader
                  title={t.upcomingEvents}
                  viewAllHref={`/${locale}/events`}
                  viewAllLabel={t.viewAll}
                />
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event: Record<string, string>) => (
                      <div key={event.id} className="glass rounded-xl p-4 hover:bg-surface-hover transition-colors">
                        <div className="flex items-center gap-4">
                          {/* Date block */}
                          <div className="shrink-0 w-14 h-14 rounded-xl bg-gold/10 flex flex-col items-center justify-center">
                            <div className="text-[10px] uppercase text-gold font-medium leading-none">
                              {new Date(event.event_date).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short" })}
                            </div>
                            <div className="text-xl font-bold text-gold leading-tight">
                              {new Date(event.event_date).getDate()}
                            </div>
                          </div>
                          {/* Event info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                            {event.location && <p className="text-xs text-muted mt-0.5 truncate">{event.location}</p>}
                          </div>
                          {/* Actions */}
                          <div className="shrink-0 flex items-center gap-2">
                            {registeredEventIds.has(event.id) ? (
                              <CalendarDownloadButton
                                event={event}
                                label={t.addToCal}
                              />
                            ) : (
                              <Link
                                href={`/${locale}/events`}
                                className="text-xs font-medium text-gold hover:text-gold-light transition-colors"
                              >
                                {t.register}
                              </Link>
                            )}
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

              {/* Recent Posts */}
              <AnimatedSection delay={0.22}>
                <SectionHeader
                  title={t.recentPosts}
                  viewAllHref={`/${locale}/feed`}
                  viewAllLabel={t.viewAll}
                />
                {recentPosts && recentPosts.length > 0 ? (
                  <div className="space-y-3">
                    {recentPosts.map((post: Record<string, string>) => (
                      <Link
                        key={post.id}
                        href={`/${locale}/feed`}
                        className="block glass rounded-xl p-4 hover:bg-surface-hover transition-colors"
                      >
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

            {/* Right column (narrower) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Referral Card — "جيب صاحبك" */}
              <AnimatedSection delay={0.16}>
                <ReferralCard
                  locale={locale}
                  userId={user.id}
                  referralCode={(profile?.referral_code as string) || null}
                  referralCount={(profile?.referral_count as number) || 0}
                  memberCount={stats?.total_members || 0}
                />
              </AnimatedSection>

              {/* Activity Badges */}
              <AnimatedSection delay={0.18}>
                <SectionHeader title={t.myBadges} />
                {userBadges.length > 0 ? (
                  <div className="glass rounded-xl p-4">
                    <BadgeRow badges={userBadges} locale={locale} />
                  </div>
                ) : (
                  <div className="glass rounded-xl p-6 text-center">
                    <p className="text-xs text-muted">{t.noBadges}</p>
                  </div>
                )}
              </AnimatedSection>

              {/* Announcements */}
              <AnimatedSection delay={0.2}>
                <SectionHeader title={t.announcementsTitle} />
                {announcements && announcements.length > 0 ? (
                  <div className="space-y-3">
                    {announcements.map((a: Record<string, string>) => (
                      <div key={a.id} className="glass-strong rounded-xl p-4 border-l-4 border-gold">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-0.5 text-gold">
                            <IconMegaphone className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-gold">{isAr ? a.title_ar : a.title_en}</h3>
                            <p className="text-xs text-muted mt-1 leading-relaxed">{isAr ? a.body_ar : a.body_en}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-xl p-6 text-center">
                    <p className="text-xs text-muted">{isAr ? "لا توجد إعلانات" : "No announcements"}</p>
                  </div>
                )}
              </AnimatedSection>

              {/* WhatsApp Groups */}
              <AnimatedSection delay={0.24}>
                <SectionHeader title={t.whatsappGroups} />
                <div className="space-y-3">
                  {userTrack && (
                    <WhatsAppGroupCard
                      trackName={isAr ? userTrack.ar.name : userTrack.en.name}
                      trackIcon={userTrack.icon}
                      whatsappLink={userTrack.whatsappGroup}
                      locale={locale}
                      variant="compact"
                    />
                  )}
                  <CommunityWhatsAppCard whatsappLink={ATHR_COMMUNITY_WHATSAPP} locale={locale} />
                </div>
              </AnimatedSection>
            </div>
          </div>

        </main>
      </DashboardFadeIn>
    </>
  );
}
