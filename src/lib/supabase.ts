import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Create Supabase client (returns null if not configured)
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Server-side client with service role key (for API routes)
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// Database types (can be generated with supabase gen types)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          default_lat: number | null;
          default_lng: number | null;
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          default_lat?: number | null;
          default_lng?: number | null;
          preferences?: Record<string, unknown>;
        };
        Update: {
          display_name?: string | null;
          default_lat?: number | null;
          default_lng?: number | null;
          preferences?: Record<string, unknown>;
        };
      };
      search_cache: {
        Row: {
          id: string;
          cache_key: string;
          query: string;
          lat: number | null;
          lng: number | null;
          swiggy_results: unknown | null;
          zomato_results: unknown | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          cache_key: string;
          query: string;
          lat?: number | null;
          lng?: number | null;
          swiggy_results?: unknown | null;
          zomato_results?: unknown | null;
        };
        Update: {
          swiggy_results?: unknown | null;
          zomato_results?: unknown | null;
          expires_at?: string;
        };
      };
      restaurant_cache: {
        Row: {
          id: string;
          platform: 'swiggy' | 'zomato';
          platform_id: string;
          restaurant_data: unknown | null;
          menu_data: unknown | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          platform: 'swiggy' | 'zomato';
          platform_id: string;
          restaurant_data?: unknown | null;
          menu_data?: unknown | null;
        };
        Update: {
          restaurant_data?: unknown | null;
          menu_data?: unknown | null;
          expires_at?: string;
        };
      };
    };
  };
}
