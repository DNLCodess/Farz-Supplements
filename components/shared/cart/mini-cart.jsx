"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { ShoppingCart, X, Trash2, ArrowRight, Package } from "lucide-react";

export default function MiniCart({ isOpen, onClose }) {
  const [imageErrors, setImageErrors] = useState({});
  const { items, removeItem, getTotalPrice, getTotalItems } = useCartStore();

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const total = getTotalPrice();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-green-900" />
            <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items or Empty State */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h3>
            <p className="text-base text-gray-600 mb-6">
              Add some natural supplements to get started!
            </p>
            <Link
              href="/products"
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-green-900 text-white px-6 py-3 rounded-xl text-base font-bold hover:bg-green-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Item Count */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-base text-gray-700">
                <span className="font-bold text-gray-900">
                  {getTotalItems()}
                </span>{" "}
                {getTotalItems() === 1 ? "item" : "items"} in your cart
              </p>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-500 transition-colors"
                >
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={onClose}
                    className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden"
                  >
                    {!imageErrors[item.id] ? (
                      <Image
                        src={
                          item.images?.[0] || "/images/product-placeholder.png"
                        }
                        alt={item.name}
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
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={onClose}
                      className="font-bold text-gray-900 hover:text-green-900 transition-colors line-clamp-2 text-base mb-1 block"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-green-900">
                          ₦{item.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Total & Actions */}
            <div className="p-6 border-t-2 border-gray-200 bg-white">
              {/* Subtotal */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-200">
                <span className="text-xl font-bold text-gray-900">
                  Subtotal
                </span>
                <span className="text-2xl font-bold text-green-900">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              {/* Shipping Note */}
              <p className="text-sm text-gray-600 text-center mb-4">
                Shipping and taxes calculated at checkout
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-3 bg-green-900 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-6 h-6" />
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-900 px-6 py-4 rounded-xl text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
