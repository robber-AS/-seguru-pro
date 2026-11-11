import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Variáveis de ambiente do Supabase não configuradas. Crie um arquivo .env baseado no .env.example");
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: "admin" | "corretor";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: "admin" | "corretor";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: "admin" | "corretor";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          full_name: string;
          cpf_cnpj: string;
          birth_date: string | null;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          cep: string | null;
          address: string | null;
          number: string | null;
          complement: string | null;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          observations: string | null;
          corretor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          cpf_cnpj: string;
          birth_date?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          cep?: string | null;
          address?: string | null;
          number?: string | null;
          complement?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          observations?: string | null;
          corretor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          cpf_cnpj?: string;
          birth_date?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          cep?: string | null;
          address?: string | null;
          number?: string | null;
          complement?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          observations?: string | null;
          corretor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          client_id: string;
          type: "car" | "motorcycle";
          brand: string;
          model: string;
          year_manufacture: number | null;
          year_model: number | null;
          plate: string | null;
          renavam: string | null;
          chassis: string | null;
          color: string | null;
          fuel: string | null;
          mileage: string | null;
          fipe_code: string | null;
          fipe_value: string | null;
          declared_value: string | null;
          usage: string | null;
          sleep_cep: string | null;
          observations: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          type: "car" | "motorcycle";
          brand: string;
          model: string;
          year_manufacture?: number | null;
          year_model?: number | null;
          plate?: string | null;
          renavam?: string | null;
          chassis?: string | null;
          color?: string | null;
          fuel?: string | null;
          mileage?: string | null;
          fipe_code?: string | null;
          fipe_value?: string | null;
          declared_value?: string | null;
          usage?: string | null;
          sleep_cep?: string | null;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          type?: "car" | "motorcycle";
          brand?: string;
          model?: string;
          year_manufacture?: number | null;
          year_model?: number | null;
          plate?: string | null;
          renavam?: string | null;
          chassis?: string | null;
          color?: string | null;
          fuel?: string | null;
          mileage?: string | null;
          fipe_code?: string | null;
          fipe_value?: string | null;
          declared_value?: string | null;
          usage?: string | null;
          sleep_cep?: string | null;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      insurers: {
        Row: {
          id: string;
          name: string;
          cnpj: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          commercial_contact: string | null;
          observations: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          commercial_contact?: string | null;
          observations?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          commercial_contact?: string | null;
          observations?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          client_id: string;
          vehicle_id: string;
          insurer_id: string;
          quote_date: string;
          premium_value: string;
          franchise_value: string | null;
          payment_method: string | null;
          installments: number | null;
          coverage: string | null;
          third_party_coverage: boolean | null;
          assistance_24h: boolean | null;
          replacement_car: boolean | null;
          theft_protection: boolean | null;
          observations: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          vehicle_id: string;
          insurer_id: string;
          quote_date?: string;
          premium_value: string;
          franchise_value?: string | null;
          payment_method?: string | null;
          installments?: number | null;
          coverage?: string | null;
          third_party_coverage?: boolean | null;
          assistance_24h?: boolean | null;
          replacement_car?: boolean | null;
          theft_protection?: boolean | null;
          observations?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          vehicle_id?: string;
          insurer_id?: string;
          quote_date?: string;
          premium_value?: string;
          franchise_value?: string | null;
          payment_method?: string | null;
          installments?: number | null;
          coverage?: string | null;
          third_party_coverage?: boolean | null;
          assistance_24h?: boolean | null;
          replacement_car?: boolean | null;
          theft_protection?: boolean | null;
          observations?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quote_coverages: {
        Row: {
          id: string;
          quote_id: string;
          coverage_type: string;
          included: boolean;
          value: string | null;
        };
        Insert: {
          id?: string;
          quote_id: string;
          coverage_type: string;
          included?: boolean;
          value?: string | null;
        };
        Update: {
          id?: string;
          quote_id?: string;
          coverage_type?: string;
          included?: boolean;
          value?: string | null;
        };
        Relationships: [];
      };
      policies: {
        Row: {
          id: string;
          policy_number: string;
          client_id: string;
          vehicle_id: string;
          insurer_id: string;
          corretor_id: string | null;
          contract_date: string;
          start_date: string;
          end_date: string;
          premium_value: string;
          franchise_value: string | null;
          commission_percent: string | null;
          commission_value: string | null;
          payment_method: string | null;
          installments: number | null;
          status: string;
          pdf_url: string | null;
          observations: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          policy_number: string;
          client_id: string;
          vehicle_id: string;
          insurer_id: string;
          corretor_id?: string | null;
          contract_date: string;
          start_date: string;
          end_date: string;
          premium_value: string;
          franchise_value?: string | null;
          commission_percent?: string | null;
          commission_value?: string | null;
          payment_method?: string | null;
          installments?: number | null;
          status?: string;
          pdf_url?: string | null;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          policy_number?: string;
          client_id?: string;
          vehicle_id?: string;
          insurer_id?: string;
          corretor_id?: string | null;
          contract_date?: string;
          start_date?: string;
          end_date?: string;
          premium_value?: string;
          franchise_value?: string | null;
          commission_percent?: string | null;
          commission_value?: string | null;
          payment_method?: string | null;
          installments?: number | null;
          status?: string;
          pdf_url?: string | null;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      renewals: {
        Row: {
          id: string;
          policy_id: string | null;
          old_policy_id: string | null;
          new_policy_id: string | null;
          client_id: string;
          vehicle_id: string;
          insurer_id: string;
          corretor_id: string | null;
          old_premium_value: string | null;
          new_premium_value: string | null;
          renewed: boolean;
          renewal_date: string;
          observations: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          policy_id?: string | null;
          old_policy_id?: string | null;
          new_policy_id?: string | null;
          client_id: string;
          vehicle_id: string;
          insurer_id: string;
          corretor_id?: string | null;
          old_premium_value?: string | null;
          new_premium_value?: string | null;
          renewed?: boolean;
          renewal_date?: string;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          policy_id?: string | null;
          old_policy_id?: string | null;
          new_policy_id?: string | null;
          client_id?: string;
          vehicle_id?: string;
          insurer_id?: string;
          corretor_id?: string | null;
          old_premium_value?: string | null;
          new_premium_value?: string | null;
          renewed?: boolean;
          renewal_date?: string;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      renewal_contacts: {
        Row: {
          id: string;
          renewal_id: string;
          contact_date: string;
          contact_type: string | null;
          observations: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          renewal_id: string;
          contact_date?: string;
          contact_type?: string | null;
          observations?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          renewal_id?: string;
          contact_date?: string;
          contact_type?: string | null;
          observations?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      commissions: {
        Row: {
          id: string;
          policy_id: string;
          percent: string | null;
          value: string | null;
          expected_date: string | null;
          received_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          policy_id: string;
          percent?: string | null;
          value?: string | null;
          expected_date?: string | null;
          received_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          policy_id?: string;
          percent?: string | null;
          value?: string | null;
          expected_date?: string | null;
          received_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          commission_id: string;
          amount: string | null;
          payment_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          commission_id: string;
          amount?: string | null;
          payment_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          commission_id?: string;
          amount?: string | null;
          payment_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          file_url: string | null;
          file_name: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          file_url?: string | null;
          file_name?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          file_url?: string | null;
          file_name?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: string | null;
          new_values: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: string | null;
          new_values?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: string | null;
          new_values?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      company_settings: {
        Row: {
          id: string;
          company_name: string | null;
          cnpj: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name?: string | null;
          cnpj?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string | null;
          cnpj?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
