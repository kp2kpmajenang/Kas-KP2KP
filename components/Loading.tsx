'use client';

interface LoadingProps {
  message?: string;
  className?: string;
}

export default function Loading({
  message = 'Memuat data...',
  className = '',
}: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 gap-3 text-center ${className}`}
    >
      <div className="relative w-9 h-9">
        <div className="absolute inset-0 rounded-full border-[3px] border-[#DDEAE7]" />

        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#0F766E] border-r-[#D9B83F] animate-spin" />
      </div>

      <span className="text-xs font-semibold text-[#71807B]">
        {message}
      </span>
    </div>
  );
}
