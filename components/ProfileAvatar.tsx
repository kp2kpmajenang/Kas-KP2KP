'use client';

interface ProfileAvatarProps {
  name: string;
  className?: string;
}

export function getInitials(name: string): string {
  if (!name) return 'KP';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    parts[0][0] + parts[parts.length - 1][0]
  ).toUpperCase();
}

export default function ProfileAvatar({
  name,
  className = '',
}: ProfileAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={`relative w-9 h-9 rounded-full bg-gradient-to-br from-[#134E4A] to-[#0F766E] text-white border-2 border-white font-bold text-xs flex items-center justify-center shrink-0 select-none shadow-[0_3px_10px_rgba(15,118,110,0.18)] ${className}`}
      aria-label={name}
    >
      <span className="absolute inset-[2px] rounded-full border border-white/10" />
      <span className="relative">{initials}</span>

      <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-[#D9B83F] border-2 border-[#FFF9E8]" />
    </div>
  );
}
