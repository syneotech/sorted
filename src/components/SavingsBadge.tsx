'use client';

interface SavingsBadgeProps {
  savings: number;
  percentage: number;
  cheaperPlatform: 'swiggy' | 'zomato';
  size?: 'sm' | 'md' | 'lg';
  showPlatform?: boolean;
}

export default function SavingsBadge({
  savings,
  percentage,
  cheaperPlatform,
  size = 'md',
  showPlatform = true,
}: SavingsBadgeProps) {
  if (savings <= 0 || percentage <= 0) return null;

  const platformName = cheaperPlatform === 'swiggy' ? 'Swiggy' : 'Zomato';
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        bg-green-100 text-green-700 border border-green-200
        ${sizeClasses[size]}
      `}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        Save {Math.round(percentage)}% ({formatPrice(savings)})
        {showPlatform && <span className="font-medium"> on {platformName}</span>}
      </span>
    </div>
  );
}

// Compact badge for card display
export function SavingsBadgeCompact({
  savings,
  percentage,
  cheaperPlatform,
}: {
  savings: number;
  percentage: number;
  cheaperPlatform: 'swiggy' | 'zomato';
}) {
  if (savings <= 0 || percentage <= 0) return null;

  const platformName = cheaperPlatform === 'swiggy' ? 'Swiggy' : 'Zomato';

  // More prominent styling for larger savings
  const isHighSavings = percentage >= 20;

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2 py-1
        ${isHighSavings
          ? 'bg-green-500 text-white'
          : 'bg-green-100 text-green-700'
        }
      `}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        Save {Math.round(percentage)}% on {platformName}
      </span>
    </div>
  );
}

// Calculate savings info from prices
export function calculateSavings(
  swiggyPrice?: number,
  zomatoPrice?: number
): {
  savings: number;
  percentage: number;
  cheaperPlatform: 'swiggy' | 'zomato' | null;
} | null {
  if (!swiggyPrice || !zomatoPrice || swiggyPrice <= 0 || zomatoPrice <= 0) {
    return null;
  }

  if (swiggyPrice === zomatoPrice) {
    return null;
  }

  const cheaperPlatform = swiggyPrice < zomatoPrice ? 'swiggy' : 'zomato';
  const savings = Math.abs(swiggyPrice - zomatoPrice);
  const higherPrice = Math.max(swiggyPrice, zomatoPrice);
  const percentage = (savings / higherPrice) * 100;

  return {
    savings,
    percentage,
    cheaperPlatform,
  };
}
