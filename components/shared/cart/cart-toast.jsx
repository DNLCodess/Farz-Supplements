"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CartToast({ isVisible, onClose, productName }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div
      className={`fixed top-24 right-4 z-60 max-w-md transition-all duration-300 ${
        show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border-2 border-green-500 p-5">
        <div className="flex items-start gap-4">
          {/* Success Icon */}
          <div className="w-12 h-12 shrink-0 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-700" />
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base mb-1">
              Added to cart!
            </p>
            <p className="text-sm text-gray-600 line-clamp-1 mb-3">
              {productName}
            </p>
            <div className="flex gap-3">
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 bg-green-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-800 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                View Cart
              </Link>
              <button
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 300);
            }}
            className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
