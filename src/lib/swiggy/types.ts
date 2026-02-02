// Swiggy API response types

export interface SwiggyRestaurant {
  info: {
    id: string;
    name: string;
    cloudinaryImageId: string;
    locality: string;
    areaName: string;
    costForTwo: string;
    cuisines: string[];
    avgRating: number;
    parentId: string;
    avgRatingString: string;
    totalRatingsString: string;
    sla: {
      deliveryTime: number;
      lastMileTravel: number;
      serviceability: string;
      slaString: string;
      lastMileTravelString: string;
      iconType: string;
    };
    availability: {
      nextCloseTime: string;
      opened: boolean;
    };
    badges: Record<string, unknown>;
    isOpen: boolean;
    aggregatedDiscountInfoV2: {
      header: string;
      shortDescriptionList: Array<{ meta: string; discountType: string }>;
    };
    type: string;
    differentiatedUi: Record<string, unknown>;
    orderabilityCommunication: Record<string, unknown>;
    displayType: string;
    restaurantOfferPresentationInfo: Record<string, unknown>;
  };
  analytics: Record<string, unknown>;
  cta: {
    link: string;
    type: string;
  };
}

export interface SwiggyMenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  defaultPrice?: number;
  finalPrice: number;
  isVeg: boolean;
  imageId?: string;
  ratings?: {
    aggregatedRating: {
      rating: string;
      ratingCount: string;
    };
  };
  itemAttribute?: {
    vegClassifier: string;
  };
  ribbon?: {
    text: string;
    textColor: string;
    topBackgroundColor: string;
    bottomBackgroundColor: string;
  };
  addons?: Array<{
    groupId: string;
    groupName: string;
    choices: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }>;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    default: boolean;
  }>;
}

export interface SwiggyMenuCategory {
  title: string;
  itemCards: Array<{
    card: {
      info: SwiggyMenuItem;
    };
  }>;
}

export interface SwiggySearchResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    cards: Array<{
      card: {
        card: {
          id: string;
          gridElements?: {
            infoWithStyle: {
              restaurants: SwiggyRestaurant[];
            };
          };
        };
      };
    }>;
  };
}

export interface SwiggyMenuResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    cards: Array<{
      groupedCard?: {
        cardGroupMap: {
          REGULAR: {
            cards: Array<{
              card: {
                card: {
                  title?: string;
                  itemCards?: Array<{
                    card: {
                      info: SwiggyMenuItem;
                    };
                  }>;
                  categories?: Array<{
                    title: string;
                    itemCards: Array<{
                      card: {
                        info: SwiggyMenuItem;
                      };
                    }>;
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
