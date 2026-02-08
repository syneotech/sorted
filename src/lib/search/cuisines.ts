// Cuisine taxonomy for Indian food delivery context

import type { CuisineTaxonomy, CuisineTaxonomyV2, RestaurantCuisineProfile, DishEntry } from './types';
import { CUISINE_CONFIG } from './config';

// ============================================================================
// V2: Hierarchical Cuisine Taxonomy with Affinity
// ============================================================================

export const CUISINE_TAXONOMY_V2: CuisineTaxonomyV2[] = [
  // === EAST ASIAN ===
  {
    id: 'chinese',
    name: 'Chinese',
    level: 'regional',
    parent: 'east_asian',
    aliases: ['indo-chinese', 'indo chinese', 'hakka', 'szechuan', 'cantonese', 'pan-asian', 'pan asian', 'oriental'],
    dishes: [
      { name: 'noodles', weight: 1.0 },
      { name: 'fried rice', weight: 1.0 },
      { name: 'manchurian', weight: 1.0 },
      { name: 'momos', weight: 0.8 }, // Also Tibetan
      { name: 'spring roll', weight: 0.9 },
      { name: 'chowmein', weight: 1.0 },
      { name: 'chow mein', weight: 1.0 },
      { name: 'dumplings', weight: 0.9 },
      { name: 'schezwan', weight: 1.0 },
      { name: 'szechwan', weight: 1.0 },
      { name: 'chilli chicken', weight: 0.95 },
      { name: 'chilli paneer', weight: 0.95 },
      { name: 'gobi manchurian', weight: 1.0 },
      { name: 'hakka noodles', weight: 1.0 },
      { name: 'crispy', weight: 0.5 },
      { name: 'chopsuey', weight: 1.0 },
      { name: 'chop suey', weight: 1.0 },
      { name: 'sweet corn soup', weight: 0.9 },
      { name: 'hot and sour', weight: 0.95 },
      { name: 'kung pao', weight: 1.0 },
      { name: 'dragon chicken', weight: 0.95 },
      { name: 'honey chilli', weight: 0.9 },
      { name: 'lollipop', weight: 0.9 },
      { name: 'dimsums', weight: 0.95 },
      { name: 'dim sum', weight: 0.95 },
      { name: 'wonton', weight: 0.95 },
    ],
    neighbors: [
      { cuisine: 'thai', affinity: 0.6 },
      { cuisine: 'pan_asian', affinity: 0.7 },
      { cuisine: 'japanese', affinity: 0.5 },
      { cuisine: 'tibetan', affinity: 0.7 },
      { cuisine: 'korean', affinity: 0.5 },
      { cuisine: 'vietnamese', affinity: 0.5 },
    ],
  },
  {
    id: 'japanese',
    name: 'Japanese',
    level: 'regional',
    parent: 'east_asian',
    aliases: ['sushi', 'ramen', 'japanese food'],
    dishes: [
      { name: 'sushi', weight: 1.0 },
      { name: 'ramen', weight: 1.0 },
      { name: 'tempura', weight: 1.0 },
      { name: 'teriyaki', weight: 0.9 },
      { name: 'miso', weight: 0.95 },
      { name: 'udon', weight: 1.0 },
      { name: 'sashimi', weight: 1.0 },
      { name: 'edamame', weight: 0.9 },
      { name: 'gyoza', weight: 0.9 },
      { name: 'katsu', weight: 1.0 },
      { name: 'bento', weight: 0.9 },
      { name: 'maki', weight: 1.0 },
      { name: 'nigiri', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'chinese', affinity: 0.5 },
      { cuisine: 'korean', affinity: 0.6 },
      { cuisine: 'pan_asian', affinity: 0.7 },
    ],
  },
  {
    id: 'korean',
    name: 'Korean',
    level: 'regional',
    parent: 'east_asian',
    aliases: ['korean food', 'k-food'],
    dishes: [
      { name: 'bibimbap', weight: 1.0 },
      { name: 'kimchi', weight: 1.0 },
      { name: 'bulgogi', weight: 1.0 },
      { name: 'korean fried chicken', weight: 1.0 },
      { name: 'japchae', weight: 1.0 },
      { name: 'tteokbokki', weight: 1.0 },
      { name: 'kimbap', weight: 1.0 },
      { name: 'ramyeon', weight: 0.9 },
    ],
    neighbors: [
      { cuisine: 'japanese', affinity: 0.6 },
      { cuisine: 'chinese', affinity: 0.5 },
      { cuisine: 'pan_asian', affinity: 0.7 },
    ],
  },
  {
    id: 'thai',
    name: 'Thai',
    level: 'regional',
    parent: 'east_asian',
    aliases: ['thai food', 'thailand'],
    dishes: [
      { name: 'pad thai', weight: 1.0 },
      { name: 'tom yum', weight: 1.0 },
      { name: 'green curry', weight: 1.0 },
      { name: 'red curry', weight: 1.0 },
      { name: 'massaman', weight: 1.0 },
      { name: 'satay', weight: 0.8 },
      { name: 'thai fried rice', weight: 1.0 },
      { name: 'coconut soup', weight: 0.8 },
      { name: 'papaya salad', weight: 1.0 },
      { name: 'basil chicken', weight: 0.95 },
    ],
    neighbors: [
      { cuisine: 'chinese', affinity: 0.6 },
      { cuisine: 'vietnamese', affinity: 0.7 },
      { cuisine: 'pan_asian', affinity: 0.8 },
    ],
  },
  {
    id: 'vietnamese',
    name: 'Vietnamese',
    level: 'regional',
    parent: 'east_asian',
    aliases: ['vietnamese food', 'vietnam'],
    dishes: [
      { name: 'pho', weight: 1.0 },
      { name: 'banh mi', weight: 1.0 },
      { name: 'spring rolls', weight: 0.7 },
      { name: 'bun cha', weight: 1.0 },
      { name: 'vermicelli', weight: 0.7 },
    ],
    neighbors: [
      { cuisine: 'thai', affinity: 0.7 },
      { cuisine: 'chinese', affinity: 0.5 },
      { cuisine: 'pan_asian', affinity: 0.7 },
    ],
  },
  {
    id: 'tibetan',
    name: 'Tibetan',
    level: 'regional',
    parent: 'east_asian',
    aliases: ['tibetan food', 'himalayan', 'nepali'],
    dishes: [
      { name: 'momos', weight: 1.0 },
      { name: 'thukpa', weight: 1.0 },
      { name: 'tingmo', weight: 1.0 },
      { name: 'shabalay', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'chinese', affinity: 0.7 },
      { cuisine: 'north_indian', affinity: 0.4 },
    ],
  },
  {
    id: 'pan_asian',
    name: 'Pan-Asian',
    level: 'specialty',
    parent: 'east_asian',
    aliases: ['asian', 'asian fusion', 'oriental'],
    dishes: [
      { name: 'stir fry', weight: 0.8 },
      { name: 'noodles', weight: 0.7 },
      { name: 'fried rice', weight: 0.7 },
      { name: 'dumplings', weight: 0.7 },
    ],
    neighbors: [
      { cuisine: 'chinese', affinity: 0.8 },
      { cuisine: 'thai', affinity: 0.8 },
      { cuisine: 'japanese', affinity: 0.7 },
      { cuisine: 'vietnamese', affinity: 0.7 },
      { cuisine: 'korean', affinity: 0.7 },
    ],
  },

  // === SOUTH ASIAN ===
  {
    id: 'north_indian',
    name: 'North Indian',
    level: 'regional',
    parent: 'south_asian',
    aliases: ['north indian', 'indian', 'hindustani'],
    dishes: [
      { name: 'butter chicken', weight: 1.0 },
      { name: 'dal makhani', weight: 1.0 },
      { name: 'paneer butter masala', weight: 1.0 },
      { name: 'naan', weight: 0.9 },
      { name: 'roti', weight: 0.8 },
      { name: 'paratha', weight: 0.9 },
      { name: 'rajma', weight: 1.0 },
      { name: 'kadai', weight: 0.9 },
      { name: 'korma', weight: 0.9 },
      { name: 'tikka', weight: 0.8 },
      { name: 'tandoori', weight: 0.9 },
      { name: 'kebab', weight: 0.8 },
      { name: 'seekh', weight: 0.9 },
      { name: 'pulao', weight: 0.8 },
      { name: 'shahi paneer', weight: 1.0 },
      { name: 'malai kofta', weight: 1.0 },
      { name: 'aloo gobi', weight: 0.95 },
      { name: 'palak paneer', weight: 1.0 },
      { name: 'dal tadka', weight: 0.95 },
      { name: 'mutter paneer', weight: 1.0 },
      { name: 'mixed veg', weight: 0.7 },
      { name: 'bhindi', weight: 0.9 },
      { name: 'baingan', weight: 0.9 },
      { name: 'jeera rice', weight: 0.85 },
      { name: 'chicken curry', weight: 0.8 },
      { name: 'biryani', weight: 0.7 }, // Also Biryani cuisine
    ],
    neighbors: [
      { cuisine: 'punjabi', affinity: 0.95 },
      { cuisine: 'mughlai', affinity: 0.9 },
      { cuisine: 'biryani', affinity: 0.7 },
      { cuisine: 'south_indian', affinity: 0.5 },
      { cuisine: 'street_food', affinity: 0.6 },
    ],
  },
  {
    id: 'punjabi',
    name: 'Punjabi',
    level: 'specialty',
    parent: 'north_indian',
    aliases: ['punjabi food', 'dhaba'],
    dishes: [
      { name: 'chole bhature', weight: 1.0 },
      { name: 'sarson ka saag', weight: 1.0 },
      { name: 'makki di roti', weight: 1.0 },
      { name: 'lassi', weight: 0.9 },
      { name: 'dal makhani', weight: 0.95 },
      { name: 'butter chicken', weight: 0.9 },
      { name: 'paneer tikka', weight: 0.9 },
      { name: 'amritsari kulcha', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'north_indian', affinity: 0.95 },
      { cuisine: 'mughlai', affinity: 0.7 },
    ],
  },
  {
    id: 'mughlai',
    name: 'Mughlai',
    level: 'specialty',
    parent: 'north_indian',
    aliases: ['mughlai food', 'awadhi', 'lucknowi', 'nawabi'],
    dishes: [
      { name: 'biryani', weight: 0.9 },
      { name: 'korma', weight: 1.0 },
      { name: 'nihari', weight: 1.0 },
      { name: 'kebab', weight: 0.95 },
      { name: 'seekh kebab', weight: 0.95 },
      { name: 'galouti kebab', weight: 1.0 },
      { name: 'sheermal', weight: 1.0 },
      { name: 'phirni', weight: 0.9 },
    ],
    neighbors: [
      { cuisine: 'north_indian', affinity: 0.9 },
      { cuisine: 'biryani', affinity: 0.85 },
      { cuisine: 'hyderabadi', affinity: 0.7 },
    ],
  },
  {
    id: 'south_indian',
    name: 'South Indian',
    level: 'regional',
    parent: 'south_asian',
    aliases: ['south indian', 'tamil', 'kerala', 'karnataka', 'andhra', 'telangana', 'chettinad', 'udupi', 'mangalorean'],
    dishes: [
      { name: 'dosa', weight: 1.0 },
      { name: 'idli', weight: 1.0 },
      { name: 'vada', weight: 1.0 },
      { name: 'uttapam', weight: 1.0 },
      { name: 'appam', weight: 1.0 },
      { name: 'puttu', weight: 1.0 },
      { name: 'upma', weight: 0.9 },
      { name: 'pongal', weight: 1.0 },
      { name: 'sambar', weight: 1.0 },
      { name: 'rasam', weight: 1.0 },
      { name: 'curd rice', weight: 0.95 },
      { name: 'thali', weight: 0.7 },
      { name: 'meals', weight: 0.8 },
      { name: 'filter coffee', weight: 0.9 },
      { name: 'payasam', weight: 0.95 },
      { name: 'kesari', weight: 0.9 },
      { name: 'kothu parotta', weight: 1.0 },
      { name: 'parotta', weight: 0.95 },
      { name: 'set dosa', weight: 1.0 },
      { name: 'masala dosa', weight: 1.0 },
      { name: 'rava dosa', weight: 1.0 },
      { name: 'onion dosa', weight: 1.0 },
      { name: 'medu vada', weight: 1.0 },
      { name: 'bisi bele bath', weight: 1.0 },
      { name: 'lemon rice', weight: 0.9 },
      { name: 'tamarind rice', weight: 0.95 },
      { name: 'coconut chutney', weight: 0.9 },
    ],
    neighbors: [
      { cuisine: 'north_indian', affinity: 0.5 },
      { cuisine: 'hyderabadi', affinity: 0.6 },
      { cuisine: 'biryani', affinity: 0.5 },
    ],
  },
  {
    id: 'hyderabadi',
    name: 'Hyderabadi',
    level: 'specialty',
    parent: 'south_asian',
    aliases: ['hyderabadi food', 'deccan'],
    dishes: [
      { name: 'hyderabadi biryani', weight: 1.0 },
      { name: 'haleem', weight: 1.0 },
      { name: 'mirchi ka salan', weight: 1.0 },
      { name: 'double ka meetha', weight: 1.0 },
      { name: 'lukhmi', weight: 1.0 },
      { name: 'qubani ka meetha', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'biryani', affinity: 0.95 },
      { cuisine: 'mughlai', affinity: 0.7 },
      { cuisine: 'south_indian', affinity: 0.6 },
    ],
  },
  {
    id: 'biryani',
    name: 'Biryani',
    level: 'specialty',
    parent: 'south_asian',
    aliases: ['biriyani', 'briyani', 'dum biryani'],
    dishes: [
      { name: 'biryani', weight: 1.0 },
      { name: 'chicken biryani', weight: 1.0 },
      { name: 'mutton biryani', weight: 1.0 },
      { name: 'veg biryani', weight: 1.0 },
      { name: 'egg biryani', weight: 1.0 },
      { name: 'hyderabadi biryani', weight: 1.0 },
      { name: 'dum biryani', weight: 1.0 },
      { name: 'kacchi biryani', weight: 1.0 },
      { name: 'lucknowi biryani', weight: 1.0 },
      { name: 'raita', weight: 0.7 },
      { name: 'shorba', weight: 0.8 },
      { name: 'mirchi ka salan', weight: 0.9 },
    ],
    neighbors: [
      { cuisine: 'hyderabadi', affinity: 0.95 },
      { cuisine: 'mughlai', affinity: 0.85 },
      { cuisine: 'north_indian', affinity: 0.7 },
    ],
  },

  // === MIDDLE EASTERN ===
  {
    id: 'lebanese',
    name: 'Lebanese',
    level: 'regional',
    parent: 'middle_eastern',
    aliases: ['lebanese food', 'mediterranean', 'levantine'],
    dishes: [
      { name: 'hummus', weight: 1.0 },
      { name: 'falafel', weight: 1.0 },
      { name: 'shawarma', weight: 0.9 },
      { name: 'fattoush', weight: 1.0 },
      { name: 'tabbouleh', weight: 1.0 },
      { name: 'kibbeh', weight: 1.0 },
      { name: 'baba ganoush', weight: 1.0 },
      { name: 'pita', weight: 0.8 },
      { name: 'labneh', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'turkish', affinity: 0.7 },
      { cuisine: 'arabian', affinity: 0.8 },
      { cuisine: 'mediterranean', affinity: 0.9 },
    ],
  },
  {
    id: 'turkish',
    name: 'Turkish',
    level: 'regional',
    parent: 'middle_eastern',
    aliases: ['turkish food', 'ottoman'],
    dishes: [
      { name: 'kebab', weight: 0.9 },
      { name: 'doner', weight: 1.0 },
      { name: 'kofte', weight: 1.0 },
      { name: 'baklava', weight: 0.9 },
      { name: 'pide', weight: 1.0 },
      { name: 'lahmacun', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'lebanese', affinity: 0.7 },
      { cuisine: 'arabian', affinity: 0.7 },
      { cuisine: 'mediterranean', affinity: 0.8 },
    ],
  },
  {
    id: 'arabian',
    name: 'Arabian',
    level: 'regional',
    parent: 'middle_eastern',
    aliases: ['arabic', 'arab food', 'middle eastern'],
    dishes: [
      { name: 'shawarma', weight: 1.0 },
      { name: 'kebab', weight: 0.85 },
      { name: 'mandi', weight: 1.0 },
      { name: 'machboos', weight: 1.0 },
      { name: 'kunafa', weight: 0.9 },
      { name: 'dates', weight: 0.7 },
    ],
    neighbors: [
      { cuisine: 'lebanese', affinity: 0.8 },
      { cuisine: 'turkish', affinity: 0.7 },
    ],
  },
  {
    id: 'afghan',
    name: 'Afghan',
    level: 'regional',
    parent: 'middle_eastern',
    aliases: ['afghani', 'afghanistan'],
    dishes: [
      { name: 'kabuli pulao', weight: 1.0 },
      { name: 'mantu', weight: 1.0 },
      { name: 'ashak', weight: 1.0 },
      { name: 'chapli kebab', weight: 0.9 },
      { name: 'bolani', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'north_indian', affinity: 0.6 },
      { cuisine: 'mughlai', affinity: 0.6 },
      { cuisine: 'arabian', affinity: 0.5 },
    ],
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    level: 'specialty',
    parent: 'middle_eastern',
    aliases: ['med', 'greek'],
    dishes: [
      { name: 'hummus', weight: 0.9 },
      { name: 'falafel', weight: 0.9 },
      { name: 'greek salad', weight: 1.0 },
      { name: 'gyros', weight: 1.0 },
      { name: 'souvlaki', weight: 1.0 },
      { name: 'tzatziki', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'lebanese', affinity: 0.9 },
      { cuisine: 'turkish', affinity: 0.8 },
      { cuisine: 'continental', affinity: 0.6 },
    ],
  },

  // === EUROPEAN ===
  {
    id: 'italian',
    name: 'Italian',
    level: 'regional',
    parent: 'european',
    aliases: ['italian food', 'pasta', 'continental'],
    dishes: [
      { name: 'pizza', weight: 0.9 }, // Also Pizza specialty
      { name: 'pasta', weight: 1.0 },
      { name: 'lasagna', weight: 1.0 },
      { name: 'risotto', weight: 1.0 },
      { name: 'ravioli', weight: 1.0 },
      { name: 'gnocchi', weight: 1.0 },
      { name: 'spaghetti', weight: 1.0 },
      { name: 'penne', weight: 1.0 },
      { name: 'alfredo', weight: 1.0 },
      { name: 'arrabiata', weight: 1.0 },
      { name: 'carbonara', weight: 1.0 },
      { name: 'bruschetta', weight: 1.0 },
      { name: 'garlic bread', weight: 0.8 },
      { name: 'tiramisu', weight: 1.0 },
      { name: 'focaccia', weight: 1.0 },
      { name: 'calzone', weight: 1.0 },
      { name: 'marinara', weight: 0.95 },
    ],
    neighbors: [
      { cuisine: 'pizza', affinity: 0.9 },
      { cuisine: 'continental', affinity: 0.8 },
      { cuisine: 'mediterranean', affinity: 0.6 },
    ],
  },
  {
    id: 'pizza',
    name: 'Pizza',
    level: 'specialty',
    parent: 'italian',
    aliases: ['pizzeria', 'pizza place'],
    dishes: [
      { name: 'pizza', weight: 1.0 },
      { name: 'margherita', weight: 1.0 },
      { name: 'pepperoni', weight: 1.0 },
      { name: 'farmhouse', weight: 1.0 },
      { name: 'bbq chicken', weight: 0.9 },
      { name: 'paneer pizza', weight: 1.0 },
      { name: 'veggie supreme', weight: 1.0 },
      { name: 'cheese burst', weight: 1.0 },
      { name: 'stuffed crust', weight: 1.0 },
      { name: 'thin crust', weight: 1.0 },
      { name: 'deep dish', weight: 1.0 },
      { name: 'garlic bread', weight: 0.7 },
      { name: 'breadsticks', weight: 0.8 },
    ],
    neighbors: [
      { cuisine: 'italian', affinity: 0.9 },
      { cuisine: 'fast_food', affinity: 0.6 },
      { cuisine: 'american', affinity: 0.5 },
    ],
  },
  {
    id: 'continental',
    name: 'Continental',
    level: 'regional',
    parent: 'european',
    aliases: ['european', 'western', 'fusion'],
    dishes: [
      { name: 'steak', weight: 0.9 },
      { name: 'grilled', weight: 0.7 },
      { name: 'roast', weight: 0.8 },
      { name: 'soup', weight: 0.6 },
      { name: 'salad', weight: 0.5 },
      { name: 'sandwich', weight: 0.6 },
    ],
    neighbors: [
      { cuisine: 'italian', affinity: 0.8 },
      { cuisine: 'american', affinity: 0.7 },
      { cuisine: 'cafe', affinity: 0.6 },
      { cuisine: 'mediterranean', affinity: 0.6 },
    ],
  },

  // === AMERICAN ===
  {
    id: 'american',
    name: 'American',
    level: 'regional',
    parent: 'american',
    aliases: ['usa', 'us food'],
    dishes: [
      { name: 'burger', weight: 0.9 },
      { name: 'steak', weight: 0.9 },
      { name: 'ribs', weight: 1.0 },
      { name: 'mac and cheese', weight: 1.0 },
      { name: 'chicken wings', weight: 0.9 },
      { name: 'bbq', weight: 0.9 },
    ],
    neighbors: [
      { cuisine: 'fast_food', affinity: 0.8 },
      { cuisine: 'continental', affinity: 0.7 },
      { cuisine: 'tex_mex', affinity: 0.6 },
    ],
  },
  {
    id: 'fast_food',
    name: 'Fast Food',
    level: 'specialty',
    parent: 'american',
    aliases: ['american', 'burger', 'fries', 'qsr', 'quick service'],
    dishes: [
      { name: 'burger', weight: 1.0 },
      { name: 'fries', weight: 1.0 },
      { name: 'french fries', weight: 1.0 },
      { name: 'nuggets', weight: 1.0 },
      { name: 'chicken wings', weight: 0.9 },
      { name: 'hot dog', weight: 1.0 },
      { name: 'sandwich', weight: 0.7 },
      { name: 'wrap', weight: 0.7 },
      { name: 'tacos', weight: 0.7 },
      { name: 'nachos', weight: 0.8 },
      { name: 'quesadilla', weight: 0.8 },
      { name: 'loaded fries', weight: 1.0 },
      { name: 'onion rings', weight: 0.95 },
      { name: 'milkshake', weight: 0.8 },
      { name: 'combo', weight: 0.6 },
    ],
    neighbors: [
      { cuisine: 'american', affinity: 0.8 },
      { cuisine: 'pizza', affinity: 0.5 },
      { cuisine: 'cafe', affinity: 0.5 },
    ],
  },
  {
    id: 'mexican',
    name: 'Mexican',
    level: 'regional',
    parent: 'american',
    aliases: ['mexican food', 'mexico'],
    dishes: [
      { name: 'tacos', weight: 1.0 },
      { name: 'burrito', weight: 1.0 },
      { name: 'quesadilla', weight: 1.0 },
      { name: 'nachos', weight: 0.95 },
      { name: 'enchilada', weight: 1.0 },
      { name: 'guacamole', weight: 0.9 },
      { name: 'salsa', weight: 0.7 },
      { name: 'churros', weight: 0.8 },
    ],
    neighbors: [
      { cuisine: 'tex_mex', affinity: 0.9 },
      { cuisine: 'american', affinity: 0.5 },
    ],
  },
  {
    id: 'tex_mex',
    name: 'Tex-Mex',
    level: 'specialty',
    parent: 'american',
    aliases: ['texmex', 'tex mex'],
    dishes: [
      { name: 'tacos', weight: 0.9 },
      { name: 'nachos', weight: 1.0 },
      { name: 'quesadilla', weight: 0.95 },
      { name: 'fajitas', weight: 1.0 },
      { name: 'chili', weight: 0.9 },
    ],
    neighbors: [
      { cuisine: 'mexican', affinity: 0.9 },
      { cuisine: 'american', affinity: 0.6 },
    ],
  },

  // === SPECIALTY/OTHER ===
  {
    id: 'cafe',
    name: 'Cafe',
    level: 'specialty',
    aliases: ['coffee', 'bakery', 'snacks', 'coffee shop'],
    dishes: [
      { name: 'coffee', weight: 1.0 },
      { name: 'cappuccino', weight: 1.0 },
      { name: 'latte', weight: 1.0 },
      { name: 'espresso', weight: 1.0 },
      { name: 'americano', weight: 1.0 },
      { name: 'mocha', weight: 1.0 },
      { name: 'frappe', weight: 0.95 },
      { name: 'sandwich', weight: 0.6 },
      { name: 'croissant', weight: 0.9 },
      { name: 'muffin', weight: 0.9 },
      { name: 'brownie', weight: 0.8 },
      { name: 'cake', weight: 0.7 },
      { name: 'pastry', weight: 0.8 },
      { name: 'cookie', weight: 0.8 },
      { name: 'waffle', weight: 0.85 },
      { name: 'pancake', weight: 0.85 },
      { name: 'smoothie', weight: 0.7 },
      { name: 'shake', weight: 0.7 },
      { name: 'tea', weight: 0.8 },
      { name: 'chai', weight: 0.7 },
    ],
    neighbors: [
      { cuisine: 'desserts', affinity: 0.8 },
      { cuisine: 'continental', affinity: 0.6 },
      { cuisine: 'beverages', affinity: 0.7 },
    ],
  },
  {
    id: 'desserts',
    name: 'Desserts',
    level: 'specialty',
    aliases: ['sweets', 'ice cream', 'mithai', 'bakery'],
    dishes: [
      { name: 'ice cream', weight: 1.0 },
      { name: 'kulfi', weight: 1.0 },
      { name: 'gulab jamun', weight: 1.0 },
      { name: 'rasgulla', weight: 1.0 },
      { name: 'jalebi', weight: 1.0 },
      { name: 'ladoo', weight: 1.0 },
      { name: 'barfi', weight: 1.0 },
      { name: 'cake', weight: 0.9 },
      { name: 'pastry', weight: 0.9 },
      { name: 'brownie', weight: 0.9 },
      { name: 'cheesecake', weight: 0.95 },
      { name: 'pudding', weight: 0.9 },
      { name: 'falooda', weight: 1.0 },
      { name: 'rabri', weight: 1.0 },
      { name: 'kheer', weight: 1.0 },
      { name: 'halwa', weight: 1.0 },
      { name: 'sandesh', weight: 1.0 },
      { name: 'peda', weight: 1.0 },
      { name: 'motichoor', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'cafe', affinity: 0.8 },
      { cuisine: 'beverages', affinity: 0.5 },
    ],
  },
  {
    id: 'street_food',
    name: 'Street Food',
    level: 'specialty',
    aliases: ['chaat', 'snacks', 'street snacks'],
    dishes: [
      { name: 'chaat', weight: 1.0 },
      { name: 'pani puri', weight: 1.0 },
      { name: 'golgappa', weight: 1.0 },
      { name: 'bhel puri', weight: 1.0 },
      { name: 'sev puri', weight: 1.0 },
      { name: 'dahi puri', weight: 1.0 },
      { name: 'samosa', weight: 0.9 },
      { name: 'kachori', weight: 0.95 },
      { name: 'pav bhaji', weight: 1.0 },
      { name: 'vada pav', weight: 1.0 },
      { name: 'dabeli', weight: 1.0 },
      { name: 'misal pav', weight: 1.0 },
      { name: 'aloo tikki', weight: 0.95 },
      { name: 'chole kulche', weight: 0.9 },
      { name: 'momos', weight: 0.7 },
      { name: 'frankie', weight: 0.9 },
      { name: 'roll', weight: 0.6 },
    ],
    neighbors: [
      { cuisine: 'north_indian', affinity: 0.6 },
      { cuisine: 'rolls', affinity: 0.7 },
      { cuisine: 'fast_food', affinity: 0.5 },
    ],
  },
  {
    id: 'healthy',
    name: 'Healthy',
    level: 'specialty',
    aliases: ['salad', 'health food', 'diet', 'fitness', 'organic'],
    dishes: [
      { name: 'salad', weight: 1.0 },
      { name: 'smoothie bowl', weight: 1.0 },
      { name: 'poke bowl', weight: 1.0 },
      { name: 'quinoa', weight: 1.0 },
      { name: 'grilled', weight: 0.7 },
      { name: 'steamed', weight: 0.8 },
      { name: 'soup', weight: 0.6 },
      { name: 'juice', weight: 0.7 },
      { name: 'protein', weight: 0.8 },
    ],
    neighbors: [
      { cuisine: 'continental', affinity: 0.5 },
      { cuisine: 'cafe', affinity: 0.5 },
      { cuisine: 'beverages', affinity: 0.5 },
    ],
  },
  {
    id: 'seafood',
    name: 'Seafood',
    level: 'specialty',
    aliases: ['fish', 'coastal', 'bengali'],
    dishes: [
      { name: 'fish', weight: 1.0 },
      { name: 'prawn', weight: 1.0 },
      { name: 'crab', weight: 1.0 },
      { name: 'lobster', weight: 1.0 },
      { name: 'pomfret', weight: 1.0 },
      { name: 'surmai', weight: 1.0 },
      { name: 'rawas', weight: 1.0 },
      { name: 'fish curry', weight: 1.0 },
      { name: 'fish fry', weight: 1.0 },
      { name: 'tandoori fish', weight: 0.95 },
      { name: 'prawn curry', weight: 1.0 },
      { name: 'fish biryani', weight: 0.9 },
    ],
    neighbors: [
      { cuisine: 'south_indian', affinity: 0.5 },
      { cuisine: 'north_indian', affinity: 0.4 },
    ],
  },
  {
    id: 'rolls',
    name: 'Rolls',
    level: 'specialty',
    aliases: ['kathi roll', 'wrap', 'frankie'],
    dishes: [
      { name: 'roll', weight: 1.0 },
      { name: 'kathi roll', weight: 1.0 },
      { name: 'chicken roll', weight: 1.0 },
      { name: 'paneer roll', weight: 1.0 },
      { name: 'egg roll', weight: 1.0 },
      { name: 'wrap', weight: 0.8 },
      { name: 'frankie', weight: 1.0 },
      { name: 'shawarma', weight: 0.7 },
      { name: 'kebab roll', weight: 1.0 },
      { name: 'tikka roll', weight: 1.0 },
    ],
    neighbors: [
      { cuisine: 'street_food', affinity: 0.7 },
      { cuisine: 'north_indian', affinity: 0.5 },
      { cuisine: 'fast_food', affinity: 0.5 },
    ],
  },
  {
    id: 'beverages',
    name: 'Beverages',
    level: 'specialty',
    aliases: ['drinks', 'juices', 'shakes'],
    dishes: [
      { name: 'juice', weight: 1.0 },
      { name: 'shake', weight: 1.0 },
      { name: 'smoothie', weight: 1.0 },
      { name: 'lassi', weight: 1.0 },
      { name: 'chaas', weight: 1.0 },
      { name: 'nimbu pani', weight: 1.0 },
      { name: 'jaljeera', weight: 1.0 },
      { name: 'cold coffee', weight: 0.9 },
      { name: 'iced tea', weight: 0.9 },
      { name: 'mocktail', weight: 0.95 },
      { name: 'soda', weight: 0.8 },
      { name: 'lemonade', weight: 0.95 },
      { name: 'coconut water', weight: 0.9 },
    ],
    neighbors: [
      { cuisine: 'cafe', affinity: 0.7 },
      { cuisine: 'healthy', affinity: 0.5 },
      { cuisine: 'desserts', affinity: 0.5 },
    ],
  },
];

