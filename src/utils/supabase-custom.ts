
/**
 * Custom types for Supabase
 */
import { createClient } from '@supabase/supabase-js';

export type SiteSettings = {
  id: number;
  phone: string;
  email: string;
  address: string;
  google_maps_url: string;
  google_map_iframe: string | null;
  office_hours: string;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          user_id: string;
          is_admin: boolean;
          is_super_admin: boolean;
          created_at: string;
          updated_at: string;
          id: string;
        };
        Insert: {
          user_id: string;
          is_admin?: boolean;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
          id?: string;
        };
        Update: {
          user_id?: string;
          is_admin?: boolean;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
          id?: string;
        };
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<SiteSettings>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          destination_id: number;
          destination_name: string;
          traveler_name: string;
          traveler_email: string;
          traveler_phone: string;
          travel_date: string;
          num_travelers: number;
          special_requests: string | null;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
          price: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          destination_id: number;
          destination_name: string;
          traveler_name: string;
          traveler_email: string;
          traveler_phone: string;
          travel_date: string;
          num_travelers: number;
          special_requests?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
          price: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          destination_id?: number;
          destination_name?: string;
          traveler_name?: string;
          traveler_email?: string;
          traveler_phone?: string;
          travel_date?: string;
          num_travelers?: number;
          special_requests?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
          price?: number;
        };
      };
      blog_posts: {
        Row: {
          id: number;
          title: string;
          content: string;
          excerpt: string;
          author: string;
          image: string;
          published_at: string;
          category: string;
          tags: string[];
        };
        Insert: {
          id?: number;
          title: string;
          content: string;
          excerpt?: string;
          author: string;
          image: string;
          published_at?: string;
          category?: string;
          tags?: string[];
        };
        Update: {
          id?: number;
          title?: string;
          content?: string;
          excerpt?: string;
          author?: string;
          image?: string;
          published_at?: string;
          category?: string;
          tags?: string[];
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_bookings: {
        Args: { destination_id: number };
        Returns: number;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Create a Supabase client instance for use in non-provider components
const SUPABASE_URL = "https://bgcegarmliqfvimmsupq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY2VnYXJtbGlxZnZpbW1zdXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyOTU4MTcsImV4cCI6MjA2Mjg3MTgxN30.3NU-T9sIWAZaS_Kr2ivGmVnCZVAlY6RSedJpDylX12Y";

export const supabaseCustom = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: {
    schema: 'public',
  },
});
