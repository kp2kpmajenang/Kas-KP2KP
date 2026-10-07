'use client';

interface LoadingProps {
  message?: string;
  className?: string;
}

export default function Loading({ message = 'Memuat data...', className = '' }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-center ${className}`}>
      <div className="w-8 h-8 rounded-full border-3 border-blue-900 border-t-amber-400 animate-spin" />
      <span className="text-xs font-semibold text-slate-500">{message}</span>
    </div>
  );
}
