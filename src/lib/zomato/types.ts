// Zomato scraped data types

export interface ZomatoRestaurant {
  resId: string;
  name: string;
  imageUrl: string;
  locality: string;
  area: string;
  cuisines: string[];
  rating: number;
  ratingCount: string;
  costForTwo: string;
  costForTwoValue: number;
  deliveryTime: number;
  deliveryTimeString: string;
  isOpen: boolean;
  discount?: string;
  slug: string;
}

export interface ZomatoMenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isVeg: boolean;
  imageUrl?: string;
  rating?: number;
  ratingCount?: string;
}

export interface ZomatoPreloadedState {
  pages?: {
    current?: {
      pageData?: {
        sections?: {
          SECTION_SEARCH_RESULT?: Array<{
            info?: ZomatoRestaurantInfo;
          }>;
          SECTION_BASIC_INFO?: ZomatoRestaurantInfo;
        };
        order?: {
          menuList?: {
            menus?: Array<{
              menu?: {
                categories?: Array<{
                  category?: {
                    name?: string;
                    items?: Array<ZomatoItemInfo>;
                  };
                }>;
              };
            }>;
          };
        };
      };
    };
  };
  restaurants?: {
    [key: string]: {
      info?: ZomatoRestaurantInfo;
    };
  };
}

export interface ZomatoRestaurantInfo {
  resId?: number;
  name?: string;
  image?: {
    url?: string;
  };
  locality?: {
    name?: string;
    localityUrl?: string;
  };
  rating?: {
    aggregate_rating?: string;
    rating_text?: string;
    votes?: string;
  };
  cuisines?: Array<{
    name?: string;
  }>;
  cfo?: {
    text?: string;
  };
  deliveryTime?: string;
  isOpen?: boolean;
  offers?: Array<{
    title?: string;
  }>;
  slugs?: {
    restaurant?: string;
  };
}

export interface ZomatoItemInfo {
  id?: number;
  name?: string;
  desc?: string;
  price?: number;
  isVeg?: boolean;
  imageUrl?: string;
}

export interface NormalizedRestaurant {
  id: string;
  platform: 'swiggy' | 'zomato';
  platformId: string;
  name: string;
  imageUrl: string;
  locality: string;
  area: string;
  cuisines: string[];
  rating: number;
  ratingCount: string;
  costForTwo: string;
  costForTwoValue: number;
  deliveryTime: number;
  deliveryTimeString: string;
  isOpen: boolean;
  discount?: string;
  deepLink: string;
}

export interface NormalizedMenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isVeg: boolean;
  imageUrl?: string;
  rating?: number;
  ratingCount?: string;
}
