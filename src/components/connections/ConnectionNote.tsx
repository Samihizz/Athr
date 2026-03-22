"use client";

import { useState } from "react";

type ConnectionNoteProps = {
  initialNote?: string;
  onSave: (note: string) => void;
  onCancel: () => void;
  locale: string;
  title?: string;
};

export default function ConnectionNote({
  initialNote = "",
  onSave,
  onCancel,
  locale,
  title,
}: ConnectionNoteProps) {
  const [note, setNote] = useState(initialNote);
  const isAr = locale === "ar";

  const t = {
    addNote: isAr ? "أضف ملاحظة" : "Add a note",
    save: isAr ? "حفظ" : "Save",
    cancel: isAr ? "إلغاء" : "Cancel",
    placeholder: isAr
      ? "اكتب ملاحظة قصيرة (اختياري)..."
      : "Write a short note (optional)...",
    chars: `${note.length}/500`,
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="glass-strong rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="font-semibold mb-3">{title || t.addNote}</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          placeholder={t.placeholder}
          rows={4}
          className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
        />
        <div className="flex items-center justify-between mt-1 mb-4">
          <span className="text-xs text-muted">{t.chars}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onSave(note.trim())}
            className="flex-1 py-2.5 rounded-xl gradient-gold text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t.save}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl glass text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
