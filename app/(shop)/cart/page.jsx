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
  X,
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

  // Helper function to safely parse numbers
  const safeNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? defaultValue : num;
  };

  // Calculate totals with proper validation
  const subtotal = safeNumber(getTotalPrice(), 0);
  const shipping = subtotal > 50000 ? 0 : 2500;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setPromoApplied(true);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const handleQuantityUpdate = (itemId, newQuantity, stockQuantity) => {
    const validQuantity = Math.max(
      1,
      Math.min(safeNumber(newQuantity, 1), safeNumber(stockQuantity, 999)),
    );
    updateQuantity(itemId, validQuantity);
  };

  // Show loading state during SSR/hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Your cart is empty
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4">
              Start adding some natural supplements to boost your wellness
              journey!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 sm:gap-3 bg-green-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-green-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const product = item.product || item;
              const itemId = item.id || item.product_id;
              const itemPrice = safeNumber(item.price || product.price, 0);
              const itemQuantity = Math.max(1, safeNumber(item.quantity, 1));
              const itemStockQuantity = safeNumber(
                item.stock_quantity || product.stock_quantity,
                null,
              );
              const itemTotal = itemPrice * itemQuantity;
              const itemKey = itemId || `item-${index}`;
              const itemName = item.name || product.name || "Unnamed Product";
              const itemSlug = item.slug || product.slug || itemId;
              const itemImages = item.images || product.images || [];
              const itemCategory = item.category || product.category;

              return (
                <div
                  key={itemKey}
                  className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 hover:border-green-500 transition-colors"
                >
                  <div className="flex gap-3 sm:gap-4 lg:gap-6">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                      {!imageErrors[itemKey] ? (
                        <Image
                          src={
                            itemImages[0] || "/images/product-placeholder.png"
                          }
                          alt={itemName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 128px"
                          onError={() => handleImageError(itemKey)}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl">
                          🌿
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${itemSlug}`}
                            className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 hover:text-green-900 transition-colors line-clamp-2"
                          >
                            {itemName}
                          </Link>
                          {itemCategory?.name && (
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                              {itemCategory.name}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(itemId)}
                          className="p-1.5 sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </div>

                      {/* Price - Mobile */}
                      <div className="text-xl sm:text-2xl font-bold text-green-900 mb-3 sm:hidden">
                        ₦{itemPrice.toLocaleString()}
                      </div>

                      {/* Price and Quantity Controls - Desktop/Tablet */}
                      <div className="hidden sm:flex items-center justify-between gap-4 flex-wrap">
                        <div className="text-2xl font-bold text-green-900">
                          ₦{itemPrice.toLocaleString()}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 lg:gap-3 bg-gray-50 rounded-lg p-2 border-2 border-gray-200">
                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                itemId,
                                itemQuantity - 1,
                                itemStockQuantity,
                              )
                            }
                            disabled={itemQuantity <= 1}
                            className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:border-green-900 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
                          </button>
                          <span className="text-lg lg:text-xl font-bold text-gray-900 min-w-[2.5rem] lg:min-w-[3rem] text-center">
                            {itemQuantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                itemId,
                                itemQuantity + 1,
                                itemStockQuantity,
                              )
                            }
                            disabled={
                              itemStockQuantity !== null &&
                              itemQuantity >= itemStockQuantity
                            }
                            className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:border-green-900 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            Item Total
                          </p>
                          <p className="text-xl lg:text-2xl font-bold text-gray-900">
                            ₦{itemTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls - Mobile */}
                      <div className="sm:hidden flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border-2 border-gray-200">
                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                itemId,
                                itemQuantity - 1,
                                itemStockQuantity,
                              )
                            }
                            disabled={itemQuantity <= 1}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:border-green-900 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 text-gray-700" />
                          </button>
                          <span className="text-lg font-bold text-gray-900 min-w-[2.5rem] text-center">
                            {itemQuantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                itemId,
                                itemQuantity + 1,
                                itemStockQuantity,
                              )
                            }
                            disabled={
                              itemStockQuantity !== null &&
                              itemQuantity >= itemStockQuantity
                            }
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:border-green-900 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-600 mb-1">Total</p>
                          <p className="text-xl font-bold text-gray-900">
                            ₦{itemTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {itemStockQuantity !== null &&
                        itemQuantity >= itemStockQuantity && (
                          <div className="mt-3 flex items-center gap-2 text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p className="text-xs sm:text-sm font-medium">
                              Maximum available quantity reached
                            </p>
                          </div>
                        )}

                      {/* Invalid Price Warning */}
                      {itemPrice === 0 && (
                        <div className="mt-3 flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-lg">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <p className="text-xs sm:text-sm font-medium">
                            Price unavailable. Please refresh or contact
                            support.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue Shopping Button - Mobile */}
            <Link
              href="/products"
              className="lg:hidden flex items-center justify-center gap-2 sm:gap-3 bg-white border-2 border-gray-300 text-gray-900 px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">
                Order Summary
              </h2>

              {/* Shipping Info */}
              <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-green-900 mb-1 text-sm sm:text-base">
                      {subtotal > 50000
                        ? "Free Shipping!"
                        : "Almost there for free shipping"}
                    </p>
                    <p className="text-xs sm:text-sm text-green-800">
                      {subtotal > 50000
                        ? "Your order qualifies for free delivery"
                        : `Add ₦${Math.max(0, 50000 - subtotal).toLocaleString()} more for free shipping`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-5 sm:mb-6">
                <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    disabled={promoApplied}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:border-green-900 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode.trim()}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-green-900 text-white font-bold rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <div className="mt-2 flex items-center gap-2 text-green-700">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium">
                      Code applied successfully!
                    </span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b-2 border-gray-200">
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-bold text-gray-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
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
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="text-gray-700">Discount (10%)</span>
                    <span className="font-bold text-green-700">
                      -₦{discount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  Total
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-green-900">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-green-900 text-white px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-green-800 transition-colors mb-3 sm:mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
              <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t-2 border-gray-200 space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-gray-700">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
                  <span className="text-xs sm:text-sm">Secure packaging</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-gray-700">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
                  <span className="text-xs sm:text-sm">
                    Fast delivery nationwide
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
