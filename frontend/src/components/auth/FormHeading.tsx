interface FormHeadingProps {
  title: string;
  subtitle?: string;
}

/** Judul formulir auth (spec: FormHeading). */
export default function FormHeading({ title, subtitle }: FormHeadingProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-[28px] font-bold leading-9 text-neutral-900">{title}</h1>
      {subtitle && <p className="text-base leading-6 text-neutral-500">{subtitle}</p>}
    </header>
  );
}
