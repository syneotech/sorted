# Swiggy API Documentation

## Overview

Sorted uses Swiggy's unofficial `/dapi/` (data API) endpoints to fetch restaurant and menu data. These endpoints are the same ones used by Swiggy's web and mobile apps.

**Important**: This is an unofficial API. Swiggy does not provide public API access, and these endpoints may change without notice.

## Base Configuration

```typescript
const SWIGGY_BASE_URL = 'https://www.swiggy.com';
const SWIGGY_API_URL = `${SWIGGY_BASE_URL}/dapi`;

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
};
```

## Endpoints

### 1. Restaurant Search

**Endpoint**: `/dapi/restaurants/list/v5`

**Method**: GET

**Purpose**: Search for restaurants by location.

```http
GET /dapi/restaurants/list/v5?lat=12.9716&lng=77.5946&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lng` | number | Yes | Longitude |
| `is-seo-homepage-enabled` | boolean | No | Enable SEO homepage |
| `page_type` | string | No | `DESKTOP_WEB_LISTING` |

**Response Structure**:
```typescript
interface SwiggyListResponse {
  data: {
    success: boolean;
    cards: Array<{
      card: {
        card: {
          id: string;
          gridElements?: {
            infoWithStyle: {
              restaurants: Array<{
                info: SwiggyRestaurantInfo;
              }>;
            };
          };
        };
      };
    }>;
  };
}

interface SwiggyRestaurantInfo {
  id: string;
  name: string;
  cloudinaryImageId: string;
  locality: string;
  areaName: string;
  costForTwo: string;        // "₹300 for two"
  cuisines: string[];
  avgRating: number;
  totalRatingsString: string; // "10K+"
  sla: {
    deliveryTime: number;    // minutes
    lastMileTravel: number;  // km
    serviceability: string;
  };
  isOpen: boolean;
  slugs: {
    restaurant: string;
    city: string;
  };
}
```

### 2. Restaurant Search by Query

**Endpoint**: `/dapi/restaurants/search/v3`

**Method**: GET

**Purpose**: Search restaurants by keyword.

```http
GET /dapi/restaurants/search/v3?lat=12.9716&lng=77.5946&str=biryani&trackingId=...
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lng` | number | Yes | Longitude |
| `str` | string | Yes | Search query |
| `trackingId` | string | No | Session tracking |

**Response Structure**:
```typescript
interface SwiggySearchResponse {
  data: {
    cards: Array<{
      groupedCard?: {
        cardGroupMap: {
          RESTAURANT: {
            cards: Array<{
              card: {
                card: {
                  info: SwiggyRestaurantInfo;
                };
              };
            }>;
          };
        };
      };
    }>;
  };
}
```

### 3. Restaurant Menu

**Endpoint**: `/dapi/menu/pl`

**Method**: GET

**Purpose**: Get full menu for a restaurant.

```http
GET /dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=12.9716&lng=77.5946&restaurantId=12345
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `restaurantId` | string | Yes | Restaurant ID |
| `lat` | number | Yes | Latitude |
| `lng` | number | Yes | Longitude |
| `page-type` | string | No | `REGULAR_MENU` |
| `complete-menu` | boolean | No | Include full menu |

**Response Structure**:
```typescript
interface SwiggyMenuResponse {
  data: {
    cards: Array<{
      groupedCard?: {
        cardGroupMap: {
          REGULAR: {
            cards: Array<{
              card: {
                card: {
                  '@type': string;
                  title: string;          // Category name
                  itemCards?: Array<{
                    card: {
                      '@type': string;
                      info: SwiggyMenuItem;
                    };
                  }>;
                };
              };
            }>;
          };
        };
      };
    }>;
  };
}

interface SwiggyMenuItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  imageId?: string;
  price?: number;          // In paise (divide by 100)
  defaultPrice?: number;   // In paise
  isVeg: number;           // 1 = veg, 0 = non-veg
  ratings?: {
    aggregatedRating: {
      rating: string;
      ratingCount: string;
    };
  };
  inStock: number;
  addons?: Array<{
    groupId: string;
    groupName: string;
    choices: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }>;
}
```

## Data Normalization

### Restaurant Normalization

```typescript
function normalizeSwiggyRestaurant(
  info: SwiggyRestaurantInfo
): NormalizedRestaurant {
  return {
    platform: 'swiggy',
    platformId: info.id,
    name: info.name,
    rating: info.avgRating || 0,
    ratingCount: parseRatingCount(info.totalRatingsString),
    costForTwo: parseCostForTwo(info.costForTwo),
    deliveryTime: info.sla?.deliveryTime || 0,
    cuisines: info.cuisines || [],
    locality: info.locality || info.areaName || '',
    image: info.cloudinaryImageId
      ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${info.cloudinaryImageId}`
      : null,
    isOpen: info.isOpen,
    deepLink: `https://www.swiggy.com/restaurants/${info.slugs?.restaurant}-${info.id}`,
  };
}

