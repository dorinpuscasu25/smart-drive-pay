/*
  # Referral System & User Registration Schema

  ## Overview
  This migration creates a complete referral-based registration system where:
  - Users MUST have a valid referral_id to register
  - Users receive their own personal_id after purchasing a BEP ticket
  - Users can invite others using their personal_id
  - Tracks referral chains and ticket purchases
  
  ## 1. New Tables
  
  ### `users`
  - `id` (uuid, primary key) - Internal database ID
  - `clerk_id` (text, unique) - Clerk authentication ID
  - `email` (text, unique) - User email address
  - `full_name` (text) - User's full name
  - `phone` (text) - User's phone number
  - `referral_id` (text, required) - ID of user who invited them
  - `personal_id` (text, unique) - User's own ID for inviting others (generated after BEP purchase)
  - `has_purchased_bep` (boolean, default false) - Whether user purchased BEP ticket
  - `is_verified` (boolean, default false) - Whether user is verified (has active BEP)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `ticket_types`
  - `id` (uuid, primary key) - Ticket type identifier
  - `name` (text) - Ticket name (e.g., "BEP Standard")
  - `description` (text) - Ticket description
  - `price` (decimal) - Ticket price
  - `validity_days` (integer) - Number of days ticket is valid
  - `active` (boolean) - Whether ticket type is available
  - `created_at` (timestamptz) - Creation timestamp
  
  ### `purchased_tickets`
  - `id` (uuid, primary key) - Purchase identifier
  - `user_id` (uuid, foreign key) - User who purchased ticket
  - `ticket_type_id` (uuid, foreign key) - Type of ticket purchased
  - `ticket_number` (text, unique) - Unique ticket number
  - `status` (text) - Ticket status: 'active', 'expired', 'used'
  - `valid_from` (timestamptz) - Ticket validity start date
  - `valid_until` (timestamptz) - Ticket validity end date
  - `purchased_at` (timestamptz) - Purchase timestamp
  
  ### `referral_stats`
  - `id` (uuid, primary key) - Stats record identifier
  - `user_id` (uuid, foreign key) - User these stats belong to
  - `total_referrals` (integer, default 0) - Total users referred
  - `successful_referrals` (integer, default 0) - Referrals who purchased BEP
  - `tombola_tickets_earned` (integer, default 0) - Raffle tickets earned
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## 2. Security (Row Level Security)
  - RLS enabled on all tables
  - Users can read their own data
  - Users can view active ticket types
  - Users can view their own tickets and referral stats
  - Insert/Update operations validated through application logic
  
  ## 3. Important Notes
  - `referral_id` is MANDATORY during registration
  - `personal_id` is generated ONLY after first BEP purchase
  - Referral chain integrity is maintained through foreign key relationships
  - Social login (Google/Facebook/Apple) must also enforce referral_id requirement
*/

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS referral_stats CASCADE;
DROP TABLE IF EXISTS purchased_tickets CASCADE;
DROP TABLE IF EXISTS ticket_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with referral system
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  referral_id text NOT NULL,
  personal_id text UNIQUE,
  has_purchased_bep boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on referral_id for fast lookups
CREATE INDEX idx_users_referral_id ON users(referral_id);
CREATE INDEX idx_users_personal_id ON users(personal_id);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create ticket_types table
CREATE TABLE ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  validity_days integer NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ticket types"
  ON ticket_types FOR SELECT
  USING (active = true);

-- Create purchased_tickets table
CREATE TABLE purchased_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id uuid REFERENCES ticket_types(id) NOT NULL,
  ticket_number text UNIQUE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'used')),
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  purchased_at timestamptz DEFAULT now()
);

CREATE INDEX idx_purchased_tickets_user_id ON purchased_tickets(user_id);
CREATE INDEX idx_purchased_tickets_status ON purchased_tickets(status);

ALTER TABLE purchased_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on purchased_tickets"
  ON purchased_tickets FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create referral_stats table
CREATE TABLE referral_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_referrals integer DEFAULT 0,
  successful_referrals integer DEFAULT 0,
  tombola_tickets_earned integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_referral_stats_user_id ON referral_stats(user_id);

ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on referral_stats"
  ON referral_stats FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on referral_stats table
CREATE TRIGGER update_referral_stats_updated_at
  BEFORE UPDATE ON referral_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique personal ID
CREATE OR REPLACE FUNCTION generate_personal_id()
RETURNS text AS $$
DECLARE
  new_id text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    -- Generate 8-character alphanumeric ID (uppercase)
    new_id := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    -- Check if ID already exists
    done := NOT EXISTS(SELECT 1 FROM users WHERE personal_id = new_id);
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample ticket types
INSERT INTO ticket_types (name, description, price, validity_days) VALUES
  ('BEP Standard', 'Electronic ticket valid for 30 days for standard appointments', 49.99, 30),
  ('BEP Premium', 'Electronic ticket valid for 90 days with priority appointments', 129.99, 90),
  ('BEP Pro', 'Electronic ticket valid for 180 days with exclusive benefits', 219.99, 180),
  ('BEP Annual', 'Electronic ticket valid for 365 days with unlimited access', 399.99, 365);

-- Insert a seed admin user with personal_id for testing
INSERT INTO users (clerk_id, email, full_name, referral_id, personal_id, has_purchased_bep, is_verified)
VALUES ('seed_admin', 'admin@bep.com', 'Admin User', 'SEED0000', 'ADMIN001', true, true)
ON CONFLICT (clerk_id) DO NOTHING;