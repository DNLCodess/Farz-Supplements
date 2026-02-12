"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  AlertCircle,
  Package,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [isClient, setIsClient] = useState(false);

  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } =
    useCartStore();

  // Prevent hydration mismatch by only rendering cart contents on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50000 ? 0 : 2500;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setPromoApplied(true);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  // Show loading state during SSR/hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Start adding some natural supplements to boost your wellness
              journey!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-green-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-lg text-gray-600">
            {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-green-500 transition-colors duration-200"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    {!imageErrors[item.id] ? (
                      <Image
                        src={
                          item.images?.[0] || "/images/product-placeholder.png"
                        }
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        🌿
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-xl font-bold text-gray-900 hover:text-green-900 transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.category && (
                          <p className="text-base text-gray-600 mt-1">
                            {item.category.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Price and Quantity Controls */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="text-2xl font-bold text-green-900">
                        ₦{item.price.toLocaleString()}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border-2 border-gray-200">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:border-green-900 hover:bg-green-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-5 h-5 text-gray-700" />
                        </button>
                        <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.stock_quantity &&
                            item.quantity >= item.stock_quantity
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:border-green-900 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Item Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.stock_quantity &&
                      item.quantity >= item.stock_quantity && (
                        <div className="mt-3 flex items-center gap-2 text-orange-700 bg-orange-50 px-4 py-2 rounded-lg">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <p className="text-sm font-medium">
                            Maximum available quantity reached
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping Button - Mobile */}
            <Link
              href="/products"
              className="lg:hidden flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-900 px-6 py-4 rounded-xl text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 lg:sticky lg:top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Shipping Info */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-start gap-3">
                  <Truck className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-green-900 mb-1">
                      {subtotal > 50000
                        ? "Free Shipping!"
                        : "Almost there for free shipping"}
                    </p>
                    <p className="text-sm text-green-800">
                      {subtotal > 50000
                        ? "Your order qualifies for free delivery"
                        : `Add ₦${(50000 - subtotal).toLocaleString()} more for free shipping`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-base font-bold text-gray-900 mb-3">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    disabled={promoApplied}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                    className="px-6 py-3 bg-green-900 text-white font-bold rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-base"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <div className="mt-2 flex items-center gap-2 text-green-700">
                    <Tag className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Code applied successfully!
                    </span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-bold text-gray-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-bold text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-700">Free</span>
                    ) : (
                      `₦${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Discount</span>
                    <span className="font-bold text-green-700">
                      -₦{discount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-green-900">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-3 bg-green-900 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-6 h-6" />
              </Link>

              {/* Continue Shopping - Desktop */}
              <Link
                href="/products"
                className="hidden lg:flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-900 px-6 py-4 rounded-xl text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Package className="w-5 h-5 text-green-700" />
                  <span className="text-sm">Secure packaging</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Truck className="w-5 h-5 text-green-700" />
                  <span className="text-sm">Fast delivery nationwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
