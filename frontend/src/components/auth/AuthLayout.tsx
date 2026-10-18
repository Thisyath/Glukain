import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import BrandStory from './BrandStory';

/** Footer kecil yang tampil di semua halaman auth (spec: bagian bawah FormArea). */
export function AuthFooter() {
  return (
    <p className="text-[13px] text-neutral-500">
      Bantuan • Kebijakan Privasi • © 2026 Glukain
    </p>
  );
}

/**
 * Kerangka dua kolom semua halaman auth (spec: BrandStory + FormArea).
 * Kolom kanan dibatasi 608px agar sejajar dengan desain.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:flex">
      <BrandStory />

      <div className="flex min-h-screen flex-1 flex-col justify-center gap-8 px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[608px] space-y-8">
          {/* Tautan kembali ke beranda untuk layar kecil (BrandStory disembunyikan) */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary-600 lg:hidden"
          >
            glukain
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
