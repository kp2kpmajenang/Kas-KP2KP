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
          ? 'bg-[#F7E7A8]/80 text-[#6F5506] border-[#D9B83F]/45'
          : isBendahara
          ? 'bg-[#0F766E]/12 text-[#0F625C] border-[#0F766E]/20'
          : 'bg-[#143632]/8 text-[#4E6661] border-[#143632]/12';

        return (
          <span
            key={role}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase leading-none ${badgeClass}`}
          >
            {role}
          </span>
        );
      })}
    </div>
  );
}
