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

  // Fetch all orders (admin view)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", currentPage, statusFilter, searchQuery],
    queryFn: async () => {
      // This would call your admin orders endpoint
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
    staleTime: 30000, // 30 seconds
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    staleTime: 60000, // 1 minute
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

  // Status configuration
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
    failed: {
      icon: XCircle,
      label: "Failed",
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
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage and track all customer orders
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7 text-blue-700" />
                </div>
                <div>
                  <p className="text-base text-gray-600 font-semibold">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total_orders || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-green-700" />
                </div>
                <div>
                  <p className="text-base text-gray-600 font-semibold">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₦{(stats.total_revenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-amber-700" />
                </div>
                <div>
                  <p className="text-base text-gray-600 font-semibold">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.pending_orders || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-purple-700" />
                </div>
                <div>
                  <p className="text-base text-gray-600 font-semibold">
                    This Month
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₦{(stats.month_revenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
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
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:border-green-900 transition-colors"
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
                  className={`px-5 py-3 rounded-xl font-bold transition-colors ${
                    statusFilter === option.value
                      ? "bg-green-900 text-white"
                      : "bg-white border-2 border-gray-300 text-gray-900 hover:border-green-900"
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
            <Loader2 className="w-12 h-12 text-green-900 animate-spin" />
          </div>
        )}

        {/* Orders Table */}
        {!isLoading && data?.orders && (
          <>
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-base font-bold text-gray-900">
                        Order
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-gray-900">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-gray-900">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-gray-900">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-gray-900">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-gray-900">
                        Payment
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-gray-900">
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
                          className="border-b-2 border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-bold text-green-900 hover:text-green-700 transition-colors"
                            >
                              #{order.order_number}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {order.customer_first_name}{" "}
                                {order.customer_last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.customer_email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-NG",
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
                                <span className="text-sm font-semibold text-gray-600">
                                  +{order.order_items.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900">
                              ₦{order.total_amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {order.payment_status === "paid" ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-900 rounded-lg font-semibold text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-lg font-semibold text-sm">
                                <Clock className="w-4 h-4" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 ${status.bgColor} ${status.textColor} rounded-lg font-semibold text-sm`}
                            >
                              <StatusIcon className="w-4 h-4" />
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
                                <Eye className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setNewStatus(order.status);
                                }}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Update Status"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-2xl border-2 border-gray-200 p-6">
                <p className="text-base text-gray-600">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl font-bold hover:border-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!data.pagination.hasMore}
                    className="flex items-center gap-2 px-5 py-3 bg-green-900 text-white rounded-xl font-bold hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
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
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 font-bold transition-colors ${
                      newStatus === status
                        ? "border-green-900 bg-green-50"
                        : "border-gray-300 hover:border-green-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{config.label}</span>
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
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={
                  updateStatusMutation.isPending ||
                  newStatus === selectedOrder.status
                }
                className="flex-1 px-6 py-3 bg-green-900 text-white rounded-xl font-bold hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
