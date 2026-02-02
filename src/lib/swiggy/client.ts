import type {
  SwiggyMenuResponse,
  SwiggyRestaurant,
  SwiggyMenuItem,
  NormalizedRestaurant,
  NormalizedMenuItem,
} from './types';

const SWIGGY_BASE_URL = 'https://www.swiggy.com';
const SWIGGY_API_BASE = `${SWIGGY_BASE_URL}/dapi`;

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Origin: SWIGGY_BASE_URL,
  Referer: `${SWIGGY_BASE_URL}/`,
  'Content-Type': 'application/json',
};

export function getSwiggyImageUrl(cloudinaryImageId: string): string {
  if (!cloudinaryImageId) return '';
  return `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${cloudinaryImageId}`;
}

export function getSwiggyDeepLink(restaurantId: string, locality?: string): string {
  const slug = locality?.toLowerCase().replace(/\s+/g, '-') || 'restaurant';
  return `${SWIGGY_BASE_URL}/restaurants/${slug}-${restaurantId}`;
}

function parseCostForTwo(costString: string): number {
  if (!costString) return 0;
  const match = costString.match(/₹(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Normalize restaurant from the list endpoint format (has wrapper with info property)
export function normalizeSwiggyRestaurant(restaurant: SwiggyRestaurant): NormalizedRestaurant {
  const { info } = restaurant;
  return {
    id: `swiggy_${info.id}`,
    platform: 'swiggy',
    platformId: info.id,
    name: info.name,
    imageUrl: getSwiggyImageUrl(info.cloudinaryImageId),
    locality: info.locality || '',
    area: info.areaName || '',
    cuisines: info.cuisines || [],
    rating: info.avgRating || 0,
    ratingCount: info.totalRatingsString || '0',
    costForTwo: info.costForTwo || '',
    costForTwoValue: parseCostForTwo(info.costForTwo),
    deliveryTime: info.sla?.deliveryTime || 30,
    deliveryTimeString: info.sla?.slaString || '30 mins',
    isOpen: info.isOpen ?? true,
    discount: info.aggregatedDiscountInfoV2?.header,
    deepLink: getSwiggyDeepLink(info.id, info.locality),
  };
}

// Normalize restaurant from the search endpoint format (info is directly on the object)
interface SwiggyRestaurantInfo {
  id: string;
  name: string;
  cloudinaryImageId: string;
  locality?: string;
  areaName?: string;
  cuisines?: string[];
  avgRating?: number;
  totalRatingsString?: string;
  costForTwo?: string;
  costForTwoMessage?: string;
  sla?: {
    deliveryTime?: number;
    slaString?: string;
  };
  isOpen?: boolean;
  aggregatedDiscountInfoV3?: {
    header?: string;
  };
}

function normalizeSwiggyRestaurantInfo(info: SwiggyRestaurantInfo): NormalizedRestaurant {
  const costForTwo = info.costForTwo || info.costForTwoMessage || '';
  return {
    id: `swiggy_${info.id}`,
    platform: 'swiggy',
    platformId: info.id,
    name: info.name,
    imageUrl: getSwiggyImageUrl(info.cloudinaryImageId),
    locality: info.locality || '',
    area: info.areaName || '',
    cuisines: info.cuisines || [],
    rating: info.avgRating || 0,
    ratingCount: info.totalRatingsString || '0',
    costForTwo,
    costForTwoValue: parseCostForTwo(costForTwo),
    deliveryTime: info.sla?.deliveryTime || 30,
    deliveryTimeString: info.sla?.slaString || '30 mins',
    isOpen: info.isOpen ?? true,
    discount: info.aggregatedDiscountInfoV3?.header,
    deepLink: getSwiggyDeepLink(info.id, info.locality),
  };
}

export function normalizeSwiggyMenuItem(
  item: SwiggyMenuItem,
  category: string
): NormalizedMenuItem {
  const price = item.price || item.defaultPrice || 0;
  return {
    id: `swiggy_${item.id}`,
    name: item.name,
    description: item.description || '',
    category,
    price: price / 100, // Swiggy prices are in paise
    isVeg: item.itemAttribute?.vegClassifier === 'VEG' || item.isVeg,
    imageUrl: item.imageId ? getSwiggyImageUrl(item.imageId) : undefined,
    rating: item.ratings?.aggregatedRating?.rating
      ? parseFloat(item.ratings.aggregatedRating.rating)
      : undefined,
    ratingCount: item.ratings?.aggregatedRating?.ratingCount,
  };
}

export async function searchSwiggyRestaurants(
  lat: number,
  lng: number,
  query?: string
): Promise<NormalizedRestaurant[]> {
  const url = query
    ? `${SWIGGY_API_BASE}/restaurants/search/v3?lat=${lat}&lng=${lng}&str=${encodeURIComponent(query)}&trackingId=undefined&submitAction=ENTER&queryUniqueId=`
    : `${SWIGGY_API_BASE}/restaurants/list/v5?lat=${lat}&lng=${lng}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Swiggy API error: ${response.status} ${response.statusText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();
    const restaurants: NormalizedRestaurant[] = [];
    const seenIds = new Set<string>();

    // Helper to add restaurant without duplicates
    const addRestaurant = (restaurant: NormalizedRestaurant) => {
      if (!seenIds.has(restaurant.platformId)) {
        seenIds.add(restaurant.platformId);
        restaurants.push(restaurant);
      }
    };

    // Extract restaurants from the response cards
    for (const card of data.data?.cards || []) {
      // Format 1: List endpoint - gridElements.infoWithStyle.restaurants
      const gridElements = card.card?.card?.gridElements?.infoWithStyle?.restaurants;
      if (gridElements && Array.isArray(gridElements)) {
        for (const restaurant of gridElements) {
          if (restaurant.info) {
            addRestaurant(normalizeSwiggyRestaurant(restaurant));
          }
        }
      }

      // Format 2: Search endpoint - groupedCard.cardGroupMap.DISH/RESTAURANT.cards
      const groupedCard = card.groupedCard;
      if (groupedCard?.cardGroupMap) {
        // Check DISH cards (search results with dishes)
        const dishCards = groupedCard.cardGroupMap.DISH?.cards || [];
        for (const dishCard of dishCards) {
          const restaurantInfo = dishCard.card?.card?.restaurant?.info;
          if (restaurantInfo) {
            addRestaurant(normalizeSwiggyRestaurantInfo(restaurantInfo));
          }
        }

        // Check RESTAURANT cards (search results with restaurants)
        const restaurantCards = groupedCard.cardGroupMap.RESTAURANT?.cards || [];
        for (const restCard of restaurantCards) {
          const info = restCard.card?.card?.info;
          if (info) {
            addRestaurant(normalizeSwiggyRestaurantInfo(info));
          }
        }
      }
    }

    console.log(`Swiggy: Found ${restaurants.length} restaurants for query "${query || 'listing'}"`);
    return restaurants;
  } catch (error) {
    console.error('Swiggy search error:', error);
    throw error;
  }
}

export async function getSwiggyMenu(
  restaurantId: string,
  lat: number,
  lng: number
): Promise<NormalizedMenuItem[]> {
  const url = `${SWIGGY_API_BASE}/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${restaurantId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Swiggy menu API error: ${response.status} ${response.statusText}`);
    }

    const data: SwiggyMenuResponse = await response.json();
    const menuItems: NormalizedMenuItem[] = [];

    // Extract menu items from the response
    for (const card of data.data?.cards || []) {
      const regularCards = card.groupedCard?.cardGroupMap?.REGULAR?.cards;
      if (!regularCards) continue;

      for (const menuCard of regularCards) {
        const cardData = menuCard.card?.card;
        if (!cardData) continue;

        // Direct item cards
        if (cardData.itemCards) {
          const category = cardData.title || 'Uncategorized';
          for (const itemCard of cardData.itemCards) {
            if (itemCard.card?.info) {
              menuItems.push(normalizeSwiggyMenuItem(itemCard.card.info, category));
            }
          }
        }

        // Nested categories
        if (cardData.categories) {
          for (const cat of cardData.categories) {
            for (const itemCard of cat.itemCards || []) {
              if (itemCard.card?.info) {
                menuItems.push(normalizeSwiggyMenuItem(itemCard.card.info, cat.title));
              }
            }
          }
        }
      }
    }

    return menuItems;
  } catch (error) {
    console.error('Swiggy menu error:', error);
    throw error;
  }
}
