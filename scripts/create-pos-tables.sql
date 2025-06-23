-- Create POS Sessions table
CREATE TABLE IF NOT EXISTS pos_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    opening_cash DECIMAL(10,2) DEFAULT 0,
    closing_cash DECIMAL(10,2),
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create POS Transactions table
CREATE TABLE IF NOT EXISTS pos_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES pos_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi')),
    amount_paid DECIMAL(10,2) NOT NULL,
    change_amount DECIMAL(10,2) DEFAULT 0,
    receipt_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(product_id UUID, quantity_sold INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET stock = stock - quantity_sold,
        updated_at = NOW()
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pos_sessions_user_id ON pos_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON pos_sessions(status);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_session_id ON pos_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_user_id ON pos_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_at ON pos_transactions(created_at);

-- Enable RLS
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own POS sessions" ON pos_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own POS transactions" ON pos_transactions
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON pos_sessions TO authenticated;
GRANT ALL ON pos_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_stock TO authenticated;
