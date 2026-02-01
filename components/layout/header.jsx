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
import SearchBar from "@/components/common/search-bar";
import MiniCart from "../shared/cart/mini-cart";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
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
    setSearchOpen(false);
    setMiniCartOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu, search, or mini cart is open
  useEffect(() => {
    if (mobileMenuOpen || searchOpen || miniCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen, searchOpen, miniCartOpen]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (searchOpen) setSearchOpen(false);
        if (miniCartOpen) setMiniCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [searchOpen, miniCartOpen]);

  return (
    <>
      {/* Top Bar - Contact Info */}
      <div className="bg-green-900 text-white py-2 hidden lg:block">
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
        <div className="relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-green-900 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg lg:text-xl">
                    F
                  </span>
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-green-900 text-base lg:text-xl leading-tight">
                    Farz Supplements
                  </div>
                  <div className="text-xs text-gray-600 hidden lg:block">
                    Nature&apos;s Power. Your Health.
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
                <Link
                  href="/"
                  className={`text-[15px] font-medium transition-colors hover:text-green-900 whitespace-nowrap ${
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
                    className={`flex items-center gap-1 text-[15px] font-medium transition-colors hover:text-green-900 whitespace-nowrap ${
                      pathname.startsWith("/products")
                        ? "text-green-900"
                        : "text-gray-700"
                    }`}
                  >
                    Products
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {megaMenuOpen && <MegaMenu />}
                </div>

                <Link
                  href="/about"
                  className={`text-[15px] font-medium transition-colors hover:text-green-900 whitespace-nowrap ${
                    pathname === "/about" ? "text-green-900" : "text-gray-700"
                  }`}
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className={`text-[15px] font-medium transition-colors hover:text-green-900 whitespace-nowrap ${
                    pathname === "/contact" ? "text-green-900" : "text-gray-700"
                  }`}
                >
                  Contact
                </Link>
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                {/* Search Button */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-700 hover:text-green-900 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

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
                  className="hidden sm:flex p-2 text-gray-700 hover:text-green-900 transition-colors"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </Link>

                {/* Cart - Opens MiniCart */}
                <button
                  onClick={() => setMiniCartOpen(true)}
                  className="relative p-2 text-gray-700 hover:text-green-900 transition-colors"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount > 9 ? "9+" : cartItemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mega Menu Portal */}
          {megaMenuOpen && (
            <div
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <MegaMenu />
            </div>
          )}
        </div>
      </header>

      {/* Search Modal Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setSearchOpen(false)}
        >
          <div className="container mx-auto px-4 pt-8 lg:pt-20">
            <div
              className="max-w-3xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSearchOpen(false)}
                className="ml-auto mb-4 p-2 text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm"
                aria-label="Close search"
              >
                <span className="hidden sm:inline">Press ESC to close</span>
                <X className="w-5 h-5" />
              </button>

              {/* Search Bar with entrance animation */}
              <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                <SearchBar
                  placeholder="Search for supplements, teas, wellness products..."
                  autoFocus={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Cart Drawer */}
      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
