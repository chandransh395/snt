
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define interfaces for tables that might not be in auto-generated types
export interface SiteSettings {
  id: number;
  phone: string;
  email: string;
  address: string;
  google_maps_url: string;
  office_hours: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  image: string;
  published_at: string;
  category?: string;
  tags: string[];
}

export interface Destination {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[];
}

export interface Booking {
  id: string;
  user_id: string;
  destination_id: number;
  destination_name: string;
  travel_date: string;
  num_travelers: number;
  created_at?: string;
  updated_at?: string;
  price: number;
  traveler_name: string;
  traveler_email: string;
  traveler_phone: string;
  special_requests?: string;
  status?: string;
}

export interface Tag {
  id: number;
  name: string;
}

// This is a workaround for TypeScript type limitations
// It allows us to access tables that might not be in the auto-generated types
export const supabaseCustom = {
  from: <T extends string>(table: T) => {
    const queryBuilder = supabase.from(table as any);
    
    // Add type assertions for known tables
    if (table === 'site_settings') {
      return queryBuilder as any;
    } else if (table === 'blog_posts') {
      return queryBuilder as any;
    } else if (table === 'destinations') {
      return queryBuilder as any;
    } else if (table === 'bookings') {
      return queryBuilder as any;
    } else if (table === 'tags') {
      return queryBuilder as any;
    }
    
    // Default case
    return queryBuilder;
  },
  // Add other methods as needed
  auth: supabase.auth,
  storage: supabase.storage,
  rpc: supabase.rpc,
};

export default supabaseCustom;
