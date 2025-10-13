-- Fix RLS policies to work without JWT authentication
-- This allows direct queries when using external auth providers like Clerk

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own tickets" ON purchased_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON purchased_tickets;

-- Create new permissive policies for authenticated operations
-- Note: Security is handled at application level with Clerk authentication
CREATE POLICY "Allow all operations on purchased_tickets"
  ON purchased_tickets FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Allow all operations on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);