function parseRatingCount(str: string): number {
  // "10K+" -> 10000, "500+" -> 500
  const match = str?.match(/(\d+(?:\.\d+)?)\s*([KM])?/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const multiplier = match[2]?.toUpperCase() === 'K' ? 1000 :
                     match[2]?.toUpperCase() === 'M' ? 1000000 : 1;
  return Math.round(num * multiplier);
}

function parseCostForTwo(str: string): number {
  // "₹300 for two" -> 300
  const match = str?.match(/₹?\s*(\d+)/);
  return match ? parseInt(match[1]) : 0;
}
```

### Menu Item Normalization

```typescript
function normalizeSwiggyMenuItem(item: SwiggyMenuItem): NormalizedMenuItem {
  // Price is in paise, convert to rupees
  const price = (item.price || item.defaultPrice || 0) / 100;

  return {
    platform: 'swiggy',
    platformId: item.id,
    name: item.name,
    description: item.description || '',
    price: price,
    isVeg: item.isVeg === 1,
    image: item.imageId
      ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300/${item.imageId}`
      : null,
    inStock: item.inStock === 1,
    rating: parseFloat(item.ratings?.aggregatedRating?.rating || '0'),
  };
}
```

## Response Extraction

Swiggy's response structure varies, so we need to handle multiple formats:

```typescript
function extractRestaurants(response: SwiggyListResponse): SwiggyRestaurantInfo[] {
  const restaurants: SwiggyRestaurantInfo[] = [];

  for (const card of response.data?.cards || []) {
    // Format 1: gridElements.infoWithStyle
    const grid = card.card?.card?.gridElements?.infoWithStyle;
    if (grid?.restaurants) {
      restaurants.push(...grid.restaurants.map(r => r.info));
    }

    // Format 2: groupedCard.cardGroupMap
    const grouped = card.groupedCard?.cardGroupMap?.RESTAURANT;
    if (grouped?.cards) {
      for (const c of grouped.cards) {
        if (c.card?.card?.info) {
          restaurants.push(c.card.card.info);
        }
      }
    }
  }

  return restaurants;
}
```

## Client Implementation

```typescript
// src/lib/swiggy/client.ts

export async function searchSwiggyRestaurants(
  lat: number,
  lng: number,
  query?: string
): Promise<NormalizedRestaurant[]> {
  const endpoint = query
    ? `/dapi/restaurants/search/v3?lat=${lat}&lng=${lng}&str=${encodeURIComponent(query)}`
    : `/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}`;

  const response = await fetch(`${SWIGGY_API_URL}${endpoint}`, {
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Swiggy API error: ${response.status}`);
  }

  const data = await response.json();
  const restaurants = extractRestaurants(data);

  return restaurants.map(normalizeSwiggyRestaurant);
}

export async function getSwiggyMenu(
  restaurantId: string,
  lat: number,
  lng: number
): Promise<{ categories: string[]; items: NormalizedMenuItem[] }> {
  const response = await fetch(
    `${SWIGGY_API_URL}/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${restaurantId}`,
    { headers: DEFAULT_HEADERS }
  );

  if (!response.ok) {
    throw new Error(`Swiggy Menu API error: ${response.status}`);
  }

  const data = await response.json();
  return extractMenu(data);
}
```

## Rate Limiting & Error Handling

### Known Limits
- Swiggy may rate limit after ~50 requests/minute
- Blocked requests return 403 or empty responses

### Error Handling
```typescript
try {
  const restaurants = await searchSwiggyRestaurants(lat, lng, query);
  return restaurants;
} catch (error) {
  if (error.message.includes('403')) {
    console.error('Swiggy rate limited');
    // Return empty array, don't fail the request
    return [];
  }
  throw error;
}
```

## Deep Links

Generate direct order links:

```typescript
function getSwiggyDeepLink(restaurant: SwiggyRestaurantInfo): string {
  const slug = restaurant.slugs?.restaurant || restaurant.name.toLowerCase().replace(/\s+/g, '-');
  return `https://www.swiggy.com/restaurants/${slug}-${restaurant.id}`;
}
```

## Known Issues

1. **Response Format Changes**: Swiggy frequently changes their response structure
2. **Location Restrictions**: Some areas may not have service
3. **Rate Limiting**: Heavy usage triggers temporary blocks
4. **Price Format**: Prices are in paise (multiply by 100 vs rupees)
5. **Image URLs**: Cloudinary IDs need proper URL construction
