import { Icon, type IconName } from '../icons';
import BrandMark from '../assets/BrandMark';

const BENEFITS: Array<{ icon: IconName; text: string }> = [
  { icon: 'file-check-2', text: 'Hasil pemeriksaan lebih mudah dibaca' },
  { icon: 'calendar-check', text: 'Jadwal obat sesuai resep' },
  { icon: 'shield-check', text: 'Data medis Anda tetap privat' },
];

/**
 * Panel kiri semua halaman auth (spec: BrandStory).
 * Disembunyikan di layar kecil agar formulir tetap jadi fokus.
 */
export default function BrandStory() {
  return (
    <aside className="hidden w-[544px] shrink-0 flex-col justify-between gap-12 bg-primary-600 p-12 lg:flex">
      <div className="flex items-center gap-2">
        <BrandMark variant="light" />
        <span className="text-2xl font-extrabold tracking-tight text-white">glukain</span>
      </div>

      <div className="space-y-6">
        <h2 className="text-[28px] font-bold leading-9 text-white">
          Lebih memahami kondisi. Lebih tenang menjalani hari.
        </h2>
        <p className="text-base leading-6 text-white/90">
          Pendamping rutinitas bagi Anda yang sudah didiagnosis diabetes oleh dokter.
        </p>
      </div>

      <div className="rounded-card bg-white p-6">
        <div className="flex items-center gap-3">
          <Icon name="heart-pulse" size={24} className="shrink-0 text-primary-600" />
          <p className="text-base font-semibold text-neutral-900">
            Satu tempat untuk kesehatan Anda
          </p>
        </div>

        <ul className="mt-6 space-y-4">
          {BENEFITS.map((benefit) => (
            <li key={benefit.text} className="flex items-center gap-4">
              <Icon name={benefit.icon} size={24} className="shrink-0 text-primary-600" />
              <span className="text-base leading-6 text-neutral-900">{benefit.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[13px] text-white/80">Glukain tidak menggantikan dokter.</p>
    </aside>
  );
}
