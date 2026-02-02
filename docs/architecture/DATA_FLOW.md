# Data Flow Documentation

## Search Flow

```mermaid
sequenceDiagram
    participant User
    participant SearchPage
    participant SearchAPI as /api/search
    participant Redis
    participant SwiggyClient
    participant ZomatoScraper
    participant Matcher
    participant Normalizer

    User->>SearchPage: Enter "Chinese"
    SearchPage->>SearchAPI: GET /api/search?q=Chinese&lat=12.97&lng=77.59

    SearchAPI->>SearchAPI: Generate cache key (MD5)
    SearchAPI->>Redis: GET unified_search:{hash}

    alt Cache Hit
        Redis-->>SearchAPI: Cached ComparisonRestaurant[]
        SearchAPI-->>SearchPage: Return cached results
    else Cache Miss
        par Parallel Platform Fetch
            SearchAPI->>SwiggyClient: searchSwiggyRestaurants()
            SwiggyClient->>SwiggyClient: GET /dapi/restaurants/list/v5
            SwiggyClient-->>SearchAPI: SwiggyRestaurant[]

            SearchAPI->>ZomatoScraper: searchZomatoRestaurants()
            ZomatoScraper->>ZomatoScraper: Launch Puppeteer
            ZomatoScraper->>ZomatoScraper: Navigate to zomato.com/city/delivery
            ZomatoScraper->>ZomatoScraper: Extract __PRELOADED_STATE__
            ZomatoScraper-->>SearchAPI: ZomatoRestaurant[]
        end

        SearchAPI->>Normalizer: normalizeSwiggy(swiggyResults)
        Normalizer-->>SearchAPI: NormalizedRestaurant[]

        SearchAPI->>Normalizer: normalizeZomato(zomatoResults)
        Normalizer-->>SearchAPI: NormalizedRestaurant[]

        SearchAPI->>Matcher: matchRestaurants(swiggy, zomato)
        Matcher->>Matcher: Fuse.js fuzzy match
        Matcher->>Matcher: Check locality overlap
        Matcher->>Matcher: Check cuisine overlap
        Matcher->>Matcher: Calculate confidence score
        Matcher-->>SearchAPI: ComparisonRestaurant[]

        SearchAPI->>Redis: SET unified_search:{hash} (TTL: 15min)
        SearchAPI-->>SearchPage: Return ComparisonRestaurant[]
    end

    SearchPage-->>User: Display restaurant cards
```

## Menu Comparison Flow

```mermaid
sequenceDiagram
    participant User
    participant RestaurantPage
    participant RestaurantAPI as /api/restaurant
    participant Redis
    participant SwiggyClient
    participant ZomatoScraper
    participant Matcher

    User->>RestaurantPage: Click restaurant card
    RestaurantPage->>RestaurantAPI: GET /api/restaurant?swiggy_id=X&zomato_slug=Y

    RestaurantAPI->>Redis: Check menu cache

    alt Cache Hit
        Redis-->>RestaurantAPI: Cached menu comparison
    else Cache Miss
        par Parallel Menu Fetch
            RestaurantAPI->>SwiggyClient: getSwiggyMenu(restaurantId)
            SwiggyClient-->>RestaurantAPI: SwiggyMenuItem[]

            RestaurantAPI->>ZomatoScraper: getZomatoMenu(restaurantSlug)
            ZomatoScraper-->>RestaurantAPI: ZomatoMenuItem[]
        end

        RestaurantAPI->>Matcher: matchMenuItems(swiggy, zomato)
        Matcher->>Matcher: Group by category
        Matcher->>Matcher: Fuse.js name matching
        Matcher->>Matcher: Match veg/non-veg
        Matcher-->>RestaurantAPI: ComparisonMenuItem[]

        RestaurantAPI->>RestaurantAPI: calculatePricing()
        RestaurantAPI->>Redis: Cache results (TTL: 30min)
    end

    RestaurantAPI-->>RestaurantPage: Menu + pricing data
    RestaurantPage-->>User: Display menu comparison
```

## Data Transformation Pipeline

```mermaid
flowchart LR
    subgraph Raw["Raw Data"]
        SR[Swiggy Response]
        ZR[Zomato Response]
    end

    subgraph Extract["Extraction"]
        SE[Extract restaurants]
        ZE[Extract from __PRELOADED_STATE__]
    end

    subgraph Normalize["Normalization"]
        SN[Swiggy Normalizer]
        ZN[Zomato Normalizer]
    end

    subgraph Unified["Unified Format"]
        NR[NormalizedRestaurant]
    end

    subgraph Match["Matching"]
        FM[Fuse.js Matcher]
        CM[Confidence Calculator]
    end

    subgraph Output["Output"]
        CR[ComparisonRestaurant]
    end

    SR --> SE --> SN --> NR
    ZR --> ZE --> ZN --> NR
    NR --> FM --> CM --> CR
```

## Normalization Details

### Swiggy to NormalizedRestaurant

