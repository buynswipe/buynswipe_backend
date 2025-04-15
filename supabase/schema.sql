-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'retailer', 'wholesaler', 'delivery_partner')),
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  gst_number TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

-- Create delivery_partners table first so orders can reference it
CREATE TABLE IF NOT EXISTS delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bike', 'auto', 'van', 'truck')),
  vehicle_number TEXT NOT NULL,
  license_number TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  wholesaler_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL,
  initial_quantity INTEGER NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retailer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('placed', 'confirmed', 'dispatched', 'delivered', 'rejected')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'upi')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid')),
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivery_partner_id UUID REFERENCES delivery_partners(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'upi')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_fee DECIMAL(10, 2) NOT NULL
);

-- Create low_stock_alerts table
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL,
  is_notified BOOLEAN DEFAULT FALSE
);

-- Create function to update stock quantity
CREATE OR REPLACE FUNCTION update_stock_quantity(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to check low stock
CREATE OR REPLACE FUNCTION check_low_stock() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity <= (NEW.initial_quantity * 0.1) THEN
    INSERT INTO low_stock_alerts (product_id, wholesaler_id, current_stock)
    VALUES (NEW.id, NEW.wholesaler_id, NEW.stock_quantity);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for low stock check
CREATE TRIGGER trigger_check_low_stock
AFTER UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION check_low_stock();

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Wholesalers can insert their own products" ON products
  FOR INSERT WITH CHECK (
    auth.uid() = wholesaler_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  );

CREATE POLICY "Wholesalers can update their own products" ON products
  FOR UPDATE USING (
    auth.uid() = wholesaler_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  );

CREATE POLICY "Wholesalers can delete their own products" ON products
  FOR DELETE USING (
    auth.uid() = wholesaler_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  );

-- Orders policies
CREATE POLICY "Orders are viewable by the retailer or wholesaler involved" ON orders
  FOR SELECT USING (
    auth.uid() = retailer_id OR
    auth.uid() = wholesaler_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Retailers can insert orders" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = retailer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'retailer')
  );

CREATE POLICY "Wholesalers can update orders they're involved in" ON orders
  FOR UPDATE USING (
    auth.uid() = wholesaler_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  );

-- Order items policies
CREATE POLICY "Order items are viewable by the retailer or wholesaler involved" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.retailer_id = auth.uid() OR orders.wholesaler_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Retailers can insert order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.retailer_id = auth.uid()
    ) AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'retailer')
  );

-- Transactions policies
CREATE POLICY "Transactions are viewable by the retailer or wholesaler involved" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = transactions.order_id
      AND (orders.retailer_id = auth.uid() OR orders.wholesaler_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update transactions" ON transactions
  FOR UPDATE USING (true);

-- Delivery partners policies
CREATE POLICY "Delivery partners are viewable by everyone" ON delivery_partners
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert delivery partners" ON delivery_partners
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler') AND
      (wholesaler_id = auth.uid() OR wholesaler_id IS NULL)
    )
  );

CREATE POLICY "Admins and wholesalers can update their delivery partners" ON delivery_partners
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler') AND
      (wholesaler_id = auth.uid() OR wholesaler_id IS NULL)
    )
  );

CREATE POLICY "Admins and wholesalers can delete their delivery partners" ON delivery_partners
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler') AND
      wholesaler_id = auth.uid()
    )
  );

-- Low stock alerts policies
CREATE POLICY "Low stock alerts are viewable by the wholesaler" ON low_stock_alerts
  FOR SELECT USING (
    wholesaler_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
