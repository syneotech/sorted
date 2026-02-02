'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import LocationPicker from '@/components/LocationPicker';

interface Location {
  lat: number;
  lng: number;
  city: string;
  address?: string;
}

export default function Home() {
  const router = useRouter();
  const [location, setLocation] = useState<Location>({
    lat: 12.9716,
    lng: 77.5946,
    city: 'bangalore',
    address: 'Bangalore',
  });

  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams({
        q: query,
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        city: location.city,
      });
      router.push(`/search?${params.toString()}`);
    },
    [location, router]
  );

  const handleLocationChange = useCallback((newLocation: Location) => {
    setLocation(newLocation);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Sorted
          </h1>
          <LocationPicker
            onLocationChange={handleLocationChange}
            initialLocation={location}
          />
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Compare Food Prices
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Find the best deals on{' '}
            <span className="text-orange-500 font-semibold">Swiggy</span> &{' '}
            <span className="text-red-500 font-semibold">Zomato</span>
          </p>
          <p className="text-gray-500">
            Save money on every order by comparing prices across platforms
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-16">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            title="Price Comparison"
            description="See side-by-side pricing from both platforms to find the best deal"
            color="orange"
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
            title="Menu Matching"
            description="Intelligent matching of menu items across different restaurant listings"
            color="red"
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            title="Smart Savings"
            description="Calculate total savings and find the cheapest way to order your favorites"
            color="green"
          />
        </div>

        {/* How it works */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <StepCard
              number={1}
              title="Search"
              description="Enter a restaurant name or cuisine type"
            />
            <StepCard
              number={2}
              title="Compare"
              description="See matched restaurants from both platforms"
            />
            <StepCard
              number={3}
              title="Browse Menu"
              description="View item-by-item price comparisons"
            />
            <StepCard
              number={4}
              title="Order"
              description="Click to order from the cheaper platform"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">
              <p>Sorted - Compare food prices across delivery platforms</p>
              <p className="mt-1">Not affiliated with Swiggy or Zomato</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Made with Next.js</span>
              <span className="text-gray-300">|</span>
              <span>Deployed on Vercel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'orange' | 'red' | 'green';
}) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div
        className={`w-14 h-14 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold flex items-center justify-center mb-4">
          {number}
        </div>
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {number < 4 && (
        <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
          <svg
            className="w-6 h-6 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
