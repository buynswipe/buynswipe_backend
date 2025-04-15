import type React from "react"
import { formatDate } from "@/lib/utils"
import type { Order, UserProfile, OrderItem, Product, DeliveryPartner } from "@/types/database.types"

interface DispatchReceiptTemplateProps {
  order: Order & {
    retailer: UserProfile
    wholesaler: UserProfile
    order_items: (OrderItem & {
      product: Product
    })[]
    delivery_partner?: DeliveryPartner
  }
  dispatchNumber: string
  dispatchDate: string
}

export const DispatchReceiptTemplate: React.FC<DispatchReceiptTemplateProps> = ({
  order,
  dispatchNumber,
  dispatchDate,
}) => {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="dispatch-receipt-template">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">DISPATCH RECEIPT</h1>
          <p className="text-gray-600">#{dispatchNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-800">{order.wholesaler.business_name}</h2>
          <p className="text-gray-600">{order.wholesaler.address}</p>
          <p className="text-gray-600">
            {order.wholesaler.city}, {order.wholesaler.pincode}
          </p>
          <p className="text-gray-600">Phone: {order.wholesaler.phone}</p>
        </div>
      </div>

      {/* Dispatch Info */}
      <div className="flex justify-between mb-8">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Ship To:</h3>
          <p className="text-gray-700 font-semibold">{order.retailer.business_name}</p>
          <p className="text-gray-600">{order.retailer.address}</p>
          <p className="text-gray-600">
            {order.retailer.city}, {order.retailer.pincode}
          </p>
          <p className="text-gray-600">Phone: {order.retailer.phone}</p>
        </div>
        <div>
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Dispatch Date:</span>
            <span className="text-gray-600 ml-2">{dispatchDate}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Order Date:</span>
            <span className="text-gray-600 ml-2">{formatDate(order.created_at)}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Order ID:</span>
            <span className="text-gray-600 ml-2">#{order.id.substring(0, 8)}</span>
          </div>
          {order.estimated_delivery && (
            <div className="mb-2">
              <span className="font-semibold text-gray-800">Estimated Delivery:</span>
              <span className="text-gray-600 ml-2">{formatDate(order.estimated_delivery)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Partner Info */}
      {order.delivery_partner && (
        <div className="mb-8 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-2">Delivery Partner Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700">
                <span className="font-semibold">Name:</span> {order.delivery_partner.name}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Phone:</span> {order.delivery_partner.phone}
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <span className="font-semibold">Vehicle:</span> {order.delivery_partner.vehicle_type} (
                {order.delivery_partner.vehicle_number})
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">License:</span> {order.delivery_partner.license_number}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left border border-gray-200">Item</th>
            <th className="py-2 px-4 text-right border border-gray-200">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="py-2 px-4 border border-gray-200">{item.product.name}</td>
              <td className="py-2 px-4 text-right border border-gray-200">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-16">
        <div className="border-t border-gray-400 pt-2">
          <p className="text-center text-gray-600">Dispatched by (Signature)</p>
        </div>
        <div className="border-t border-gray-400 pt-2">
          <p className="text-center text-gray-600">Received by (Signature)</p>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-800">Notes:</h4>
          <p className="text-gray-600 text-sm">{order.notes}</p>
        </div>
      )}
    </div>
  )
}
