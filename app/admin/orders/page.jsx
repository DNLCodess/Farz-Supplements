"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  Edit,
  Loader2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  // Fetch all orders
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", currentPage, statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    staleTime: 30000,
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    staleTime: 60000,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Order status updated successfully");
      setSelectedOrder(null);
      setNewStatus("");
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedOrder || !newStatus) return;
    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status: newStatus,
    });
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      bgColor: "bg-amber-100",
      textColor: "text-amber-900",
    },
    processing: {
      icon: Package,
      label: "Processing",
      bgColor: "bg-blue-100",
      textColor: "text-blue-900",
    },
    shipped: {
      icon: Truck,
      label: "Shipped",
      bgColor: "bg-purple-100",
      textColor: "text-purple-900",
    },
    delivered: {
      icon: CheckCircle2,
      label: "Delivered",
      bgColor: "bg-green-100",
      textColor: "text-green-900",
    },
    cancelled: {
      icon: XCircle,
      label: "Cancelled",
      bgColor: "bg-red-100",
      textColor: "text-red-900",
    },
  };

  const filterOptions = [
    { value: null, label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
  ];

  const statusOptions = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Order Management</h1>
        <p className="text-gray-600 mt-1">
          Manage and track all customer orders
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Total Orders
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              {stats.total_orders || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              ₦{(stats.total_revenue || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Pending Orders
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              {stats.pending_orders || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                This Month
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              ₦{(stats.month_revenue || 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number, email, or phone..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900 transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.value || "all"}
                onClick={() => {
                  setStatusFilter(option.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === option.value
                    ? "bg-green-900 text-white"
                    : "bg-white border border-gray-300 text-gray-900 hover:border-green-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && data?.orders && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order) => {
                    const status =
                      statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-semibold text-green-900 hover:text-green-700 transition-colors"
                          >
                            #{order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.customer_first_name}{" "}
                              {order.customer_last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.customer_email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-NG",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {order.order_items?.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="relative w-10 h-10 bg-gray-50 rounded-lg overflow-hidden"
                              >
                                {!imageErrors[item.id] ? (
                                  <Image
                                    src={
                                      item.product_image ||
                                      "/images/product-placeholder.png"
                                    }
                                    alt={item.product_name}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                    onError={() => handleImageError(item.id)}
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-xl">
                                    🌿
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.order_items?.length > 3 && (
                              <span className="text-sm font-medium text-gray-600">
                                +{order.order_items.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-charcoal">
                            ₦{parseFloat(order.total_amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {order.payment_status === "paid" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-900 rounded-lg text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-medium">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 ${status.bgColor} ${status.textColor} rounded-lg text-xs font-medium`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.status);
                              }}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              title="Update Status"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {data.orders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No orders found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg font-medium hover:border-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!data.pagination.hasMore}
                  className="px-4 py-2 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-4">
              Update Order Status
            </h3>
            <p className="text-base text-gray-600 mb-6">
              Order #{selectedOrder.order_number}
            </p>

            <div className="space-y-3 mb-6">
              {statusOptions.map((status) => {
                const config = statusConfig[status];
                const Icon = config.icon;

                return (
                  <button
                    key={status}
                    onClick={() => setNewStatus(status)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      newStatus === status
                        ? "border-green-900 bg-green-50"
                        : "border-gray-300 hover:border-green-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setNewStatus("");
                }}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={
                  updateStatusMutation.isPending ||
                  newStatus === selectedOrder.status
                }
                className="flex-1 px-6 py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
