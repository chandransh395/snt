export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          category: string | null
          content: string
          excerpt: string | null
          id: number
          image: string
          published_at: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          author: string
          category?: string | null
          content: string
          excerpt?: string | null
          id?: number
          image: string
          published_at?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          author?: string
          category?: string | null
          content?: string
          excerpt?: string | null
          id?: number
          image?: string
          published_at?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string | null
          destination_id: number
          destination_name: string
          id: string
          num_travelers: number
          price: number
          special_requests: string | null
          status: string | null
          travel_date: string
          traveler_email: string
          traveler_name: string
          traveler_phone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          destination_id: number
          destination_name: string
          id?: string
          num_travelers: number
          price: number
          special_requests?: string | null
          status?: string | null
          travel_date: string
          traveler_email: string
          traveler_name: string
          traveler_phone: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          destination_id?: number
          destination_name?: string
          id?: string
          num_travelers?: number
          price?: number
          special_requests?: string | null
          status?: string | null
          travel_date?: string
          traveler_email?: string
          traveler_name?: string
          traveler_phone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      destinations: {
        Row: {
          bookings_count: number | null
          description: string
          id: number
          image: string
          name: string
          price: string
          region: string
          tags: string[] | null
          top_booked: boolean | null
        }
        Insert: {
          bookings_count?: number | null
          description: string
          id?: number
          image: string
          name: string
          price: string
          region: string
          tags?: string[] | null
          top_booked?: boolean | null
        }
        Update: {
          bookings_count?: number | null
          description?: string
          id?: number
          image?: string
          name?: string
          price?: string
          region?: string
          tags?: string[] | null
          top_booked?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string | null
          id: number
          name: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          value?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string
          email: string
          google_map_iframe: string | null
          google_maps_url: string
          id: number
          office_hours: string
          phone: string
          social_facebook: string | null
          social_instagram: string | null
          social_twitter: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string
          email?: string
          google_map_iframe?: string | null
          google_maps_url?: string
          id?: number
          office_hours?: string
          phone?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          email?: string
          google_map_iframe?: string | null
          google_maps_url?: string
          id?: number
          office_hours?: string
          phone?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
