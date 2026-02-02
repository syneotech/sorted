'use client';

import type { PlatformFilter as PlatformFilterType } from '@/lib/filters/types';

interface PlatformFilterProps {
  selected: PlatformFilterType;
  onChange: (platform: PlatformFilterType) => void;
}

export default function PlatformFilter({ selected, onChange }: PlatformFilterProps) {
  const options: { value: PlatformFilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'matched', label: 'Both Platforms' },
    { value: 'swiggy', label: 'Swiggy' },
    { value: 'zomato', label: 'Zomato' },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Available On</h4>
      <div className="flex gap-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${selected === option.value
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
