-- ==========================================
-- SHEGA POS & INVENTORY SYNC SCHEMAS
-- TARGET METRIC: CHAPA & SUPABASE MULTI-BRANCH DATABASE
-- COPY-PASTE DIRECTLY INTO SUPABASE SQL EDITOR
-- ==========================================

-- 1. Create table for employees & authentication roles
CREATE TABLE IF NOT EXISTS shega_employees (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  pin TEXT NOT NULL,                     -- 4-digit POS numerical passcodes (e.g., '1234')
  role TEXT NOT NULL DEFAULT 'Waiter',    -- 'Admin' | 'Chef' | 'Waiter'
  branch TEXT NOT NULL DEFAULT 'Shegawan', -- 'Shegawan' | 'Teyim Shega'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed starting default restaurant roster for immediate logging-in and testing
INSERT INTO shega_employees (id, username, pin, role, branch) VALUES
('emp-1', 'Shegawan Admin', '1234', 'Admin', 'Shegawan'),
('emp-2', 'Chef Aster', '2222', 'Chef', 'Shegawan'),
('emp-3', 'Waiter Biniam', '3333', 'Waiter', 'Shegawan'),
('emp-4', 'Teyim Admin', '1234', 'Admin', 'Teyim Shega'),
('emp-5', 'Waiter Almaz', '3333', 'Waiter', 'Teyim Shega')
ON CONFLICT (id) DO UPDATE 
SET username = EXCLUDED.username, pin = EXCLUDED.pin, role = EXCLUDED.role, branch = EXCLUDED.branch;


-- 2. Create table for ingredients inventory tracking
CREATE TABLE IF NOT EXISTS shega_ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,                  -- e.g. 'g', 'ml', 'pcs', 'slice'
  stock NUMERIC NOT NULL DEFAULT 0,
  "minStock" NUMERIC NOT NULL DEFAULT 5, -- Minimum safety stock trigger
  "costPerUnit" NUMERIC NOT NULL DEFAULT 0,
  branch TEXT NOT NULL DEFAULT 'Shegawan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. Create table for dishes & menu items configurations
CREATE TABLE IF NOT EXISTS shega_dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  description TEXT,
  "basePrice" NUMERIC NOT NULL DEFAULT 0,
  variants JSONB,                       -- Array of variants: e.g. [{"name": "Double", "price": 120}]
  recipe JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of recipe requirements: [{"ingredientId": "ing-1", "quantity": 150}]
  yield NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 4. Create table for dinning tables status state
CREATE TABLE IF NOT EXISTS shega_tables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Empty', -- 'Empty' | 'Occupied' | 'Unclean'
  "currentOrderId" TEXT,
  branch TEXT NOT NULL DEFAULT 'Shegawan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. Create table for customer tickets & order sales
CREATE TABLE IF NOT EXISTS shega_orders (
  id TEXT PRIMARY KEY,
  "orderNumber" INT NOT NULL,
  "tableId" TEXT NOT NULL,
  "tableName" TEXT NOT NULL,
  items JSONB NOT NULL,                 -- Array of order items: [{"dishId": "...", "dishName": "...", "quantity": 2, "price": 140}]
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled'
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "servedAt" TIMESTAMPTZ,
  branch TEXT NOT NULL DEFAULT 'Shegawan',
  "waiterName" TEXT,
  "specialNote" TEXT,
  extras JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 6. Create table for full structural inventory log tracking
CREATE TABLE IF NOT EXISTS shega_inventory_logs (
  id TEXT PRIMARY KEY,
  "ingredientId" TEXT NOT NULL,
  "ingredientName" TEXT NOT NULL,
  "amountChanged" NUMERIC NOT NULL,       -- Positive for restocks, negative for recipe cooking consumption
  type TEXT NOT NULL DEFAULT 'Adjustment', -- 'Deduction' | 'Adjustment' | 'Restock'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reference TEXT,                       -- Order receipt ID or adjustment description
  branch TEXT NOT NULL DEFAULT 'Shegawan',
  "actorName" TEXT,
  "actorRole" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Disable RLS or turn on Permissive Anonymous Access for Easy POS terminals offline syncing:
ALTER TABLE shega_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_inventory_logs ENABLE ROW LEVEL SECURITY;

-- Create Open Public Access policies so all regional tablet terminals read and write data flawlessly without complex headers:
CREATE POLICY "Public Read Access shega_employees" ON shega_employees FOR SELECT USING (true);
CREATE POLICY "Public Insert Access shega_employees" ON shega_employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access shega_employees" ON shega_employees FOR UPDATE USING (true);

CREATE POLICY "Public Read Access shega_ingredients" ON shega_ingredients FOR SELECT USING (true);
CREATE POLICY "Public Insert Access shega_ingredients" ON shega_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access shega_ingredients" ON shega_ingredients FOR UPDATE USING (true);

CREATE POLICY "Public Read Access shega_dishes" ON shega_dishes FOR SELECT USING (true);
CREATE POLICY "Public Insert Access shega_dishes" ON shega_dishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access shega_dishes" ON shega_dishes FOR UPDATE USING (true);

CREATE POLICY "Public Read Access shega_tables" ON shega_tables FOR SELECT USING (true);
CREATE POLICY "Public Insert Access shega_tables" ON shega_tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access shega_tables" ON shega_tables FOR UPDATE USING (true);

CREATE POLICY "Public Read Access shega_orders" ON shega_orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Access shega_orders" ON shega_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access shega_orders" ON shega_orders FOR UPDATE USING (true);

CREATE POLICY "Public Read Access shega_inventory_logs" ON shega_inventory_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Access shega_inventory_logs" ON shega_inventory_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access shega_inventory_logs" ON shega_inventory_logs FOR UPDATE USING (true);

