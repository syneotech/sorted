// Cuisine taxonomy for Indian food delivery context

import type { CuisineTaxonomy } from './types';

export const CUISINE_TAXONOMY: CuisineTaxonomy[] = [
  {
    name: 'Chinese',
    aliases: ['indo-chinese', 'indo chinese', 'hakka', 'szechuan', 'cantonese', 'pan-asian', 'pan asian', 'oriental'],
    dishes: [
      'noodles', 'manchurian', 'fried rice', 'chowmein', 'chow mein', 'momos', 'dumplings',
      'spring roll', 'schezwan', 'szechwan', 'chilli chicken', 'chilli paneer', 'gobi manchurian',
      'hakka noodles', 'crispy', 'chopsuey', 'chop suey', 'sweet corn soup', 'hot and sour',
      'kung pao', 'dragon chicken', 'honey chilli', 'lollipop', 'dimsums', 'dim sum', 'wonton'
    ],
    related: ['Asian', 'Thai', 'Japanese'],
  },
  {
    name: 'North Indian',
    aliases: ['north indian', 'punjabi', 'mughlai', 'awadhi', 'lucknowi', 'kashmiri', 'rajasthani', 'delhi'],
    dishes: [
      'biryani', 'butter chicken', 'dal makhani', 'paneer butter masala', 'naan', 'roti', 'paratha',
      'chole bhature', 'rajma', 'kadai', 'korma', 'tikka', 'tandoori', 'kebab', 'seekh',
      'pulao', 'shahi paneer', 'malai kofta', 'aloo gobi', 'palak paneer', 'dal tadka',
      'mutter paneer', 'mixed veg', 'bhindi', 'baingan', 'jeera rice', 'chicken curry'
    ],
    related: ['Indian', 'Mughlai', 'Biryani'],
  },
  {
    name: 'South Indian',
    aliases: ['south indian', 'tamil', 'kerala', 'karnataka', 'andhra', 'telangana', 'chettinad', 'udupi', 'mangalorean'],
    dishes: [
      'dosa', 'idli', 'vada', 'uttapam', 'appam', 'puttu', 'upma', 'pongal', 'sambar',
      'rasam', 'curd rice', 'thali', 'meals', 'filter coffee', 'payasam', 'kesari',
      'kothu parotta', 'parotta', 'set dosa', 'masala dosa', 'rava dosa', 'onion dosa',
      'medu vada', 'bisi bele bath', 'lemon rice', 'tamarind rice', 'coconut chutney'
    ],
    related: ['Indian', 'Andhra', 'Kerala'],
  },
  {
    name: 'Biryani',
    aliases: ['biriyani', 'briyani', 'hyderabadi', 'lucknowi biryani', 'dum biryani'],
    dishes: [
      'biryani', 'chicken biryani', 'mutton biryani', 'veg biryani', 'egg biryani',
      'hyderabadi biryani', 'dum biryani', 'kacchi biryani', 'kebab', 'mirchi ka salan',
      'raita', 'shorba', 'haleem', 'phirni'
    ],
    related: ['North Indian', 'Mughlai', 'Hyderabadi'],
  },
  {
    name: 'Italian',
    aliases: ['pizza', 'pasta', 'continental'],
    dishes: [
      'pizza', 'pasta', 'lasagna', 'risotto', 'ravioli', 'gnocchi', 'spaghetti',
      'penne', 'alfredo', 'arrabiata', 'carbonara', 'margherita', 'pepperoni',
      'bruschetta', 'garlic bread', 'tiramisu', 'focaccia', 'calzone', 'marinara'
    ],
    related: ['Continental', 'European', 'American'],
  },
  {
    name: 'Fast Food',
    aliases: ['american', 'burger', 'fries', 'qsr', 'quick service'],
    dishes: [
      'burger', 'fries', 'french fries', 'nuggets', 'chicken wings', 'hot dog',
      'sandwich', 'wrap', 'tacos', 'nachos', 'quesadilla', 'loaded fries',
      'onion rings', 'milkshake', 'cola', 'soda', 'meal', 'combo'
    ],
    related: ['American', 'Continental', 'Cafe'],
  },
  {
    name: 'Pizza',
    aliases: ['pizzeria'],
    dishes: [
      'pizza', 'margherita', 'pepperoni', 'farmhouse', 'bbq chicken', 'paneer pizza',
      'veggie supreme', 'cheese burst', 'stuffed crust', 'thin crust', 'deep dish',
      'garlic bread', 'breadsticks', 'cheesy dip'
    ],
    related: ['Italian', 'Fast Food', 'American'],
  },
  {
    name: 'Cafe',
    aliases: ['coffee', 'bakery', 'desserts', 'snacks'],
    dishes: [
      'coffee', 'cappuccino', 'latte', 'espresso', 'americano', 'mocha', 'frappe',
      'sandwich', 'croissant', 'muffin', 'brownie', 'cake', 'pastry', 'cookie',
      'waffle', 'pancake', 'smoothie', 'shake', 'tea', 'chai'
    ],
    related: ['Desserts', 'Bakery', 'Continental'],
  },
  {
    name: 'Street Food',
    aliases: ['chaat', 'snacks', 'fast food'],
    dishes: [
      'chaat', 'pani puri', 'golgappa', 'bhel puri', 'sev puri', 'dahi puri',
      'samosa', 'kachori', 'pav bhaji', 'vada pav', 'dabeli', 'misal pav',
      'aloo tikki', 'chole kulche', 'momos', 'frankie', 'roll', 'tikka'
    ],
    related: ['North Indian', 'Fast Food', 'Snacks'],
  },
  {
    name: 'Thai',
    aliases: ['thai'],
    dishes: [
      'pad thai', 'tom yum', 'green curry', 'red curry', 'massaman', 'basil',
      'satay', 'spring rolls', 'thai fried rice', 'coconut soup', 'papaya salad'
    ],
    related: ['Asian', 'Chinese', 'Pan-Asian'],
  },
  {
    name: 'Japanese',
    aliases: ['sushi', 'ramen'],
    dishes: [
      'sushi', 'ramen', 'tempura', 'teriyaki', 'miso', 'udon', 'sashimi',
      'edamame', 'gyoza', 'katsu', 'bento', 'maki', 'nigiri'
    ],
    related: ['Asian', 'Chinese', 'Pan-Asian'],
  },
  {
    name: 'Desserts',
    aliases: ['sweets', 'ice cream', 'mithai', 'bakery'],
    dishes: [
      'ice cream', 'kulfi', 'gulab jamun', 'rasgulla', 'jalebi', 'ladoo',
      'barfi', 'cake', 'pastry', 'brownie', 'cheesecake', 'pudding', 'falooda',
      'rabri', 'kheer', 'halwa', 'sandesh', 'peda', 'motichoor'
    ],
    related: ['Sweets', 'Bakery', 'Cafe'],
  },
  {
    name: 'Healthy',
    aliases: ['salad', 'health food', 'diet', 'fitness', 'organic'],
    dishes: [
      'salad', 'smoothie bowl', 'poke bowl', 'quinoa', 'grilled', 'steamed',
      'soup', 'juice', 'protein', 'low carb', 'keto', 'vegan', 'gluten free'
    ],
    related: ['Continental', 'Cafe', 'Salads'],
  },
  {
    name: 'Seafood',
    aliases: ['fish', 'coastal', 'bengali'],
    dishes: [
      'fish', 'prawn', 'crab', 'lobster', 'pomfret', 'surmai', 'rawas',
      'fish curry', 'fish fry', 'tandoori fish', 'prawn curry', 'fish biryani'
    ],
    related: ['Bengali', 'Kerala', 'Coastal', 'Mangalorean'],
  },
  {
    name: 'Rolls',
    aliases: ['kathi roll', 'wrap', 'frankie'],
    dishes: [
      'roll', 'kathi roll', 'chicken roll', 'paneer roll', 'egg roll',
      'wrap', 'frankie', 'shawarma', 'kebab roll', 'tikka roll'
    ],
    related: ['Street Food', 'North Indian', 'Fast Food'],
  },
  {
    name: 'Beverages',
    aliases: ['drinks', 'juices', 'shakes'],
    dishes: [
      'juice', 'shake', 'smoothie', 'lassi', 'chaas', 'nimbu pani', 'jaljeera',
      'cold coffee', 'iced tea', 'mocktail', 'soda', 'lemonade', 'coconut water'
    ],
    related: ['Cafe', 'Healthy', 'Desserts'],
  },
];

