import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

const WholesalerDashboard = async () => {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "wholesaler") {
    redirect("/")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Wholesaler Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="flex flex-col space-y-2">
            <Link
              href="/manage-products"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Manage Products
            </Link>
            <Link href="/orders" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              View Orders
            </Link>
            <Link
              href="/inventory"
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Manage Inventory
            </Link>
          </div>
        </div>

        {/* Sales Overview */}
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Sales Overview</h2>
          <p>Here you can see a summary of your recent sales performance.</p>
          {/* Add sales data visualization here */}
        </div>

        {/* Product Performance */}
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Product Performance</h2>
          <p>Analyze the performance of your products to optimize your offerings.</p>
          {/* Add product performance data visualization here */}
        </div>
      </div>
    </div>
  )
}

export default WholesalerDashboard
