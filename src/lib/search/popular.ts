// Popular search terms for India
export const POPULAR_SEARCHES = [
  'Biryani',
  'Pizza',
  'Burger',
  'Chinese',
  'North Indian',
  'South Indian',
  'Dosa',
  'Momos',
  'Rolls',
  'Chicken',
  'Paneer',
  'Thali',
  'Pasta',
  'Cake',
  'Ice Cream',
  'Coffee',
] as const;

export type PopularSearch = typeof POPULAR_SEARCHES[number];

// Categories of popular searches
export const POPULAR_CATEGORIES = {
  cuisines: ['Chinese', 'North Indian', 'South Indian', 'Italian'],
  dishes: ['Biryani', 'Pizza', 'Burger', 'Dosa', 'Momos', 'Rolls'],
  proteins: ['Chicken', 'Paneer'],
  meals: ['Thali', 'Pasta'],
  desserts: ['Cake', 'Ice Cream'],
  beverages: ['Coffee'],
} as const;

// Get a random subset of popular searches
export function getRandomPopularSearches(count: number = 6): string[] {
  const shuffled = [...POPULAR_SEARCHES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
