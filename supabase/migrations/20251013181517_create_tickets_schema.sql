-- Create Ticket Purchase System Schema
-- 
-- 1. New Tables
--    - users: Stores user information synced from Clerk
--    - ticket_types: Available ticket types with pricing
--    - purchased_tickets: User ticket purchases and status
-- 
-- 2. Security
--    - Enable RLS on all tables
--    - Users can read their own data
--    - Users can view available ticket types

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create ticket_types table
CREATE TABLE IF NOT EXISTS ticket_types (
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
CREATE TABLE IF NOT EXISTS purchased_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  ticket_type_id uuid REFERENCES ticket_types(id) NOT NULL,
  ticket_number text UNIQUE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'used')),
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  purchased_at timestamptz DEFAULT now()
);

ALTER TABLE purchased_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON purchased_tickets FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can insert own tickets"
  ON purchased_tickets FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Insert sample ticket types
INSERT INTO ticket_types (name, description, price, validity_days) VALUES
  ('BEP Standard', 'Bilet electronic valabil 30 zile pentru programări standard', 49.99, 30),
  ('BEP Premium', 'Bilet electronic valabil 90 zile cu prioritate la programări', 129.99, 90),
  ('BEP Pro', 'Bilet electronic valabil 180 zile cu beneficii exclusive', 219.99, 180),
  ('BEP Annual', 'Bilet electronic valabil 365 zile cu acces nelimitat', 399.99, 365);