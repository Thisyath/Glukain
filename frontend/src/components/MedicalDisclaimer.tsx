import { Icon } from './icons';

/** MedicalDisclaimer (spec: MedicalDisclaimer) — catatan medis konsisten di tiap layar. */
export default function MedicalDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-control bg-surface-50 p-4 text-[13px] leading-5 text-neutral-500">
      <Icon name="shield-check" size={20} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
