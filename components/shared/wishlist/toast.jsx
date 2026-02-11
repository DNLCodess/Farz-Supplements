"use client";

import { useEffect } from "react";
import { Heart, X } from "lucide-react";
import Link from "next/link";

export default function WishlistToast({ isVisible, onClose, action }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4 flex items-center gap-4 min-w-[320px]">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            action === "added" ? "bg-green-50" : "bg-gray-50"
          }`}
        >
          <Heart
            className={`w-6 h-6 ${
              action === "added"
                ? "text-green-900 fill-current"
                : "text-gray-600"
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="font-bold text-gray-900 mb-1">
            {action === "added" ? "Added to Wishlist" : "Removed from Wishlist"}
          </p>
          {action === "added" && (
            <Link
              href="/profile?tab=wishlist"
              className="text-sm text-green-900 hover:underline font-medium"
            >
              View Wishlist →
            </Link>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
