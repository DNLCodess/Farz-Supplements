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

  const addToCart = useCartStore((state) => state.addToCart);
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

    // Add to cart with proper structure
    await addToCart({
      product_id: product.id,
      product: product,
      price: product.price,
      quantity: 1,
      stock_quantity: product.stock_quantity,
    });

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
        className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-green-600 transition-all duration-200 flex flex-col h-full"
      >
        {/* Product Image - 4:3 ratio */}
        <div
          className="relative w-full bg-gray-50 overflow-hidden"
          style={{ paddingBottom: "75%" }}
        >
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              🌿
            </div>
          )}

          {/* Badges - Top Right */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {hasDiscount && (
              <div className="px-2.5 py-1 bg-red-600 text-white text-sm font-bold rounded-md shadow-sm">
                -{discountPercentage}%
              </div>
            )}
            {product.is_featured && (
              <div className="px-2.5 py-1 bg-green-900 text-white text-xs font-semibold rounded-md shadow-sm">
                Featured
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            disabled={isWishlistPending}
            className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 border disabled:opacity-50 ${
              isInWishlist
                ? "bg-green-900 border-green-900 hover:bg-green-800"
                : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {isWishlistPending ? (
              <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
            ) : (
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isInWishlist
                    ? "text-white fill-current"
                    : "text-gray-600 group-hover:text-red-500"
                }`}
              />
            )}
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          {product.category && (
            <p className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
              {product.category.name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-charcoal mb-2 line-clamp-2 min-h-11 group-hover:text-green-900 transition-colors text-base leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avgRating > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-green-900">
                ₦{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base text-gray-500 line-through">
                  ₦{product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-3 flex items-center gap-1.5">
              {isOutOfStock ? (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600 font-semibold">
                    Out of Stock
                  </p>
                </>
              ) : isLowStock ? (
                <>
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-orange-700 font-semibold">
                    Only {product.stock_quantity} left
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700 font-semibold">
                    In Stock
                  </p>
                </>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className={`w-full py-3 rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : isAddingToCart
                    ? "bg-green-700 text-white"
                    : "bg-green-900 text-white hover:bg-green-800 shadow-sm hover:shadow"
              }`}
            >
              {isAddingToCart ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
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
