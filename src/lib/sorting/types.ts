// Sorting types and options

export type SortOption =
  | 'relevance'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'delivery-time'
  | 'savings';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  id: SortOption;
  label: string;
  description: string;
  direction: SortDirection;
}

export const SORT_OPTIONS: Record<SortOption, SortConfig> = {
  relevance: {
    id: 'relevance',
    label: 'Relevance',
    description: 'Best match for your search',
    direction: 'desc',
  },
  'price-low': {
    id: 'price-low',
    label: 'Price: Low to High',
    description: 'Cheapest options first',
    direction: 'asc',
  },
  'price-high': {
    id: 'price-high',
    label: 'Price: High to Low',
    description: 'Premium options first',
    direction: 'desc',
  },
  rating: {
    id: 'rating',
    label: 'Rating',
    description: 'Highest rated first',
    direction: 'desc',
  },
  'delivery-time': {
    id: 'delivery-time',
    label: 'Delivery Time',
    description: 'Fastest delivery first',
    direction: 'asc',
  },
  savings: {
    id: 'savings',
    label: 'Biggest Savings',
    description: 'Largest price difference first',
    direction: 'desc',
  },
};

export const DEFAULT_SORT: SortOption = 'relevance';
