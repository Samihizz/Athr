"use client";

import { downloadICS } from "@/lib/calendar";

export default function CalendarDownloadButton({
  event,
  label,
}: {
  event: Record<string, string | undefined> & {
    title?: string;
    event_date?: string;
  };
  label: string;
}) {
  return (
    <button
      onClick={() =>
        downloadICS({
          title: event.title || "Athr Event",
          description: event.description,
          location: event.location,
          startDate: event.event_date || new Date().toISOString(),
        })
      }
      className="p-1.5 rounded-lg glass hover:bg-surface-hover transition-colors"
      title={label}
    >
      <svg
        className="w-4 h-4 text-gold/70 hover:text-gold transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="10" y1="16" x2="14" y2="16" />
      </svg>
    </button>
  );
}
