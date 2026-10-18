import type { IconName } from './components/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

/** Menu utama sesuai FIGMA_SCREEN_SPEC (NavigationSidebar) — 7 item. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Beranda', icon: 'house' },
  { to: '/upload', label: 'Unggah', icon: 'upload' },
  { to: '/history', label: 'Riwayat', icon: 'chart' },
  { to: '/medications', label: 'Obat', icon: 'pill' },
  { to: '/food', label: 'Cek Makanan', icon: 'scan-line' },
  { to: '/chat', label: 'Chatbot', icon: 'messages-square' },
  { to: '/profile', label: 'Profil', icon: 'user-round' },
];

/** Item yang tampil pada bottom navigation (mobile) — maksimal 5. */
export const MOBILE_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter((item) =>
  ['/dashboard', '/upload', '/history', '/chat', '/profile'].includes(item.to)
);

const BREADCRUMBS: Array<[string, string]> = [
  ['/dashboard', 'Beranda'],
  ['/upload', 'Unggah'],
  ['/processing', 'Unggah'],
  ['/confirm', 'Unggah'],
  ['/history', 'Riwayat'],
  ['/medications', 'Obat'],
  ['/food', 'Cek Makanan'],
  ['/chat', 'Chatbot'],
  ['/profile', 'Profil'],
  ['/recommendations', 'Beranda'],
];

/** Label remah ("Ruang kesehatan Anda / …") berdasarkan path aktif. */
export function breadcrumbFor(pathname: string): string {
  const match = BREADCRUMBS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  return match ? match[1] : 'Beranda';
}
