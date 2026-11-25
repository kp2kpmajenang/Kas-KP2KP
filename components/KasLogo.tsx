'use client';

import { useId } from 'react';

interface KasLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export default function KasLogo({
  size = 'md',
  className = '',
}: KasLogoProps) {
  const id = useId();
  const bgGradId = `kas-logo-bg-${id}`;
  const goldGradId = `kas-logo-gold-${id}`;

  const sizeClass =
    size === 'xs'
      ? 'w-9 h-9'
      : size === 'sm'
      ? 'w-10 h-10 sm:w-11 sm:h-11'
      : size === 'lg'
      ? 'w-[70px] h-[70px]'
      : 'w-14 h-14';

  return (
    <div className={`relative shrink-0 ${sizeClass} ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[#D9B83F]/25 blur-lg" />

      <svg
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full"
        aria-label="Logo KAS KP2KP"
      >
        <defs>
          <linearGradient
            id={bgGradId}
            x1="8"
            y1="8"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#134E4A" />
            <stop offset="0.58" stopColor="#0F766E" />
            <stop offset="1" stopColor="#D9B83F" />
          </linearGradient>

          <linearGradient
            id={goldGradId}
            x1="18"
            y1="10"
            x2="58"
            y2="58"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F7E7A8" />
            <stop offset="1" stopColor="#D9B83F" />
          </linearGradient>
        </defs>

        <rect
          x="3"
          y="3"
          width="66"
          height="66"
          rx="22"
          fill={`url(#${bgGradId})`}
        />

        <path
          d="M18 13C24 9 32 8 39 10C50 13 59 21 62 31"
          stroke="white"
          strokeOpacity="0.22"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* K */}
        <path
          d="M20 22V50"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M23 36L38 22"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 36L39 50"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bar Grafik */}
        <path
          d="M43 47V38"
          stroke={`url(#${goldGradId})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M51 47V32"
          stroke={`url(#${goldGradId})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M59 47V27"
          stroke={`url(#${goldGradId})`}
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M17 53H59"
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
