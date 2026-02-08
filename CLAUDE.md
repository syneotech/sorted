# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

'Sorted' is a Next.js web app comparing Zomato & Swiggy restaurants, menus, and prices in India. It fetches data from both platforms (Swiggy API proxy + Zomato Puppeteer scraper), normalizes it to a common schema, matches restaurants/items using fuzzy search, and displays price comparisons.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
npm start            # Run production server
npm test             # Run Vitest in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
npm run test:visual  # Run visual tests (requires dev server + agent-browser)
```

## High-Level Architecture

```
Browser → Next.js API Routes → Platform Integrations → External Services
                ↓
         Upstash Redis (caching)
```

**Data Flow:**
1. Client calls `/api/search` with query + coordinates
2. API route fetches from both platforms in parallel (`Promise.allSettled`)
3. Results normalized to `NormalizedRestaurant` schema
4. Fuzzy matching via Fuse.js finds same restaurant on both platforms
5. Relevance scoring applied based on query intent (cuisine/dish/restaurant)
6. Filters & sorting applied, results cached to Redis (15 min TTL)

## Key Directories

```
src/
├── app/api/           # API routes (search, restaurant, swiggy/*, zomato/*)
├── components/        # React UI components
│   └── filters/       # Filter bar, chips, dropdowns
├── hooks/             # useFilters for filter state management
└── lib/
    ├── swiggy/        # Swiggy API client (client.ts) + types
    ├── zomato/        # Puppeteer scraper (scraper.ts) + types
    ├── comparison/    # matcher.ts (Fuse.js matching), normalizer.ts
    ├── search/        # Relevance scoring, query analysis, cuisine taxonomy
    ├── filters/       # Filter engine (cuisine, dietary, price, rating, etc.)
    ├── sorting/       # Sort algorithms (relevance, price, rating, delivery)
    └── cache/         # Redis client wrapper
```

## Platform Integration Patterns

### Swiggy (API Proxy)
- Uses internal `/dapi/` endpoints with spoofed browser headers
- Data extracted from nested card structures: `data.cards[].gridElements.infoWithStyle.restaurants[]`

### Zomato (Puppeteer Scraper)
- Headless browser renders page, extracts `window.__PRELOADED_STATE__`
- Falls back to DOM scraping if script parsing fails
- User-agent rotation to avoid bot detection

### Data Normalization
Both platforms normalize to `NormalizedRestaurant`:
```typescript
{ id, platform, platformId, name, imageUrl, locality,
  cuisines, rating, costForTwoValue, deliveryTime, isOpen, deepLink }
```

## Matching & Scoring System

**Restaurant Matching** (`src/lib/comparison/matcher.ts`):
- Fuse.js fuzzy search with weights: name (0.7), locality (0.2), cuisines (0.1)
- Match confidence boosted by locality and cuisine overlap
- Threshold: 0.4 (lower = stricter matching)

**Relevance Scoring** (`src/lib/search/`):
- Query analyzed for intent: cuisine search, dish search, restaurant name search
- Weights adjust dynamically (e.g., cuisine searches boost cuisine match to 55%)
- Scoring factors: cuisine match, name match, rating boost, popularity

## API Endpoints

| Endpoint | Purpose | Cache TTL |
|----------|---------|-----------|
| `GET /api/search` | Unified restaurant search with filters | 15 min |
| `GET /api/restaurant` | Menu comparison between platforms | 30 min |
| `GET /api/swiggy/restaurants` | Internal: Swiggy search | - |
| `GET /api/zomato/restaurants` | Internal: Zomato search | - |

Required params for search: `q`, `lat`, `lng`. Optional: `city`, filter params.

## Documentation Index

- [docs/architecture/](docs/architecture/) - Data flow, API routes, components, caching
- [docs/algorithms/](docs/algorithms/) - Matching, normalization, relevance scoring
- [docs/api/](docs/api/) - Swiggy and Zomato integration details
- [docs/PLAN.md](docs/PLAN.md) - Implementation roadmap
- [docs/PROGRESS.md](docs/PROGRESS.md) - Phase completion status

## Environment Variables

Required:
- `UPSTASH_REDIS_REST_URL` - Redis endpoint
- `UPSTASH_REDIS_REST_TOKEN` - Redis auth token

Optional:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - If using Supabase

## Important Patterns

1. **Graceful Degradation**: One platform failing doesn't break the app—`Promise.allSettled` ensures partial results
2. **Server-Side Only**: All external API calls happen in API routes to avoid CORS and hide scraping
3. **Config-Driven Scoring**: Weights and thresholds in `src/lib/search/config.ts` for easy tuning
4. **URL Query Sync**: Filter state syncs to URL params for shareable links

## Context Management

For analyzing large portions of the codebase, use Gemini CLI (`gemini -p`) to leverage its larger context window and save Claude context.
