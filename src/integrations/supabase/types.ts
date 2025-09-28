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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      holdings: {
        Row: {
          average_price: number
          category: string
          created_at: string
          current_price: number | null
          id: string
          name: string
          profit_loss: number | null
          profit_loss_percent: number | null
          shares: number
          symbol: string
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_price: number
          category: string
          created_at?: string
          current_price?: number | null
          id?: string
          name: string
          profit_loss?: number | null
          profit_loss_percent?: number | null
          shares: number
          symbol: string
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_price?: number
          category?: string
          created_at?: string
          current_price?: number | null
          id?: string
          name?: string
          profit_loss?: number | null
          profit_loss_percent?: number | null
          shares?: number
          symbol?: string
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_balances: {
        Row: {
          cash_balance: number | null
          created_at: string
          daily_change: number | null
          daily_change_percent: number | null
          free_margin: number | null
          id: string
          invested_amount: number | null
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cash_balance?: number | null
          created_at?: string
          daily_change?: number | null
          daily_change_percent?: number | null
          free_margin?: number | null
          id?: string
          invested_amount?: number | null
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cash_balance?: number | null
          created_at?: string
          daily_change?: number | null
          daily_change_percent?: number | null
          free_margin?: number | null
          id?: string
          invested_amount?: number | null
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          price: number
          shares: number
          status: string
          symbol: string
          total_amount: number
          type: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          price: number
          shares: number
          status?: string
          symbol: string
          total_amount: number
          type: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          price?: number
          shares?: number
          status?: string
          symbol?: string
          total_amount?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          crypto_type: string | null
          id: string
          method: string
          status: string
          transaction_hash: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          crypto_type?: string | null
          id?: string
          method: string
          status?: string
          transaction_hash?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          crypto_type?: string | null
          id?: string
          method?: string
          status?: string
          transaction_hash?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          added_at: string | null
          category: string
          change_value: number | null
          id: string
          is_custom: boolean | null
          name: string
          price: number | null
          symbol: string
          trading_view_symbol: string | null
          user_id: string | null
          volume: number | null
        }
        Insert: {
          added_at?: string | null
          category: string
          change_value?: number | null
          id?: string
          is_custom?: boolean | null
          name: string
          price?: number | null
          symbol: string
          trading_view_symbol?: string | null
          user_id?: string | null
          volume?: number | null
        }
        Update: {
          added_at?: string | null
          category?: string
          change_value?: number | null
          id?: string
          is_custom?: boolean | null
          name?: string
          price?: number | null
          symbol?: string
          trading_view_symbol?: string | null
          user_id?: string | null
          volume?: number | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
