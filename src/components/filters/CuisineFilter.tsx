'use client';

import FilterChip from './FilterChip';
import { POPULAR_CUISINES } from '@/lib/filters/cuisine';

interface CuisineFilterProps {
  selected: string[];
  onChange: (cuisines: string[]) => void;
  availableCuisines?: string[];
}

export default function CuisineFilter({
  selected,
  onChange,
  availableCuisines,
}: CuisineFilterProps) {
  // Use popular cuisines or available ones from results
  const cuisines = availableCuisines?.length
    ? availableCuisines.slice(0, 12)
    : POPULAR_CUISINES;

  const toggleCuisine = (cuisine: string) => {
    if (selected.includes(cuisine)) {
      onChange(selected.filter(c => c !== cuisine));
    } else {
      onChange([...selected, cuisine]);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Cuisine</h4>
      <div className="flex flex-wrap gap-2">
        {cuisines.map(cuisine => (
          <FilterChip
            key={cuisine}
            label={cuisine}
            selected={selected.includes(cuisine)}
            onClick={() => toggleCuisine(cuisine)}
          />
        ))}
      </div>
    </div>
  );
}
