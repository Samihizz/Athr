import { type Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/get-translations";
import { tracks } from "@/lib/tracks";
import { MAX_MEMBERS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimatedHero from "@/components/landing/AnimatedHero";
import AnimatedFeatures from "@/components/landing/AnimatedFeatures";
import AnimatedTracks from "@/components/landing/AnimatedTracks";
import AnimatedStats from "@/components/landing/AnimatedStats";
import AnimatedCTA from "@/components/landing/AnimatedCTA";

const trackImages: Record<string, string> = {
  ai: "/images/tracks/ai.png",
  creative: "/images/tracks/creative.png",
  business: "/images/tracks/business.png",
  marketing: "/images/tracks/marketing.png",
  finance: "/images/tracks/finance.png",
  tech: "/images/tracks/tech.png",
};

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations(locale as Locale);
  const isAr = locale === "ar";

  // Fetch current member count for capacity display
  let memberCount = 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (count !== null) memberCount = count;
  } catch {
    // If fetch fails, show 0 — non-critical
  }

  const heroStats = [
    { value: `${memberCount}/${MAX_MEMBERS}`, label: t.landing.statsMembers },
    { value: "50+", label: t.landing.statsEvents },
    { value: "80+", label: t.landing.statsMentors },
  ];

  const bannerStats = [
    { value: `${memberCount}/${MAX_MEMBERS}`, label: t.landing.statsMembers },
    { value: "50+", label: t.landing.statsEvents },
    { value: "80+", label: t.landing.statsMentors },
    { value: "5", label: t.landing.statsCities },
  ];

  const featureIcons = [
    { icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.997M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>, color: "from-primary/20 to-primary/5" },
    { icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>, color: "from-gold/15 to-gold/5" },
    { icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>, color: "from-primary/15 to-primary/5" },
    { icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>, color: "from-gold/20 to-gold/5" },
    { icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>, color: "from-primary/20 to-primary/5" },
    { icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>, color: "from-gold/15 to-gold/5" },
  ];

  return (
    <>
      <Navbar locale={locale} t={t} />

      {/* ── Hero Section ── */}
      <AnimatedHero locale={locale} isAr={isAr} t={t} stats={heroStats} />

      {/* ── Divider ── */}
      <div className="section-divider mx-auto max-w-7xl" />

      {/* ── Features Section ── */}
      <AnimatedFeatures t={t} features={featureIcons} />

      {/* ── Divider ── */}
      <div className="section-divider mx-auto max-w-7xl" />

      {/* ── Tracks Section ── */}
      <AnimatedTracks
        locale={locale}
        isAr={isAr}
        t={t}
        tracks={tracks}
        trackImages={trackImages}
      />

      {/* ── Stats Banner ── */}
      <AnimatedStats stats={bannerStats} />

      {/* ── CTA Section ── */}
      <AnimatedCTA locale={locale} t={t} />

      <Footer locale={locale} t={t} />
    </>
  );
}
