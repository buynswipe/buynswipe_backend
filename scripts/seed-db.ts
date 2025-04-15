import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log("Starting database seeding...")

  // Create demo users
  const adminId = uuidv4()
  const retailerId = uuidv4()
  const wholesalerId = uuidv4()

  // Create admin user
  const { error: adminAuthError } = await supabase.auth.admin.createUser({
    email: "admin@retailbandhu.com",
    password: "admin123",
    email_confirm: true,
    user_metadata: { role: "admin" },
    id: adminId,
  })

  if (adminAuthError) {
    console.error("Error creating admin user:", adminAuthError)
    return
  }

  // Create retailer user
  const { error: retailerAuthError } = await supabase.auth.admin.createUser({
    email: "retailer@retailbandhu.com",
    password: "retailer123",
    email_confirm: true,
    user_metadata: { role: "retailer" },
    id: retailerId,
  })

  if (retailerAuthError) {
    console.error("Error creating retailer user:", retailerAuthError)
    return
  }

  // Create wholesaler user
  const { error: wholesalerAuthError } = await supabase.auth.admin.createUser({
    email: "wholesaler@retailbandhu.com",
    password: "wholesaler123",
    email_confirm: true,
    user_metadata: { role: "wholesaler" },
    id: wholesalerId,
  })

  if (wholesalerAuthError) {
    console.error("Error creating wholesaler user:", wholesalerAuthError)
    return
  }

  // Create user profiles
  const { error: adminProfileError } = await supabase.from("profiles").insert({
    id: adminId,
    email: "admin@retailbandhu.com",
    role: "admin",
    business_name: "Retail Bandhu Admin",
    phone: "9876543210",
    address: "Admin Office",
    city: "Mumbai",
    pincode: "400001",
    is_approved: true,
  })

  if (adminProfileError) {
    console.error("Error creating admin profile:", adminProfileError)
    return
  }

  const { error: retailerProfileError } = await supabase.from("profiles").insert({
    id: retailerId,
    email: "retailer@retailbandhu.com",
    role: "retailer",
    business_name: "Sample Retail Store",
    phone: "9876543211",
    address: "123 Retail Street",
    city: "Delhi",
    pincode: "110001",
    is_approved: true,
    latitude: 28.6139,
    longitude: 77.209,
  })

  if (retailerProfileError) {
    console.error("Error creating retailer profile:", retailerProfileError)
    return
  }

  const { error: wholesalerProfileError } = await supabase.from("profiles").insert({
    id: wholesalerId,
    email: "wholesaler@retailbandhu.com",
    role: "wholesaler",
    business_name: "Mega Wholesale Supplies",
    phone: "9876543212",
    address: "456 Wholesale Avenue",
    city: "Delhi",
    pincode: "110002",
    is_approved: true,
    gst_number: "GST1234567890",
    latitude: 28.6129,
    longitude: 77.2295,
  })

  if (wholesalerProfileError) {
    console.error("Error creating wholesaler profile:", wholesalerProfileError)
    return
  }

  // Create sample products
  const products = [
    {
      wholesaler_id: wholesalerId,
      name: "Rice (25kg)",
      description: "Premium quality basmati rice",
      category: "Groceries",
      price: 1200,
      stock_quantity: 50,
      initial_quantity: 100,
    },
    {
      wholesaler_id: wholesalerId,
      name: "Wheat Flour (10kg)",
      description: "Fine wheat flour for chapatis",
      category: "Groceries",
      price: 350,
      stock_quantity: 75,
      initial_quantity: 150,
    },
    {
      wholesaler_id: wholesalerId,
      name: "Cooking Oil (5L)",
      description: "Refined sunflower oil",
      category: "Groceries",
      price: 550,
      stock_quantity: 60,
      initial_quantity: 100,
    },
    {
      wholesaler_id: wholesalerId,
      name: "Sugar (5kg)",
      description: "Fine grain white sugar",
      category: "Groceries",
      price: 250,
      stock_quantity: 80,
      initial_quantity: 120,
    },
    {
      wholesaler_id: wholesalerId,
      name: "Soap (Box of 12)",
      description: "Bath soap variety pack",
      category: "Personal Care",
      price: 360,
      stock_quantity: 40,
      initial_quantity: 80,
    },
  ]

  const { error: productsError } = await supabase.from("products").insert(products)

  if (productsError) {
    console.error("Error creating products:", productsError)
    return
  }

  // Get product IDs for creating orders
  const { data: productData, error: productFetchError } = await supabase
    .from("products")
    .select("id, price")
    .eq("wholesaler_id", wholesalerId)

  if (productFetchError || !productData) {
    console.error("Error fetching products:", productFetchError)
    return
  }

  // Create sample orders
  const orderId1 = uuidv4()
  const orderId2 = uuidv4()

  const orders = [
    {
      id: orderId1,
      retailer_id: retailerId,
      wholesaler_id: wholesalerId,
      status: "confirmed",
      payment_method: "cod",
      payment_status: "pending",
      total_amount: 1550, // Will be calculated from order items
      notes: "Please deliver in the morning",
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    },
    {
      id: orderId2,
      retailer_id: retailerId,
      wholesaler_id: wholesalerId,
      status: "placed",
      payment_method: "upi",
      payment_status: "paid",
      total_amount: 610, // Will be calculated from order items
      notes: "Urgent delivery needed",
    },
  ]

  const { error: ordersError } = await supabase.from("orders").insert(orders)

  if (ordersError) {
    console.error("Error creating orders:", ordersError)
    return
  }

  // Create order items
  const orderItems = [
    {
      order_id: orderId1,
      product_id: productData[0].id,
      quantity: 1,
      price: productData[0].price,
    },
    {
      order_id: orderId1,
      product_id: productData[2].id,
      quantity: 1,
      price: productData[2].price,
    },
    {
      order_id: orderId2,
      product_id: productData[3].id,
      quantity: 1,
      price: productData[3].price,
    },
    {
      order_id: orderId2,
      product_id: productData[4].id,
      quantity: 1,
      price: productData[4].price,
    },
  ]

  const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems)

  if (orderItemsError) {
    console.error("Error creating order items:", orderItemsError)
    return
  }

  // Create transactions
  const transactions = [
    {
      order_id: orderId2,
      amount: 610,
      payment_method: "upi",
      status: "completed",
      transaction_fee: 610 * 0.02, // 2% transaction fee
    },
  ]

  const { error: transactionsError } = await supabase.from("transactions").insert(transactions)

  if (transactionsError) {
    console.error("Error creating transactions:", transactionsError)
    return
  }

  console.log("Database seeding completed successfully!")
}

// Run the seed function
seedDatabase()
  .catch(console.error)
  .finally(() => process.exit())
