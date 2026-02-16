"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrderStatus } from "@/hooks/useOrders";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

function PaymentVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  // Extract order ID from URL or localStorage
  const orderId =
    searchParams.get("order_id") ||
    (typeof window !== "undefined" && localStorage.getItem("pending_order_id"));

  // Poll order status every 2 seconds
  const { data, isLoading, error } = useOrderStatus(orderId, !!orderId);

  useEffect(() => {
    if (!reference || !orderId) {
      router.push("/cart");
      return;
    }

    // Store order ID in localStorage for recovery
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_order_id", orderId);
    }
  }, [reference, orderId, router]);

  useEffect(() => {
    if (data?.order) {
      const paymentStatus = data.order.payment_status;

      if (paymentStatus === "paid") {
        // Payment successful - redirect to success page
        if (typeof window !== "undefined") {
          localStorage.removeItem("pending_order_id");
        }
        router.push(`/orders/${orderId}?success=true`);
      } else if (paymentStatus === "failed") {
        // Payment failed - redirect to failure page
        if (typeof window !== "undefined") {
          localStorage.removeItem("pending_order_id");
        }
        router.push(`/orders/${orderId}?failed=true`);
      }
      // Otherwise keep polling (status is still "pending" or "processing")
    }
  }, [data, orderId, router]);

  // Set timeout after 5 minutes
  useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (data?.order?.payment_status === "pending") {
          router.push(`/orders/${orderId}?timeout=true`);
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearTimeout(timeout);
  }, [data, orderId, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verification Error
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We couldn't verify your payment. Please contact support.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-green-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const status = data?.order?.payment_status || "pending";
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "amber",
      title: "Verifying Payment",
      message: "Please wait while we confirm your payment with Paystack...",
    },
    processing: {
      icon: Loader2,
      color: "blue",
      title: "Processing Payment",
      message:
        "Your payment is being processed. This should only take a moment...",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon */}
        <div
          className={`w-32 h-32 bg-${config.color}-100 rounded-full flex items-center justify-center mx-auto mb-8 relative`}
        >
          <Icon
            className={`w-16 h-16 text-${config.color}-600 ${Icon === Loader2 ? "animate-spin" : ""}`}
          />

          {/* Pulse animation */}
          <div
            className={`absolute inset-0 bg-${config.color}-100 rounded-full animate-ping opacity-20`}
          ></div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {config.title}
        </h1>

        <p className="text-lg text-gray-600 mb-8">{config.message}</p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-3 h-3 bg-green-900 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-green-900 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-green-900 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 text-left">
          <p className="text-sm text-blue-900 font-semibold mb-2">
            What's happening?
          </p>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <span>Your order has been created</span>
            </li>
            <li className="flex items-start gap-2">
              <Loader2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 animate-spin" />
              <span>Waiting for payment confirmation from Paystack</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <span>This usually takes less than 30 seconds</span>
            </li>
          </ul>
        </div>

        {/* Warning */}
        <p className="text-sm text-gray-500 mt-6">
          Please don't close this page or press the back button
        </p>
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-green-900 animate-spin" />
        </div>
      }
    >
      <PaymentVerifyContent />
    </Suspense>
  );
}
