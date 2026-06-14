-- ==========================================
-- SHEGA POS & INVENTORY SYNC SCHEMAS
-- TARGET METRIC: CHAPA & SUPABASE MULTI-BRANCH DATABASE
-- COPY-PASTE DIRECTLY INTO SUPABASE SQL EDITOR
-- ==========================================

-- 1. Create table for employees & authentication roles
CREATE TABLE IF NOT EXISTS shega_employees (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  pin TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Waiter',
  branch TEXT NOT NULL DEFAULT 'Shegawan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No demo employee accounts are pre-seeded; create them through the app or Supabase auth as needed.


-- 2. Create table for ingredients inventory tracking
CREATE TABLE IF NOT EXISTS shega_ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock NUMERIC NOT NULL DEFAULT 0,
  "minStock" NUMERIC NOT NULL DEFAULT 5,
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
  variants JSONB,
  recipe JSONB NOT NULL DEFAULT '[]'::jsonb,
  yield NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 4. Create table for dinning tables status state
CREATE TABLE IF NOT EXISTS shega_tables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Empty',
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
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
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
  "amountChanged" NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'Adjustment',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reference TEXT,
  branch TEXT NOT NULL DEFAULT 'Shegawan',
  "actorName" TEXT,
  "actorRole" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Enable RLS
ALTER TABLE shega_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shega_inventory_logs ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- RLS POLICIES (drop first, then recreate => idempotent)
-- =========================================================

-- shega_employees
DROP POLICY IF EXISTS "Public Read Access shega_employees" ON shega_employees;
DROP POLICY IF EXISTS "Public Insert Access shega_employees" ON shega_employees;
DROP POLICY IF EXISTS "Public Update Access shega_employees" ON shega_employees;

CREATE POLICY "Public Read Access shega_employees"
ON shega_employees FOR SELECT USING (true);

CREATE POLICY "Public Insert Access shega_employees"
ON shega_employees FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Access shega_employees"
ON shega_employees FOR UPDATE USING (true);


-- shega_ingredients
DROP POLICY IF EXISTS "Public Read Access shega_ingredients" ON shega_ingredients;
DROP POLICY IF EXISTS "Public Insert Access shega_ingredients" ON shega_ingredients;
DROP POLICY IF EXISTS "Public Update Access shega_ingredients" ON shega_ingredients;

CREATE POLICY "Public Read Access shega_ingredients"
ON shega_ingredients FOR SELECT USING (true);

CREATE POLICY "Public Insert Access shega_ingredients"
ON shega_ingredients FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Access shega_ingredients"
ON shega_ingredients FOR UPDATE USING (true);


-- shega_dishes
DROP POLICY IF EXISTS "Public Read Access shega_dishes" ON shega_dishes;
DROP POLICY IF EXISTS "Public Insert Access shega_dishes" ON shega_dishes;
DROP POLICY IF EXISTS "Public Update Access shega_dishes" ON shega_dishes;

CREATE POLICY "Public Read Access shega_dishes"
ON shega_dishes FOR SELECT USING (true);

CREATE POLICY "Public Insert Access shega_dishes"
ON shega_dishes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Access shega_dishes"
ON shega_dishes FOR UPDATE USING (true);


-- shega_tables
DROP POLICY IF EXISTS "Public Read Access shega_tables" ON shega_tables;
DROP POLICY IF EXISTS "Public Insert Access shega_tables" ON shega_tables;
DROP POLICY IF EXISTS "Public Update Access shega_tables" ON shega_tables;

CREATE POLICY "Public Read Access shega_tables"
ON shega_tables FOR SELECT USING (true);

CREATE POLICY "Public Insert Access shega_tables"
ON shega_tables FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Access shega_tables"
ON shega_tables FOR UPDATE USING (true);


-- shega_orders
DROP POLICY IF EXISTS "Public Read Access shega_orders" ON shega_orders;
DROP POLICY IF EXISTS "Public Insert Access shega_orders" ON shega_orders;
DROP POLICY IF EXISTS "Public Update Access shega_orders" ON shega_orders;

CREATE POLICY "Public Read Access shega_orders"
ON shega_orders FOR SELECT USING (true);

CREATE POLICY "Public Insert Access shega_orders"
ON shega_orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Access shega_orders"
ON shega_orders FOR UPDATE USING (true);


-- shega_inventory_logs
DROP POLICY IF EXISTS "Public Read Access shega_inventory_logs" ON shega_inventory_logs;
DROP POLICY IF EXISTS "Public Insert Access shega_inventory_logs" ON shega_inventory_logs;
DROP POLICY IF EXISTS "Public Update Access shega_inventory_logs" ON shega_inventory_logs;

CREATE POLICY "Public Read Access shega_inventory_logs"
ON shega_inventory_logs FOR SELECT USING (true);

CREATE POLICY "Public Insert Access shega_inventory_logs"
ON shega_inventory_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Access shega_inventory_logs"
ON shega_inventory_logs FOR UPDATE USING (true);