// Create V2 lookup maps
const cuisineIdMapV2 = new Map<string, CuisineTaxonomyV2>();
const cuisineNameMapV2 = new Map<string, CuisineTaxonomyV2>();
const cuisineAliasMapV2 = new Map<string, CuisineTaxonomyV2>();
const dishToCuisineMapV2 = new Map<string, { cuisine: CuisineTaxonomyV2; weight: number }[]>();

// Initialize V2 maps
for (const cuisine of CUISINE_TAXONOMY_V2) {
  cuisineIdMapV2.set(cuisine.id, cuisine);
  cuisineNameMapV2.set(cuisine.name.toLowerCase(), cuisine);

  for (const alias of cuisine.aliases) {
    cuisineAliasMapV2.set(alias.toLowerCase(), cuisine);
  }

  for (const dish of cuisine.dishes) {
    const lowerDish = dish.name.toLowerCase();
    if (!dishToCuisineMapV2.has(lowerDish)) {
      dishToCuisineMapV2.set(lowerDish, []);
    }
    dishToCuisineMapV2.get(lowerDish)!.push({ cuisine, weight: dish.weight });
  }
}

// ============================================================================
// V2 Functions
// ============================================================================

/**
 * Find V2 cuisine by ID
 */
export function findCuisineByIdV2(id: string): CuisineTaxonomyV2 | undefined {
  return cuisineIdMapV2.get(id.toLowerCase());
}

