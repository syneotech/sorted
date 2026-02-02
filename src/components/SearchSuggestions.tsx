'use client';

import { POPULAR_SEARCHES } from '@/lib/search/popular';

interface SearchSuggestionsProps {
  onSelect: (query: string) => void;
  suggestions?: string[];
  title?: string;
}

export default function SearchSuggestions({
  onSelect,
  suggestions = [...POPULAR_SEARCHES].slice(0, 8),
  title = 'Popular searches',
}: SearchSuggestionsProps) {
  return (
    <div className="pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-500 mb-3">{title}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors min-h-[44px]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact version for inline use
export function SearchSuggestionsInline({
  onSelect,
  suggestions = [...POPULAR_SEARCHES].slice(0, 4),
}: {
  onSelect: (query: string) => void;
  suggestions?: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-100 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
