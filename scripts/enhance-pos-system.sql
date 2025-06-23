-- Enhanced POS System Schema

-- Add product categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'package',
    parent_id UUID REFERENCES product_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    retailer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add discounts and promotions table
CREATE TABLE IF NOT EXISTS pos_discounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'buy_x_get_y')),
    value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_to VARCHAR(20) DEFAULT 'all' CHECK (applicable_to IN ('all', 'category', 'product')),
    applicable_ids JSONB DEFAULT '[]',
    retailer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add customer management
CREATE TABLE IF NOT EXISTS pos_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    loyalty_points INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    retailer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced transactions table
ALTER TABLE pos_transactions ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES pos_customers(id);
ALTER TABLE pos_transactions ADD COLUMN IF NOT EXISTS discount_id UUID REFERENCES pos_discounts(id);
ALTER TABLE pos_transactions ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pos_transactions ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0;
ALTER TABLE pos_transactions ADD COLUMN IF NOT EXISTS loyalty_points_redeemed INTEGER DEFAULT 0;
ALTER TABLE pos_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE pos_transactions ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'return', 'exchange'));

-- Enhanced products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS margin_percentage DECIMAL(5,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Add payment methods table
CREATE TABLE IF NOT EXISTS pos_payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('cash', 'card', 'upi', 'wallet', 'bank_transfer')),
    is_active BOOLEAN DEFAULT TRUE,
    processing_fee_percentage DECIMAL(5,2) DEFAULT 0,
    processing_fee_fixed DECIMAL(10,2) DEFAULT 0,
    retailer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add transaction payments table for multiple payment methods
CREATE TABLE IF NOT EXISTS pos_transaction_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES pos_transactions(id) ON DELETE CASCADE,
    payment_method_id UUID REFERENCES pos_payment_methods(id),
    amount DECIMAL(10,2) NOT NULL,
    reference_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add inventory tracking
CREATE TABLE IF NOT EXISTS pos_inventory_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES pos_transactions(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('sale', 'return', 'adjustment', 'restock')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    cost_price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add sales analytics views
CREATE OR REPLACE VIEW pos_sales_analytics AS
SELECT 
    DATE(t.created_at) as sale_date,
    COUNT(*) as transaction_count,
    SUM(t.total) as total_revenue,
    SUM(t.subtotal) as subtotal_revenue,
    SUM(t.tax) as total_tax,
    SUM(t.discount_amount) as total_discounts,
    AVG(t.total) as average_transaction_value,
    t.retailer_id
FROM pos_transactions t
WHERE t.transaction_type = 'sale' AND t.payment_status = 'completed'
GROUP BY DATE(t.created_at), t.retailer_id;

-- Add product performance view
CREATE OR REPLACE VIEW pos_product_performance AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    pc.name as category_name,
    SUM(ti.quantity) as total_sold,
    SUM(ti.total_price) as total_revenue,
    AVG(ti.unit_price) as average_price,
    COUNT(DISTINCT t.id) as transaction_count,
    p.stock as current_stock,
    p.retailer_id
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN pos_transaction_items ti ON p.id = ti.product_id
LEFT JOIN pos_transactions t ON ti.transaction_id = t.id
WHERE t.transaction_type = 'sale' AND t.payment_status = 'completed'
GROUP BY p.id, p.name, pc.name, p.stock, p.retailer_id;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_categories_retailer_id ON product_categories(retailer_id);
CREATE INDEX IF NOT EXISTS idx_pos_discounts_retailer_id ON pos_discounts(retailer_id);
CREATE INDEX IF NOT EXISTS idx_pos_customers_retailer_id ON pos_customers(retailer_id);
CREATE INDEX IF NOT EXISTS idx_pos_customers_phone ON pos_customers(phone);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_customer_id ON pos_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_at ON pos_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_pos_inventory_movements_product_id ON pos_inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Insert default payment methods
INSERT INTO pos_payment_methods (name, type, retailer_id) 
SELECT 'Cash', 'cash', id FROM auth.users WHERE id IN (SELECT DISTINCT retailer_id FROM pos_sessions)
ON CONFLICT DO NOTHING;

INSERT INTO pos_payment_methods (name, type, retailer_id) 
SELECT 'Credit/Debit Card', 'card', id FROM auth.users WHERE id IN (SELECT DISTINCT retailer_id FROM pos_sessions)
ON CONFLICT DO NOTHING;

INSERT INTO pos_payment_methods (name, type, retailer_id) 
SELECT 'UPI', 'upi', id FROM auth.users WHERE id IN (SELECT DISTINCT retailer_id FROM pos_sessions)
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO product_categories (name, description, color, icon, retailer_id)
SELECT 'Electronics', 'Electronic devices and accessories', '#3B82F6', 'smartphone', id 
FROM auth.users WHERE id IN (SELECT DISTINCT retailer_id FROM pos_sessions)
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (name, description, color, icon, retailer_id)
SELECT 'Groceries', 'Food and daily essentials', '#10B981', 'shopping-cart', id 
FROM auth.users WHERE id IN (SELECT DISTINCT retailer_id FROM pos_sessions)
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (name, description, color, icon, retailer_id)
SELECT 'Clothing', 'Apparel and fashion items', '#F59E0B', 'shirt', id 
FROM auth.users WHERE id IN (SELECT DISTINCT retailer_id FROM pos_sessions)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaction_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_inventory_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own categories" ON product_categories
    FOR ALL USING (auth.uid() = retailer_id);

CREATE POLICY "Users can manage their own discounts" ON pos_discounts
    FOR ALL USING (auth.uid() = retailer_id);

CREATE POLICY "Users can manage their own customers" ON pos_customers
    FOR ALL USING (auth.uid() = retailer_id);

CREATE POLICY "Users can manage their own payment methods" ON pos_payment_methods
    FOR ALL USING (auth.uid() = retailer_id);

CREATE POLICY "Users can view their own transaction payments" ON pos_transaction_payments
    FOR ALL USING (auth.uid() IN (SELECT retailer_id FROM pos_transactions WHERE id = transaction_id));

CREATE POLICY "Users can view their own inventory movements" ON pos_inventory_movements
    FOR ALL USING (auth.uid() IN (SELECT retailer_id FROM products WHERE id = product_id));

-- Grant permissions
GRANT ALL ON product_categories TO authenticated;
GRANT ALL ON pos_discounts TO authenticated;
GRANT ALL ON pos_customers TO authenticated;
GRANT ALL ON pos_payment_methods TO authenticated;
GRANT ALL ON pos_transaction_payments TO authenticated;
GRANT ALL ON pos_inventory_movements TO authenticated;
GRANT SELECT ON pos_sales_analytics TO authenticated;
GRANT SELECT ON pos_product_performance TO authenticated;
