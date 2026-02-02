-- Sorted Food Comparator Database Schema
-- Run this in your Supabase SQL Editor

-- User preferences (optional, for logged-in users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  default_lat DECIMAL(10, 8),
  default_lng DECIMAL(11, 8),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search cache
CREATE TABLE IF NOT EXISTS search_cache (
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
CREATE TABLE IF NOT EXISTS restaurant_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,  -- 'swiggy' | 'zomato'
  platform_id TEXT NOT NULL,
  restaurant_data JSONB,
  menu_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  UNIQUE(platform, platform_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_search_cache_key ON search_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_restaurant_cache_platform ON restaurant_cache(platform, platform_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_cache_expires ON restaurant_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Search cache: Public read, service role write
CREATE POLICY "Anyone can read search cache" ON search_cache
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Service role can manage search cache" ON search_cache
  FOR ALL TO service_role USING (true);

-- Restaurant cache: Public read, service role write
CREATE POLICY "Anyone can read restaurant cache" ON restaurant_cache
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Service role can manage restaurant cache" ON restaurant_cache
  FOR ALL TO service_role USING (true);

-- Function to automatically clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM search_cache WHERE expires_at < NOW();
  DELETE FROM restaurant_cache WHERE expires_at < NOW();
END;
$$;

-- Schedule cleanup every hour (requires pg_cron extension)
-- Run this separately if pg_cron is available:
-- SELECT cron.schedule('cleanup-cache', '0 * * * *', 'SELECT cleanup_expired_cache()');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
