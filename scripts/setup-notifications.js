import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupNotifications() {
  try {
    console.log("Setting up notifications table...")

    // Create notifications table
    const { error: tableError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          read BOOLEAN DEFAULT false,
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          created_by UUID REFERENCES profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
        
        -- Enable RLS
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        
        -- Policy for selecting notifications
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'select_notifications'
          ) THEN
            CREATE POLICY select_notifications ON notifications
              FOR SELECT USING (
                user_id = auth.uid() OR
                created_by = auth.uid() OR
                EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
              );
          END IF;
        END $$;
        
        -- Policy for inserting notifications
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'insert_notifications'
          ) THEN
            CREATE POLICY insert_notifications ON notifications
              FOR INSERT WITH CHECK (
                EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'wholesaler'))
              );
          END IF;
        END $$;
        
        -- Policy for updating notifications
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'update_notifications'
          ) THEN
            CREATE POLICY update_notifications ON notifications
              FOR UPDATE USING (
                user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
              );
          END IF;
        END $$;
      `,
    })

    if (tableError) {
      console.error("Error creating notifications table:", tableError)
      return
    }

    console.log("Notifications table created successfully")

    // Create test notifications for delivery partners
    console.log("Creating test notifications for delivery partners...")

    // Get delivery partners
    const { data: deliveryPartners, error: dpError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "delivery_partner")

    if (dpError) {
      console.error("Error fetching delivery partners:", dpError)
      return
    }

    // Get orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, retailer_id")
      .in("status", ["dispatched", "in_transit"])
      .limit(5)

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return
    }

    // Create notifications
    for (const partner of deliveryPartners || []) {
      for (const order of orders || []) {
        const { error: notifError } = await supabase.from("notifications").insert({
          user_id: partner.id,
          type: "delivery",
          title: "New Delivery Assignment",
          message: `You have been assigned to deliver order #${order.id.substring(0, 8)}`,
          order_id: order.id,
          created_by: order.retailer_id,
        })

        if (notifError) {
          console.error("Error creating notification:", notifError)
        }
      }
    }

    console.log("Test notifications created successfully")
  } catch (error) {
    console.error("Error setting up notifications:", error)
  }
}

setupNotifications()
