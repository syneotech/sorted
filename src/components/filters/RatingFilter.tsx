'use client';

import type { RatingFilter as RatingFilterType } from '@/lib/filters/types';

interface RatingFilterProps {
  selected: RatingFilterType;
  onChange: (rating: RatingFilterType) => void;
}

export default function RatingFilter({ selected, onChange }: RatingFilterProps) {
  const options: { value: RatingFilterType; label: string }[] = [
    { value: 'any', label: 'Any' },
    { value: '3+', label: '3+' },
    { value: '3.5+', label: '3.5+' },
    { value: '4+', label: '4+' },
    { value: '4.5+', label: '4.5+' },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Rating</h4>
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
            {option.value !== 'any' && <span className="text-yellow-400">★</span>}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
