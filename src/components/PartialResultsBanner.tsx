'use client';

interface PlatformStatus {
  success: boolean;
  error?: string;
  count: number;
}

interface PartialResultsBannerProps {
  platformStatus: {
    swiggy: PlatformStatus;
    zomato: PlatformStatus;
  };
  onRetry: (platform: 'swiggy' | 'zomato') => void;
}

export default function PartialResultsBanner({
  platformStatus,
  onRetry,
}: PartialResultsBannerProps) {
  const swiggyFailed = !platformStatus.swiggy.success;
  const zomatoFailed = !platformStatus.zomato.success;

  // Don't show if both succeeded or both failed (different UX for total failure)
  if ((!swiggyFailed && !zomatoFailed) || (swiggyFailed && zomatoFailed)) {
    return null;
  }

  const failedPlatform = swiggyFailed ? 'Swiggy' : 'Zomato';
  const failedPlatformKey = swiggyFailed ? 'swiggy' : 'zomato';
  const workingPlatform = swiggyFailed ? 'Zomato' : 'Swiggy';
  const workingCount = swiggyFailed ? platformStatus.zomato.count : platformStatus.swiggy.count;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        {/* Warning icon */}
        <svg
          className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-yellow-800">
            Showing partial results from {workingPlatform}
          </h4>
          <p className="text-sm text-yellow-700 mt-1">
            {failedPlatform} is currently unavailable.{' '}
            {workingCount > 0 && (
              <>Showing {workingCount} results from {workingPlatform}.</>
            )}
          </p>
        </div>

        {/* Retry button */}
        <button
          onClick={() => onRetry(failedPlatformKey)}
          aria-label={`Retry fetching from ${failedPlatform}`}
          className="shrink-0 px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-1.5 min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Retry {failedPlatform}
        </button>
      </div>
    </div>
  );
}

// Banner for when both platforms failed
export function TotalFailureBanner({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <svg
        className="w-12 h-12 text-red-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h4 className="text-lg font-medium text-red-800 mb-2">
        Unable to fetch restaurant data
      </h4>
      <p className="text-sm text-red-600 mb-4">
        Both Swiggy and Zomato are currently unavailable. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors inline-flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Try Again
      </button>
    </div>
  );
}
