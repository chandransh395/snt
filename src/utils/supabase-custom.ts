
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bgcegarmliqfvimmsupq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY2VnYXJtbGlxZnZpbW1zdXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyOTU4MTcsImV4cCI6MjA2Mjg3MTgxN30.3NU-T9sIWAZaS_Kr2ivGmVnCZVAlY6RSedJpDylX12Y";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          is_admin: boolean;
          is_super_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          is_admin?: boolean;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          is_admin?: boolean;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: number;
          email: string;
          phone: string;
          address: string;
          office_hours: string;
          google_maps_url: string;
          google_map_iframe: string | null;
          social_facebook: string | null;
          social_twitter: string | null;
          social_instagram: string | null;
          updated_at: string | null;
        };
      };
    };
    Functions: {
      increment_bookings: {
        Args: { destination_id: number };
        Returns: void;
      };
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
  };
}

// Create a client with limited functionality for safer public-facing operations
export const supabaseCustom = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];
