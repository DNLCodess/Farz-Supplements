"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { usePrefetchProduct } from "@/hooks/use-products";
import { useAuth } from "@/hooks/use-auth";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsInWishlist,
} from "@/hooks/use-wishlist";
import { useRouter } from "next/navigation";
import CartToast from "../cart/cart-toast";
import WishlistToast from "../wishlist/toast";

export default function ProductCard({ product }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [wishlistAction, setWishlistAction] = useState(null);

  const addItem = useCartStore((state) => state.addItem);
  const prefetchProduct = usePrefetchProduct();
  const { user } = useAuth();

  // Wishlist hooks
  const isInWishlistFn = useIsInWishlist();
  const isInWishlist = isInWishlistFn(product.id);
  const { mutate: addToWishlist, isPending: isAddingToWishlist } =
    useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemovingFromWishlist } =
    useRemoveFromWishlist();

  const isWishlistPending = isAddingToWishlist || isRemovingFromWishlist;

  // Get first image or use placeholder
  const imageUrl = product.images?.[0] || "/images/product-placeholder.png";

  // Calculate discount percentage
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compare_at_price - product.price) /
          product.compare_at_price) *
          100,
      )
    : 0;

  // Stock status
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock =
    product.stock_quantity > 0 &&
    product.stock_quantity <= (product.low_stock_threshold || 5);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    setIsAddingToCart(true);
    addItem(product, 1);

    // Show feedback
    setTimeout(() => {
      setIsAddingToCart(false);
      setShowToast(true);
    }, 400);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(product.id, {
        onSuccess: () => {
          setWishlistAction("removed");
          setShowWishlistToast(true);
        },
      });
    } else {
      addToWishlist(product.id, {
        onSuccess: () => {
          setWishlistAction("added");
          setShowWishlistToast(true);
        },
      });
    }
  };

  const handleMouseEnter = () => {
    prefetchProduct(product.slug);
  };

  return (
    <>
      <Link
        href={`/products/${product.slug}`}
        onMouseEnter={handleMouseEnter}
        className="group bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-500 transition-all duration-200 flex flex-col h-full"
      >
        {/* Product Image - 4:3 ratio for more content space */}
        <div
          className="relative w-full bg-gray-50 overflow-hidden"
          style={{ paddingBottom: "75%" }}
        >
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              🌿
            </div>
          )}

          {/* Badges - Top Right, Always Visible */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {hasDiscount && (
              <div className="px-3 py-1.5 bg-red-600 text-white text-base font-bold rounded-lg shadow-md">
                SAVE {discountPercentage}%
              </div>
            )}
            {product.is_featured && (
              <div className="px-3 py-1.5 bg-green-900 text-white text-sm font-semibold rounded-lg shadow-md">
                ⭐ Featured
              </div>
            )}
          </div>

          {/* Wishlist Button - Always Visible, Larger */}
          <button
            onClick={handleWishlistClick}
            disabled={isWishlistPending}
            className={`absolute top-3 left-3 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors border-2 disabled:opacity-50 ${
              isInWishlist
                ? "bg-green-900 border-green-900 hover:bg-green-800"
                : "bg-white border-gray-200 hover:bg-red-50 hover:border-red-300"
            }`}
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {isWishlistPending ? (
              <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
            ) : (
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isInWishlist
                    ? "text-white fill-current"
                    : "text-gray-600 hover:text-red-500"
                }`}
              />
            )}
          </button>
        </div>

        {/* Product Info - More Spacing */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category - Larger, Darker */}
          {product.category && (
            <p className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
              {product.category.name}
            </p>
          )}

          {/* Product Name - Very Large, Bold */}
          <h3 className="font-bold text-charcoal mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-green-900 transition-colors text-lg leading-snug">
            {product.name}
          </h3>

          {/* Rating - Larger Stars */}
          {product.avgRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-base font-medium text-gray-700">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price - Extra Large, Very Prominent */}
          <div className="mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-extrabold text-green-900">
                ₦{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-600 line-through font-medium">
                  ₦{product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status - Larger, With Icons */}
            <div className="mb-4 flex items-center gap-2">
              {isOutOfStock ? (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-base text-red-600 font-bold">
                    Out of Stock
                  </p>
                </>
              ) : isLowStock ? (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <p className="text-base text-orange-700 font-bold">
                    Only {product.stock_quantity} left!
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-base text-green-700 font-bold">In Stock</p>
                </>
              )}
            </div>

            {/* Add to Cart Button - Extra Large, High Contrast */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 border-2 ${
                isOutOfStock
                  ? "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"
                  : isAddingToCart
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-green-900 text-white border-green-900 hover:bg-green-800 hover:border-green-800"
              }`}
            >
              {isAddingToCart ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Toast Notification */}
      <CartToast
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        productName={product.name}
      />

      {/* Wishlist Toast Notification */}
      <WishlistToast
        isVisible={showWishlistToast}
        onClose={() => setShowWishlistToast(false)}
        action={wishlistAction}
      />
    </>
  );
}
