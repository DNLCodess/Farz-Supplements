// app/admin/orders/[orderId]/page.jsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", params.orderId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/orders/${params.orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      return response.json();
    },
    staleTime: 30000,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      const response = await fetch(
        `/api/admin/orders/${params.orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated successfully");
      setShowStatusModal(false);
      setNewStatus("");
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

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

  const statusOptions = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The order you're looking for doesn't exist
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 bg-white border border-gray-300 rounded-lg hover:border-green-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-charcoal">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-NG", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setNewStatus(order.status);
            setShowStatusModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
        >
          <Edit className="w-5 h-5" />
          Update Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-charcoal mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    {!imageErrors[item.id] ? (
                      <Image
                        src={
                          item.product_image ||
                          "/images/product-placeholder.png"
                        }
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">
                        🌿
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {item.product_name}
                    </h3>
                    {item.product_sku && (
                      <p className="text-sm text-gray-600">
                        SKU: {item.product_sku}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₦{parseFloat(item.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ₦{parseFloat(item.total).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₦{parseFloat(order.subtotal).toLocaleString()}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>₦{parseFloat(order.tax).toLocaleString()}</span>
                </div>
              )}
              {order.shipping_cost > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>
                    ₦{parseFloat(order.shipping_cost).toLocaleString()}
                  </span>
                </div>
              )}
              {order.transaction_fee > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Transaction Fee</span>
                  <span>
                    ₦{parseFloat(order.transaction_fee).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-charcoal pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>
                  ₦
                  {parseFloat(
                    order.total_amount || order.total,
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-700" />
              </div>
              <h2 className="text-xl font-bold text-charcoal">
                Shipping Address
              </h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">
                {order.shipping_first_name} {order.shipping_last_name}
              </p>
              <p>{order.shipping_address?.street}</p>
              <p>
                {order.shipping_city}, {order.shipping_state}{" "}
                {order.shipping_postal_code}
              </p>
              <p>{order.customer_phone}</p>
            </div>
          </div>

          {/* Order Notes */}
          {(order.notes || order.order_notes) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-700" />
                </div>
                <h2 className="text-xl font-bold text-charcoal">Notes</h2>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {order.notes || order.order_notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-charcoal mb-4">
              Order Status
            </h2>
            <div
              className={`flex items-center gap-3 p-4 ${status.bgColor} rounded-lg mb-4`}
            >
              <StatusIcon className={`w-6 h-6 ${status.textColor}`} />
              <span className={`text-lg font-bold ${status.textColor}`}>
                {status.label}
              </span>
            </div>
            {order.tracking_number && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  Tracking Number
                </p>
                <p className="text-gray-900 font-mono bg-gray-50 p-3 rounded-lg">
                  {order.tracking_number}
                </p>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-charcoal mb-4">
              Customer Info
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">
                    {order.customer_first_name} {order.customer_last_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">
                    {order.customer_email}
                  </p>
                </div>
              </div>
              {order.customer_phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {order.customer_phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-charcoal mb-4">
              Payment Info
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span
                  className={`font-semibold ${
                    order.payment_status === "paid"
                      ? "text-green-900"
                      : "text-amber-900"
                  }`}
                >
                  {order.payment_status === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {order.payment_method}
                  </span>
                </div>
              )}
              {order.payment_reference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-semibold text-gray-900 font-mono text-sm">
                    {order.payment_reference}
                  </span>
                </div>
              )}
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid At</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(order.paid_at).toLocaleDateString("en-NG")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-charcoal mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Order Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleString("en-NG")}
                  </p>
                </div>
              </div>
              {order.paid_at && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Payment Received
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.paid_at).toLocaleString("en-NG")}
                    </p>
                  </div>
                </div>
              )}
              {order.cancelled_at && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <XCircle className="w-4 h-4 text-red-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order Cancelled
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.cancelled_at).toLocaleString("en-NG")}
                    </p>
                    {order.cancellation_reason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reason: {order.cancellation_reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.updated_at).toLocaleString("en-NG")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-4">
              Update Order Status
            </h3>
            <p className="text-base text-gray-600 mb-6">
              Order #{order.order_number}
            </p>

            <div className="space-y-3 mb-6">
              {statusOptions.map((statusOption) => {
                const config = statusConfig[statusOption];
                const Icon = config.icon;

                return (
                  <button
                    key={statusOption}
                    onClick={() => setNewStatus(statusOption)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      newStatus === statusOption
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
                  setShowStatusModal(false);
                  setNewStatus("");
                }}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatusMutation.mutate(newStatus)}
                disabled={
                  updateStatusMutation.isPending || newStatus === order.status
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
