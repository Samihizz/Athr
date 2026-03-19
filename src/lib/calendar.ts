/**
 * ICS Calendar Export Utility
 * Generates .ics file content compatible with Google Calendar, Apple Calendar, and Outlook.
 */

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatICSDate(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}@athr.app`;
}

export function generateICS(event: {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}): string {
  const now = formatICSDate(new Date().toISOString());
  const dtStart = formatICSDate(event.startDate);
  // Default to 2 hours duration if no end date
  const endDate =
    event.endDate ||
    new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000).toISOString();
  const dtEnd = formatICSDate(endDate);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Athr Platform//Event//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${generateUID()}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICSText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICSText(event.location)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

export function downloadICS(event: {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const slug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const a = document.createElement("a");
  a.href = url;
  a.download = `athr-event-${slug}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
