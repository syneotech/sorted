'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ComparisonRestaurant } from '@/lib/comparison/normalizer';
import PriceBadge from './PriceBadge';

interface ComparisonCardProps {
  comparison: ComparisonRestaurant;
  lat: number;
  lng: number;
  city: string;
}

export default function ComparisonCard({
  comparison,
  lat,
  lng,
  city,
}: ComparisonCardProps) {
  const { swiggy, zomato, matchConfidence } = comparison;
  const restaurant = swiggy || zomato;

  if (!restaurant) return null;

  const isMatched = swiggy && zomato;
  const swiggyOnly = swiggy && !zomato;
  const zomatoOnly = !swiggy && zomato;

  // Build comparison URL
  const comparisonUrl = `/restaurant/${encodeURIComponent(restaurant.name.toLowerCase().replace(/\s+/g, '-'))}?${
    swiggy ? `swiggy_id=${swiggy.platformId}` : ''
  }${swiggy && zomato ? '&' : ''}${
    zomato ? `zomato_slug=${zomato.deepLink.split('/').pop()}` : ''
  }&lat=${lat}&lng=${lng}&city=${city}`;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 000 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
            </svg>
          </div>
        )}

        {/* Platform badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {swiggy && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              Swiggy
            </span>
          )}
          {zomato && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              Zomato
            </span>
          )}
        </div>

        {/* Match indicator */}
        {isMatched && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500/90 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Matched ({Math.round(matchConfidence * 100)}%)
          </div>
        )}

        {/* Discount badge */}
        {(swiggy?.discount || zomato?.discount) && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-blue-500/90 text-white text-xs font-medium rounded-full">
            {swiggy?.discount || zomato?.discount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-sm font-medium shrink-0">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {restaurant.rating.toFixed(1)}
          </div>
        </div>

        {/* Cuisines */}
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">
          {restaurant.cuisines.slice(0, 4).join(', ')}
        </p>

        {/* Location */}
        <p className="text-sm text-gray-400 mb-3 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          {restaurant.locality}
        </p>

        {/* Price and Delivery Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>{restaurant.costForTwo}</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {restaurant.deliveryTimeString}
          </span>
        </div>

        {/* Price Comparison */}
        {isMatched && (
          <div className="mb-3">
            <PriceBadge
              swiggyPrice={swiggy?.costForTwoValue}
              zomatoPrice={zomato?.costForTwoValue}
              size="sm"
            />
          </div>
        )}

        {/* Rating Comparison */}
        {isMatched && swiggy && zomato && Math.abs(swiggy.rating - zomato.rating) >= 0.2 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span
              className={`flex items-center gap-1 ${
                swiggy.rating > zomato.rating ? 'text-green-600' : ''
              }`}
            >
              Swiggy: {swiggy.rating.toFixed(1)}★
            </span>
            <span className="text-gray-300">vs</span>
            <span
              className={`flex items-center gap-1 ${
                zomato.rating > swiggy.rating ? 'text-green-600' : ''
              }`}
            >
              Zomato: {zomato.rating.toFixed(1)}★
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isMatched ? (
            <Link
              href={comparisonUrl}
              className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
            >
              Compare Prices
            </Link>
          ) : (
            <>
              {swiggyOnly && swiggy && (
                <a
                  href={swiggy.deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Order on Swiggy
                </a>
              )}
              {zomatoOnly && zomato && (
                <a
                  href={zomato.deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Order on Zomato
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
