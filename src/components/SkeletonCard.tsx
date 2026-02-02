'use client';

import Skeleton, { SkeletonBadge } from './ui/Skeleton';

interface SkeletonCardProps {
  showPriceBadge?: boolean;
}

export default function SkeletonCard({ showPriceBadge = true }: SkeletonCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="relative h-48 bg-gray-200">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />

        {/* Platform badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          <SkeletonBadge />
          <SkeletonBadge />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-14 rounded" />
        </div>

        {/* Cuisines */}
        <Skeleton className="h-4 w-2/3 mb-2" />

        {/* Location */}
        <Skeleton className="h-4 w-1/2 mb-3" />

        {/* Price and Delivery Info */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Price Comparison */}
        {showPriceBadge && (
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        )}

        {/* Button */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Grid of skeleton cards
export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
