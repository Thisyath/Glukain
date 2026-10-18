/**
 * Waktu disimpan UTC, ditampilkan sesuai zona waktu pasien.
 */

export function toUTC(date: Date | string): Date {
  if (date instanceof Date) return date;
  return new Date(date);
}

export function formatForTimezone(date: Date, timezone: string): string {
  return date.toLocaleString('id-ID', { timeZone: timezone });
}

export function nowUTC(): Date {
  return new Date();
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}
