interface LogoMarkProps {
  className?: string;
  showWordmark?: boolean;
}

export function LogoMark({ className = 'h-11 w-11', showWordmark = false }: LogoMarkProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${showWordmark ? '' : className}`}>
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={showWordmark ? 'h-11 w-11 shrink-0' : 'h-full w-full'}
        role="img"
      >
        <defs>
          <linearGradient id="invoico-mark-gradient" x1="10" y1="8" x2="56" y2="58">
            <stop stopColor="#0ea5e9" />
            <stop offset="0.58" stopColor="#2563eb" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#invoico-mark-gradient)" />
        <path
          d="M22 14h16l10 10v26a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path d="M38 14v10h10" fill="#bae6fd" />
        <path d="M25 31h16M25 38h11" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <path
          d="m25 46 5 5 11-13"
          fill="none"
          stroke="#059669"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showWordmark && (
        <div>
          <p className="text-xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
            Invoico
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Professional Invoice Generator
          </p>
        </div>
      )}
    </div>
  );
}
