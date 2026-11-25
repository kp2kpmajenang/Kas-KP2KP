'use client';

interface ProfileAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function getInitials(name: string): string {
  if (!name) return 'KP';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileAvatar({
  name,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const initials = getInitials(name);

  const sizeClass =
    size === 'sm'
      ? 'h-9 w-9 text-[12px]'
      : size === 'lg'
      ? 'h-14 w-14 text-[16px]'
      : 'h-11 w-11 text-[13px]';

  return (
    <div
      className={`relative flex shrink-0 select-none items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-[#F7E7A8] via-[#EBD274] to-[#C9A227] font-bold text-[#134E4A] shadow-[0_6px_16px_-4px_rgba(19,78,74,0.22)] ${sizeClass} ${className}`}
      aria-label={name}
    >
      <span className="relative">{initials}</span>
    </div>
  );
}
