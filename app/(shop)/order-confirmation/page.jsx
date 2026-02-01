"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  Phone,
  ArrowRight,
  Download,
  Home,
} from "lucide-react";

export default function OrderConfirmationPage() {
  // In a real app, this would come from the order data
  const orderNumber =
    "FS-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const orderDate = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
              <CheckCircle2 className="w-14 h-14 text-green-700" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your order has been received and is
              being processed.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6">
            <div className="grid sm:grid-cols-2 gap-6 mb-8 pb-8 border-b-2 border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-2">Order Number</p>
                <p className="text-2xl font-bold text-green-900">
                  {orderNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Order Date</p>
                <p className="text-xl font-bold text-gray-900">{orderDate}</p>
              </div>
            </div>

            {/* What's Next Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What happens next?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-7 h-7 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      1. Confirmation Email
                    </h3>
                    <p className="text-base text-gray-600">
                      We&apos;ve sent a confirmation email with your order
                      details. Please check your inbox.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-14 h-14 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-7 h-7 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      2. Order Processing
                    </h3>
                    <p className="text-base text-gray-600">
                      Your order is being carefully prepared and packaged by our
                      team.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-14 h-14 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-7 h-7 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      3. Delivery
                    </h3>
                    <p className="text-base text-gray-600">
                      Your order will be delivered within 2 working days in
                      Lagos, or 3-5 days for other locations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="bg-green-50 rounded-xl border-2 border-green-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Need Help?
            </h2>
            <p className="text-base text-green-800 mb-6">
              If you have any questions about your order, our customer service
              team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+2348069662020"
                className="flex items-center justify-center gap-3 bg-green-900 text-white px-6 py-4 rounded-xl text-base font-bold hover:bg-green-800 transition-colors"
              >
                <Phone className="w-5 h-5" />
                +234 806 966 2020
              </a>
              <a
                href="mailto:support@farzsupplements.com"
                className="flex items-center justify-center gap-3 bg-white border-2 border-green-700 text-green-900 px-6 py-4 rounded-xl text-base font-bold hover:bg-green-50 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-900 px-6 py-4 rounded-xl text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
            >
              <Home className="w-6 h-6" />
              Back to Home
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-3 bg-green-900 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
