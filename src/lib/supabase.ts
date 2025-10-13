import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  validity_days: number;
  active: boolean;
  created_at: string;
}

export interface PurchasedTicket {
  id: string;
  user_id: string;
  ticket_type_id: string;
  ticket_number: string;
  status: 'active' | 'expired' | 'used';
  valid_from: string;
  valid_until: string;
  purchased_at: string;
  ticket_types?: TicketType;
}
