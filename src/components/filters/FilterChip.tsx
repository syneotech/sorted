'use client';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  count?: number;
  disabled?: boolean;
}

export default function FilterChip({
  label,
  selected,
  onClick,
  count,
  disabled = false,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="checkbox"
      aria-checked={selected}
      className={`
        px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
        min-h-[44px] min-w-[44px]
        ${selected
          ? 'bg-orange-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 text-xs ${selected ? 'text-orange-200' : 'text-gray-500'}`}>
          ({count})
        </span>
      )}
    </button>
  );
}
