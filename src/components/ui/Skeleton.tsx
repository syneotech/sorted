'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className,
  variant = 'default',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return (
    <div
      className={cn(
        'skeleton bg-gray-200',
        variantClasses[variant],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Preset skeleton components for common use cases
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonImage({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('w-full h-48', className)} />
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('h-10 w-24 rounded-lg', className)} />
  );
}

export function SkeletonBadge({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('h-6 w-16 rounded-full', className)} />
  );
}
