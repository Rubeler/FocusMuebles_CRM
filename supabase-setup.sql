-- ============================================
-- FocusMuebles CRM - Supabase Database Setup
-- ============================================
-- Run this SQL in your Supabase Dashboard:
--   1. Go to https://supabase.com/dashboard
--   2. Select your project (ztwplbqtbxryuypqitan)
--   3. Click "SQL Editor" in the left sidebar
--   4. Paste this entire SQL and click "Run"
-- ============================================

-- 1. Users table (custom auth, not Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Leads table (pipeline)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  furniture_type TEXT DEFAULT '',
  estimated_value NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  stage TEXT DEFAULT 'nuevo_lead' CHECK (
    stage IN (
      'nuevo_lead',
      'contactado',
      'cotizacion_enviada',
      'negociacion',
      'venta_cerrada',
      'venta_perdida'
    )
  ),
  last_contact TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Events table (calendar)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date TEXT NOT NULL,
  time TEXT DEFAULT '',
  type TEXT DEFAULT 'llamada' CHECK (
    type IN ('llamada', 'entrega', 'follow_up', 'otro')
  ),
  client_id TEXT,
  client_name TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Workshop config table
CREATE TABLE IF NOT EXISTS workshop_config (
  user_id TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Muebles y Diseño',
  logo TEXT DEFAULT ''
);

-- 5. Disable RLS for simplicity (we handle auth in our app)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_config ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (our app handles authorization)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on workshop_config" ON workshop_config FOR ALL USING (true) WITH CHECK (true);

-- 6. Insert default admin user
INSERT INTO users (id, email, password, name, role)
VALUES (
  'admin-001',
  'admin@focusmuebles.com',
  'admin123',
  'Administrador',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- 7. Create an RPC function to check if setup is complete
CREATE OR REPLACE FUNCTION check_setup()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'users', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'users'),
    'leads', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'leads'),
    'events', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'events'),
    'workshop_config', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'workshop_config')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
