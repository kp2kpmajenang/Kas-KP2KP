'use client';

interface RoleBadgeProps {
  roles: string[] | string;
  className?: string;
}

export default function RoleBadge({ roles, className = '' }: RoleBadgeProps) {
  const roleList = Array.isArray(roles) ? roles : [roles];

  return (
    <div className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {roleList.map((role) => {
        const isSuper = role.includes('SUPER ADMIN');
        const isBendahara = role.includes('BENDAHARA');

        const badgeClass = isSuper
          ? 'bg-amber-100 text-amber-900 border-amber-200'
          : isBendahara
          ? 'bg-blue-100 text-blue-900 border-blue-200'
          : 'bg-slate-100 text-slate-700 border-slate-200';

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
