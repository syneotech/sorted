'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      {/* Icon */}
      {icon ? (
        <div className="mb-4">{icon}</div>
      ) : (
        <DefaultIcon />
      )}

      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
      )}

      {/* Action button */}
      {action && <div className="mb-6">{action}</div>}

      {/* Additional content (e.g., suggestions) */}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function DefaultIcon() {
  return (
    <svg
      className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
  );
}

// Preset empty states
export function NoSearchResultsEmpty({
  query,
  children,
}: {
  query: string;
  children?: ReactNode;
}) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-16 h-16 text-gray-300 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      title={`No restaurants found for "${query}"`}
      description="Try adjusting your search or browse popular options below"
    >
      {children}
    </EmptyState>
  );
}

export function NoFilteredResultsEmpty({
  onClearFilters,
  children,
}: {
  onClearFilters: () => void;
  children?: ReactNode;
}) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-16 h-16 text-gray-300 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      }
      title="No restaurants match your filters"
      description="Try removing some filters to see more results"
      action={
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
        >
          Clear all filters
        </button>
      }
    >
      {children}
    </EmptyState>
  );
}

export function InitialSearchEmpty({ children }: { children?: ReactNode }) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-16 h-16 text-gray-300 mx-auto"
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
      }
      title="Search for restaurants or dishes"
      description="Compare prices between Swiggy and Zomato to find the best deals"
    >
      {children}
    </EmptyState>
  );
}
