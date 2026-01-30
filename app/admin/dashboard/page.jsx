import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-900" />
            </div>
            <span className="text-xs font-medium text-success-600 bg-success-50 px-2 py-1 rounded">
              +12.5%
            </span>
          </div>
          <div className="text-2xl font-bold text-charcoal mb-1">₦450,000</div>
          <div className="text-sm text-gray-600">Total Sales (This Month)</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-success-600 bg-success-50 px-2 py-1 rounded">
              +8.2%
            </span>
          </div>
          <div className="text-2xl font-bold text-charcoal mb-1">127</div>
          <div className="text-sm text-gray-600">Total Orders (This Month)</div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-warning-700" />
            </div>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
              Active
            </span>
          </div>
          <div className="text-2xl font-bold text-charcoal mb-1">324</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-success-600 bg-success-50 px-2 py-1 rounded">
              +15.3%
            </span>
          </div>
          <div className="text-2xl font-bold text-charcoal mb-1">1,248</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
      </div>

      {/* Recent Orders & Quick Actions Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-charcoal">
              Recent Orders
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Order items would go here */}
              <p className="text-gray-600 text-center py-8">
                No recent orders to display
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-charcoal">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <a
                href="/admin/products/new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-900" />
                </div>
                <div>
                  <div className="font-medium text-charcoal">Add Product</div>
                  <div className="text-xs text-gray-600">
                    Create new product
                  </div>
                </div>
              </a>

              <a
                href="/admin/orders"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-charcoal">View Orders</div>
                  <div className="text-xs text-gray-600">Manage all orders</div>
                </div>
              </a>

              <a
                href="/admin/customers"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-charcoal">Customers</div>
                  <div className="text-xs text-gray-600">
                    View customer list
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-warning-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-charcoal mb-1">
              Low Stock Alert
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              5 products are running low on stock. Review and restock soon.
            </p>
            <a
              href="/admin/products?filter=low-stock"
              className="inline-flex items-center gap-2 text-sm font-medium text-warning-700 hover:text-warning-800"
            >
              View Products
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
