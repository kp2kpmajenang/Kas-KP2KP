'use client';

interface RupiahInputProps {
  value: string;
  onChange: (rawDigits: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

function formatRibuan(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function RupiahInput({
  value,
  onChange,
  placeholder = '0',
  required = false,
  disabled = false,
  id,
}: RupiahInputProps) {
  const formatted = formatRibuan(value);

  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-3.5 text-[13px] font-semibold text-[#4E6661]">
        Rp
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatted}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '');
          onChange(digits);
        }}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="kas-num h-11 w-full rounded-[15px] border border-[#143632]/12 bg-white/75 pl-10 pr-3.5 text-[14px] font-semibold text-[#143632] outline-none transition-all placeholder:font-normal placeholder:text-[#4E6661]/50 focus:border-[#0F766E] focus:bg-white focus:ring-3 focus:ring-[#0F766E]/12 disabled:opacity-60"
      />
    </div>
  );
}
