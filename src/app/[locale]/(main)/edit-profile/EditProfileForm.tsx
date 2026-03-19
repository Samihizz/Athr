"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadAvatar } from "@/lib/supabase/storage";
import { tracks } from "@/lib/tracks";

const cities = [
  "Dammam", "Khobar", "Dhahran", "Jubail", "Qatif",
  "Ras Tanura", "Safwa", "Tarut", "Saihat", "Al Ahsa",
];

type ProfileData = Record<string, unknown> | null;

export default function EditProfileForm({
  profile,
  locale,
  userId,
}: {
  profile: ProfileData;
  locale: string;
  userId: string;
}) {
  const router = useRouter();
  const isAr = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState((profile?.full_name as string) || "");
  const [phone, setPhone] = useState((profile?.phone as string) || "");
  const [bio, setBio] = useState((profile?.bio as string) || "");
  const [city, setCity] = useState((profile?.city as string) || "");
  const [expertise, setExpertise] = useState((profile?.expertise as string) || "");
  const [education, setEducation] = useState((profile?.education as string) || "");
  const [experience, setExperience] = useState((profile?.experience as string) || "");
  const [skills, setSkills] = useState(
    Array.isArray(profile?.skills) ? profile.skills.join(", ") : (profile?.skills as string) || ""
  );
  const [linkedin, setLinkedin] = useState((profile?.linkedin_url as string) || "");
  const [wantToLearn, setWantToLearn] = useState((profile?.want_to_learn as string) || "");
  const [avatarUrl, setAvatarUrl] = useState((profile?.avatar_url as string) || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const t = {
    fullName: isAr ? "الاسم الكامل" : "Full Name",
    phone: isAr ? "رقم الجوال" : "Phone Number",
    bio: isAr ? "نبذة عنك" : "Bio",
    bioPlaceholder: isAr ? "أخبرنا عن نفسك..." : "Tell us about yourself...",
    city: isAr ? "المدينة" : "City",
    selectCity: isAr ? "اختر مدينتك" : "Select your city",
    expertise: isAr ? "مجال الخبرة" : "Area of Expertise",
    selectExpertise: isAr ? "اختر مسارك" : "Select your track",
    education: isAr ? "التعليم" : "Education",
    experience: isAr ? "الخبرة" : "Experience",
    skills: isAr ? "المهارات" : "Skills",
    skillsPlaceholder: isAr ? "مثال: بايثون، إدارة المشاريع" : "e.g. Python, Project Management",
    linkedin: isAr ? "رابط لينكدإن" : "LinkedIn URL",
    wantToLearn: isAr ? "أريد تعلم" : "Want to Learn",
    wantToLearnPlaceholder: isAr ? "ما الذي تريد تعلمه؟" : "What do you want to learn?",
    save: isAr ? "حفظ التغييرات" : "Save Changes",
    saved: isAr ? "تم الحفظ بنجاح!" : "Saved successfully!",
    errorGeneric: isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.",
    changePhoto: isAr ? "تغيير الصورة" : "Change Photo",
    uploadPhoto: isAr ? "رفع صورة" : "Upload Photo",
    profilePhoto: isAr ? "صورة الملف الشخصي" : "Profile Photo",
  };

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError(isAr ? "حجم الصورة يجب أن يكون أقل من 2 ميجا" : "Image must be less than 2MB");
      return;
    }

    setAvatarUploading(true);
    setError("");

    const url = await uploadAvatar(userId, file);
    if (url) {
      setAvatarUrl(url);
      // Also update in DB immediately
      const supabase = createClient();
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    } else {
      setError(isAr ? "فشل رفع الصورة" : "Failed to upload photo");
    }
    setAvatarUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        bio,
        city,
        expertise,
        education,
        experience,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        linkedin_url: linkedin || null,
        want_to_learn: wantToLearn || null,
        profile_complete: true,
      })
      .eq("id", userId);

    if (updateError) {
      setError(t.errorGeneric);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setLoading(false);
  }

  const inputClass = "w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary-light transition-colors";

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-6">
      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
        <p className="text-sm font-medium text-muted">{t.profilePhoto}</p>
        <div className="relative group">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName || "Avatar"}
              width={96}
              height={96}
              className="h-24 w-24 rounded-2xl object-cover border-2 border-border"
            />
          ) : (
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-3xl font-bold text-foreground border-2 border-border">
              {fullName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute inset-0 rounded-2xl bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <span className="text-xs font-medium text-foreground">
              {avatarUploading ? "..." : (avatarUrl ? t.changePhoto : t.uploadPhoto)}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">{t.fullName}</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t.phone}</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className={inputClass} placeholder="+966..." />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t.bio}</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
          className={`${inputClass} resize-none placeholder:text-muted`}
          placeholder={t.bioPlaceholder} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">{t.city}</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
            <option value="">{t.selectCity}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t.expertise}</label>
          <select value={expertise} onChange={(e) => setExpertise(e.target.value)} className={inputClass}>
            <option value="">{t.selectExpertise}</option>
            {tracks.map((track) => <option key={track.id} value={track.id}>{isAr ? track.ar.name : track.en.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t.education}</label>
        <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t.experience}</label>
        <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t.skills}</label>
        <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
          className={inputClass} placeholder={t.skillsPlaceholder} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t.wantToLearn}</label>
        <input type="text" value={wantToLearn} onChange={(e) => setWantToLearn(e.target.value)}
          className={inputClass} placeholder={t.wantToLearnPlaceholder} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t.linkedin}</label>
        <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} dir="ltr"
          className={inputClass} placeholder="https://linkedin.com/in/yourprofile" />
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      {success && <p className="text-sm text-green-400 text-center">{t.saved}</p>}

      <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
        {loading ? "..." : t.save}
      </button>
    </form>
  );
}
