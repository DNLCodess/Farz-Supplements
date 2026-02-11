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
  LogOut,
  UserCircle,
  Settings,
  Package,
  Shield,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuth, useSignOut } from "@/hooks/use-auth";
import { useWishlistCount } from "@/hooks/use-wishlist";
import MegaMenu from "./mega-menu";
import MobileNav from "./mobile-nav";
import SearchBar from "@/components/common/search-bar";
import MiniCart from "../shared/cart/mini-cart";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistCount();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

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
    setAccountMenuOpen(false);
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
        if (accountMenuOpen) setAccountMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [searchOpen, miniCartOpen, accountMenuOpen]);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuOpen && !e.target.closest(".account-menu-container")) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  const handleSignOut = () => {
    signOut();
    setAccountMenuOpen(false);
  };

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
              {isAuthenticated && (
                <span className="text-green-100">
                  Welcome, {user?.first_name}!
                </span>
              )}
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

                {/* Wishlist with Counter */}
                <Link
                  href="/profile?tab=wishlist"
                  className="hidden sm:flex p-2 text-gray-700 hover:text-green-900 transition-colors relative"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Account - Conditional Rendering */}
                {isAuthenticated ? (
                  <div className="relative account-menu-container">
                    <button
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="hidden sm:flex items-center gap-2 p-2 text-gray-700 hover:text-green-900 transition-colors"
                      aria-label="Account menu"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-900">
                          {user?.first_name?.[0]}
                          {user?.last_name?.[0]}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Account Dropdown Menu */}
                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {user?.email}
                          </p>
                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 text-green-900 text-xs font-medium rounded-full">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <UserCircle className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link
                            href="/profile?tab=orders"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <Package className="w-4 h-4" />
                            My Orders
                          </Link>
                          <Link
                            href="/profile?tab=wishlist"
                            className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <Heart className="w-4 h-4" />
                              Wishlist
                            </div>
                            {wishlistCount > 0 && (
                              <span className="bg-green-100 text-green-900 text-xs font-bold rounded-full px-2 py-0.5">
                                {wishlistCount}
                              </span>
                            )}
                          </Link>
                          <Link
                            href="/profile?tab=addresses"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>

                          {isAdmin && (
                            <>
                              <div className="my-2 border-t border-gray-200"></div>
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-900 hover:bg-green-50 transition-colors font-medium"
                                onClick={() => setAccountMenuOpen(false)}
                              >
                                <Shield className="w-4 h-4" />
                                Admin Dashboard
                              </Link>
                            </>
                          )}
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-gray-200 pt-2">
                          <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full disabled:opacity-50"
                          >
                            <LogOut className="w-4 h-4" />
                            {isSigningOut ? "Signing out..." : "Sign Out"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="hidden sm:flex p-2 text-gray-700 hover:text-green-900 transition-colors"
                    aria-label="Account"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}

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
