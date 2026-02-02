# Environment Variables

This document describes all environment variables used by the Sorted application.

## Required Variables

### Redis (Upstash)

| Variable | Description | Example |
|----------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST API URL | `https://xyz.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST API token | `AXyz123...` |

**How to obtain**:
1. Create account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token from the dashboard

---

## Optional Variables

### Supabase (Future)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJ...` |

**Note**: Supabase is not currently used but schema is prepared for future features (user accounts, saved searches).

---

### Analytics (Future)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | `G-XXXXXX` |

---

## Development vs Production

### Development (`.env.local`)

```bash
# Redis (can use free tier)
UPSTASH_REDIS_REST_URL=https://your-dev-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-dev-token

# Supabase (optional, local or free tier)
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
```

### Production (Vercel Environment Variables)

Set these in Vercel dashboard under Project Settings → Environment Variables:

```bash
# Redis (production instance)
UPSTASH_REDIS_REST_URL=https://your-prod-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-prod-token

# Supabase (production instance)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
```

---

## Example `.env.local` File

```bash
# ===========================================
# Sorted App - Local Development Environment
# ===========================================

# Redis Cache (Upstash)
# Get these from: https://console.upstash.com
UPSTASH_REDIS_REST_URL=https://example-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxx_your_token_here

# Supabase Database (Optional)
# Get these from: https://supabase.com/dashboard
# NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# Notes:
# - Never commit this file to version control
# - Copy .env.example to .env.local and fill in values
# - Redis is required; Supabase is optional
# ===========================================
```

---

## Environment Variable Validation

The app validates required environment variables at startup:

```typescript
// src/lib/env.ts (future implementation)

function validateEnv() {
  const required = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
```

---

## Security Notes

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Use different credentials** for development and production
3. **Rotate tokens** if they are ever exposed
4. **Limit scope** - Use tokens with minimal required permissions
5. **Use Vercel secrets** - For production, set variables in Vercel dashboard

---

## Troubleshooting

### "Redis connection failed"

1. Check `UPSTASH_REDIS_REST_URL` format (should include `https://`)
2. Verify token is correct (copy from Upstash dashboard)
3. Check if Redis instance is active (not paused)

### "Environment variable undefined"

1. Ensure `.env.local` exists in project root
2. Restart the development server after adding variables
3. Check variable names match exactly (case-sensitive)

### "Supabase connection failed"

1. Verify Supabase project is active
2. Check URL format (should end with `.supabase.co`)
3. Ensure anon key is the public key (starts with `eyJ`)
