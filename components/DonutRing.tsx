'use client';

interface DonutRingProps {
  percentage: number;
  label?: string;
  size?: number;
}

/**
 * Visualisasi Donut Ring (DESIGN.md Pattern 2)
 * Warna dinamis:
 * - < 80%  : Hijau Teal (#0F766E) — Aman
 * - 80-99% : Emas/Amber (#B47A26) — Hati-hati
 * - >=100% : Merah Rose (#9F3542) — Melebihi pemasukan
 */
export default function DonutRing({
  percentage,
  label,
  size = 84,
}: DonutRingProps) {
  const safePct = Number.isFinite(percentage) ? Math.max(0, percentage) : 0;
  const clamped = Math.min(100, safePct);
  const radius = 32;
  const circumference = 2 * Math.PI * radius; // ~201.06
  const strokeDashoffset = circumference * (1 - clamped / 100);

  const ringColor =
    safePct >= 100
      ? '#9F3542'
      : safePct >= 80
      ? '#B47A26'
      : '#0F766E';

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 80 80"
        className="h-full w-full -rotate-90"
        aria-label={label || `${Math.round(safePct)}%`}
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgba(19, 78, 74, 0.10)"
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="kas-num text-[14px] font-bold leading-none"
          style={{ color: ringColor }}
        >
          {Math.round(safePct)}%
        </span>
        {label && (
          <span className="mt-0.5 text-[9.5px] font-medium text-[#4E6661]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
