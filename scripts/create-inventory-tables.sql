-- Create inventory management tables

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    max_stock INTEGER NOT NULL DEFAULT 100,
    supplier VARCHAR(255),
    location VARCHAR(100),
    last_restocked TIMESTAMP,
    expiry_date DATE,
    batch_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    tags TEXT[],
    images TEXT[],
    description TEXT,
    weight DECIMAL(8,3),
    dimensions JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER')),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    reference VARCHAR(100),
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMP DEFAULT NOW(),
    cost DECIMAL(10,2),
    notes TEXT
);

-- Low stock alerts table
CREATE TABLE IF NOT EXISTS low_stock_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL,
    min_stock INTEGER NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'CRITICAL', 'OUT_OF_STOCK')),
    created_at TIMESTAMP DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP,
    acknowledged_by UUID REFERENCES auth.users(id)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'package',
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED')),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_date DATE,
    received_date DATE,
    total_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(stock);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(is_active);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_timestamp ON stock_movements(timestamp);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_acknowledged ON low_stock_alerts(acknowledged);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_items_updated_at 
    BEFORE UPDATE ON inventory_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at 
    BEFORE UPDATE ON purchase_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Users can view inventory items" ON inventory_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert inventory items" ON inventory_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update inventory items" ON inventory_items FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view stock movements" ON stock_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert stock movements" ON stock_movements FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view low stock alerts" ON low_stock_alerts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update low stock alerts" ON low_stock_alerts FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert sample categories
INSERT INTO categories (name, description, color, icon) VALUES
('Beverages', 'Soft drinks, juices, water', '#3B82F6', 'coffee'),
('Snacks', 'Chips, crackers, nuts', '#EF4444', 'cookie'),
('Groceries', 'Rice, flour, oil, spices', '#10B981', 'shopping-basket'),
('Personal Care', 'Soap, shampoo, toothpaste', '#8B5CF6', 'heart'),
('Household', 'Cleaning supplies, detergents', '#F59E0B', 'home'),
('Dairy', 'Milk, cheese, yogurt', '#06B6D4', 'milk'),
('Frozen', 'Ice cream, frozen foods', '#6366F1', 'snowflake'),
('Electronics', 'Batteries, chargers', '#EC4899', 'zap')
ON CONFLICT (name) DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
('Coca Cola India', 'Rajesh Kumar', 'rajesh@cocacola.in', '+91-9876543210', 'Mumbai, Maharashtra'),
('PepsiCo India', 'Priya Sharma', 'priya@pepsico.in', '+91-9876543211', 'Delhi, NCR'),
('Nestle India', 'Amit Patel', 'amit@nestle.in', '+91-9876543212', 'Bangalore, Karnataka'),
('Hindustan Unilever', 'Sunita Singh', 'sunita@hul.co.in', '+91-9876543213', 'Chennai, Tamil Nadu'),
('Colgate Palmolive', 'Ravi Gupta', 'ravi@colgate.in', '+91-9876543214', 'Pune, Maharashtra')
ON CONFLICT DO NOTHING;

-- Insert sample inventory items with barcodes
INSERT INTO inventory_items (name, barcode, category, price, cost_price, stock, min_stock, max_stock, supplier, description) VALUES
('Coca Cola 500ml', '1234567890123', 'Beverages', 25.00, 18.00, 50, 10, 200, 'Coca Cola India', 'Refreshing cola drink'),
('Lays Classic 50g', '9876543210987', 'Snacks', 20.00, 14.00, 75, 15, 300, 'PepsiCo India', 'Crispy potato chips'),
('Maggi 2-Minute Noodles', '5555555555555', 'Groceries', 12.00, 8.50, 100, 20, 500, 'Nestle India', 'Instant noodles'),
('Colgate Total 100g', '1111111111111', 'Personal Care', 85.00, 65.00, 25, 5, 100, 'Colgate Palmolive', 'Advanced toothpaste'),
('Surf Excel 1kg', '7777777777777', 'Household', 180.00, 140.00, 15, 5, 50, 'Hindustan Unilever', 'Laundry detergent powder'),
('Pepsi 500ml', '2222222222222', 'Beverages', 25.00, 18.00, 45, 10, 200, 'PepsiCo India', 'Cola soft drink'),
('Kurkure Masala Munch', '3333333333333', 'Snacks', 15.00, 10.00, 60, 15, 250, 'PepsiCo India', 'Spicy corn snack'),
('Amul Milk 1L', '4444444444444', 'Dairy', 55.00, 50.00, 30, 10, 100, 'Amul', 'Fresh full cream milk'),
('Britannia Good Day', '6666666666666', 'Snacks', 30.00, 22.00, 40, 10, 150, 'Britannia', 'Butter cookies'),
('Dettol Soap 100g', '8888888888888', 'Personal Care', 35.00, 25.00, 35, 8, 120, 'Reckitt Benckiser', 'Antiseptic soap')
ON CONFLICT (barcode) DO NOTHING;

COMMENT ON TABLE inventory_items IS 'Main inventory items with barcode tracking';
COMMENT ON TABLE stock_movements IS 'Track all stock in/out movements';
COMMENT ON TABLE low_stock_alerts IS 'Automated low stock notifications';
COMMENT ON TABLE suppliers IS 'Supplier master data';
COMMENT ON TABLE categories IS 'Product categories with hierarchy support';
