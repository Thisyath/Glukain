import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './icons';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  /** Penuh lebar kolom (default true, sesuai tombol pada spec). */
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-600/90 active:bg-primary-600/80',
  secondary:
    'border border-primary-600 bg-white text-primary-600 hover:bg-primary-600/5 active:bg-primary-600/10',
  ghost: 'bg-white text-primary-600 hover:bg-primary-600/5 active:bg-primary-600/10',
};

/** Tombol 48px dengan ikon opsional (spec: ButtonPrimary/Secondary/Ghost). */
export default function Button({
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = true,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const showIcon = Boolean(icon) && !loading;

  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-control px-4 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        VARIANT_CLASSES[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Icon name="loader-circle" size={20} className="shrink-0 animate-spin" />}
      {showIcon && iconPosition === 'left' && <Icon name={icon!} size={20} className="shrink-0" />}
      <span>{children}</span>
      {showIcon && iconPosition === 'right' && <Icon name={icon!} size={20} className="shrink-0" />}
    </button>
  );
}
