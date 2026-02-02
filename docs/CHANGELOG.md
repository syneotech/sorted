# Changelog

All notable changes to the Sorted project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Cuisine-aware relevance scoring (Phase 2)
- Advanced filtering and sorting (Phase 3)
- UI/UX redesign (Phase 4)
- Comprehensive testing (Phase 5)

---

## [0.1.0] - 2025-02-01

### Added

#### Core Features
- **Restaurant Search**: Unified search across Swiggy and Zomato platforms
- **Cross-Platform Matching**: Fuzzy matching algorithm using Fuse.js to identify same restaurants across platforms
- **Menu Comparison**: Side-by-side menu comparison with price differences
- **Price Calculations**: Optimal order calculation showing potential savings

#### Data Sources
- **Swiggy Integration**: API client for Swiggy's unofficial `/dapi/` endpoints
  - Restaurant search and listing
  - Menu fetching with categories
  - Deep links to Swiggy orders
- **Zomato Integration**: Puppeteer-based scraper
  - Restaurant search via `__PRELOADED_STATE__` extraction
  - Menu scraping with fallback DOM parsing
  - Deep links to Zomato orders

#### API Routes
- `GET /api/search` - Unified restaurant search
- `GET /api/restaurant` - Menu comparison endpoint
- `GET /api/swiggy/restaurants` - Swiggy restaurant search
- `GET /api/swiggy/menu` - Swiggy menu fetching
- `GET /api/zomato/restaurants` - Zomato restaurant scraping
- `GET /api/zomato/menu` - Zomato menu scraping

#### UI Components
- **SearchBar**: Search input with validation
- **LocationPicker**: City selection with geolocation support
- **ComparisonCard**: Restaurant comparison card with platform badges
- **MenuComparison**: Menu items table with filtering
- **PriceBadge**: Visual price comparison indicator

#### Pages
- **Home**: Landing page with hero, features, and how-it-works sections
- **Search Results**: Grid of restaurant comparisons with filter tabs
- **Restaurant Detail**: Full menu comparison with pricing summary

#### Infrastructure
- **Redis Caching**: Upstash Redis for response caching
  - Search results: 15 min TTL
  - Menu data: 30 min TTL
- **Rate Limiting**: In-memory rate limiting per IP
  - Search: 20 requests/min
  - Restaurant: 15 requests/min

#### Data Normalization
- Unified `NormalizedRestaurant` interface
- Unified `NormalizedMenuItem` interface
- Platform-specific normalizers for Swiggy and Zomato
- Price normalization (paise to rupees for Swiggy)

### Technical Details
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Fuzzy Matching**: Fuse.js
- **Scraping**: Puppeteer
- **Caching**: Upstash Redis

### Known Issues
- Search results may include irrelevant restaurants (no relevance scoring yet)
- Zomato scraper may fail if DOM structure changes
- No filters or sorting beyond basic tabs
- Mobile responsiveness needs improvement

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | 2025-02-01 | Initial MVP release |

---

## Upcoming Releases

### v0.2.0 - Relevance & Filtering
- Cuisine-aware relevance scoring
- Search filters (cuisine, rating, price, dietary)
- Sorting options (relevance, price, rating, delivery time)

### v0.3.0 - UI Redesign
- Modern design system
- Improved component designs
- Mobile-first responsive layout
- Loading and error states

### v0.4.0 - Testing & Polish
- Unit test coverage
- Integration tests
- Performance optimizations
- Final documentation
