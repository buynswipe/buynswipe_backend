import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables")
  process.exit(1)
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function createTransactionsTable() {
  console.log("Creating transactions table...")

  try {
    // Check if the table exists
    const { data: existingTable, error: checkError } = await supabase
      .from("transactions")
      .select("id")
      .limit(1)
      .maybeSingle()

    const tableExists = !checkError || !checkError.message.includes('relation "transactions" does not exist')

    if (tableExists) {
      console.log("Transactions table already exists, checking structure...")

      // Get table structure
      const { error: describeError, data: columns } = await supabase.rpc("exec_sql", {
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'transactions'
        `,
      })

      if (describeError) {
        console.error("Error checking table structure:", describeError)
        throw describeError
      }

      console.log("Current columns:", columns)
    } else {
      console.log("Creating new transactions table...")
    }

    // Create or update transactions table
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: `
    -- Create the table if it doesn't exist
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      order_id UUID NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      transaction_fee DECIMAL(10, 2),
      payment_gateway VARCHAR(50),
      gateway_transaction_id VARCHAR(100),
      metadata JSONB
    );
    
    -- Add foreign key if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_order_id_fkey'
      ) THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT transactions_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If there's an error, log it but continue
      RAISE NOTICE 'Error adding foreign key: %', SQLERRM;
    END $$;
  `,
    })

    if (createError) {
      console.error("Error creating transactions table:", createError)
      throw createError
    }

    // Add RLS policies
    const { error: rlsError } = await supabase.rpc("exec_sql", {
      sql: `
        -- Enable RLS
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "transactions_insert_policy" ON transactions;
        DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;
        DROP POLICY IF EXISTS "transactions_update_policy" ON transactions;
        DROP POLICY IF EXISTS "transactions_delete_policy" ON transactions;
        
        -- Create policies
        CREATE POLICY "Admins can do anything with transactions" ON transactions
          FOR ALL USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
          );
        
        CREATE POLICY "Wholesalers can view, insert and update their transactions" ON transactions
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM orders 
              WHERE orders.id = transactions.order_id 
              AND orders.wholesaler_id = auth.uid()
            )
          );
        
        CREATE POLICY "Retailers can view their transactions" ON transactions
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM orders 
              WHERE orders.id = transactions.order_id 
              AND orders.retailer_id = auth.uid()
            )
          );
      `,
    })

    if (rlsError) {
      console.error("Error setting up RLS policies:", rlsError)
      throw rlsError
    }

    console.log("Transactions table and RLS policies created/updated successfully!")
    return true
  } catch (error) {
    console.error("Error creating transactions table:", error)
    throw error
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createTransactionsTable()
    .then(() => {
      console.log("Script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Script failed:", error)
      process.exit(1)
    })
}
