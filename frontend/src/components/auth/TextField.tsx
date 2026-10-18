import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../icons';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Teks bantuan di bawah kolom (mis. "Kuat • Minimal 8 karakter"). */
  hint?: ReactNode;
  /** Pesan galat; menggantikan `hint` saat ada. */
  error?: string;
  /** Tampilkan tombol mata untuk password. */
  toggleable?: boolean;
}

/**
 * Kolom input berlabel (spec: Input*Default) dengan dukungan password
 * dan pesan galat inline.
 */
export default function TextField({
  label,
  hint,
  error,
  toggleable = false,
  type = 'text',
  id,
  className = '',
  ...rest
}: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? `field-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
  const resolvedType = toggleable ? (visible ? 'text' : 'password') : type;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-base font-semibold text-neutral-900">
        {label}
      </label>

      <div
        className={`flex min-h-[48px] items-center gap-2 rounded-control border bg-white px-4 ${
          error
            ? 'border-danger-600'
            : 'border-neutral-500/50 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-600/40'
        }`}
      >
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={error ? true : undefined}
          {...rest}
          className={`h-full w-full bg-transparent py-3 text-base text-neutral-900 outline-none placeholder:text-neutral-500/60 ${className}`}
        />
        {toggleable && (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
            className="shrink-0 text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <Icon name={visible ? 'eye-off' : 'eye'} size={20} />
          </button>
        )}
      </div>

      {error ? (
        <p className="text-[13px] text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-[13px] leading-5 text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}
