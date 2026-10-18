import type { ReactNode } from 'react';
import { Icon } from './icons';

/** AlertInfo (spec: komponen AlertInfo) — latar surface-50, radius-control. */
export default function InfoAlert({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-control bg-surface-50 p-4">
      <div className="flex items-center gap-2">
        <Icon name="info" size={20} className="shrink-0 text-neutral-500" />
        <p className="text-base font-semibold text-neutral-900">{title}</p>
      </div>
      <p className="mt-2 text-base leading-6 text-neutral-900/80">{children}</p>
    </div>
  );
}
