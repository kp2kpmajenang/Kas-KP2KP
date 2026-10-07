'use client';

interface RoleBadgeProps {
  roles: string[] | string;
  className?: string;
}

export default function RoleBadge({
  roles,
  className = '',
}: RoleBadgeProps) {
  const roleList = Array.isArray(roles) ? roles : [roles];

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 ${className}`}
    >
      {roleList.map((role) => {
        const isSuper = role.includes('SUPER ADMIN');
        const isBendahara = role.includes('BENDAHARA');

        const badgeClass = isSuper
          ? 'bg-[#F7E7A8]/70 text-[#725B00] border-[#E5CD70]'
          : isBendahara
          ? 'bg-[#E4F3F0] text-[#0F625C] border-[#C5E4DE]'
          : 'bg-[#F2F3EE] text-[#59635F] border-[#E1E4DD]';

        return (
          <span
            key={role}
            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm border tracking-wide ${badgeClass}`}
          >
            {role}
          </span>
        );
      })}
    </div>
  );
}
