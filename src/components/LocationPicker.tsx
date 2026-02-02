'use client';

import { useState, useEffect, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
  city: string;
  address?: string;
}

interface LocationPickerProps {
  onLocationChange: (location: Location) => void;
  initialLocation?: Location;
}

const DEFAULT_LOCATIONS: Record<string, Location> = {
  bangalore: { lat: 12.9716, lng: 77.5946, city: 'bangalore', address: 'Bangalore' },
  delhi: { lat: 28.6139, lng: 77.209, city: 'delhi', address: 'New Delhi' },
  mumbai: { lat: 19.076, lng: 72.8777, city: 'mumbai', address: 'Mumbai' },
  chennai: { lat: 13.0827, lng: 80.2707, city: 'chennai', address: 'Chennai' },
  hyderabad: { lat: 17.385, lng: 78.4867, city: 'hyderabad', address: 'Hyderabad' },
  kolkata: { lat: 22.5726, lng: 88.3639, city: 'kolkata', address: 'Kolkata' },
  pune: { lat: 18.5204, lng: 73.8567, city: 'pune', address: 'Pune' },
};

export default function LocationPicker({
  onLocationChange,
  initialLocation,
}: LocationPickerProps) {
  const [location, setLocation] = useState<Location>(
    initialLocation || DEFAULT_LOCATIONS.bangalore
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved location from localStorage
    const saved = localStorage.getItem('userLocation');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocation(parsed);
        onLocationChange(parsed);
      } catch {
        // Invalid saved data, use default
      }
    }
  }, [onLocationChange]);

  const detectLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get city name (using Nominatim - free)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.state ||
            'Unknown';
          const address = data.display_name || 'Current Location';

          // Map to our supported cities or use custom
          const normalizedCity = city.toLowerCase().replace(/\s+/g, '');
          const supportedCity = Object.keys(DEFAULT_LOCATIONS).find((c) =>
            normalizedCity.includes(c)
          );

          const newLocation: Location = {
            lat: latitude,
            lng: longitude,
            city: supportedCity || 'bangalore', // Default to bangalore for Zomato scraping
            address: address.split(',').slice(0, 3).join(', '),
          };

          setLocation(newLocation);
          localStorage.setItem('userLocation', JSON.stringify(newLocation));
          onLocationChange(newLocation);
        } catch {
          // Use coordinates without reverse geocoding
          const newLocation: Location = {
            lat: latitude,
            lng: longitude,
            city: 'bangalore',
            address: 'Current Location',
          };
          setLocation(newLocation);
          localStorage.setItem('userLocation', JSON.stringify(newLocation));
          onLocationChange(newLocation);
        }

        setIsLoading(false);
      },
      (err) => {
        setError(`Unable to get location: ${err.message}`);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, [onLocationChange]);

  const selectCity = useCallback(
    (cityKey: string) => {
      const newLocation = DEFAULT_LOCATIONS[cityKey];
      setLocation(newLocation);
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
      onLocationChange(newLocation);
      setIsOpen(false);
    },
    [onLocationChange]
  );

  return (
    <div className="relative">
      {/* Location Display Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
      >
        <svg
          className="w-5 h-5 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-gray-700 font-medium max-w-[200px] truncate">
          {location.address || location.city}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Detect Location */}
          <button
            onClick={detectLocation}
            disabled={isLoading}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            {isLoading ? (
              <svg
                className="w-5 h-5 text-orange-500 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <div>
              <p className="text-gray-700 font-medium">Detect my location</p>
              <p className="text-gray-500 text-sm">Using GPS</p>
            </div>
          </button>

          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          {/* Popular Cities */}
          <div className="px-4 py-2 text-gray-500 text-xs font-medium uppercase">
            Popular Cities
          </div>
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(DEFAULT_LOCATIONS).map(([key, loc]) => (
              <button
                key={key}
                onClick={() => selectCity(key)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  location.city === key ? 'bg-orange-50' : ''
                }`}
              >
                <svg
                  className={`w-4 h-4 ${location.city === key ? 'text-orange-500' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span
                  className={`capitalize ${location.city === key ? 'text-orange-600 font-medium' : 'text-gray-700'}`}
                >
                  {loc.address}
                </span>
                {location.city === key && (
                  <svg
                    className="w-4 h-4 text-orange-500 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
