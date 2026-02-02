import puppeteer from 'puppeteer';
import type {
  NormalizedRestaurant,
  NormalizedMenuItem,
} from './types';

const ZOMATO_BASE_URL = 'https://www.zomato.com';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function parseCostForTwo(costString: string): number {
  const match = costString?.match(/₹\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function parseDeliveryTime(timeString: string): number {
  const match = timeString?.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
}

export function getZomatoDeepLink(slug: string, city: string = 'bangalore'): string {
  return `${ZOMATO_BASE_URL}/${city}/${slug}`;
}

async function getBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
  });
  return browser;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRestaurantsFromState(state: any, city: string): NormalizedRestaurant[] {
  const restaurants: NormalizedRestaurant[] = [];
  const seenIds = new Set<string>();

  const addRestaurant = (rest: NormalizedRestaurant) => {
    if (rest.platformId && !seenIds.has(rest.platformId)) {
      seenIds.add(rest.platformId);
      restaurants.push(rest);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeRestaurant = (info: any): NormalizedRestaurant | null => {
    if (!info || !info.resId) return null;

    const slug = info.slugs?.restaurant || info.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
    const costForTwo = info.cfo?.text || info.costText?.text || '₹400 for two';
    const deliveryTimeStr = info.sla?.deliveryTime || info.deliveryTime || '30 min';

    return {
      id: `zomato_${info.resId}`,
      platform: 'zomato',
      platformId: String(info.resId),
      name: info.name || '',
      imageUrl: info.image?.url || info.imageUrl || '',
      locality: info.locality?.name || info.localityName || '',
      area: info.locality?.localityUrl?.split('/').pop() || '',
      cuisines: Array.isArray(info.cuisines)
        ? info.cuisines.map((c: { name?: string } | string) => typeof c === 'string' ? c : c.name || '').filter(Boolean)
        : (info.cuisineString || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      rating: parseFloat(info.rating?.aggregate_rating || info.avgRating || '0'),
      ratingCount: info.rating?.votes || info.ratingCount || '0',
      costForTwo,
      costForTwoValue: parseCostForTwo(costForTwo),
      deliveryTime: parseDeliveryTime(deliveryTimeStr),
      deliveryTimeString: deliveryTimeStr,
      isOpen: info.isOpen ?? true,
      discount: info.offers?.[0]?.title || info.bulkOffers?.[0]?.text,
      deepLink: getZomatoDeepLink(slug, city),
    };
  };

  // Try multiple paths where restaurants might be stored
  try {
    // Path 1: pages.current.pageData.sections
    const sections = state?.pages?.current?.pageData?.sections;
    if (sections) {
      // SECTION_SEARCH_RESULT
      const searchResults = sections.SECTION_SEARCH_RESULT || [];
      for (const item of searchResults) {
        const rest = normalizeRestaurant(item.info || item);
        if (rest) addRestaurant(rest);
      }

      // SECTION_SEARCH_META_INFO restaurants
      const metaInfo = sections.SECTION_SEARCH_META_INFO;
      if (metaInfo?.restaurants) {
        for (const item of metaInfo.restaurants) {
          const rest = normalizeRestaurant(item.info || item);
          if (rest) addRestaurant(rest);
        }
      }
    }

    // Path 2: pages.restaurant (individual restaurant pages)
    const restaurantPage = state?.pages?.restaurant;
    if (restaurantPage) {
      for (const key of Object.keys(restaurantPage)) {
        const info = restaurantPage[key]?.sections?.SECTION_BASIC_INFO;
        if (info) {
          const rest = normalizeRestaurant(info);
          if (rest) addRestaurant(rest);
        }
      }
    }

    // Path 3: Direct restaurants object
    if (state?.restaurants) {
      for (const key of Object.keys(state.restaurants)) {
        const info = state.restaurants[key]?.info || state.restaurants[key];
        const rest = normalizeRestaurant(info);
        if (rest) addRestaurant(rest);
      }
    }

    // Path 4: entities.restaurants
    if (state?.entities?.restaurants) {
      for (const key of Object.keys(state.entities.restaurants)) {
        const info = state.entities.restaurants[key];
        const rest = normalizeRestaurant(info);
        if (rest) addRestaurant(rest);
      }
    }

    // Path 5: Search results in a different format
    const searchResults = state?.searchResults?.restaurants || state?.searchPageResults?.restaurants;
    if (searchResults) {
      for (const item of searchResults) {
        const rest = normalizeRestaurant(item.info || item);
        if (rest) addRestaurant(rest);
      }
    }

  } catch (err) {
    console.error('Error extracting restaurants from state:', err);
  }

  return restaurants;
}

export async function searchZomatoRestaurants(
  lat: number,
  lng: number,
  query?: string,
  city: string = 'bangalore'
): Promise<NormalizedRestaurant[]> {
  console.log(`Zomato: Starting search for "${query || 'delivery'}" in ${city}`);
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();

    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1920, height: 1080 });

    // Grant geolocation permission and set coordinates
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(`${ZOMATO_BASE_URL}`, ['geolocation']);
    await page.setGeolocation({ latitude: lat, longitude: lng });

    // Build URL
    const searchUrl = query
      ? `${ZOMATO_BASE_URL}/${city}/restaurants?q=${encodeURIComponent(query)}`
      : `${ZOMATO_BASE_URL}/${city}/delivery`;

    console.log(`Zomato: Navigating to ${searchUrl}`);

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for content to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Extract __PRELOADED_STATE__ from the page
    const result = await page.evaluate(() => {
      // Method 1: Look for script with __PRELOADED_STATE__
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent || '';
        if (content.includes('window.__PRELOADED_STATE__')) {
          // Find the JSON object after the assignment
          const startMarker = 'window.__PRELOADED_STATE__ = ';
          const startIdx = content.indexOf(startMarker);
          if (startIdx !== -1) {
            const jsonStart = startIdx + startMarker.length;
            // Find where the JSON ends - it should be followed by ; or end of script
            let depth = 0;
            let inString = false;
            let escapeNext = false;
            let jsonEnd = jsonStart;

            for (let i = jsonStart; i < content.length; i++) {
              const char = content[i];

              if (escapeNext) {
                escapeNext = false;
                continue;
              }

              if (char === '\\' && inString) {
                escapeNext = true;
                continue;
              }

              if (char === '"' && !escapeNext) {
                inString = !inString;
                continue;
              }

              if (!inString) {
                if (char === '{' || char === '[') depth++;
                else if (char === '}' || char === ']') {
                  depth--;
                  if (depth === 0) {
                    jsonEnd = i + 1;
                    break;
                  }
                }
              }
            }

            const jsonStr = content.slice(jsonStart, jsonEnd);
            try {
              return { success: true, data: JSON.parse(jsonStr) };
            } catch (e) {
              return { success: false, error: `JSON parse failed: ${e}`, snippet: jsonStr.slice(0, 500) };
            }
          }
        }
      }

      // Method 2: Check if it's on window object directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).__PRELOADED_STATE__) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { success: true, data: (window as any).__PRELOADED_STATE__ };
      }

      return { success: false, error: 'No __PRELOADED_STATE__ found' };
    });

    if (!result.success) {
      console.log(`Zomato: Failed to extract preloaded state - ${result.error}`);

      // Fallback: Try to scrape restaurant cards directly from DOM
      console.log('Zomato: Attempting DOM scraping fallback...');

      const domRestaurants = await page.evaluate((cityName) => {
        const results: Array<{
          name: string;
          rating: string;
          cuisines: string;
          deliveryTime: string;
          costForTwo: string;
          imageUrl: string;
          link: string;
        }> = [];

        // Try various selectors for restaurant cards
        const selectors = [
          '[data-testid="restaurant-card"]',
          '.sc-gUjWJS', // Common Zomato card class pattern
          'a[href*="/order"]',
          '.jumbo-tracker', // Another pattern
        ];

        for (const selector of selectors) {
          const cards = document.querySelectorAll(selector);
          if (cards.length > 0) {
            cards.forEach((card) => {
              // Try to find restaurant name
              const nameEl = card.querySelector('h4, [class*="sc-"] > p:first-child, [class*="name"]');
              const name = nameEl?.textContent?.trim();

              if (name && name.length > 1) {
                // Get other details
                const ratingEl = card.querySelector('[class*="rating"], [color="RATING"]');
                const linkEl = card.closest('a') || card.querySelector('a');
                const imgEl = card.querySelector('img');
                const textContent = card.textContent || '';

                // Extract delivery time (pattern: "XX min")
                const timeMatch = textContent.match(/(\d+)\s*min/i);
                // Extract cost (pattern: "₹XXX for two")
                const costMatch = textContent.match(/₹\s*(\d+)/);

                results.push({
                  name,
                  rating: ratingEl?.textContent?.trim() || '',
                  cuisines: '',
                  deliveryTime: timeMatch ? `${timeMatch[1]} min` : '30 min',
                  costForTwo: costMatch ? `₹${costMatch[1]} for two` : '₹400 for two',
                  imageUrl: imgEl?.src || '',
                  link: linkEl?.getAttribute('href') || '',
                });
              }
            });

            if (results.length > 0) break;
          }
        }

        return results;
      }, city);

      await browser.close();

      if (domRestaurants.length > 0) {
        console.log(`Zomato: Found ${domRestaurants.length} restaurants via DOM scraping`);
        return domRestaurants.map((r, index) => ({
          id: `zomato_dom_${index}`,
          platform: 'zomato' as const,
          platformId: `dom_${index}`,
          name: r.name,
          imageUrl: r.imageUrl,
          locality: '',
          area: city,
          cuisines: r.cuisines ? r.cuisines.split(',').map((c) => c.trim()) : [],
          rating: parseFloat(r.rating) || 0,
          ratingCount: '',
          costForTwo: r.costForTwo,
          costForTwoValue: parseCostForTwo(r.costForTwo),
          deliveryTime: parseDeliveryTime(r.deliveryTime),
          deliveryTimeString: r.deliveryTime,
          isOpen: true,
          deepLink: r.link.startsWith('http') ? r.link : `${ZOMATO_BASE_URL}${r.link}`,
        }));
      }

      return [];
    }

    await browser.close();

    const restaurants = extractRestaurantsFromState(result.data, city);
    console.log(`Zomato: Found ${restaurants.length} restaurants from preloaded state`);

    return restaurants;
  } catch (error) {
    console.error('Zomato scraping error:', error);
    await browser.close();
    throw error;
  }
}

