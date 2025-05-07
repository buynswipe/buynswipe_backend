import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { generateDocumentNumber } from "@/lib/utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch order with related data
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        retailer:profiles!retailer_id(*),
        wholesaler:profiles!wholesaler_id(*),
        order_items(*, product:products(*))
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is authorized to view this order
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (
      (profile.role === "retailer" && order.retailer_id !== session.user.id) ||
      (profile.role === "wholesaler" && order.wholesaler_id !== session.user.id)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Generate invoice number and date
    const invoiceNumber = generateDocumentNumber("INV", order.id, Date.now())
    const invoiceDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

    // Calculate subtotal
    const subtotal = order.order_items.reduce((total, item) => total + item.price * item.quantity, 0)

    // Calculate tax (assuming 18% GST)
    const taxRate = 0.18
    const taxAmount = subtotal * taxRate

    // Calculate total
    const total = subtotal + taxAmount

    // Create HTML directly without using ReactDOMServer
    const invoiceHtml = `
      <div class="bg-white p-8 max-w-4xl mx-auto" id="invoice-template">
        <!-- Header -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">INVOICE</h1>
            <p class="text-gray-600">#${invoiceNumber}</p>
          </div>
          <div class="text-right">
            <h2 class="text-xl font-semibold text-gray-800">${order.wholesaler.business_name}</h2>
            <p class="text-gray-600">${order.wholesaler.address}</p>
            <p class="text-gray-600">${order.wholesaler.city}, ${order.wholesaler.pincode}</p>
            <p class="text-gray-600">Phone: ${order.wholesaler.phone}</p>
            <p class="text-gray-600">GST: ${order.wholesaler.gst_number || "N/A"}</p>
          </div>
        </div>

        <!-- Invoice Info -->
        <div class="flex justify-between mb-8">
          <div>
            <h3 class="font-semibold text-gray-800 mb-2">Bill To:</h3>
            <p class="text-gray-700 font-semibold">${order.retailer.business_name}</p>
            <p class="text-gray-600">${order.retailer.address}</p>
            <p class="text-gray-600">${order.retailer.city}, ${order.retailer.pincode}</p>
            <p class="text-gray-600">Phone: ${order.retailer.phone}</p>
            <p class="text-gray-600">GST: ${order.retailer.gst_number || "N/A"}</p>
          </div>
          <div>
            <div class="mb-2">
              <span class="font-semibold text-gray-800">Invoice Date:</span>
              <span class="text-gray-600 ml-2">${invoiceDate}</span>
            </div>
            <div class="mb-2">
              <span class="font-semibold text-gray-800">Order Date:</span>
              <span class="text-gray-600 ml-2">${new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}</span>
            </div>
            <div class="mb-2">
              <span class="font-semibold text-gray-800">Order ID:</span>
              <span class="text-gray-600 ml-2">#${order.id.substring(0, 8)}</span>
            </div>
            <div class="mb-2">
              <span class="font-semibold text-gray-800">Payment Method:</span>
              <span class="text-gray-600 ml-2">
                ${order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}
              </span>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <table class="w-full mb-8 border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-2 px-4 text-left border border-gray-200">Item</th>
              <th class="py-2 px-4 text-right border border-gray-200">Quantity</th>
              <th class="py-2 px-4 text-right border border-gray-200">Unit Price</th>
              <th class="py-2 px-4 text-right border border-gray-200">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items
              .map(
                (item, index) => `
              <tr class="${index % 2 === 0 ? "bg-white" : "bg-gray-50"}">
                <td class="py-2 px-4 border border-gray-200">${item.product.name}</td>
                <td class="py-2 px-4 text-right border border-gray-200">${item.quantity}</td>
                <td class="py-2 px-4 text-right border border-gray-200">₹${item.price.toFixed(2)}</td>
                <td class="py-2 px-4 text-right border border-gray-200">
                  ₹${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="flex justify-end mb-8">
          <div class="w-64">
            <div class="flex justify-between py-2">
              <span class="font-semibold">Subtotal:</span>
              <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="font-semibold">GST (18%):</span>
              <span>₹${taxAmount.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-2 border-t border-gray-200 font-bold">
              <span>Total:</span>
              <span>₹${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Terms and Notes -->
        <div class="border-t border-gray-200 pt-4">
          <h3 class="font-semibold text-gray-800 mb-2">Terms & Notes</h3>
          <p class="text-gray-600 text-sm">
            Thank you for your business. Payment is expected within 30 days of invoice date.
            Please make payment to the bank account specified in your contract.
          </p>
          ${
            order.notes
              ? `
            <div class="mt-2">
              <h4 class="font-semibold text-gray-800">Order Notes:</h4>
              <p class="text-gray-600 text-sm">${order.notes}</p>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `

    // Create full HTML document with styles
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${invoiceNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.5;
            color: #333;
            margin: 0;
            padding: 0;
          }
          
          .bg-white { background-color: white; }
          .p-8 { padding: 2rem; }
          .max-w-4xl { max-width: 56rem; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .mb-8 { margin-bottom: 2rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .ml-2 { margin-left: 0.5rem; }
          .mt-2 { margin-top: 0.5rem; }
          .mt-8 { margin-top: 2rem; }
          .mt-16 { margin-top: 4rem; }
          .pt-2 { padding-top: 0.5rem; }
          .pt-4 { padding-top: 1rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .text-2xl { font-size: 1.5rem; }
          .text-xl { font-size: 1.25rem; }
          .text-sm { font-size: 0.875rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .text-gray-800 { color: #2d3748; }
          .text-gray-700 { color: #4a5568; }
          .text-gray-600 { color: #718096; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .text-center { text-align: center; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .justify-end { justify-content: flex-end; }
          .items-start { align-items: flex-start; }
          .w-full { width: 100%; }
          .w-64 { width: 16rem; }
          .border-collapse { border-collapse: collapse; }
          .border { border-width: 1px; border-style: solid; }
          .border-t { border-top-width: 1px; border-top-style: solid; }
          .border-gray-200 { border-color: #edf2f7; }
          .border-gray-400 { border-color: #cbd5e0; }
          .bg-gray-100 { background-color: #f7fafc; }
          .bg-gray-50 { background-color: #f9fafb; }
          .rounded-md { border-radius: 0.375rem; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-4 { gap: 1rem; }
          .gap-8 { gap: 2rem; }
          
          @media print {
            body { 
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        </style>
      </head>
      <body>
        ${invoiceHtml}
        <script>
          // Auto-print when loaded if not downloading
          if (!window.location.search.includes('download=true')) {
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          }
        </script>
      </body>
      </html>
    `

    // Return HTML response
    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error: any) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: error.message || "Failed to generate invoice" }, { status: 500 })
  }
}