/**
 * Find V2 cuisine by name
 */
export function findCuisineByNameV2(name: string): CuisineTaxonomyV2 | undefined {
  return cuisineNameMapV2.get(name.toLowerCase()) || cuisineAliasMapV2.get(name.toLowerCase());
}

/**
 * Get cuisine affinity between two cuisines (0-1)
 */
export function getCuisineAffinity(cuisine1: string, cuisine2: string): number {
  const lower1 = cuisine1.toLowerCase();
  const lower2 = cuisine2.toLowerCase();

  // Same cuisine
  if (lower1 === lower2) return 1.0;

  // Find the cuisines
  const c1 = findCuisineByNameV2(cuisine1);
  const c2 = findCuisineByNameV2(cuisine2);

  if (!c1 || !c2) return 0;

  // Same cuisine entry (via alias)
  if (c1.id === c2.id) return 1.0;

  // Check neighbors
  const neighbor = c1.neighbors.find(n => n.cuisine === c2.id);
  if (neighbor) return neighbor.affinity;

  // Check reverse
  const reverseNeighbor = c2.neighbors.find(n => n.cuisine === c1.id);
  if (reverseNeighbor) return reverseNeighbor.affinity;

  // Check shared parent (family relationship)
  if (c1.parent && c1.parent === c2.parent) {
    return 0.4; // Same family but not explicit neighbors
  }

  // Check if one is parent of other
  if (c1.parent === c2.id || c2.parent === c1.id) {
    return 0.8; // Parent-child relationship
  }

  return 0;
}

