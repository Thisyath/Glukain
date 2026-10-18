/** Pembantu format tampilan (locale id-ID) yang dipakai lintas halaman. */

/** Ukuran berkas manusiawi, mis. "2,4 MB". */
export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })} ${units[index]}`;
}

/** Label jenis berkas dari MIME, mis. "application/pdf" → "PDF". */
export function fileTypeLabel(mimeType?: string | null): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF';
    case 'image/jpeg':
      return 'JPG';
    case 'image/png':
      return 'PNG';
    default:
      return mimeType ? mimeType.split('/').pop()!.toUpperCase() : 'Berkas';
  }
}

/** Tanggal panjang, mis. "12 Oktober 2026". */
export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Tanggal + jam, mis. "12 Oktober 2026, 09.30". */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${formatDate(iso)}, ${date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

/** Nilai untuk `<input type="date">` (YYYY-MM-DD) dari ISO. */
export function toDateInputValue(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Tanggal hari ini untuk `<input type="date">` (YYYY-MM-DD). */
export function todayDateInputValue(): string {
  return toDateInputValue(new Date().toISOString());
}

/** Angka gaya Indonesia, mis. 8.2 → "8,2". */
export function formatNumber(value?: number | null): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('id-ID', { maximumFractionDigits: 2 });
}
