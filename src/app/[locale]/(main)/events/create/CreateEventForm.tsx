"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { tracks } from "@/lib/tracks";

export default function CreateEventForm({
  locale,
  userId,
}: {
  locale: string;
  userId: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [track, setTrack] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");

  const t = {
    eventTitle: isAr ? "اسم الفعالية" : "Event Title",
    eventTitleAr: isAr ? "اسم الفعالية (عربي - اختياري)" : "Event Title (Arabic - optional)",
    description: isAr ? "الوصف" : "Description",
    eventDate: isAr ? "تاريخ الفعالية" : "Event Date",
    eventTime: isAr ? "وقت الفعالية" : "Event Time",
    location: isAr ? "المكان" : "Location",
    track: isAr ? "المسار" : "Track",
    selectTrack: isAr ? "اختر مسار" : "Select a track",
    imageUrl: isAr ? "رابط الصورة (اختياري)" : "Image URL (optional)",
    maxAttendees: isAr ? "الحد الأقصى للحضور (اختياري)" : "Max Attendees (optional)",
    submit: isAr ? "أنشئ الفعالية" : "Create Event",
    submitting: isAr ? "جاري الإنشاء..." : "Creating...",
    required: isAr ? "مطلوب" : "Required",
    cancel: isAr ? "إلغاء" : "Cancel",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(isAr ? "اسم الفعالية مطلوب" : "Event title is required");
      return;
    }
    if (!eventDate) {
      setError(isAr ? "تاريخ الفعالية مطلوب" : "Event date is required");
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      let dateStr = eventDate;
      if (eventTime) {
        dateStr = `${eventDate}T${eventTime}:00`;
      } else {
        dateStr = `${eventDate}T00:00:00`;
      }

      const supabase = createClient();
      const { error: insertError } = await supabase.from("events").insert({
        title: title.trim(),
        description: description.trim() || null,
        event_date: dateStr,
        location: location.trim() || null,
        track: track || null,
        created_by: userId,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      router.push(`/${locale}/events`);
      router.refresh();
    } catch {
      setError(isAr ? "حدث خطأ، حاول مرة ثانية" : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t.eventTitle} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isAr ? "مثال: ورشة عمل الذكاء الاصطناعي" : "e.g. AI Workshop"}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted"
          required
        />
      </div>

      {/* Title AR */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t.eventTitleAr}
        </label>
        <input
          type="text"
          value={titleAr}
          onChange={(e) => setTitleAr(e.target.value)}
          dir="rtl"
          placeholder="مثال: ورشة عمل الذكاء الاصطناعي"
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.description}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder={isAr ? "وصف الفعالية..." : "Describe the event..."}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted resize-none"
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t.eventDate} <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t.eventTime}</label>
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.location}</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={isAr ? "مثال: الدمام، مركز الابتكار" : "e.g. Dammam Innovation Center"}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted"
        />
      </div>

      {/* Track */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.track}</label>
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground"
        >
          <option value="">{t.selectTrack}</option>
          {tracks.map((tr) => (
            <option key={tr.id} value={tr.id}>
              {isAr ? tr.ar.name : tr.en.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.imageUrl}</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted"
        />
      </div>

      {/* Max Attendees */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.maxAttendees}</label>
        <input
          type="number"
          value={maxAttendees}
          onChange={(e) => setMaxAttendees(e.target.value)}
          min="1"
          placeholder={isAr ? "مثال: 50" : "e.g. 50"}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none transition-colors text-foreground placeholder:text-muted"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl font-semibold text-sm gradient-gold text-background hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? t.submitting : t.submit}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/events`)}
          className="px-6 py-3 rounded-xl font-medium text-sm glass hover:bg-surface-hover transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
