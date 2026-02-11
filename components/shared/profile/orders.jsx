"use client";

import { useRouter } from "next/navigation";
import { Package, Loader2 } from "lucide-react";
import { useUserOrders } from "@/hooks/use-auth";
import { formatDate } from "@/utils/format";

export default function OrdersTab() {
  const router = useRouter();
  const { data: ordersData, isLoading } = useUserOrders();
  const orders = ordersData?.orders || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-900 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No orders yet</p>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 bg-green-900 text-white rounded-lg font-bold hover:bg-green-800 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} router={router} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, router }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-900";
      case "cancelled":
        return "bg-red-50 text-red-900";
      default:
        return "bg-blue-50 text-blue-900";
    }
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:border-green-900 transition-colors cursor-pointer"
      onClick={() => router.push(`/orders/${order.id}`)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-gray-900">Order #{order.order_number}</p>
          <p className="text-sm text-gray-600">
            {formatDate(order.created_at)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            order.status,
          )}`}
        >
          {order.status}
        </span>
      </div>
      <div className="flex justify-between items-end">
        <p className="text-sm text-gray-600">
          {order.order_items?.length} item(s)
        </p>
        <p className="text-lg font-bold text-green-900">
          ₦{(order.total_amount || order.total || 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
