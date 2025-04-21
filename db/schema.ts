// Define schema types for compatibility with code expecting Drizzle or similar
export const orders = {
  id: "id",
  userId: "user_id",
  status: "status",
  totalAmount: "total_amount",
  createdAt: "created_at",
  updatedAt: "updated_at",
  // Add other fields as needed
}

// Add other schemas as needed
export const users = {
  id: "id",
  email: "email",
  name: "name",
  role: "role",
}

export const products = {
  id: "id",
  name: "name",
  price: "price",
  description: "description",
  imageUrl: "image_url",
}
