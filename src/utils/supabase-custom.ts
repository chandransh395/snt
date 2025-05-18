
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

// Type definitions that match the Database types from Supabase
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Region = Database['public']['Tables']['regions']['Row'];
export type User = Database['public']['Tables']['profiles']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type Destination = Database['public']['Tables']['destinations']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

// Extend types as needed for frontend purposes
export interface DestinationWithDetails extends Destination {
  isPopular?: boolean;
}

export interface BookingWithDetails extends Booking {
  destination?: Destination;
}

// Export the typed supabase client
export const supabaseCustom = supabase;
