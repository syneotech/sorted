'use client';

import type { DietaryFilter as DietaryFilterType } from '@/lib/filters/types';

interface DietaryFilterProps {
  selected: DietaryFilterType;
  onChange: (dietary: DietaryFilterType) => void;
}

export default function DietaryFilter({ selected, onChange }: DietaryFilterProps) {
  const options: { value: DietaryFilterType; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '' },
    { value: 'veg', label: 'Veg', icon: '🟢' },
    { value: 'non-veg', label: 'Non-Veg', icon: '🔴' },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Dietary</h4>
      <div className="flex gap-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              flex items-center gap-1
              ${selected === option.value
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {option.icon && <span>{option.icon}</span>}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