// Create lookup maps for fast access
const cuisineNameMap = new Map<string, CuisineTaxonomy>();
const cuisineAliasMap = new Map<string, CuisineTaxonomy>();
const dishToCuisineMap = new Map<string, CuisineTaxonomy[]>();

// Initialize maps
for (const cuisine of CUISINE_TAXONOMY) {
  const lowerName = cuisine.name.toLowerCase();
  cuisineNameMap.set(lowerName, cuisine);

  for (const alias of cuisine.aliases) {
    cuisineAliasMap.set(alias.toLowerCase(), cuisine);
  }

  for (const dish of cuisine.dishes) {
    const lowerDish = dish.toLowerCase();
    if (!dishToCuisineMap.has(lowerDish)) {
      dishToCuisineMap.set(lowerDish, []);
    }
    dishToCuisineMap.get(lowerDish)!.push(cuisine);
  }
}

/**
 * Find cuisine by exact name
 */
export function findCuisineByName(name: string): CuisineTaxonomy | undefined {
  return cuisineNameMap.get(name.toLowerCase());
}

/**
 * Find cuisine by alias
 */
export function findCuisineByAlias(alias: string): CuisineTaxonomy | undefined {
  return cuisineAliasMap.get(alias.toLowerCase());
}

/**
 * Find cuisines that serve a specific dish
 */
