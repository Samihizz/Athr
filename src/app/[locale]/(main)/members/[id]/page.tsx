import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

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

  const t = {
    back: isAr ? "العودة للشفاتة" : "Back to Directory",
    mentor: isAr ? "خبير" : "Mentor",
    bio: isAr ? "نبذة" : "About",
    education: isAr ? "التعليم" : "Education",
    experience: isAr ? "الخبرة" : "Experience",
    skills: isAr ? "المهارات" : "Skills",
    track: isAr ? "المسار" : "Track",
    city: isAr ? "المدينة" : "City",
    linkedin: isAr ? "لينكدإن" : "LinkedIn",
    editProfile: isAr ? "تعديل ملفي" : "Edit My Profile",
    requestMentor: isAr ? "طلب خبير" : "Request Mentorship",
    shareProfile: isAr ? "مشاركة الملف" : "Share Profile",
    wantToLearn: isAr ? "يريد تعلم" : "Wants to Learn",
    joined: isAr ? "انضم" : "Joined",
  };

  const profileUrl = `https://athrsa.org/${locale}/members/${id}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${member.full_name} — ${isAr ? "شفت في أثر" : "Athr Member"}\n${profileUrl}`)}`;

  return (
    <>
      <AuthNavbar locale={locale} userName={currentProfile?.full_name || user.email || ""} userId={user.id} isAdmin={currentProfile?.is_admin} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <Link
          href={`/${locale}/community`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.back}
        </Link>

        <div className="glass-strong rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-start gap-5 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary-light shrink-0">
              {member.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{member.full_name}</h1>
                {member.is_mentor && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-medium">{t.mentor}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted mt-1 flex-wrap">
                {member.city && <span>📍 {member.city}</span>}
                {memberTrack && <span className="inline-flex items-center gap-1"><img src={memberTrack.icon} alt="" className="w-4 h-4 rounded inline" /> {isAr ? memberTrack.ar.name : memberTrack.en.name}</span>}
              </div>
              {member.created_at && (
                <p className="text-xs text-muted mt-1">
                  {t.joined} {new Date(member.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-2">{t.bio}</h2>
              <p className="text-sm text-muted leading-relaxed">{member.bio}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {member.education && (
              <div className="glass rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted mb-1">{t.education}</h3>
                <p className="text-sm">{member.education}</p>
              </div>
            )}
            {member.experience && (
              <div className="glass rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted mb-1">{t.experience}</h3>
                <p className="text-sm">{member.experience}</p>
              </div>
            )}
            {member.want_to_learn && (
              <div className="glass rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted mb-1">{t.wantToLearn}</h3>
                <p className="text-sm">{member.want_to_learn}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          {member.skills && (Array.isArray(member.skills) ? member.skills : String(member.skills).split(",").map((s: string) => s.trim()).filter(Boolean)).length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-2">{t.skills}</h2>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(member.skills) ? member.skills : String(member.skills).split(",").map((s: string) => s.trim()).filter(Boolean)).map((skill: string) => (
                  <span key={skill} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary-light">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            {isOwnProfile ? (
              <Link
                href={`/${locale}/edit-profile`}
                className="px-5 py-2 rounded-xl gradient-gold text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t.editProfile}
              </Link>
            ) : member.is_mentor ? (
              <Link
                href={`/${locale}/community`}
                className="px-5 py-2 rounded-xl gradient-gold text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t.requestMentor}
              </Link>
            ) : null}
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-xl glass text-sm hover:bg-surface-hover transition-colors"
              >
                {t.linkedin} →
              </a>
            )}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl glass text-sm hover:bg-surface-hover transition-colors"
            >
              📤 {t.shareProfile}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
