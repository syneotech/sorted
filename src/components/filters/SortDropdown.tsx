'use client';

import { useState, useRef, useEffect } from 'react';
import type { SortOption } from '@/lib/sorting/types';
import { SORT_OPTIONS } from '@/lib/sorting/types';

interface SortDropdownProps {
  selected: SortOption;
  onChange: (sort: SortOption) => void;
}

export default function SortDropdown({ selected, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = Object.values(SORT_OPTIONS);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm text-gray-600">Sort by:</span>
        <span className="text-sm font-medium text-gray-900">
          {SORT_OPTIONS[selected].label}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {sortOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors
                ${selected === option.id ? 'bg-orange-50' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm ${selected === option.id ? 'font-medium text-orange-600' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                {selected === option.id && (
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