export async function getZomatoMenu(
  restaurantSlug: string,
  city: string = 'bangalore'
): Promise<NormalizedMenuItem[]> {
  console.log(`Zomato: Fetching menu for ${restaurantSlug}`);
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();

    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1920, height: 1080 });

    const menuUrl = `${ZOMATO_BASE_URL}/${city}/${restaurantSlug}/order`;
    console.log(`Zomato: Navigating to ${menuUrl}`);

    await page.goto(menuUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for menu to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Try to extract menu from preloaded state or DOM
    const menuItems = await page.evaluate(() => {
      const items: Array<{
        name: string;
        description: string;
        price: number;
        isVeg: boolean;
        category: string;
        imageUrl: string;
      }> = [];

      // Try to get from __PRELOADED_STATE__
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (window as any).__PRELOADED_STATE__;
      if (state) {
        try {
          // Navigate to menu data in state
          const menuData = state?.pages?.current?.pageData?.order?.menuList?.menus ||
                          state?.pages?.restaurant?.[Object.keys(state?.pages?.restaurant || {})[0]]?.order?.menuList?.menus;

          if (menuData) {
            for (const menu of menuData) {
              const categories = menu?.menu?.categories || [];
              for (const cat of categories) {
                const categoryName = cat?.category?.name || 'Menu';
                const categoryItems = cat?.category?.items || [];
                for (const item of categoryItems) {
                  items.push({
                    name: item.name || '',
                    description: item.desc || item.description || '',
                    price: (item.price || item.item_price || 0) / 100,
                    isVeg: item.isVeg ?? item.item_tag === 'veg',
                    category: categoryName,
                    imageUrl: item.imageUrl || item.image?.url || '',
                  });
                }
              }
            }
          }
        } catch (e) {
          console.error('Error parsing menu from state:', e);
        }
      }

      // Fallback: scrape from DOM if no items found
      if (items.length === 0) {
        const menuSections = document.querySelectorAll('[class*="MenuSection"], [class*="menu-section"]');
        let currentCategory = 'Menu';

        menuSections.forEach((section) => {
          const categoryEl = section.querySelector('h2, h3, h4, [class*="category"]');
          if (categoryEl) {
            currentCategory = categoryEl.textContent?.trim() || 'Menu';
          }

          const itemCards = section.querySelectorAll('[class*="MenuItem"], [class*="dish-card"]');
          itemCards.forEach((card) => {
            const nameEl = card.querySelector('[class*="name"], h4, h5');
            const priceEl = card.querySelector('[class*="price"]');
            const descEl = card.querySelector('[class*="desc"]');
            const vegIcon = card.querySelector('[class*="veg"], [fill="green"]');
            const imgEl = card.querySelector('img');

            const priceText = priceEl?.textContent || '0';
            const priceMatch = priceText.match(/₹?\s*(\d+)/);

            if (nameEl?.textContent) {
              items.push({
                name: nameEl.textContent.trim(),
                description: descEl?.textContent?.trim() || '',
                price: priceMatch ? parseInt(priceMatch[1], 10) : 0,
                isVeg: !!vegIcon,
                category: currentCategory,
                imageUrl: imgEl?.src || '',
              });
            }
          });
        });
      }

      return items;
    });

    await browser.close();

    console.log(`Zomato: Found ${menuItems.length} menu items`);

    return menuItems.map((item, index) => ({
      id: `zomato_item_${index}`,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      isVeg: item.isVeg,
      imageUrl: item.imageUrl || undefined,
    }));
  } catch (error) {
    console.error('Zomato menu scraping error:', error);
    await browser.close();
    throw error;
  }
}
