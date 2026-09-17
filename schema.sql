-- Supabase SQL Schema for Jainil Hair Migration (Updated for String IDs)

-- Drop existing tables if you ran the old script
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS product_transfers CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- 1. Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    phone TEXT,
    role TEXT DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.0,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    video_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    branch TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Leads Table
CREATE TABLE leads (
    id TEXT PRIMARY KEY,
    lead_number TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    branch TEXT,
    section TEXT,
    source TEXT,
    campaign TEXT,
    status TEXT DEFAULT 'new',
    grade TEXT,
    city TEXT,
    hair_condition TEXT,
    assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_name TEXT,
    notes JSONB DEFAULT '[]'::jsonb,
    follow_up_date DATE,
    follow_up_time TEXT,
    follow_up_type TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
    phone TEXT,
    total_amount DECIMAL(10, 2) DEFAULT 0.0,
    status TEXT DEFAULT 'pending',
    order_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Services and Packages (Basic key-value store for now to ensure flexible migration)
CREATE TABLE services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Calls Table
CREATE TABLE calls (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
    call_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Product Transfers
CREATE TABLE product_transfers (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    transfer_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Settings
CREATE TABLE settings (
    id TEXT PRIMARY KEY,
    data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
