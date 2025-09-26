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
      admin_notification_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          payment_method: string
          payment_proof_url: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          payment_proof_url?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          payment_proof_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linked_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          bank_name: string | null
          card_type: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          bank_name?: string | null
          card_type?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          bank_name?: string | null
          card_type?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      market_assets: {
        Row: {
          created_at: string | null
          current_price: number
          id: string
          market_cap: number | null
          name: string
          price_change: number | null
          price_change_percent: number | null
          symbol: string
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          created_at?: string | null
          current_price?: number
          id?: string
          market_cap?: number | null
          name: string
          price_change?: number | null
          price_change_percent?: number | null
          symbol: string
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          created_at?: string | null
          current_price?: number
          id?: string
          market_cap?: number | null
          name?: string
          price_change?: number | null
          price_change_percent?: number | null
          symbol?: string
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          asset_symbol: string
          average_price: number
          created_at: string | null
          current_value: number | null
          id: string
          quantity: number
          unrealized_pnl: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_symbol: string
          average_price?: number
          created_at?: string | null
          current_value?: number | null
          id?: string
          quantity?: number
          unrealized_pnl?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_symbol?: string
          average_price?: number
          created_at?: string | null
          current_value?: number | null
          id?: string
          quantity?: number
          unrealized_pnl?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          balance: number | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          kyc_document_url: string | null
          kyc_status: string | null
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          balance?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_document_url?: string | null
          kyc_status?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          balance?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_document_url?: string | null
          kyc_status?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_conversations: {
        Row: {
          admin_unread_count: number | null
          created_at: string
          id: string
          last_admin_read_at: string | null
          last_user_read_at: string | null
          status: string | null
          updated_at: string
          user_id: string
          user_unread_count: number | null
        }
        Insert: {
          admin_unread_count?: number | null
          created_at?: string
          id?: string
          last_admin_read_at?: string | null
          last_user_read_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          user_unread_count?: number | null
        }
        Update: {
          admin_unread_count?: number | null
          created_at?: string
          id?: string
          last_admin_read_at?: string | null
          last_user_read_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          user_unread_count?: number | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: string[] | null
          conversation_id: string
          created_at: string
          id: string
          message_text: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          attachments?: string[] | null
          conversation_id: string
          created_at?: string
          id?: string
          message_text: string
          sender_id: string
          sender_type: string
        }
        Update: {
          attachments?: string[] | null
          conversation_id?: string
          created_at?: string
          id?: string
          message_text?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          amount: number
          asset_symbol: string
          created_at: string
          id: string
          price: number
          status: string | null
          total_value: number
          trade_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          asset_symbol: string
          created_at?: string
          id?: string
          price: number
          status?: string | null
          total_value: number
          trade_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          asset_symbol?: string
          created_at?: string
          id?: string
          price?: number
          status?: string | null
          total_value?: number
          trade_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_directory: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          cash_balance: number | null
          created_at: string | null
          free_margin: number | null
          id: string
          invested_amount: number | null
          margin_level: number | null
          total_equity: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cash_balance?: number | null
          created_at?: string | null
          free_margin?: number | null
          id?: string
          invested_amount?: number | null
          margin_level?: number | null
          total_equity?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cash_balance?: number | null
          created_at?: string | null
          free_margin?: number | null
          id?: string
          invested_amount?: number | null
          margin_level?: number | null
          total_equity?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_details: Json
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          payment_method: string
          status: string | null
          updated_at: string
          user_id: string
          withdrawal_slip_url: string | null
        }
        Insert: {
          account_details: Json
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          status?: string | null
          updated_at?: string
          user_id: string
          withdrawal_slip_url?: string | null
        }
        Update: {
          account_details?: Json
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          withdrawal_slip_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_admin_user: {
        Args: { target_email: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
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
