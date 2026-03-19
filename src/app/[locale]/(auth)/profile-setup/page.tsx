"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { tracks } from "@/lib/tracks";

const cities = [
  "Dammam", "Khobar", "Dhahran", "Jubail", "Qatif",
  "Ras Tanura", "Safwa", "Tarut", "Saihat",
];

export default function ProfileSetupPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const isAr = locale === "ar";

  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [expertise, setExpertise] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = {
    title: isAr ? "أكمل ملفك الشخصي" : "Complete Your Profile",
    subtitle: isAr ? "أخبرنا عن نفسك حتى نتمكن من ربطك بالأشخاص المناسبين" : "Tell us about yourself so we can connect you with the right people",
    bio: isAr ? "نبذة عنك" : "Bio",
    bioPlaceholder: isAr ? "أخبرنا عن نفسك..." : "Tell us about yourself...",
    city: isAr ? "المدينة" : "City",
    selectCity: isAr ? "اختر مدينتك" : "Select your city",
    expertise: isAr ? "مجال الخبرة" : "Area of Expertise",
    selectExpertise: isAr ? "اختر مسارك" : "Select your track",
    education: isAr ? "التعليم" : "Education",
    educationPlaceholder: isAr ? "خلفيتك التعليمية" : "Your educational background",
    experience: isAr ? "الخبرة" : "Experience",
    experiencePlaceholder: isAr ? "خبرتك المهنية" : "Your professional experience",
    skills: isAr ? "المهارات" : "Skills",
    skillsPlaceholder: isAr ? "مثال: بايثون، إدارة المشاريع، التصميم" : "e.g. Python, Project Management, Design",
    linkedin: isAr ? "رابط لينكدإن" : "LinkedIn URL",
    linkedinPlaceholder: "https://linkedin.com/in/yourprofile",
    save: isAr ? "حفظ والمتابعة" : "Save & Continue",
    skip: isAr ? "تخطي الآن" : "Skip for now",
    errorGeneric: isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        bio,
        city,
        expertise,
        education,
        experience,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        linkedin_url: linkedin || null,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(t.errorGeneric);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  function handleSkip() {
    router.push(`/${locale}/dashboard`);
  }

  return (
    <div className="glass-strong rounded-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 text-sm text-muted">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1.5">
            {t.bio}
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder={t.bioPlaceholder}
          />
        </div>

        {/* City & Expertise */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1.5">
              {t.city}
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">{t.selectCity}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="expertise" className="block text-sm font-medium mb-1.5">
              {t.expertise}
            </label>
            <select
              id="expertise"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">{t.selectExpertise}</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {isAr ? track.ar.name : track.en.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Education */}
        <div>
          <label htmlFor="education" className="block text-sm font-medium mb-1.5">
            {t.education}
          </label>
          <input
            id="education"
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            placeholder={t.educationPlaceholder}
          />
        </div>

        {/* Experience */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium mb-1.5">
            {t.experience}
          </label>
          <input
            id="experience"
            type="text"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            placeholder={t.experiencePlaceholder}
          />
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium mb-1.5">
            {t.skills}
          </label>
          <input
            id="skills"
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            placeholder={t.skillsPlaceholder}
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium mb-1.5">
            {t.linkedin}
          </label>
          <input
            id="linkedin"
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            placeholder={t.linkedinPlaceholder}
            dir="ltr"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-gold text-background font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "..." : t.save}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="w-full py-3 rounded-xl border border-border text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          {t.skip}
        </button>
      </form>
    </div>
  );
}
