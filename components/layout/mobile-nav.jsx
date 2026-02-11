"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  X,
  Home,
  ShoppingBag,
  Info,
  Phone,
  User,
  Heart,
  Package,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWishlistCount } from "@/hooks/use-wishlist";

const categories = [
  { name: "Herbal Liquids", slug: "herbal-liquids", icon: "🧪" },
  { name: "Teas & Coffee", slug: "teas-coffee", icon: "☕" },
  { name: "Capsules", slug: "capsules", icon: "💊" },
  { name: "Powders", slug: "powders", icon: "🥤" },
  { name: "Gummies", slug: "gummies", icon: "🍬" },
  { name: "Drinks", slug: "drinks", icon: "🧃" },
  { name: "Oral Care", slug: "oral-care", icon: "🦷" },
  { name: "Hair Care", slug: "hair-care", icon: "💇" },
  { name: "Face Care", slug: "face-care", icon: "✨" },
  { name: "Seeds", slug: "seeds", icon: "🌱" },
];

export default function MobileNav({ isOpen, onClose }) {
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const wishlistCount = useWishlistCount();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-charcoal/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <div className="font-bold text-green-900 text-base">
                Farz Supplements
              </div>
              <div className="text-xs text-gray-600">Menu</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-600 hover:text-charcoal"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="py-2">
          {/* Home */}
          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors ${
              pathname === "/" ? "bg-green-50 text-green-900" : "text-gray-700"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </Link>

          {/* Products with Expandable Categories */}
          <div>
            <button
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors ${
                pathname.startsWith("/products")
                  ? "bg-green-50 text-green-900"
                  : "text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">Products</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${categoriesExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {/* Categories Submenu */}
            {categoriesExpanded && (
              <div className="bg-gray-50 py-2">
                <Link
                  href="/products"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 pl-12 py-2 text-gray-700 hover:text-green-900 transition-colors"
                >
                  <span className="text-sm font-medium">All Products</span>
                </Link>

                <div className="border-t border-gray-200 mt-2 pt-2">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/products?category=${category.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 pl-12 py-2 text-gray-700 hover:text-green-900 transition-colors"
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* About */}
          <Link
            href="/about"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors ${
              pathname === "/about"
                ? "bg-green-50 text-green-900"
                : "text-gray-700"
            }`}
          >
            <Info className="w-5 h-5" />
            <span className="font-medium">About</span>
          </Link>

          {/* Contact */}
          <Link
            href="/contact"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors ${
              pathname === "/contact"
                ? "bg-green-50 text-green-900"
                : "text-gray-700"
            }`}
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">Contact</span>
          </Link>

          {/* Divider */}
          <div className="my-2 border-t border-gray-200" />

          {/* Account Links */}
          <Link
            href="/profile?tab=wishlist"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5" />
              <span className="font-medium">Wishlist</span>
            </div>
            {wishlistCount > 0 && (
              <span className="bg-green-900 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/profile?tab=orders"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">My Orders</span>
          </Link>

          <Link
            href={isAuthenticated ? "/profile" : "/login"}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">
              {isAuthenticated ? "My Account" : "Sign In"}
            </span>
          </Link>
        </nav>

        {/* Bottom Contact Info */}
        <div className="mt-auto border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Contact Us
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <a
              href="tel:+2348069662020"
              className="flex items-center gap-2 hover:text-green-900"
            >
              <Phone className="w-4 h-4" />
              <span>+234 806 966 2020</span>
            </a>
            <div className="text-xs text-gray-600">
              Delivery: Lagos (2 days) | Outside Lagos (2 working days)
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
