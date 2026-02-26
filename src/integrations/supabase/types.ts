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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          area: string | null
          created_at: string
          custom_specs: Json | null
          email: string
          id: string
          material: string | null
          message: string
          name: string
          phone: string | null
          product_category: string | null
          product_interest: string | null
          project_type: string | null
          purpose: string | null
          status: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          custom_specs?: Json | null
          email: string
          id?: string
          material?: string | null
          message?: string
          name: string
          phone?: string | null
          product_category?: string | null
          product_interest?: string | null
          project_type?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          custom_specs?: Json | null
          email?: string
          id?: string
          material?: string | null
          message?: string
          name?: string
          phone?: string | null
          product_category?: string | null
          product_interest?: string | null
          project_type?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiry_replies: {
        Row: {
          id: string
          inquiry_id: string
          reply_text: string
          reply_type: string
          sent_at: string
          sent_by: string | null
        }
        Insert: {
          id?: string
          inquiry_id: string
          reply_text: string
          reply_type?: string
          sent_at?: string
          sent_by?: string | null
        }
        Update: {
          id?: string
          inquiry_id?: string
          reply_text?: string
          reply_type?: string
          sent_at?: string
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_replies_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          description: string
          discount_percent: number | null
          hsn_code: string | null
          id: string
          invoice_id: string
          product_id: string | null
          quantity: number
          rate: number
          sort_order: number | null
          tax_amount: number | null
          tax_rate: number | null
          total: number
          unit: string | null
        }
        Insert: {
          amount?: number
          description: string
          discount_percent?: number | null
          hsn_code?: string | null
          id?: string
          invoice_id: string
          product_id?: string | null
          quantity?: number
          rate?: number
          sort_order?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          unit?: string | null
        }
        Update: {
          amount?: number
          description?: string
          discount_percent?: number | null
          hsn_code?: string | null
          id?: string
          invoice_id?: string
          product_id?: string | null
          quantity?: number
          rate?: number
          sort_order?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_in_words: string | null
          billing_address: string | null
          cgst_amount: number | null
          cgst_rate: number | null
          company_gstin: string | null
          created_at: string | null
          customer_address: string | null
          customer_email: string | null
          customer_gstin: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number | null
          discount_percent: number | null
          due_date: string | null
          grand_total: number | null
          id: string
          igst_amount: number | null
          igst_rate: number | null
          invoice_number: string
          invoice_type: string
          metadata: Json | null
          notes: string | null
          payment_terms: string | null
          sgst_amount: number | null
          sgst_rate: number | null
          shipping_address: string | null
          status: string | null
          subtotal: number | null
          tally_exported: boolean | null
          tally_voucher_number: string | null
          taxable_amount: number | null
          terms: string | null
          total_tax: number | null
          updated_at: string | null
        }
        Insert: {
          amount_in_words?: string | null
          billing_address?: string | null
          cgst_amount?: number | null
          cgst_rate?: number | null
          company_gstin?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_gstin?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date?: string | null
          grand_total?: number | null
          id?: string
          igst_amount?: number | null
          igst_rate?: number | null
          invoice_number: string
          invoice_type?: string
          metadata?: Json | null
          notes?: string | null
          payment_terms?: string | null
          sgst_amount?: number | null
          sgst_rate?: number | null
          shipping_address?: string | null
          status?: string | null
          subtotal?: number | null
          tally_exported?: boolean | null
          tally_voucher_number?: string | null
          taxable_amount?: number | null
          terms?: string | null
          total_tax?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_in_words?: string | null
          billing_address?: string | null
          cgst_amount?: number | null
          cgst_rate?: number | null
          company_gstin?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_gstin?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date?: string | null
          grand_total?: number | null
          id?: string
          igst_amount?: number | null
          igst_rate?: number | null
          invoice_number?: string
          invoice_type?: string
          metadata?: Json | null
          notes?: string | null
          payment_terms?: string | null
          sgst_amount?: number | null
          sgst_rate?: number | null
          shipping_address?: string | null
          status?: string | null
          subtotal?: number | null
          tally_exported?: boolean | null
          tally_voucher_number?: string | null
          taxable_amount?: number | null
          terms?: string | null
          total_tax?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          category: string
          color: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          finish: string | null
          hsn_code: string | null
          id: string
          images: string[] | null
          length_mm: number | null
          margin_percent: number | null
          material: string | null
          min_stock_level: number | null
          name: string
          origin: string | null
          price: number
          specs: Json | null
          stock_quantity: number | null
          subcategory: string | null
          supplier: string | null
          supplier_code: string | null
          tags: string[] | null
          thickness_mm: number | null
          thumbnail: string | null
          unit: string | null
          updated_at: string | null
          variants: Json | null
          weight_kg: number | null
          width_mm: number | null
        }
        Insert: {
          active?: boolean | null
          category?: string
          color?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          finish?: string | null
          hsn_code?: string | null
          id?: string
          images?: string[] | null
          length_mm?: number | null
          margin_percent?: number | null
          material?: string | null
          min_stock_level?: number | null
          name: string
          origin?: string | null
          price?: number
          specs?: Json | null
          stock_quantity?: number | null
          subcategory?: string | null
          supplier?: string | null
          supplier_code?: string | null
          tags?: string[] | null
          thickness_mm?: number | null
          thumbnail?: string | null
          unit?: string | null
          updated_at?: string | null
          variants?: Json | null
          weight_kg?: number | null
          width_mm?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string
          color?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          finish?: string | null
          hsn_code?: string | null
          id?: string
          images?: string[] | null
          length_mm?: number | null
          margin_percent?: number | null
          material?: string | null
          min_stock_level?: number | null
          name?: string
          origin?: string | null
          price?: number
          specs?: Json | null
          stock_quantity?: number | null
          subcategory?: string | null
          supplier?: string | null
          supplier_code?: string | null
          tags?: string[] | null
          thickness_mm?: number | null
          thumbnail?: string | null
          unit?: string | null
          updated_at?: string | null
          variants?: Json | null
          weight_kg?: number | null
          width_mm?: number | null
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
