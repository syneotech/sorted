'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  initialQuery = '',
  onSearch,
  placeholder = 'Search for restaurants or dishes...',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        if (onSearch) {
          onSearch(trimmedQuery);
        } else {
          router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        }
      }
    },
    [query, onSearch, router]
  );

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        className={`relative flex items-center bg-white rounded-full shadow-lg transition-all duration-200 ${
          isFocused ? 'ring-2 ring-orange-500 shadow-xl' : 'hover:shadow-xl'
        }`}
      >
        {/* Search Icon */}
        <div className="absolute left-4 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-4 pl-12 pr-24 text-gray-700 bg-transparent rounded-full focus:outline-none text-lg"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="absolute right-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Search
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {['Biryani', 'Pizza', 'Burger', 'Chinese', 'South Indian', 'North Indian'].map(
          (suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setQuery(suggestion);
                if (onSearch) {
                  onSearch(suggestion);
                } else {
                  router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                }
              }}
              className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors"
            >
              {suggestion}
            </button>
          )
        )}
      </div>
    </form>
  );
}
