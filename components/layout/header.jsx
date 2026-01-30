"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShoppingCart,
  Heart,
  User,
  Search,
  Phone,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import MegaMenu from "./mega-menu";
import MobileNav from "./mobile-nav";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  // Handle scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top Bar - Contact Info */}
      <div className="bg-green-900 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+234 806 966 2020</span>
              </div>
              <span className="text-green-100">
                Delivery within Lagos: 2 days | Outside Lagos: 2 working days
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/track-order"
                className="hover:text-green-100 transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/help"
                className="hover:text-green-100 transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "border-b border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-charcoal hover:text-green-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              {/* Placeholder Logo - Replace with actual logo when available */}
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-xl">
                  F
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-green-900 text-lg md:text-xl leading-tight">
                  Farz Supplements
                </div>
                <div className="text-xs text-gray-600 hidden md:block">
                  Nature's Power. Your Health.
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link
                href="/"
                className={`text-base font-medium transition-colors hover:text-green-900 ${
                  pathname === "/" ? "text-green-900" : "text-gray-700"
                }`}
              >
                Home
              </Link>

              {/* Products with Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 text-base font-medium transition-colors hover:text-green-900 ${
                    pathname.startsWith("/products")
                      ? "text-green-900"
                      : "text-gray-700"
                  }`}
                >
                  Products
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {megaMenuOpen && <MegaMenu />}
              </div>

              <Link
                href="/about"
                className={`text-base font-medium transition-colors hover:text-green-900 ${
                  pathname === "/about" ? "text-green-900" : "text-gray-700"
                }`}
              >
                About
              </Link>

              <Link
                href="/contact"
                className={`text-base font-medium transition-colors hover:text-green-900 ${
                  pathname === "/contact" ? "text-green-900" : "text-gray-700"
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search - Desktop */}
              <Link
                href="/search"
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-green-900 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Search - Mobile Icon */}
              <Link
                href="/search"
                className="lg:hidden p-2 text-gray-700 hover:text-green-900 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden sm:flex p-2 text-gray-700 hover:text-green-900 transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Account */}
              <Link
                href="/login"
                className="hidden md:flex p-2 text-gray-700 hover:text-green-900 transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-green-900 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount > 9 ? "9+" : cartItemsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar - Mobile (below main header) */}
        <div className="lg:hidden border-t border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
