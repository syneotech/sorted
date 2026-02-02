'use client';

import Skeleton from './ui/Skeleton';

export default function SkeletonMenuItem() {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
      {/* Veg/Non-veg indicator */}
      <Skeleton className="w-5 h-5 rounded" />

      {/* Image */}
      <Skeleton className="w-16 h-16 rounded-lg shrink-0" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Prices */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonMenuCategory() {
  return (
    <div className="space-y-3">
      {/* Category header */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-1 h-6 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-8" />
      </div>

      {/* Menu items */}
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonMenuItem key={i} />
      ))}
    </div>
  );
}

export function SkeletonMenuList({ categoryCount = 3 }: { categoryCount?: number }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: categoryCount }).map((_, i) => (
        <SkeletonMenuCategory key={i} />
      ))}
    </div>
  );
}
