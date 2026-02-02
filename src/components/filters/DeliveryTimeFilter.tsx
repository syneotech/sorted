'use client';

import type { DeliveryTimeFilter as DeliveryTimeFilterType } from '@/lib/filters/types';

interface DeliveryTimeFilterProps {
  selected: DeliveryTimeFilterType;
  onChange: (time: DeliveryTimeFilterType) => void;
}

export default function DeliveryTimeFilter({ selected, onChange }: DeliveryTimeFilterProps) {
  const options: { value: DeliveryTimeFilterType; label: string }[] = [
    { value: 'any', label: 'Any' },
    { value: '30', label: '<30 min' },
    { value: '45', label: '<45 min' },
    { value: '60', label: '<60 min' },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Delivery Time</h4>
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
