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
      bulk_orders: {
        Row: {
          company: string
          created_at: string
          customer_name: string
          delivery_at: string
          email: string
          id: string
          items: string
          notes: string
          phone: string
          qty: number
          quoted: number | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string
          created_at?: string
          customer_name: string
          delivery_at?: string
          email?: string
          id?: string
          items?: string
          notes?: string
          phone: string
          qty?: number
          quoted?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          customer_name?: string
          delivery_at?: string
          email?: string
          id?: string
          items?: string
          notes?: string
          phone?: string
          qty?: number
          quoted?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          icon: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          icon?: string
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          icon?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      delivery_locations: {
        Row: {
          lat: number
          lng: number
          order_id: string
          partner_id: string
          updated_at: string
        }
        Insert: {
          lat: number
          lng: number
          order_id: string
          partner_id: string
          updated_at?: string
        }
        Update: {
          lat?: number
          lng?: number
          order_id?: string
          partner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_locations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean
          best_seller: boolean
          category_id: string
          created_at: string
          description: string
          full_price: number | null
          half_price: number | null
          id: string
          image: string
          is_new: boolean
          is_veg: boolean
          name: string
          price: number
          rating: number
          sort_order: number
          spicy: boolean
          updated_at: string
        }
        Insert: {
          available?: boolean
          best_seller?: boolean
          category_id: string
          created_at?: string
          description?: string
          full_price?: number | null
          half_price?: number | null
          id: string
          image?: string
          is_new?: boolean
          is_veg?: boolean
          name: string
          price?: number
          rating?: number
          sort_order?: number
          spicy?: boolean
          updated_at?: string
        }
        Update: {
          available?: boolean
          best_seller?: boolean
          category_id?: string
          created_at?: string
          description?: string
          full_price?: number | null
          half_price?: number | null
          id?: string
          image?: string
          is_new?: boolean
          is_veg?: boolean
          name?: string
          price?: number
          rating?: number
          sort_order?: number
          spicy?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          active: boolean
          badge: string
          code: string | null
          created_at: string
          description: string
          discount_type: string
          emoji: string
          expires_at: string | null
          id: string
          label: string
          max_discount: number | null
          min_order: number
          priority: number
          tone: string
          updated_at: string
          value: number
        }
        Insert: {
          active?: boolean
          badge?: string
          code?: string | null
          created_at?: string
          description?: string
          discount_type?: string
          emoji?: string
          expires_at?: string | null
          id?: string
          label: string
          max_discount?: number | null
          min_order?: number
          priority?: number
          tone?: string
          updated_at?: string
          value?: number
        }
        Update: {
          active?: boolean
          badge?: string
          code?: string | null
          created_at?: string
          description?: string
          discount_type?: string
          emoji?: string
          expires_at?: string | null
          id?: string
          label?: string
          max_discount?: number | null
          min_order?: number
          priority?: number
          tone?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          item_id: string
          name: string
          order_id: string
          portion: string
          price: number
          qty: number
        }
        Insert: {
          id?: string
          item_id: string
          name: string
          order_id: string
          portion?: string
          price?: number
          qty?: number
        }
        Update: {
          id?: string
          item_id?: string
          name?: string
          order_id?: string
          portion?: string
          price?: number
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          changed_by_name: string
          created_at: string
          id: string
          note: string
          order_id: string
          status: string
        }
        Insert: {
          changed_by?: string | null
          changed_by_name?: string
          created_at?: string
          id?: string
          note?: string
          order_id: string
          status: string
        }
        Update: {
          changed_by?: string | null
          changed_by_name?: string
          created_at?: string
          id?: string
          note?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          collected_mode: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          delivery_fee: number
          delivery_partner_id: string | null
          discount: number
          id: string
          landmark: string
          lat: number | null
          lng: number | null
          mode: string
          notes: string
          offer_id: string | null
          order_code: string
          payment_method: string
          payment_status: string
          phone: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address?: string
          collected_mode?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          delivery_fee?: number
          delivery_partner_id?: string | null
          discount?: number
          id?: string
          landmark?: string
          lat?: number | null
          lng?: number | null
          mode?: string
          notes?: string
          offer_id?: string | null
          order_code: string
          payment_method?: string
          payment_status?: string
          phone: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string
          collected_mode?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          delivery_fee?: number
          delivery_partner_id?: string | null
          discount?: number
          id?: string
          landmark?: string
          lat?: number | null
          lng?: number | null
          mode?: string
          notes?: string
          offer_id?: string | null
          order_code?: string
          payment_method?: string
          payment_status?: string
          phone?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_code: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
          user_code: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_code?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "delivery" | "customer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "delivery", "customer"],
    },
  },
} as const
