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

export async function seedChatResponses() {
  console.log("Seeding suggested chat responses...")

  try {
    // Check if the table exists
    const { error: checkError } = await supabase.from("chat_suggested_responses").select("id").limit(1).maybeSingle()

    if (checkError && checkError.message.includes('relation "chat_suggested_responses" does not exist')) {
      console.error("Chat suggested responses table does not exist. Please run create-chat-tables script first.")
      process.exit(1)
    }

    // Sample suggested responses
    const suggestedResponses = [
      // Product related
      {
        category: "products",
        topic: "catalog",
        question: "How do I add a new product?",
        response:
          "To add a new product, go to the Products section in your dashboard and click on the 'Add Product' button. Fill in the required details like name, description, price, and inventory levels.",
        language: "en",
      },
      {
        category: "products",
        topic: "inventory",
        question: "How do I update my inventory?",
        response:
          "You can update your inventory by going to the Products section, selecting the product you want to update, and changing the inventory quantity. You can also use the bulk update feature for multiple products.",
        language: "en",
      },

      // Order related
      {
        category: "orders",
        topic: "status",
        question: "How do I check my order status?",
        response:
          "You can check your order status by going to the Orders section in your dashboard. Each order will show its current status (pending, processing, shipped, delivered, etc.).",
        language: "en",
      },
      {
        category: "orders",
        topic: "cancellation",
        question: "How do I cancel an order?",
        response:
          "To cancel an order, go to the Orders section, find the order you want to cancel, and click on the 'Cancel Order' button. Note that you can only cancel orders that haven't been shipped yet.",
        language: "en",
      },

      // Payment related
      {
        category: "payments",
        topic: "methods",
        question: "What payment methods do you accept?",
        response:
          "We accept various payment methods including UPI, Cash on Delivery (COD), and bank transfers. The available payment methods will be shown during checkout.",
        language: "en",
      },
      {
        category: "payments",
        topic: "issues",
        question: "My payment failed, what should I do?",
        response:
          "If your payment failed, you can try again with the same or a different payment method. If the issue persists, please check your payment details and ensure you have sufficient funds. For further assistance, please contact our support team.",
        language: "en",
      },

      // Returns related
      {
        category: "returns",
        topic: "policy",
        question: "What is your return policy?",
        response:
          "Our return policy allows returns within 7 days of delivery for most products. The product must be in its original condition and packaging. Some products may have specific return conditions.",
        language: "en",
      },
      {
        category: "returns",
        topic: "process",
        question: "How do I return a product?",
        response:
          "To return a product, go to your Orders section, select the order containing the product you want to return, and click on 'Request Return'. Follow the instructions to complete the return process.",
        language: "en",
      },

      // Account related
      {
        category: "account",
        topic: "profile",
        question: "How do I update my profile information?",
        response:
          "You can update your profile information by clicking on your profile icon in the top right corner and selecting 'Profile'. From there, you can edit your business details, contact information, and other settings.",
        language: "en",
      },
      {
        category: "account",
        topic: "password",
        question: "How do I change my password?",
        response:
          "To change your password, go to your Profile page, click on the 'Security' tab, and select 'Change Password'. You'll need to enter your current password and then your new password.",
        language: "en",
      },

      // Hindi translations for common questions
      {
        category: "products",
        topic: "catalog",
        question: "मैं नया उत्पाद कैसे जोड़ूं?",
        response:
          "नया उत्पाद जोड़ने के लिए, अपने डैशबोर्ड में प्रोडक्ट्स सेक्शन पर जाएं और 'Add Product' बटन पर क्लिक करें। नाम, विवरण, मूल्य और इन्वेंट्री स्तर जैसे आवश्यक विवरण भरें।",
        language: "hi",
      },
      {
        category: "orders",
        topic: "status",
        question: "मैं अपने ऑर्डर की स्थिति कैसे जांचूं?",
        response:
          "आप अपने डैशबोर्ड में ऑर्डर्स सेक्शन पर जाकर अपने ऑर्डर की स्थिति देख सकते हैं। प्रत्येक ऑर्डर अपनी वर्तमान स्थिति (पेंडिंग, प्रोसेसिंग, शिप्ड, डिलीवर्ड, आदि) दिखाएगा।",
        language: "hi",
      },
    ]

    // Insert suggested responses
    for (const response of suggestedResponses) {
      const { error } = await supabase.from("chat_suggested_responses").upsert(
        {
          ...response,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "category,topic,question,language",
        },
      )

      if (error) {
        console.error(`Error inserting suggested response: ${error.message}`)
      }
    }

    console.log(`Seeded ${suggestedResponses.length} suggested responses successfully!`)
    return true
  } catch (error) {
    console.error("Error seeding chat responses:", error)
    throw error
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  seedChatResponses()
    .then(() => {
      console.log("Script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Script failed:", error)
      process.exit(1)
    })
}
