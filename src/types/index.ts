import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type Insurer = Database["public"]["Tables"]["insurers"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
export type Policy = Database["public"]["Tables"]["policies"]["Row"];
export type Renewal = Database["public"]["Tables"]["renewals"]["Row"];
export type Commission = Database["public"]["Tables"]["commissions"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

export type UserRole = "admin" | "corretor";

export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
  full_name: string | null;
}
