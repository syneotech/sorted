# Cross-Platform Food Ordering Comparator MVP

## Overview
Web app comparing Zomato & Swiggy restaurants, menus, and prices.

**Strategy**: Use unofficial APIs (not official MCPs) since third-party apps are currently blocked by both platforms.

## Architecture
```
[Next.js on Vercel] → [Next.js API Routes] → [Swiggy /dapi/ + Zomato scraping]
                              ↓
                    [Supabase Postgres + Redis cache]
```

**Cost: Free tier** (Vercel + Supabase + Upstash Redis free tiers)

## Data Access Methods

| Platform | Method | Endpoint/Approach |
|----------|--------|-------------------|
| **Swiggy** | Unofficial API | `/dapi/restaurants/list/v5`, `/dapi/menu/pl` |
| **Zomato** | Headless scraping | Extract `window.__PRELOADED_STATE__` from pages |

**Why not official MCPs?**
- Both Zomato and Swiggy explicitly block third-party apps
- 34 open issues on Zomato MCP (auth failures, whitelist pending)
- 12 open issues on Swiggy MCP (similar problems)
- MCPs designed for Claude/ChatGPT/VSCode only, not custom apps

## Tech Stack
- **Frontend**: Next.js 14+ (App Router, TypeScript, Tailwind)
- **Backend**: Next.js API Routes (for proxying + scraping)
- **Scraping**: Puppeteer/Playwright (for Zomato)
- **Database**: Supabase Postgres (user preferences, search history)
- **Cache**: Upstash Redis (rate limiting, response caching)
- **Deployment**: Vercel (frontend + API) + Supabase Cloud

## Database Schema

```sql
-- User preferences (optional, for logged-in users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  default_lat DECIMAL(10, 8),
  default_lng DECIMAL(11, 8),
  preferences JSONB DEFAULT '{}'
);

-- Search cache
CREATE TABLE search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,  -- hash(query + lat + lng)
  query TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  swiggy_results JSONB,
  zomato_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '15 minutes'
);

-- Restaurant cache (longer TTL)
CREATE TABLE restaurant_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,  -- 'swiggy' | 'zomato'
  platform_id TEXT NOT NULL,
  restaurant_data JSONB,
  menu_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  UNIQUE(platform, platform_id)
);
```

## Project Structure
```
sorted/
├── docs/
│   └── PLAN.md                         # This file
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing/search page
│   │   ├── search/page.tsx             # Search results
│   │   ├── restaurant/[slug]/page.tsx  # Restaurant comparison
│   │   └── api/
│   │       ├── search/route.ts         # Unified search endpoint
│   │       ├── restaurant/route.ts     # Restaurant details
│   │       ├── swiggy/
│   │       │   ├── restaurants/route.ts
│   │       │   └── menu/route.ts
│   │       └── zomato/
│   │           ├── restaurants/route.ts
│   │           └── menu/route.ts
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── LocationPicker.tsx
│   │   ├── ComparisonCard.tsx
│   │   ├── MenuComparison.tsx
│   │   └── PriceBadge.tsx
│   └── lib/
│       ├── swiggy/
│       │   ├── client.ts               # Swiggy API wrapper
│       │   └── types.ts
│       ├── zomato/
│       │   ├── scraper.ts              # Puppeteer scraper
│       │   └── types.ts
│       ├── comparison/
│       │   ├── matcher.ts              # Restaurant matching logic
│       │   └── normalizer.ts           # Normalize data formats
│       └── cache/
│           └── redis.ts                # Upstash Redis client
```

## API Design

### `/api/search?q=biryani&lat=12.97&lng=77.59`
Unified search endpoint that:
1. Checks Redis cache first
2. Calls Swiggy `/dapi/restaurants/list/v5` in parallel with
3. Scrapes Zomato search results
4. Normalizes and matches restaurants across platforms
5. Returns comparison data

### `/api/restaurant?swiggy_id=X&zomato_slug=Y`
Restaurant detail endpoint that:
1. Fetches menu from both platforms
2. Matches menu items by name (fuzzy matching)
3. Returns side-by-side price comparison

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
1. Initialize Next.js + Tailwind + TypeScript
2. Set up Supabase project (local)
3. Set up Upstash Redis
4. Create database schema
5. Build basic UI layout

### Phase 2: Swiggy Integration (Days 3-4)
6. Build Swiggy API client (`/lib/swiggy/client.ts`)
7. Implement `/api/swiggy/restaurants` route
8. Implement `/api/swiggy/menu` route
9. Add Redis caching layer
10. Test with real location data

### Phase 3: Zomato Integration (Days 5-7)
11. Set up Puppeteer/Playwright
12. Build Zomato scraper (`/lib/zomato/scraper.ts`)
13. Extract `__PRELOADED_STATE__` parsing logic
14. Implement `/api/zomato/restaurants` route
15. Implement `/api/zomato/menu` route
16. Handle anti-bot measures (user-agent, delays)

### Phase 4: Comparison Engine (Days 8-9)
17. Build restaurant matcher (fuzzy name + location matching)
18. Build data normalizer (unified schema)
19. Implement `/api/search` unified endpoint
20. Implement `/api/restaurant` comparison endpoint

### Phase 5: Frontend (Days 10-12)
21. Build SearchBar + LocationPicker
22. Build search results page with ComparisonCard
23. Build restaurant detail page with MenuComparison
24. Add "Order on Zomato/Swiggy" deep links
25. Mobile responsiveness

### Phase 6: Deploy (Days 13-14)
26. Deploy to Vercel
27. Configure Supabase Cloud
28. Set up Upstash Redis production
29. Test end-to-end
30. Monitor for anti-bot blocks

## Known Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **ToS violation** | Account bans, legal issues | Accept risk; use rotating proxies if needed |
| **Zomato anti-bot** | Scraping blocked | User-agent rotation, request delays, Puppeteer stealth |
| **API changes** | Breaking changes | Monitor for changes; abstract behind normalizer |
| **Rate limiting** | Slow responses | Aggressive caching (15-60 min TTL) |
| **CORS on Swiggy** | Browser blocked | All calls via Next.js API routes (server-side) |

## Verification Plan
1. **Swiggy search**: Call `/api/swiggy/restaurants?lat=12.97&lng=77.59` → Get restaurant list
2. **Zomato search**: Call `/api/zomato/restaurants?lat=12.97&lng=77.59` → Get restaurant list
3. **Unified search**: Call `/api/search?q=biryani&lat=12.97&lng=77.59` → Get matched results
4. **Menu comparison**: Click restaurant → See side-by-side menu with prices
5. **Caching**: Repeat search → Response from cache (faster)
6. **Deep links**: Click "Order on Swiggy" → Opens Swiggy app/website

## Future: Adding Ordering (if official access granted)
- Apply for Zomato/Swiggy MCP whitelist
- Add OAuth flows for user account linking
- Implement cart and checkout
- Track orders

## Critical Files
- `/src/lib/swiggy/client.ts` - Swiggy API wrapper
- `/src/lib/zomato/scraper.ts` - Puppeteer-based scraper
- `/src/lib/comparison/matcher.ts` - Cross-platform restaurant matching
- `/src/app/api/search/route.ts` - Unified search endpoint
- `/src/components/ComparisonCard.tsx` - Core comparison UI