```mermaid
flowchart TD
    subgraph Input["Swiggy Restaurant Object"]
        A1["info.id"]
        A2["info.name"]
        A3["info.avgRating"]
        A4["info.costForTwoMessage"]
        A5["info.sla.deliveryTime"]
        A6["info.cuisines[]"]
        A7["info.locality"]
        A8["info.cloudinaryImageId"]
    end

    subgraph Transform["Transformation"]
        T1["platformId = id"]
        T2["name = name"]
        T3["rating = avgRating || 0"]
        T4["costForTwo = parse number from string"]
        T5["deliveryTime = sla.deliveryTime"]
        T6["cuisines = cuisines[]"]
        T7["locality = locality"]
        T8["image = cloudinary URL"]
    end

    subgraph Output["NormalizedRestaurant"]
        O["{ platform: 'swiggy', platformId, name, rating, ... }"]
    end

    A1 --> T1 --> O
    A2 --> T2 --> O
    A3 --> T3 --> O
    A4 --> T4 --> O
    A5 --> T5 --> O
    A6 --> T6 --> O
    A7 --> T7 --> O
    A8 --> T8 --> O
```

### Zomato to NormalizedRestaurant

```mermaid
flowchart TD
    subgraph Input["Zomato __PRELOADED_STATE__"]
        B1["pages.current.entity_id"]
        B2["pages.current.name"]
        B3["pages.current.rating.aggregate_rating"]
        B4["pages.current.cfo"]
        B5["pages.current.eta"]
        B6["pages.current.cuisines[]"]
        B7["pages.current.locality.name"]
        B8["pages.current.thumb"]
    end

    subgraph Transform["Transformation"]
        U1["platformId = entity_id"]
        U2["name = name"]
        U3["rating = aggregate_rating || 0"]
        U4["costForTwo = cfo (already rupees)"]
        U5["deliveryTime = extract number from eta"]
        U6["cuisines = cuisines[]"]
        U7["locality = locality.name"]
        U8["image = thumb URL"]
    end

    subgraph Output["NormalizedRestaurant"]
        V["{ platform: 'zomato', platformId, name, rating, ... }"]
    end

    B1 --> U1 --> V
    B2 --> U2 --> V
    B3 --> U3 --> V
    B4 --> U4 --> V
    B5 --> U5 --> V
    B6 --> U6 --> V
    B7 --> U7 --> V
    B8 --> U8 --> V
```

## Matching Algorithm Flow

```mermaid
flowchart TD
    Start[Start Matching] --> Init[Initialize Fuse.js with Swiggy restaurants]
    Init --> Loop[For each Zomato restaurant]

    Loop --> Search[Fuse.js search by name]
    Search --> Check{Match found?}

    Check -->|No| Unmatched[Add to zomatoOnly]
    Check -->|Yes| Validate[Validate match]

    Validate --> Locality{Locality overlap?}
    Locality -->|No| Cuisine{Cuisine overlap?}
    Locality -->|Yes| Score[Calculate confidence]

    Cuisine -->|No| Reject[Reject match]
    Cuisine -->|Yes| Score

    Reject --> Unmatched

    Score --> Combine[Create ComparisonRestaurant]
    Combine --> Mark[Mark Swiggy restaurant as matched]

    Unmatched --> Next{More restaurants?}
    Mark --> Next

    Next -->|Yes| Loop
    Next -->|No| Remaining[Add unmatched Swiggy to swiggyOnly]

    Remaining --> Return[Return all comparisons]
```

## Price Calculation Flow

```mermaid
flowchart TD
    Start[Menu Comparison] --> Items[For each matched item]

    Items --> HasBoth{Has both prices?}

    HasBoth -->|Yes| Compare[Compare prices]
    HasBoth -->|No| Single[Use available price]

    Compare --> Cheaper{Which is cheaper?}
    Cheaper -->|Swiggy| AddSwiggy[Add to Swiggy total]
    Cheaper -->|Zomato| AddZomato[Add to Zomato total]
    Cheaper -->|Same| AddEither[Add to both]

    AddSwiggy --> Optimal[Add cheaper to optimal]
    AddZomato --> Optimal
    AddEither --> Optimal

    Single --> OptimalSingle[Add to optimal]

    Optimal --> Next{More items?}
    OptimalSingle --> Next

    Next -->|Yes| Items
    Next -->|No| Calculate[Calculate totals]

    Calculate --> Savings["savings = max(swiggy, zomato) - optimal"]
    Savings --> Return["Return { swiggyTotal, zomatoTotal, optimalTotal, savings }"]
```

## State Management

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Loading: User submits search
    Loading --> Success: Data received
    Loading --> Error: Request failed
    Loading --> PartialSuccess: One platform failed

    Success --> Idle: New search
    Error --> Idle: Retry/New search
    PartialSuccess --> Idle: New search

    Success --> Filtering: Apply filter
    Filtering --> Success: Filter applied

    Success --> Sorting: Change sort
    Sorting --> Success: Sort applied
```

## Error Handling Flow

```mermaid
flowchart TD
    Request[API Request] --> TryCatch[Try/Catch Block]

    TryCatch --> Platform[Platform Calls]
    Platform --> Swiggy[Swiggy API]
    Platform --> Zomato[Zomato Scraper]

    Swiggy --> SwiggyResult{Success?}
    Zomato --> ZomatoResult{Success?}

    SwiggyResult -->|Yes| SwiggyData[Swiggy Data]
    SwiggyResult -->|No| SwiggyError[Log error, empty array]

    ZomatoResult -->|Yes| ZomatoData[Zomato Data]
    ZomatoResult -->|No| ZomatoError[Log error, empty array]

    SwiggyData --> Merge[Merge Results]
    SwiggyError --> Merge
    ZomatoData --> Merge
    ZomatoError --> Merge

    Merge --> HasData{Has any data?}
    HasData -->|Yes| Return[Return partial results]
    HasData -->|No| Error[Return error response]
```
