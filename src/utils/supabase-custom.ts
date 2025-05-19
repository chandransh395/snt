
/**
 * Custom types for Supabase
 */

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
