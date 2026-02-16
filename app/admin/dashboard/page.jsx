"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";

async function getDashboardStats() {
  const response = await fetch("/api/admin/dashboard/stats");
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Link href="/admin/payments" className="block group">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-900 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              {stats?.revenue_growth && stats.revenue_growth > 0 && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  +{stats.revenue_growth}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-charcoal mb-1">
              ₦{(stats?.total_revenue || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </Link>

        {/* Total Orders */}
        <Link href="/admin/orders" className="block group">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-900 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <ShoppingCart className="w-5 h-5 text-blue-700" />
              </div>
              {stats?.orders_growth && stats.orders_growth > 0 && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  +{stats.orders_growth}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-charcoal mb-1">
              {stats?.total_orders || 0}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </Link>

        {/* Total Products */}
        <Link href="/admin/products" className="block group">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-900 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center group-hover:bg-warning-200 transition-colors">
                <Package className="w-5 h-5 text-warning-700" />
              </div>
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                Active
              </span>
            </div>
            <div className="text-2xl font-bold text-charcoal mb-1">
              {stats?.total_products || 0}
            </div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
        </Link>

        {/* Total Customers */}
        <Link href="/admin/customers" className="block group">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-900 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users className="w-5 h-5 text-purple-700" />
              </div>
              {stats?.customers_growth && stats.customers_growth > 0 && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  +{stats.customers_growth}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-charcoal mb-1">
              {stats?.total_customers || 0}
            </div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
        </Link>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-green-700" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              This Month
            </span>
          </div>
          <p className="text-xl font-bold text-charcoal">
            ₦{(stats?.month_revenue || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Pending Orders
            </span>
          </div>
          <p className="text-xl font-bold text-charcoal">
            {stats?.pending_orders || 0}
          </p>
        </div>

        <Link href="/admin/products?filter=low-stock" className="block group">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-600 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <AlertCircle className="w-4 h-4 text-red-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Low Stock Items
              </span>
            </div>
            <p className="text-xl font-bold text-charcoal">
              {stats?.low_stock_products || 0}
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-charcoal mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <div className="font-medium text-charcoal">Add Product</div>
                <div className="text-xs text-gray-600">
                  Create new product listing
                </div>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <div className="font-medium text-charcoal">View Orders</div>
                <div className="text-xs text-gray-600">Manage all orders</div>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <div className="font-medium text-charcoal">Categories</div>
                <div className="text-xs text-gray-600">Organize products</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-charcoal mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {stats?.recent_orders?.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4 h-4 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-charcoal text-sm">
                    #{order.order_number}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {order.customer_email}
                  </div>
                </div>
                <div className="text-sm font-semibold text-charcoal">
                  ₦{order.total.toLocaleString()}
                </div>
              </Link>
            )) || (
              <p className="text-sm text-gray-600 text-center py-4">
                No recent orders
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats?.low_stock_products > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-warning-600 rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-charcoal mb-1">
                Low Stock Alert
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                {stats.low_stock_products}{" "}
                {stats.low_stock_products === 1 ? "product is" : "products are"}{" "}
                running low on stock. Review and restock soon.
              </p>
              <Link
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
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
