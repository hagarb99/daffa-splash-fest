export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          category: Database["public"]["Enums"]["activity_category"]
          cover_image: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          duration_min: number | null
          group_size: number | null
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          price: number
          requirements_ar: string | null
          requirements_en: string | null
          rules_ar: string | null
          rules_en: string | null
          safety_ar: string | null
          safety_en: string | null
          slug: string
          sort_order: number
          type: Database["public"]["Enums"]["activity_type"]
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["activity_category"]
          cover_image?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          duration_min?: number | null
          group_size?: number | null
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          price?: number
          requirements_ar?: string | null
          requirements_en?: string | null
          rules_ar?: string | null
          rules_en?: string | null
          safety_ar?: string | null
          safety_en?: string | null
          slug: string
          sort_order?: number
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["activity_category"]
          cover_image?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          duration_min?: number | null
          group_size?: number | null
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          price?: number
          requirements_ar?: string | null
          requirements_en?: string | null
          rules_ar?: string | null
          rules_en?: string | null
          safety_ar?: string | null
          safety_en?: string | null
          slug?: string
          sort_order?: number
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
        }
        Relationships: []
      }
      activity_images: {
        Row: {
          activity_id: string
          id: string
          sort_order: number
          url: string
        }
        Insert: {
          activity_id: string
          id?: string
          sort_order?: number
          url: string
        }
        Update: {
          activity_id?: string
          id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_images_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          activity_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          expires_at: string | null
          fawry_ref: string | null
          id: string
          persons: number
          status: Database["public"]["Enums"]["booking_status"]
          time_slot_id: string
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          expires_at?: string | null
          fawry_ref?: string | null
          id?: string
          persons: number
          status?: Database["public"]["Enums"]["booking_status"]
          time_slot_id: string
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          expires_at?: string | null
          fawry_ref?: string | null
          id?: string
          persons?: number
          status?: Database["public"]["Enums"]["booking_status"]
          time_slot_id?: string
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          category: string | null
          id: string
          is_active: boolean
          logo_url: string
          name_ar: string
          name_en: string
          sort_order: number
        }
        Insert: {
          category?: string | null
          id?: string
          is_active?: boolean
          logo_url: string
          name_ar: string
          name_en: string
          sort_order?: number
        }
        Update: {
          category?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string
          name_ar?: string
          name_en?: string
          sort_order?: number
        }
        Relationships: []
      }
      cities: {
        Row: {
          end_date: string | null
          id: string
          image: string | null
          is_active: boolean
          name_ar: string
          name_en: string
          order_index: number
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          name_ar: string
          name_en: string
          order_index?: number
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          name_ar?: string
          name_en?: string
          order_index?: number
          start_date?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          fawry_reference: string | null
          id: string
          processed_at: string
          provider: string
          raw_payload: Json | null
          signature: string | null
          status: string
        }
        Insert: {
          amount: number
          booking_id: string
          fawry_reference?: string | null
          id?: string
          processed_at?: string
          provider?: string
          raw_payload?: Json | null
          signature?: string | null
          status: string
        }
        Update: {
          amount?: number
          booking_id?: string
          fawry_reference?: string | null
          id?: string
          processed_at?: string
          provider?: string
          raw_payload?: Json | null
          signature?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          id: string
          is_active: boolean
          link: string | null
          logo_url: string
          name_ar: string
          name_en: string
          sort_order: number
          tier: Database["public"]["Enums"]["sponsor_tier"]
        }
        Insert: {
          id?: string
          is_active?: boolean
          link?: string | null
          logo_url: string
          name_ar: string
          name_en: string
          sort_order?: number
          tier: Database["public"]["Enums"]["sponsor_tier"]
        }
        Update: {
          id?: string
          is_active?: boolean
          link?: string | null
          logo_url?: string
          name_ar?: string
          name_en?: string
          sort_order?: number
          tier?: Database["public"]["Enums"]["sponsor_tier"]
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          activity_id: string
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          reserved_capacity: number
          slot_date: string
          start_time: string
          total_capacity: number
        }
        Insert: {
          activity_id: string
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          reserved_capacity?: number
          slot_date: string
          start_time: string
          total_capacity: number
        }
        Update: {
          activity_id?: string
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          reserved_capacity?: number
          slot_date?: string
          start_time?: string
          total_capacity?: number
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_category: "morning" | "night"
      activity_type: "individual" | "group"
      app_role: "admin" | "user"
      booking_status: "pending" | "confirmed" | "cancelled" | "expired"
      sponsor_tier: "platinum" | "gold" | "silver" | "partner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_category: ["morning", "night"],
      activity_type: ["individual", "group"],
      app_role: ["admin", "user"],
      booking_status: ["pending", "confirmed", "cancelled", "expired"],
      sponsor_tier: ["platinum", "gold", "silver", "partner"],
    },
  },
} as const
