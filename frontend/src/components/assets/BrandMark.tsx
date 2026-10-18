interface BrandMarkProps {
  size?: number;
  className?: string;
  /** primary: kotak ungu untuk latar terang. light: kotak putih untuk latar ungu. */
  variant?: 'primary' | 'light';
}

/** Kotak brand 36x36 (radius-control) dengan glyph — dipakai di sidebar & auth. */
export default function BrandMark({
  size = 36,
  className = '',
  variant = 'primary',
}: BrandMarkProps) {
  const tone =
    variant === 'light' ? 'bg-white text-primary-600' : 'bg-primary-600 text-white';

  return (
    <span
      className={`grid place-items-center rounded-control ${tone} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
