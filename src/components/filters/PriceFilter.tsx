'use client';

import FilterChip from './FilterChip';
import type { PriceRange } from '@/lib/filters/types';
import { PRICE_RANGES } from '@/lib/filters/types';

interface PriceFilterProps {
  selected: PriceRange[];
  onChange: (prices: PriceRange[]) => void;
}

export default function PriceFilter({ selected, onChange }: PriceFilterProps) {
  const options: { value: PriceRange; label: string }[] = [
    { value: 'budget', label: PRICE_RANGES.budget.label },
    { value: 'moderate', label: PRICE_RANGES.moderate.label },
    { value: 'premium', label: PRICE_RANGES.premium.label },
  ];

  const togglePrice = (price: PriceRange) => {
    if (selected.includes(price)) {
      onChange(selected.filter(p => p !== price));
    } else {
      onChange([...selected, price]);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Price</h4>
      <div className="flex gap-2">
        {options.map(option => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={selected.includes(option.value)}
            onClick={() => togglePrice(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
