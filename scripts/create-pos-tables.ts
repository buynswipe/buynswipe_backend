import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createPosTables() {
  console.log("Creating POS tables...")

  try {
    // Read and execute the SQL file content
    const sqlCommands = `
      -- Create POS-related tables
      CREATE TABLE IF NOT EXISTS pos_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          retailer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          session_end TIMESTAMP WITH TIME ZONE,
          opening_cash DECIMAL(10,2) DEFAULT 0,
          closing_cash DECIMAL(10,2),
          total_sales DECIMAL(10,2) DEFAULT 0,
          total_transactions INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pos_transactions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES pos_sessions(id) ON DELETE CASCADE,
          retailer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          transaction_number VARCHAR(50) UNIQUE NOT NULL,
          customer_name VARCHAR(255),
          customer_phone VARCHAR(20),
          subtotal DECIMAL(10,2) NOT NULL,
          tax_amount DECIMAL(10,2) DEFAULT 0,
          discount_amount DECIMAL(10,2) DEFAULT 0,
          total_amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'mixed')),
          payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
          cash_received DECIMAL(10,2),
          change_given DECIMAL(10,2),
          notes TEXT,
          receipt_printed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pos_transaction_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          transaction_id UUID REFERENCES pos_transactions(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          product_name VARCHAR(255) NOT NULL,
          product_sku VARCHAR(100),
          barcode VARCHAR(100),
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          discount_percent DECIMAL(5,2) DEFAULT 0,
          discount_amount DECIMAL(10,2) DEFAULT 0,
          line_total DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS product_barcodes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          barcode VARCHAR(100) NOT NULL UNIQUE,
          barcode_type VARCHAR(20) DEFAULT 'EAN13',
          is_primary BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pos_settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          retailer_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
          store_name VARCHAR(255),
          store_address TEXT,
          store_phone VARCHAR(20),
          store_email VARCHAR(255),
          tax_rate DECIMAL(5,2) DEFAULT 0,
          receipt_header TEXT,
          receipt_footer TEXT,
          auto_print_receipt BOOLEAN DEFAULT TRUE,
          thermal_printer_ip VARCHAR(45),
          thermal_printer_port INTEGER DEFAULT 9100,
          barcode_scanner_enabled BOOLEAN DEFAULT TRUE,
          sound_enabled BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlCommands })

    if (error) {
      console.error("Error creating POS tables:", error)
      return
    }

    // Create indexes
    const indexCommands = `
      CREATE INDEX IF NOT EXISTS idx_pos_sessions_retailer_id ON pos_sessions(retailer_id);
      CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON pos_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_pos_transactions_session_id ON pos_transactions(session_id);
      CREATE INDEX IF NOT EXISTS idx_pos_transactions_retailer_id ON pos_transactions(retailer_id);
      CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_at ON pos_transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_transaction_id ON pos_transaction_items(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_product_id ON pos_transaction_items(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_barcodes_barcode ON product_barcodes(barcode);
      CREATE INDEX IF NOT EXISTS idx_product_barcodes_product_id ON product_barcodes(product_id);
    `

    const { error: indexError } = await supabase.rpc("exec_sql", { sql_query: indexCommands })

    if (indexError) {
      console.error("Error creating indexes:", indexError)
      return
    }

    // Add columns to products table
    const alterCommands = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
              ALTER TABLE products ADD COLUMN sku VARCHAR(100) UNIQUE;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'barcode') THEN
              ALTER TABLE products ADD COLUMN barcode VARCHAR(100);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN
              ALTER TABLE products ADD COLUMN cost_price DECIMAL(10,2);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_stock_level') THEN
              ALTER TABLE products ADD COLUMN min_stock_level INTEGER DEFAULT 0;
          END IF;
      END $$;
    `

    const { error: alterError } = await supabase.rpc("exec_sql", { sql_query: alterCommands })

    if (alterError) {
      console.error("Error altering products table:", alterError)
      return
    }

    // Create functions
    const functionCommands = `
      CREATE OR REPLACE FUNCTION generate_transaction_number()
      RETURNS TEXT AS $$
      DECLARE
          new_number TEXT;
          counter INTEGER;
      BEGIN
          SELECT TO_CHAR(NOW(), 'YYYYMMDD') INTO new_number;
          
          SELECT COUNT(*) + 1 INTO counter
          FROM pos_transactions 
          WHERE DATE(created_at) = CURRENT_DATE;
          
          new_number := new_number || '-' || LPAD(counter::TEXT, 4, '0');
          
          RETURN new_number;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION set_transaction_number()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
              NEW.transaction_number := generate_transaction_number();
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_set_transaction_number ON pos_transactions;
      CREATE TRIGGER trigger_set_transaction_number
          BEFORE INSERT ON pos_transactions
          FOR EACH ROW
          EXECUTE FUNCTION set_transaction_number();
    `

    const { error: functionError } = await supabase.rpc("exec_sql", { sql_query: functionCommands })

    if (functionError) {
      console.error("Error creating functions:", functionError)
      return
    }

    console.log("POS tables created successfully!")
  } catch (error) {
    console.error("Error:", error)
  }
}

createPosTables()