/**
 * Infer restaurant cuisine profile from cuisine list order
 * First cuisine = primary (100%), subsequent = secondary with decreasing weights
 */
export function inferCuisineProfile(cuisines: string[]): RestaurantCuisineProfile {
  if (cuisines.length === 0) {
    return { primary: 'unknown', secondary: [], estimatedCoverage: 0 };
  }

  const primary = cuisines[0];
  const secondary = cuisines.slice(1).map((cuisine, index) => ({
    cuisine,
    strength: Math.max(0.2, 0.6 - index * 0.15), // 0.6, 0.45, 0.3, 0.2, ...
  }));

  // Primary coverage = 1.0 minus secondary contributions
  const secondaryTotal = secondary.reduce((sum, s) => sum + s.strength * 0.3, 0);
  const estimatedCoverage = 1.0 - Math.min(secondaryTotal, 0.5);

  return { primary, secondary, estimatedCoverage };
}

/**
 * Get dish exclusivity weight for a cuisine
 * Returns how strongly a dish is associated with a specific cuisine
 */
export function getDishCuisineWeight(dish: string, cuisineName: string): number {
  const lowerDish = dish.toLowerCase();
  const entries = dishToCuisineMapV2.get(lowerDish);

  if (!entries) return 0;

  const entry = entries.find(
    e => e.cuisine.name.toLowerCase() === cuisineName.toLowerCase() ||
         e.cuisine.id === cuisineName.toLowerCase()
  );

  return entry?.weight ?? 0;
}

