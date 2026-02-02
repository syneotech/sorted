'use client';

interface PlatformLoadingStatus {
  swiggy: 'loading' | 'done' | 'error';
  zomato: 'loading' | 'done' | 'error';
}

interface LoadingProgressProps {
  status?: PlatformLoadingStatus;
}

export default function LoadingProgress({ status }: LoadingProgressProps) {
  // Default to loading both if no status provided
  const platformStatus = status ?? { swiggy: 'loading', zomato: 'loading' };

  const getStatusIcon = (state: 'loading' | 'done' | 'error') => {
    switch (state) {
      case 'done':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-current rounded-full animate-spin" />
        );
    }
  };

  const getStatusText = (platform: 'swiggy' | 'zomato', state: 'loading' | 'done' | 'error') => {
    const name = platform.charAt(0).toUpperCase() + platform.slice(1);
    switch (state) {
      case 'done':
        return `${name} ready`;
      case 'error':
        return `${name} failed`;
      default:
        return `Fetching from ${name}...`;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading search results">
      <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" aria-hidden="true" />
      <p className="text-gray-600 font-medium">Searching restaurants...</p>

      {/* Platform status indicators */}
      <div className="flex items-center gap-6 text-sm">
        {/* Swiggy */}
        <div className="flex items-center gap-2">
          <div className={`${platformStatus.swiggy === 'loading' ? 'text-orange-500' : ''}`}>
            {getStatusIcon(platformStatus.swiggy)}
          </div>
          <span className={`
            ${platformStatus.swiggy === 'done' ? 'text-green-600' : ''}
            ${platformStatus.swiggy === 'error' ? 'text-red-500' : ''}
            ${platformStatus.swiggy === 'loading' ? 'text-gray-600' : ''}
          `}>
            {getStatusText('swiggy', platformStatus.swiggy)}
          </span>
        </div>

        {/* Zomato */}
        <div className="flex items-center gap-2">
          <div className={`${platformStatus.zomato === 'loading' ? 'text-red-500' : ''}`}>
            {getStatusIcon(platformStatus.zomato)}
          </div>
          <span className={`
            ${platformStatus.zomato === 'done' ? 'text-green-600' : ''}
            ${platformStatus.zomato === 'error' ? 'text-red-500' : ''}
            ${platformStatus.zomato === 'loading' ? 'text-gray-600' : ''}
          `}>
            {getStatusText('zomato', platformStatus.zomato)}
          </span>
        </div>
      </div>
    </div>
  );
}
