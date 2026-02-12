"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Package,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsInWishlist,
} from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Breadcrumbs from "@/components/common/ui/bread-crumbs";
import StarRating from "@/components/common/ui/star-rating";
import ShareButton from "@/components/common/ui/share-button";
import ProductReviews from "@/components/shared/product/reviews";
import RelatedProducts from "@/components/shared/product/related-products";

import { formatPrice } from "@/lib/utils";
import WishlistToast from "@/components/shared/wishlist/toast";

export default function ProductDetailClient({
  product,
  relatedProducts,
  initialReviews,
  ratingSummary,
}) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [wishlistAction, setWishlistAction] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get cart methods and state with proper selectors
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Use selector to get cart quantity - this will trigger re-render when it changes
  const cartQuantity = useCartStore((state) =>
    state.getItemQuantity(product.id),
  );

  const isInCart = cartQuantity > 0;

  const { user } = useAuth();

  // Wishlist hooks
  const isInWishlistFn = useIsInWishlist();
  const inWishlist = isInWishlistFn(product.id);
  const { mutate: addToWishlist, isPending: isAddingToWishlist } =
    useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemovingFromWishlist } =
    useRemoveFromWishlist();

  const isWishlistPending = isAddingToWishlist || isRemovingFromWishlist;

  // FIX: Handle images properly - they're an array of URL strings, not objects
  const validImages = Array.isArray(product.images)
    ? product.images.filter(
        (img) => img && typeof img === "string" && img.trim() !== "",
      )
    : [];

  const images =
    validImages.length > 0 ? validImages : ["/images/product-placeholder.png"];

  const isOnSale =
    product.compare_at_price &&
    parseFloat(product.compare_at_price) > parseFloat(product.price);

  const discountPercentage = isOnSale
    ? Math.round(
        ((parseFloat(product.compare_at_price) - parseFloat(product.price)) /
          parseFloat(product.compare_at_price)) *
          100,
      )
    : 0;

  const isLowStock =
    product.stock_quantity > 0 &&
    product.stock_quantity <= (product.low_stock_threshold || 5);

  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setIsUpdating(true);

    try {
      await addToCart({
        product_id: product.id,
        product: product,
        price: product.price,
        quantity: 1,
        stock_quantity: product.stock_quantity,
      });

      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = () => {
    if (cartQuantity < product.stock_quantity) {
      updateQuantity(product.id, cartQuantity + 1);
    } else {
      toast.error("Cannot add more items than available in stock");
    }
  };

  const handleDecrement = () => {
    if (cartQuantity > 1) {
      updateQuantity(product.id, cartQuantity - 1);
    } else {
      // Remove from cart when quantity reaches 0
      removeItem(product.id);
      toast.success("Removed from cart");
    }
  };

  const handleToggleWishlist = () => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }

    if (inWishlist) {
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

  const handleImageChange = (index) => {
    setSelectedImage(index);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    ...(product.category
      ? [
          {
            label: product.category.name,
            href: `/products?category=${product.category.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              className="relative aspect-square bg-white rounded-lg overflow-hidden border border-neutral-200 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOnSale && (
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Save {discountPercentage}%
                </div>
              )}

              <Image
                src={images[selectedImage] || "/images/product-placeholder.png"}
                alt={product.name}
                fill
                className="object-contain p-4 cursor-zoom-in"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                onClick={() => setShowImageModal(true)}
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-neutral-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-neutral-700" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`relative aspect-square bg-white rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-neutral-900"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="150px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {/* Category */}
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-block text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {product.category.name}
              </Link>
            )}

            {/* Product Name */}
            <h1 className="text-3xl lg:text-4xl font-medium text-neutral-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating Summary */}
            {ratingSummary && ratingSummary.total_reviews > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={ratingSummary.average_rating} size="lg" />
                <span className="text-base text-neutral-700">
                  {ratingSummary.average_rating.toFixed(1)}
                </span>
                <span className="text-base text-neutral-500">
                  ({ratingSummary.total_reviews}{" "}
                  {ratingSummary.total_reviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-medium text-neutral-900">
                  {formatPrice(product.price)}
                </span>
                {isOnSale && (
                  <span className="text-xl text-neutral-500 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>
              {product.sku && (
                <p className="text-sm text-neutral-600">SKU: {product.sku}</p>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-md text-sm font-medium">
                  <Package className="w-4 h-4" />
                  Out of Stock
                </div>
              ) : isLowStock ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-md text-sm font-medium">
                  <Package className="w-4 h-4" />
                  Only {product.stock_quantity} left in stock
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium">
                  <Check className="w-4 h-4" />
                  In Stock
                </div>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-base text-neutral-700 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Add to Cart or Quantity Controls */}
            {!isOutOfStock && (
              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  {!isInCart ? (
                    <button
                      onClick={handleAddToCart}
                      disabled={isUpdating}
                      className="flex-1 h-12 bg-green-900 text-white rounded-md font-semibold text-base hover:bg-green-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center bg-green-50 border-2 border-green-900 rounded-md overflow-hidden">
                      <button
                        onClick={handleDecrement}
                        className="flex-1 h-12 px-4 bg-white hover:bg-gray-100 transition-colors flex items-center justify-center border-r border-green-900"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-5 h-5 text-green-900" />
                      </button>
                      <div className="flex-1 h-12 px-4 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-900">
                          {cartQuantity}
                        </span>
                      </div>
                      <button
                        onClick={handleIncrement}
                        disabled={cartQuantity >= product.stock_quantity}
                        className="flex-1 h-12 px-4 bg-white hover:bg-gray-100 transition-colors flex items-center justify-center border-l border-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-5 h-5 text-green-900" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleToggleWishlist}
                    disabled={isWishlistPending}
                    className={`w-12 h-12 rounded-md border-2 flex items-center justify-center transition-colors disabled:opacity-50 ${
                      inWishlist
                        ? "border-green-900 bg-green-900 text-white hover:bg-green-800"
                        : "border-neutral-300 hover:border-red-400 hover:bg-red-50 text-neutral-600"
                    }`}
                    aria-label={
                      inWishlist ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    {isWishlistPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart
                        className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
                      />
                    )}
                  </button>

                  <ShareButton
                    title={product.name}
                    url={`/products/${product.slug}`}
                    className="w-12 h-12"
                  />
                </div>

                {/* Stock Warning - Only show when in cart */}
                {isInCart && cartQuantity >= product.stock_quantity && (
                  <p className="text-sm text-orange-600 font-medium">
                    Maximum quantity reached
                  </p>
                )}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Free Delivery
                  </p>
                  <p className="text-sm text-neutral-600">
                    On orders over ₦10,000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Secure Payment
                  </p>
                  <p className="text-sm text-neutral-600">
                    100% secure checkout
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-5 h-5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Easy Returns
                  </p>
                  <p className="text-sm text-neutral-600">
                    30-day return policy
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Quality Assured
                  </p>
                  <p className="text-sm text-neutral-600">
                    Premium supplements
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Description & Details */}
        {product.description && (
          <motion.div
            className="mt-12 lg:mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg border border-neutral-200 p-6 lg:p-8">
              <h2 className="text-2xl font-medium text-neutral-900 mb-4">
                Product Details
              </h2>
              <div className="prose prose-neutral max-w-none">
                <div
                  className="text-base text-neutral-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Reviews Section */}
        <ProductReviews
          productId={product.id}
          initialReviews={initialReviews}
          ratingSummary={ratingSummary}
        />

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              className="relative max-w-5xl w-full aspect-square"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedImage] || "/images/product-placeholder.png"}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
              />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist Toast Notification */}
      <WishlistToast
        isVisible={showWishlistToast}
        onClose={() => setShowWishlistToast(false)}
        action={wishlistAction}
      />
    </div>
  );
}
