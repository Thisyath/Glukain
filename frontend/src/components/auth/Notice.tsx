import type { ReactNode } from 'react';

type NoticeTone = 'success' | 'danger' | 'info';

const TONE_CLASSES: Record<NoticeTone, string> = {
  success: 'bg-success-100 text-success-600',
  danger: 'bg-danger-100 text-danger-600',
  info: 'bg-surface-50 text-neutral-900',
};

/** Kotak pesan singkat untuk hasil aksi (sukses/gagal/informasi). */
export default function Notice({ tone = 'info', children }: { tone?: NoticeTone; children: ReactNode }) {
  return (
    <div role="status" className={`rounded-control p-4 text-sm leading-6 ${TONE_CLASSES[tone]}`}>
      {children}
    </div>
  );
}
