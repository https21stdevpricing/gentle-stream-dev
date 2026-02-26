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
      employee_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          employee_id: string
          hours_worked: number | null
          id: string
          notes: string | null
          overtime_hours: number | null
          status: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          employee_id: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          created_at: string
          daily_wage: number
          department: string
          emergency_contact: string | null
          id: string
          joined_at: string
          left_at: string | null
          name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          daily_wage?: number
          department?: string
          emergency_contact?: string | null
          id?: string
          joined_at?: string
          left_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          daily_wage?: number
          department?: string
          emergency_contact?: string | null
          id?: string
          joined_at?: string
          left_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          status?: string
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
      inventory_stock: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string
          id: string
          last_restocked_at: string | null
          min_stock_level: number | null
          notes: string | null
          product_id: string | null
          product_name: string
          quantity: number
          unit: string | null
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          min_stock_level?: number | null
          notes?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          unit?: string | null
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          min_stock_level?: number | null
          notes?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit?: string | null
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "warehouse_zones"
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
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      warehouse_zones: {
        Row: {
          capacity_sqft: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          used_sqft: number | null
          zone_type: string | null
        }
        Insert: {
          capacity_sqft?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          used_sqft?: number | null
          zone_type?: string | null
        }
        Update: {
          capacity_sqft?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          used_sqft?: number | null
          zone_type?: string | null
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
