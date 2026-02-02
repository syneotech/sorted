# Sorted

Compare food delivery prices across Swiggy and Zomato to find the best deals.

## Features

- **Cross-Platform Search**: Search restaurants on both Swiggy and Zomato simultaneously
- **Restaurant Matching**: Automatically matches the same restaurant across platforms
- **Menu Comparison**: Side-by-side menu comparison with price differences
- **Price Optimization**: See which platform offers better prices and potential savings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Data Fetching**: Swiggy API + Zomato scraper (Puppeteer)
- **Caching**: Upstash Redis
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Upstash Redis account (free tier works)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/sorted.git
   cd sorted
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
sorted/
├── src/
│   ├── app/                    # Next.js pages & API routes
│   │   ├── api/                # Backend API endpoints
│   │   ├── search/             # Search results page
│   │   └── restaurant/         # Restaurant detail page
│   ├── components/             # React components
│   └── lib/                    # Business logic
│       ├── swiggy/             # Swiggy API client
│       ├── zomato/             # Zomato scraper
│       ├── comparison/         # Matching & normalization
│       └── cache/              # Redis utilities
├── docs/                       # Documentation
└── public/                     # Static assets
```

## Documentation

- [Architecture Overview](./docs/architecture/OVERVIEW.md)
- [Data Flow](./docs/architecture/DATA_FLOW.md)
- [API Routes](./docs/architecture/API_ROUTES.md)
- [Component Hierarchy](./docs/architecture/COMPONENTS.md)
- [Caching Strategy](./docs/architecture/CACHING.md)
- [Swiggy API](./docs/api/SWIGGY.md)
- [Zomato Scraper](./docs/api/ZOMATO.md)
- [Matching Algorithm](./docs/algorithms/MATCHING.md)
- [Data Normalization](./docs/algorithms/NORMALIZATION.md)
- [Environment Variables](./docs/ENV_VARS.md)
- [Contributing](./docs/CONTRIBUTING.md)
- [Changelog](./docs/CHANGELOG.md)

## API Endpoints

### Search Restaurants
```http
GET /api/search?q=biryani&lat=12.97&lng=77.59&city=bangalore
```

### Compare Menus
```http
GET /api/restaurant?swiggy_id=123&zomato_slug=restaurant-name&lat=12.97&lng=77.59
```

See [API Routes Documentation](./docs/architecture/API_ROUTES.md) for details.

## Development

### Branch Strategy

```
main (protected)
  └── develop
        ├── feature/...
        ├── fix/...
        └── docs/...
```

See [Contributing Guide](./docs/CONTRIBUTING.md) for workflow details.

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # With coverage
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

### Manual Deployment

```bash
npm run build
npm start
```

## Known Limitations

- **Unofficial APIs**: Uses Swiggy's internal API and scrapes Zomato (may break if they change)
- **Rate Limiting**: Aggressive caching to avoid hitting platform limits
- **Location**: Currently supports major Indian cities only
- **Search Relevance**: Basic matching; cuisine-aware scoring coming in v0.2.0

## Roadmap

- [x] v0.1.0 - MVP with basic search and comparison
- [ ] v0.2.0 - Cuisine-aware relevance scoring
- [ ] v0.3.0 - Advanced filtering and sorting
- [ ] v0.4.0 - UI/UX redesign
- [ ] v0.5.0 - Comprehensive testing

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## License

MIT
