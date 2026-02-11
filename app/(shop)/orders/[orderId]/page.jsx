"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useOrder, useCancelOrder } from "@/hooks/use-orders";
import {
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  Clock,
  MapPin,
  Mail,
  AlertCircle,
  Home,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/utils/format";

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  // Check URL params for success/failure states
  const success = searchParams.get("success") === "true";
  const failed = searchParams.get("failed") === "true";
  const timeout = searchParams.get("timeout") === "true";

  // Get email from localStorage or URL
  useEffect(() => {
    const storedEmail = localStorage.getItem("order_email");
    if (storedEmail) {
      setEmail(storedEmail);
      setEmailSubmitted(true);
    }
  }, []);

  const { data, isLoading, error } = useOrder(
    orderId,
    emailSubmitted ? email : null,
  );
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const order = data?.order;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email && /\S+@\S+\.\S+/.test(email)) {
      localStorage.setItem("order_email", email);
      setEmailSubmitted(true);
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    cancelOrder(
      {
        orderId,
        reason: cancelReason,
        customerEmail: email,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success("Order cancelled successfully");
            setShowCancelModal(false);
          } else {
            if (result.requiresSupport) {
              toast.error(result.error + " Please contact support.");
            } else {
              toast.error(result.error);
            }
          }
        },
        onError: () => {
          toast.error("Failed to cancel order");
        },
      },
    );
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  // Email verification form
  if (!emailSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Verify Your Email
            </h1>
            <p className="text-base text-gray-600 text-center mb-6">
              Enter your email address to view order details
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-900 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
              >
                View Order
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-900 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We couldn't find an order with this ID and email combination.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("order_email");
              router.push("/");
            }}
            className="bg-green-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Success banner
  const showSuccessBanner = success && order.payment_status === "paid";
  const showFailureBanner =
    failed || (timeout && order.payment_status !== "paid");

  const canCancel =
    order.payment_status === "pending" &&
    (order.status === "pending" || order.status === "failed");

  // Status configuration
  const statusConfig = {
    pending: {
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-900",
      borderColor: "border-amber-200",
      label: "Pending Payment",
    },
    processing: {
      icon: Package,
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      borderColor: "border-blue-200",
      label: "Processing",
    },
    shipped: {
      icon: Truck,
      bgColor: "bg-purple-50",
      textColor: "text-purple-900",
      borderColor: "border-purple-200",
      label: "Shipped",
    },
    delivered: {
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      borderColor: "border-green-200",
      label: "Delivered",
    },
    cancelled: {
      icon: XCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-900",
      borderColor: "border-red-200",
      label: "Cancelled",
    },
    failed: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-900",
      borderColor: "border-red-200",
      label: "Failed",
    },
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  // Extract shipping address safely (handle JSONB object)
  const shippingAddress =
    typeof order.shipping_address === "object" && order.shipping_address
      ? order.shipping_address
      : {
          address: order.shipping_address || "",
          city: order.shipping_city || "",
          state: order.shipping_state || "",
          postal_code: order.shipping_postal_code || "",
        };

  // Get total amount (handle both total and total_amount)
  const totalAmount = order.total_amount || order.total || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {/* Success Banner */}
        {showSuccessBanner && (
          <div className="max-w-4xl mx-auto mb-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-base text-green-800">
                  Thank you for your order. We've received your payment and your
                  order is being processed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Failure Banner */}
        {showFailureBanner && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-red-900 mb-2">
                  {timeout ? "Payment Verification Timeout" : "Payment Failed"}
                </h2>
                <p className="text-base text-red-800 mb-4">
                  {timeout
                    ? "We're still waiting to confirm your payment. Please contact support if you've completed the payment."
                    : "Your payment was not successful. You can try again or contact support for assistance."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push("/checkout")}
                    className="bg-red-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 transition-colors"
                  >
                    Try Again
                  </button>
                  <a
                    href="mailto:support@farzsupplements.com"
                    className="bg-white text-red-900 px-6 py-3 rounded-xl font-bold border border-red-300 hover:bg-red-50 transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Order Details
            </h1>
            <p className="text-lg text-gray-600">Order #{order.order_number}</p>
          </div>

          {/* Order Status */}
          <div
            className={`${currentStatus.bgColor} border ${currentStatus.borderColor} rounded-xl p-6 mb-6`}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div
                className={`w-16 h-16 ${currentStatus.bgColor} rounded-full flex items-center justify-center border ${currentStatus.borderColor}`}
              >
                <StatusIcon className={`w-8 h-8 ${currentStatus.textColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`text-2xl font-bold ${currentStatus.textColor}`}>
                  {currentStatus.label}
                </h2>
                <p
                  className={`text-base ${currentStatus.textColor} opacity-80`}
                >
                  {formatDate(order.created_at)}
                </p>
              </div>
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-3 bg-white border border-red-300 text-red-900 rounded-xl font-bold hover:bg-red-50 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="relative w-24 h-24 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                    {!imageErrors[item.product_id] ? (
                      <Image
                        src={
                          item.product_image ||
                          "/images/product-placeholder.png"
                        }
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        onError={() => handleImageError(item.product_id)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        🌿
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {item.product_name}
                    </h3>
                    <p className="text-base text-gray-600 mb-2">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-xl font-bold text-green-900">
                      ₦{(item.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between text-lg">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-bold text-gray-900">
                  ₦{(order.subtotal || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-700">Shipping</span>
                <span className="font-bold text-gray-900">
                  {(order.shipping_cost || 0) === 0 ? (
                    <span className="text-green-700">Free</span>
                  ) : (
                    `₦${(order.shipping_cost || 0).toLocaleString()}`
                  )}
                </span>
              </div>
              {(order.transaction_fee || 0) > 0 && (
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Transaction Fee</span>
                  <span className="font-bold text-gray-900">
                    ₦{(order.transaction_fee || 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-3xl font-bold text-green-900">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-green-900" />
                Contact Information
              </h2>
              <div className="space-y-3">
                <p className="text-base text-gray-700">
                  <span className="font-semibold">Name:</span>{" "}
                  {order.customer_first_name || ""}{" "}
                  {order.customer_last_name || ""}
                </p>
                <p className="text-base text-gray-700">
                  <span className="font-semibold">Email:</span>{" "}
                  {order.customer_email}
                </p>
                <p className="text-base text-gray-700">
                  <span className="font-semibold">Phone:</span>{" "}
                  {order.customer_phone}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-green-900" />
                Shipping Address
              </h2>
              <div className="text-base text-gray-700 leading-relaxed">
                <p className="font-semibold mb-1">
                  {order.shipping_first_name || ""}{" "}
                  {order.shipping_last_name || ""}
                </p>
                <p>{shippingAddress.address}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state}
                  {shippingAddress.postal_code &&
                    ` ${shippingAddress.postal_code}`}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-900 px-6 py-4 rounded-xl text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-all"
            >
              <Home className="w-6 h-6" />
              Back to Home
            </Link>
            <Link
              href="/products"
              className="flex-1 flex items-center justify-center gap-3 bg-green-900 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Cancel Order</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-base text-gray-600 mb-6">
              Please provide a reason for cancelling this order:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none mb-6"
              rows="4"
              placeholder="e.g., Changed my mind, ordered by mistake..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling || !cancelReason.trim()}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