/**
 * Find all cuisines that serve a dish (V2) with weights
 */
export function findCuisinesByDishV2(dish: string): { cuisine: CuisineTaxonomyV2; weight: number }[] {
  return dishToCuisineMapV2.get(dish.toLowerCase()) || [];
}

/**
 * Calculate cuisine coverage score for a restaurant given searched cuisines
 */
export function calculateCuisineCoverage(
  searchedCuisines: string[],
  restaurantProfile: RestaurantCuisineProfile
): number {
  if (searchedCuisines.length === 0) return 0.5; // Neutral

  let maxCoverage = 0;

  for (const searched of searchedCuisines) {
    // Check if primary matches
    const primaryAffinity = getCuisineAffinity(searched, restaurantProfile.primary);
    if (primaryAffinity > 0) {
      const coverage = primaryAffinity * restaurantProfile.estimatedCoverage;
      maxCoverage = Math.max(maxCoverage, coverage);
    }

    // Check secondary cuisines
    for (const sec of restaurantProfile.secondary) {
      const secAffinity = getCuisineAffinity(searched, sec.cuisine);
      if (secAffinity > 0) {
        // Secondary coverage is reduced by strength
        const coverage = secAffinity * sec.strength * CUISINE_CONFIG.SECONDARY_CUISINE_PENALTY;
        maxCoverage = Math.max(maxCoverage, coverage);
      }
    }
  }

  return maxCoverage;
}

/**
 * Get cuisine prominence - how prominently the searched cuisine appears in restaurant
 */
export function getCuisineProminence(
  searchedCuisines: string[],
  restaurantProfile: RestaurantCuisineProfile
): number {
  if (searchedCuisines.length === 0) return 0.5;

  for (const searched of searchedCuisines) {
    // Check primary first
    const primaryAffinity = getCuisineAffinity(searched, restaurantProfile.primary);
    if (primaryAffinity >= 0.8) {
      return CUISINE_CONFIG.PRIMARY_CUISINE_BOOST;
    }

    // Check secondary
    for (const sec of restaurantProfile.secondary) {
      const secAffinity = getCuisineAffinity(searched, sec.cuisine);
      if (secAffinity >= 0.8) {
        return sec.strength * CUISINE_CONFIG.SECONDARY_CUISINE_PENALTY;
      }
    }
  }

  return 0.3; // Weak match
}

// ============================================================================
// V1 Taxonomy (maintained for backward compatibility)
// ============================================================================

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
