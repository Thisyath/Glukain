export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none" stroke="white" strokeWidth="2"/>
          <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0"/>
          <path d="M7 14c0-2.5 2-4.5 5-4.5s5 2 5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <circle cx="12" cy="9" r="1.5" fill="white"/>
        </svg>
      </div>
      <span className={`font-bold text-xl ${light ? 'text-white' : 'text-neutral-900'}`}>
        glukain
      </span>
    </div>
  );
}
