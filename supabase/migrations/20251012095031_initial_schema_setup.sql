/*
  # Initial Database Schema Setup for Retail Bandhu

  1. New Tables
    - `profiles` - User profile data with business information
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `role` (text - admin, retailer, wholesaler, delivery_partner)
      - `business_name`, `phone`, `address`, `city`, `pincode` (text)
      - `is_approved` (boolean, default false)
      - `gst_number`, `latitude`, `longitude` (optional fields)
      - `created_at` (timestamptz)

    - `delivery_partners` - Delivery partner information
      - `id` (uuid, primary key)
      - `name`, `phone`, `email` (text)
      - `vehicle_type` (bike, auto, van, truck)
      - `vehicle_number`, `license_number` (text)
      - `address`, `city`, `pincode` (text)
      - `is_active` (boolean, default true)
      - `wholesaler_id` (uuid, references profiles)
      - `created_at` (timestamptz)

    - `products` - Product catalog
      - `id` (uuid, primary key)
      - `wholesaler_id` (uuid, references profiles)
      - `name`, `description`, `category` (text)
      - `price` (decimal)
      - `stock_quantity`, `initial_quantity` (integer)
      - `image_url` (text)
      - `created_at` (timestamptz)

    - `orders` - Order management
      - `id` (uuid, primary key)
      - `retailer_id`, `wholesaler_id` (uuid, references profiles)
      - `status` (placed, confirmed, dispatched, delivered, rejected)
      - `payment_method` (cod, upi)
      - `payment_status` (pending, paid)
      - `total_amount` (decimal)
      - `notes` (text)
      - `estimated_delivery` (timestamptz)
      - `delivery_partner_id` (uuid, references delivery_partners)
      - `created_at` (timestamptz)

    - `order_items` - Order line items
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `price` (decimal)

    - `transactions` - Payment transactions
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `amount`, `transaction_fee` (decimal)
      - `payment_method` (cod, upi)
      - `status` (pending, completed, failed)
      - `created_at` (timestamptz)

    - `low_stock_alerts` - Inventory alerts
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `wholesaler_id` (uuid, references profiles)
      - `current_stock` (integer)
      - `is_notified` (boolean, default false)
      - `created_at` (timestamptz)

  2. Functions
    - `update_stock_quantity()` - Decreases product stock
    - `check_low_stock()` - Trigger function for low stock alerts

  3. Security
    - Enable RLS on all tables
    - Profiles: Public read, users can update own profile
    - Products: Public read, wholesalers manage their own products
    - Orders: Viewable by involved parties, retailers create, wholesalers update
    - Order items: Viewable by order parties, retailers create
    - Transactions: Viewable by order parties, system manages
    - Delivery partners: Public read, admins/wholesalers manage
    - Low stock alerts: Viewable by wholesaler and admins

  4. Important Notes
    - All tables use UUID primary keys
    - RLS policies restrict access based on user roles
    - Triggers automatically create low stock alerts
    - Foreign keys ensure referential integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
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

-- Create delivery_partners table
CREATE TABLE IF NOT EXISTS delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
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

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL,
  initial_quantity INTEGER NOT NULL,
  image_url TEXT
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  retailer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('placed', 'confirmed', 'dispatched', 'delivered', 'rejected')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'upi')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid')),
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  estimated_delivery TIMESTAMPTZ,
  delivery_partner_id UUID REFERENCES delivery_partners(id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'upi')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_fee DECIMAL(10, 2) NOT NULL
);

-- Create low_stock_alerts table
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
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
    VALUES (NEW.id, NEW.wholesaler_id, NEW.stock_quantity)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for low stock check
DROP TRIGGER IF EXISTS trigger_check_low_stock ON products;
CREATE TRIGGER trigger_check_low_stock
AFTER UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION check_low_stock();

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Wholesalers can insert their own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = wholesaler_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler' AND is_approved = true)
  );

CREATE POLICY "Wholesalers can update their own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = wholesaler_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  )
  WITH CHECK (
    auth.uid() = wholesaler_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  );

CREATE POLICY "Wholesalers can delete their own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    auth.uid() = wholesaler_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  );

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = retailer_id OR
    auth.uid() = wholesaler_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Retailers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = retailer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'retailer' AND is_approved = true)
  );

CREATE POLICY "Wholesalers and admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = wholesaler_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = wholesaler_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Order items policies
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.retailer_id = auth.uid() OR orders.wholesaler_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Retailers can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.retailer_id = auth.uid()
    ) AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'retailer')
  );

-- Transactions policies
CREATE POLICY "Users can view transactions for their orders"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = transactions.order_id
      AND (orders.retailer_id = auth.uid() OR orders.wholesaler_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Delivery partners policies
CREATE POLICY "Authenticated users can view delivery partners"
  ON delivery_partners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and wholesalers can create delivery partners"
  ON delivery_partners FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler') AND
      (wholesaler_id = auth.uid() OR wholesaler_id IS NULL)
    )
  );

CREATE POLICY "Admins and wholesalers can update their delivery partners"
  ON delivery_partners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler') AND
      (wholesaler_id = auth.uid() OR wholesaler_id IS NULL)
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler') AND
      (wholesaler_id = auth.uid() OR wholesaler_id IS NULL)
    )
  );

CREATE POLICY "Admins and wholesalers can delete their delivery partners"
  ON delivery_partners FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler') AND
      wholesaler_id = auth.uid()
    )
  );

-- Low stock alerts policies
CREATE POLICY "Wholesalers and admins can view low stock alerts"
  ON low_stock_alerts FOR SELECT
  TO authenticated
  USING (
    wholesaler_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
