'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { ComparisonMenuItem } from '@/lib/comparison/normalizer';
import { PriceBadgeCompact } from './PriceBadge';

interface MenuComparisonProps {
  menuItems: ComparisonMenuItem[];
  categories: string[];
  pricing: {
    swiggyTotal: number;
    zomatoTotal: number;
    optimalTotal: number;
    totalSavings: number;
  };
  swiggyLink?: string;
  zomatoLink?: string;
}

export default function MenuComparison({
  menuItems,
  categories,
  pricing,
  swiggyLink,
  zomatoLink,
}: MenuComparisonProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMatchedOnly, setShowMatchedOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (showMatchedOnly && !(item.swiggy && item.zomato)) return false;
      if (vegOnly) {
        const isVeg = item.swiggy?.isVeg ?? item.zomato?.isVeg ?? false;
        if (!isVeg) return false;
      }
      return true;
    });
  }, [menuItems, selectedCategory, showMatchedOnly, vegOnly]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, ComparisonMenuItem[]> = {};
    for (const item of filteredItems) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredItems]);

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Pricing Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 sm:p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Comparison Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-orange-600 font-medium">Swiggy Total</p>
            <p className="text-2xl font-bold text-gray-800">{formatPrice(pricing.swiggyTotal)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-red-600 font-medium">Zomato Total</p>
            <p className="text-2xl font-bold text-gray-800">{formatPrice(pricing.zomatoTotal)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-green-600 font-medium">Best Price</p>
            <p className="text-2xl font-bold text-green-600">{formatPrice(pricing.optimalTotal)}</p>
          </div>
          <div className="bg-green-100 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-green-700 font-medium">You Save</p>
            <p className="text-2xl font-bold text-green-700">{formatPrice(pricing.totalSavings)}</p>
          </div>
        </div>
      </div>

      {/* Order Links */}
      <div className="flex flex-wrap gap-3">
        {swiggyLink && (
          <a
            href={swiggyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Order on Swiggy
          </a>
        )}
        {zomatoLink && (
          <a
            href={zomatoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Order on Zomato
          </a>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm overflow-x-auto">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Category:</label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Toggle Filters */}
        <label className="flex items-center gap-2 cursor-pointer min-h-[44px] whitespace-nowrap">
          <input
            type="checkbox"
            checked={showMatchedOnly}
            onChange={(e) => setShowMatchedOnly(e.target.checked)}
            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
          />
          <span className="text-sm text-gray-600">Matched only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer min-h-[44px] whitespace-nowrap">
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
            className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
          />
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-sm inline-block" />
            Veg only
          </span>
        </label>

        {/* Results count */}
        <span className="text-sm text-gray-400 ml-auto">
          {filteredItems.length} items
        </span>
      </div>

      {/* Menu Items */}
      <div className="space-y-8">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full" />
              {category}
              <span className="text-sm font-normal text-gray-400">({items.length})</span>
            </h4>

            <div className="space-y-3">
              {items.map((item) => (
                <MenuItemRow key={item.matchId} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No items found matching your filters</p>
        </div>
      )}
    </div>
  );
}

function MenuItemRow({ item }: { item: ComparisonMenuItem }) {
  const displayItem = item.swiggy || item.zomato;
  if (!displayItem) return null;

  const isMatched = item.swiggy && item.zomato;
  const swiggyOnly = item.swiggy && !item.zomato;

  const cheaper = item.priceDifference?.cheaperPlatform;
  const savings = item.priceDifference?.savings ?? 0;
  // Calculate percentage from prices
  const savingsPercentage = item.priceDifference && item.priceDifference.swiggy > 0 && item.priceDifference.zomato > 0
    ? (savings / Math.max(item.priceDifference.swiggy, item.priceDifference.zomato)) * 100
    : 0;
  const hasSignificantSavings = isMatched && savings > 0 && savingsPercentage >= 15;

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        hasSignificantSavings ? 'ring-1 ring-green-300 bg-green-50/50' : ''
      }`}
    >
      {/* Veg/Non-veg indicator */}
      <div
        className={`w-5 h-5 border-2 rounded flex items-center justify-center shrink-0 ${
          displayItem.isVeg ? 'border-green-500' : 'border-red-500'
        }`}
      >
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            displayItem.isVeg ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
      </div>

      {/* Image */}
      {displayItem.imageUrl && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <Image
            src={displayItem.imageUrl}
            alt={displayItem.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h5 className="font-medium text-gray-800 line-clamp-1">{displayItem.name}</h5>
            {displayItem.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{displayItem.description}</p>
            )}
          </div>

          {/* Platform badges for non-matched */}
          {!isMatched && (
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                swiggyOnly
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {swiggyOnly ? 'Swiggy only' : 'Zomato only'}
            </span>
          )}
        </div>

        {/* Match confidence */}
        {isMatched && item.matchConfidence < 0.8 && (
          <p className="text-xs text-yellow-600 mt-1">
            ~{Math.round(item.matchConfidence * 100)}% match confidence
          </p>
        )}
      </div>

      {/* Prices */}
      <div className="text-right shrink-0">
        <PriceBadgeCompact
          swiggyPrice={item.swiggy?.price}
          zomatoPrice={item.zomato?.price}
        />
        {isMatched && cheaper && cheaper !== 'same' && item.priceDifference && (
          <p className="text-xs text-green-600 mt-1 font-medium">
            Save ₹{item.priceDifference.savings}
            {savingsPercentage > 0 && ` (${Math.round(savingsPercentage)}%)`}
          </p>
        )}
      </div>
    </div>
  );
}