export function findCuisinesByDish(dish: string): CuisineTaxonomy[] {
  return dishToCuisineMap.get(dish.toLowerCase()) || [];
}

/**
 * Check if a cuisine matches a search term
 */
export function cuisineMatchesSearch(cuisineName: string, searchTerm: string): boolean {
  const lowerCuisine = cuisineName.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();

  // Direct match
  if (lowerCuisine.includes(lowerSearch) || lowerSearch.includes(lowerCuisine)) {
    return true;
  }

  // Find the cuisine taxonomy
  const cuisine = findCuisineByName(cuisineName) || findCuisineByAlias(cuisineName);
  if (!cuisine) {
    return false;
  }

  // Check if search matches any alias
  for (const alias of cuisine.aliases) {
    if (alias.includes(lowerSearch) || lowerSearch.includes(alias)) {
      return true;
    }
  }

  // Check if search matches any related cuisine
  for (const related of cuisine.related) {
    if (related.toLowerCase().includes(lowerSearch) || lowerSearch.includes(related.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Get all related cuisines for a given cuisine name
 */
export function getRelatedCuisines(cuisineName: string): string[] {
  const cuisine = findCuisineByName(cuisineName) || findCuisineByAlias(cuisineName);
  if (!cuisine) {
    return [];
  }
  return [cuisine.name, ...cuisine.aliases, ...cuisine.related];
}

/**
 * Calculate similarity score between two cuisines (0-1)
 */
export function cuisineSimilarity(cuisine1: string, cuisine2: string): number {
  const lower1 = cuisine1.toLowerCase();
  const lower2 = cuisine2.toLowerCase();

  // Exact match
  if (lower1 === lower2) {
    return 1.0;
  }

  // One contains the other
  if (lower1.includes(lower2) || lower2.includes(lower1)) {
    return 0.9;
  }

  // Check if they're related
  const tax1 = findCuisineByName(cuisine1) || findCuisineByAlias(cuisine1);
  const tax2 = findCuisineByName(cuisine2) || findCuisineByAlias(cuisine2);

  if (tax1 && tax2) {
    // Same taxonomy entry
    if (tax1.name === tax2.name) {
      return 0.95;
    }

    // Check if related
    if (tax1.related.includes(tax2.name) || tax2.related.includes(tax1.name)) {
      return 0.7;
    }
  }

  return 0;
}
