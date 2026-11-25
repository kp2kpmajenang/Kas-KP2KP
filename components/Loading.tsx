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
      className={`flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}
    >
      <div className="kas-glass-orb relative flex h-11 w-11 items-center justify-center rounded-full">
        <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-[#0F766E]/20 border-r-[#C9A227] border-t-[#0F766E]" />
      </div>

      <span className="text-[12px] font-medium text-[#4E6661]">
        {message}
      </span>
    </div>
  );
}
