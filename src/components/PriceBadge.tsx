'use client';

interface PriceBadgeProps {
  swiggyPrice?: number;
  zomatoPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showPlatform?: boolean;
}

export default function PriceBadge({
  swiggyPrice,
  zomatoPrice,
  size = 'md',
  showPlatform = true,
}: PriceBadgeProps) {
  const hasSwiggy = swiggyPrice !== undefined && swiggyPrice > 0;
  const hasZomato = zomatoPrice !== undefined && zomatoPrice > 0;

  if (!hasSwiggy && !hasZomato) {
    return null;
  }

  const cheaper = hasSwiggy && hasZomato
    ? swiggyPrice < zomatoPrice
      ? 'swiggy'
      : zomatoPrice < swiggyPrice
        ? 'zomato'
        : 'same'
    : null;

  const savings = hasSwiggy && hasZomato
    ? Math.abs(swiggyPrice - zomatoPrice)
    : 0;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Swiggy Price */}
      {hasSwiggy && (
        <div
          className={`flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${
            cheaper === 'swiggy'
              ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {showPlatform && (
            <span className="opacity-70">Swiggy:</span>
          )}
          <span>{formatPrice(swiggyPrice)}</span>
          {cheaper === 'swiggy' && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      )}

      {/* Zomato Price */}
      {hasZomato && (
        <div
          className={`flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${
            cheaper === 'zomato'
              ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {showPlatform && (
            <span className="opacity-70">Zomato:</span>
          )}
          <span>{formatPrice(zomatoPrice)}</span>
          {cheaper === 'zomato' && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      )}

      {/* Savings Badge */}
      {savings > 0 && (
        <div
          className={`flex items-center gap-1 rounded-full font-medium bg-green-500 text-white ${sizeClasses[size]}`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
          <span>Save {formatPrice(savings)}</span>
        </div>
      )}
    </div>
  );
}

// Compact version for menu items
export function PriceBadgeCompact({
  swiggyPrice,
  zomatoPrice,
}: {
  swiggyPrice?: number;
  zomatoPrice?: number;
}) {
  const hasSwiggy = swiggyPrice !== undefined && swiggyPrice > 0;
  const hasZomato = zomatoPrice !== undefined && zomatoPrice > 0;

  if (!hasSwiggy && !hasZomato) {
    return <span className="text-gray-400">-</span>;
  }

  const cheaper = hasSwiggy && hasZomato
    ? swiggyPrice < zomatoPrice
      ? 'swiggy'
      : zomatoPrice < swiggyPrice
        ? 'zomato'
        : 'same'
    : null;

  const formatPrice = (price: number) => `₹${price}`;

  return (
    <div className="flex items-center gap-3 text-sm">
      {hasSwiggy && (
        <span
          className={`${
            cheaper === 'swiggy' ? 'text-green-600 font-semibold' : 'text-orange-600'
          }`}
        >
          {formatPrice(swiggyPrice)}
        </span>
      )}
      {hasSwiggy && hasZomato && (
        <span className="text-gray-300">|</span>
      )}
      {hasZomato && (
        <span
          className={`${
            cheaper === 'zomato' ? 'text-green-600 font-semibold' : 'text-red-600'
          }`}
        >
          {formatPrice(zomatoPrice)}
        </span>
      )}
    </div>
  );
}
