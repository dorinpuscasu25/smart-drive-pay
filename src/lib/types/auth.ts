export type AuthUser = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  phone?: string | null;
  roles?: string[];
  avatar_path?: string | null;
  email_verified_at?: string | null;
  cars_count?: number;
  orders_count?: number;
  bep_pass_assignments_count?: number;
  companies_owned_count?: number;
  [key: string]: unknown;
};

export type AuthPayload = {
  token: string;
  user: AuthUser;
};

export type AuthProfileResponse = {
  user: AuthUser;
};
