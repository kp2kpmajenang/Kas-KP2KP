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
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileAvatar({ name, className = '' }: ProfileAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={`w-9 h-9 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-bold text-xs flex items-center justify-center shrink-0 select-none shadow-xs ${className}`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
