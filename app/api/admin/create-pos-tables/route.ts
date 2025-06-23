import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create POS tables
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

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_pos_sessions_retailer_id ON pos_sessions(retailer_id);
      CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON pos_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_pos_transactions_session_id ON pos_transactions(session_id);
      CREATE INDEX IF NOT EXISTS idx_pos_transactions_retailer_id ON pos_transactions(retailer_id);
      CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_at ON pos_transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_transaction_id ON pos_transaction_items(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_product_id ON pos_transaction_items(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_barcodes_barcode ON product_barcodes(barcode);
      CREATE INDEX IF NOT EXISTS idx_product_barcodes_product_id ON product_barcodes(product_id);

      -- Add barcode and SKU columns to products table if they don't exist
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

      -- Create function to generate transaction numbers
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

      -- Create trigger to auto-generate transaction numbers
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

      -- Create function to update session totals
      CREATE OR REPLACE FUNCTION update_pos_session_totals(p_session_id UUID, p_transaction_amount DECIMAL)
      RETURNS VOID AS $$
      BEGIN
          UPDATE pos_sessions 
          SET 
              total_sales = total_sales + p_transaction_amount,
              total_transactions = total_transactions + 1,
              updated_at = NOW()
          WHERE id = p_session_id;
      END;
      $$ LANGUAGE plpgsql;
    `

    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlCommands })

    if (error) {
      console.error("Error creating POS tables:", error)
      return NextResponse.json({ error: "Failed to create POS tables" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "POS tables created successfully",
    })
  } catch (error: any) {
    console.error("Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
