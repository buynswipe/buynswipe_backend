import type React from "react"
import { formatDate } from "@/lib/utils"
import type { Order, UserProfile, OrderItem, Product } from "@/types/database.types"

interface InvoiceTemplateProps {
  order: Order & {
    retailer: UserProfile
    wholesaler: UserProfile
    order_items: (OrderItem & {
      product: Product
    })[]
  }
  invoiceNumber: string
  invoiceDate: string
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, invoiceNumber, invoiceDate }) => {
  // Calculate subtotal
  const subtotal = order.order_items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Calculate tax (assuming 18% GST)
  const taxRate = 0.18
  const taxAmount = subtotal * taxRate

  // Calculate total
  const total = subtotal + taxAmount

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="invoice-template">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
          <p className="text-gray-600">#{invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-800">{order.wholesaler.business_name}</h2>
          <p className="text-gray-600">{order.wholesaler.address}</p>
          <p className="text-gray-600">
            {order.wholesaler.city}, {order.wholesaler.pincode}
          </p>
          <p className="text-gray-600">Phone: {order.wholesaler.phone}</p>
          <p className="text-gray-600">GST: {order.wholesaler.gst_number || "N/A"}</p>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between mb-8">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
          <p className="text-gray-700 font-semibold">{order.retailer.business_name}</p>
          <p className="text-gray-600">{order.retailer.address}</p>
          <p className="text-gray-600">
            {order.retailer.city}, {order.retailer.pincode}
          </p>
          <p className="text-gray-600">Phone: {order.retailer.phone}</p>
          <p className="text-gray-600">GST: {order.retailer.gst_number || "N/A"}</p>
        </div>
        <div>
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Invoice Date:</span>
            <span className="text-gray-600 ml-2">{invoiceDate}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Order Date:</span>
            <span className="text-gray-600 ml-2">{formatDate(order.created_at)}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Order ID:</span>
            <span className="text-gray-600 ml-2">#{order.id.substring(0, 8)}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Payment Method:</span>
            <span className="text-gray-600 ml-2">
              {order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left border border-gray-200">Item</th>
            <th className="py-2 px-4 text-right border border-gray-200">Quantity</th>
            <th className="py-2 px-4 text-right border border-gray-200">Unit Price</th>
            <th className="py-2 px-4 text-right border border-gray-200">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="py-2 px-4 border border-gray-200">{item.product.name}</td>
              <td className="py-2 px-4 text-right border border-gray-200">{item.quantity}</td>
              <td className="py-2 px-4 text-right border border-gray-200">₹{item.price.toFixed(2)}</td>
              <td className="py-2 px-4 text-right border border-gray-200">
                ₹{(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="font-semibold">Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-semibold">GST (18%):</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms and Notes */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-800 mb-2">Terms & Notes</h3>
        <p className="text-gray-600 text-sm">
          Thank you for your business. Payment is expected within 30 days of invoice date. Please make payment to the
          bank account specified in your contract.
        </p>
        {order.notes && (
          <div className="mt-2">
            <h4 className="font-semibold text-gray-800">Order Notes:</h4>
            <p className="text-gray-600 text-sm">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
