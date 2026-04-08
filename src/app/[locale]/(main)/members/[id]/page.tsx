import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import TrackIcon from "@/components/TrackIcon";
import { getUserBadges } from "@/lib/badges";
import AuthNavbar from "@/components/layout/AuthNavbar";
import ConnectButton from "@/components/ConnectButton";
import { BadgeRow } from "@/components/ActivityBadge";

/* ── Track color mapping ── */
function getTrackColor(trackId: string): string {
  const colors: Record<string, string> = {
    ai: "#8B5CF6",
    creative: "#EC4899",
    business: "#F59E0B",
    marketing: "#10B981",
    finance: "#3B82F6",
    tech: "#6366F1",
  };
  return colors[trackId] || "#CCA300";
}

/* ── Parse comma-separated or array fields safely ── */
function parseList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) redirect(`/${locale}/login`);

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", user.id)
    .single();

  const { data: member, error: memberError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!member || memberError) notFound();

  const memberTrack = tracks.find((t) => t.id === member.expertise);
  const isOwnProfile = user.id === id;
  const trackColor = getTrackColor(member.expertise ?? "");
  const skills = parseList(member.skills);
  const wantToLearn = parseList(member.want_to_learn);
  const isVerified = !!(member as Record<string, unknown>).verified;

  // Fetch the connection between current user and this member
  let connectionNote: string | null = null;
  let isConnected = false;
  if (!isOwnProfile) {
    const { data: conn } = await supabase
      .from("connections")
      .select("status, note")
      .or(
        `and(requester_id.eq.${user.id},receiver_id.eq.${id}),and(requester_id.eq.${id},receiver_id.eq.${user.id})`
      )
      .eq("status", "accepted")
      .limit(1)
      .single();
    if (conn) {
      isConnected = true;
      connectionNote = conn.note;
    }
  }

  // Fetch mutual connections count
  let mutualCount = 0;
  if (!isOwnProfile) {
    // Get current user's accepted connections
    const { data: myConns } = await supabase
      .from("connections")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted");

    // Get member's accepted connections
    const { data: theirConns } = await supabase
      .from("connections")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${id},receiver_id.eq.${id}`)
      .eq("status", "accepted");

    if (myConns && theirConns) {
      const myFriends = new Set(
        myConns.map((c: { requester_id: string; receiver_id: string }) =>
          c.requester_id === user.id ? c.receiver_id : c.requester_id
        )
      );
      const theirFriends = new Set(
        theirConns.map((c: { requester_id: string; receiver_id: string }) =>
          c.requester_id === id ? c.receiver_id : c.requester_id
        )
      );
      for (const f of myFriends) {
        if (theirFriends.has(f)) mutualCount++;
      }
    }
  }

  // Fetch activity badges for this member
  const memberBadges = await getUserBadges(id, supabase);

  const initials = (member.full_name ?? "?")
    .split(" ")
    .map((w: string) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const t = {
    back: isAr ? "العودة للأعضاء" : "Back to Directory",
    bio: isAr ? "نبذة" : "About",
    education: isAr ? "التعليم" : "Education",
    experience: isAr ? "الخبرة" : "Experience",
    skills: isAr ? "المهارات" : "Skills",
    track: isAr ? "المسار" : "Track",
    city: isAr ? "المدينة" : "City",
    linkedin: isAr ? "لينكدإن" : "LinkedIn",
    editProfile: isAr ? "عدّل ملفك" : "Edit Profile",
    shareProfile: isAr ? "شارك الملف" : "Share Profile",
    wantToLearn: isAr ? "عايز يتعلم" : "Wants to Learn",
    memberSince: isAr ? "عضو من" : "Member since",
    phone: isAr ? "الهاتف" : "Phone",
    mutualConnections: isAr ? "معارف مشتركين" : "Mutual connections",
    connectionNote: isAr ? "ملاحظة الاتصال" : "Connection note",
  };

  const profileUrl = `https://athrsa.org/${locale}/members/${id}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${member.full_name} — ${isAr ? "عضو في أثر" : "Athr Member"}\n${profileUrl}`
  )}`;

  const joinDate = member.created_at
    ? new Date(member.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <>
      <AuthNavbar
        locale={locale}
        userName={currentProfile?.full_name || user.email || ""}
        userId={user.id}
        isAdmin={currentProfile?.is_admin}
      />

      <main className="relative min-h-screen overflow-hidden">
        {/* ── Background Orbs ── */}
        <div
          className="profile-orb profile-orb-1"
          style={{ background: trackColor, opacity: 0.15 }}
        />
        <div
          className="profile-orb profile-orb-2"
          style={{ background: "#CCA300", opacity: 0.1 }}
        />
        <div
          className="profile-orb profile-orb-3"
          style={{ background: trackColor, opacity: 0.08 }}
        />

        <div className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          {/* ── Back Link ── */}
          <Link
            href={`/${locale}/community`}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6 animate-fade-in-up"
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
            {t.back}
          </Link>

          {/* ══════════════════════════════════════════
              HERO / COVER SECTION
          ══════════════════════════════════════════ */}
          <section className="animate-fade-in-up animate-delay-100">
            <div className="relative rounded-3xl overflow-hidden">
              {/* Gradient Banner */}
              <div
                className="h-48 sm:h-56 relative"
                style={{
                  background: `linear-gradient(135deg, ${trackColor}33 0%, #CCA30022 40%, ${trackColor}18 100%)`,
                }}
              >
                {/* Decorative SVG Patterns */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-[0.07]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="dots"
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="2" cy="2" r="1.5" fill="currentColor" />
                    </pattern>
                    <pattern
                      id="diag"
                      x="0"
                      y="0"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(30)"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="40"
                        stroke="currentColor"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                  <rect width="100%" height="100%" fill="url(#diag)" opacity="0.5" />
                </svg>

                {/* Geometric accents */}
                <div
                  className="absolute top-6 right-8 w-24 h-24 rounded-full border opacity-10"
                  style={{ borderColor: trackColor }}
                />
                <div
                  className="absolute top-16 right-20 w-12 h-12 rounded-full border opacity-[0.06]"
                  style={{ borderColor: trackColor }}
                />
                <div
                  className="absolute bottom-8 left-12 w-16 h-16 rotate-45 border opacity-[0.08]"
                  style={{ borderColor: "#CCA300" }}
                />
                <div
                  className="absolute top-8 left-1/3 w-20 h-[1px] opacity-10"
                  style={{ background: trackColor }}
                />
                <div
                  className="absolute bottom-12 right-1/3 w-32 h-[1px] opacity-[0.06]"
                  style={{ background: "#CCA300" }}
                />
              </div>

              {/* Glass card overlapping the banner bottom */}
              <div className="relative -mt-20 mx-4 sm:mx-8">
                <div className="glass-strong rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                    {/* Avatar */}
                    <div className="-mt-20 sm:-mt-24 shrink-0">
                      <div
                        className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-background overflow-hidden"
                        style={{
                          boxShadow: `0 0 30px ${trackColor}20`,
                        }}
                      >
                        {member.avatar_url ? (
                          <Image
                            src={member.avatar_url}
                            alt={member.full_name ?? ""}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${trackColor}, ${trackColor}88)`,
                            }}
                          >
                            {initials}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name & Meta */}
                    <div className="flex-1 text-center sm:text-start pb-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                          {member.full_name}
                        </h1>
                        {isVerified && (
                          <span title="Verified">
                            <svg
                              className="w-6 h-6 text-gold"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 flex-wrap">
                        {/* Track badge */}
                        {memberTrack && (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                            style={{
                              background: `${trackColor}18`,
                              color: trackColor,
                              border: `1px solid ${trackColor}30`,
                            }}
                          >
                            <TrackIcon trackId={memberTrack.id} size={14} />
                            {isAr ? memberTrack.ar.name : memberTrack.en.name}
                          </span>
                        )}

                        {/* City */}
                        {member.city && (
                          <span className="inline-flex items-center gap-1 text-sm text-muted">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {member.city}
                          </span>
                        )}
                      </div>

                      {/* Member since */}
                      {joinDate && (
                        <p className="text-xs text-muted mt-1.5">
                          {t.memberSince} {joinDate}
                        </p>
                      )}

                      {/* Mutual connections */}
                      {!isOwnProfile && mutualCount > 0 && (
                        <p className="text-xs text-gold mt-1.5 inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          {mutualCount} {t.mutualConnections}
                        </p>
                      )}

                      {/* Activity Badges */}
                      {memberBadges.length > 0 && (
                        <div className="mt-3">
                          <BadgeRow badges={memberBadges} locale={locale} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connection note */}
                  {isConnected && connectionNote && (
                    <div className="mt-4 p-3 rounded-xl bg-surface border border-border">
                      <p className="text-xs text-muted mb-1 font-semibold">{t.connectionNote}</p>
                      <p className="text-sm text-foreground/80 italic">&ldquo;{connectionNote}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              BIO SECTION
          ══════════════════════════════════════════ */}
          {member.bio && (
            <section className="mt-6 animate-fade-in-up animate-delay-200">
              <div className="glass rounded-2xl p-6 sm:p-8 profile-detail-card">
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                  {t.bio}
                </h2>
                <p className="text-sm sm:text-base text-foreground/85 leading-relaxed whitespace-pre-line">
                  {member.bio}
                </p>
              </div>
            </section>
          )}

          {/* ── Decorative Divider ── */}
          <div className="section-divider my-6 animate-fade-in-up animate-delay-200" />

          {/* ══════════════════════════════════════════
              DETAILS GRID
          ══════════════════════════════════════════ */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up animate-delay-300">
            {/* Education */}
            {member.education && (
              <div className="glass rounded-2xl p-5 profile-detail-card">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4.5 h-4.5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                    />
                  </svg>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {t.education}
                  </h3>
                </div>
                <p className="text-sm text-foreground/85">{member.education}</p>
              </div>
            )}

            {/* Experience */}
            {member.experience && (
              <div className="glass rounded-2xl p-5 profile-detail-card">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4.5 h-4.5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {t.experience}
                  </h3>
                </div>
                <p className="text-sm text-foreground/85">{member.experience}</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="glass rounded-2xl p-5 profile-detail-card sm:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4.5 h-4.5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                    />
                  </svg>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {t.skills}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{
                        background: `${trackColor}15`,
                        color: trackColor,
                        border: `1px solid ${trackColor}25`,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Want to Learn */}
            {wantToLearn.length > 0 && (
              <div className="glass rounded-2xl p-5 profile-detail-card sm:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4.5 h-4.5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                    />
                  </svg>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {t.wantToLearn}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wantToLearn.map((item) => (
                    <span
                      key={item}
                      className="text-xs px-3 py-1.5 rounded-full font-medium bg-primary/10 text-primary-light border border-primary/20"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* LinkedIn */}
            {member.linkedin_url && (
              <div className="glass rounded-2xl p-5 profile-detail-card">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4.5 h-4.5 text-muted"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {t.linkedin}
                  </h3>
                </div>
                <a
                  href={member.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: trackColor }}
                >
                  {member.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/\/$/, "") || t.linkedin}
                </a>
              </div>
            )}

            {/* Phone */}
            {member.phone && (
              <div className="glass rounded-2xl p-5 profile-detail-card">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4.5 h-4.5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {t.phone}
                  </h3>
                </div>
                <p className="text-sm text-foreground/85 direction-ltr">{member.phone}</p>
              </div>
            )}
          </section>

          {/* ── Decorative Divider ── */}
          <div className="section-divider my-6 animate-fade-in-up animate-delay-400" />

          {/* ══════════════════════════════════════════
              ACTIONS ROW
          ══════════════════════════════════════════ */}
          <section className="animate-fade-in-up animate-delay-400">
            <div className="glass rounded-2xl p-5 sm:p-6 profile-detail-card">
              <div className="flex flex-wrap items-center gap-3">
                {/* Connect button area */}
                {!isOwnProfile && (
                  <div id="connect-button">
                    <ConnectButton
                      currentUserId={user.id}
                      targetUserId={id}
                      locale={locale}
                    />
                  </div>
                )}

                {/* Edit Profile */}
                {isOwnProfile && (
                  <Link
                    href={`/${locale}/edit-profile`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-gold text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                      />
                    </svg>
                    {t.editProfile}
                  </Link>
                )}

                {/* WhatsApp Share */}
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-surface-hover transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t.shareProfile}
                </a>

                {/* LinkedIn quick link */}
                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-surface-hover transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    {t.linkedin}
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
