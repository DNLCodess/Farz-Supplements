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
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import Breadcrumbs from "@/components/common/ui/bread-crumbs";
import StarRating from "@/components/common/ui/star-rating";
import QuantitySelector from "@/components/common/ui/quantity-selector";
import AddToCartButton from "@/components/shared/cart/add-to-cart-button";
import ShareButton from "@/components/common/ui/share-button";
import ProductReviews from "@/components/shared/product/reviews";
import RelatedProducts from "@/components/shared/product/related-products";
import { formatPrice } from "@/lib/utils";

export default function ProductDetailClient({
  product,
  relatedProducts,
  initialReviews,
  ratingSummary,
}) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);

  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Ensure we have valid image URLs, filter out empty/invalid ones
  const validImages =
    product.images?.filter((img) => img?.url && img.url.trim() !== "") || [];
  const images =
    validImages.length > 0
      ? validImages
      : [{ url: "/images/placeholder.jpg", alt: product.name }];

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

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    await addToCart({
      product_id: product.id,
      quantity,
      product,
    });
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
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
                src={images[selectedImage]?.url || "/images/placeholder.jpg"}
                alt={images[selectedImage]?.alt || product.name}
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
                {images.map((image, index) => (
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
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
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

            {/* Quantity and Add to Cart */}
            {!isOutOfStock && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-neutral-900">
                    Quantity:
                  </label>
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    max={product.stock_quantity}
                  />
                </div>

                <div className="flex gap-3">
                  <AddToCartButton
                    onClick={handleAddToCart}
                    isLoading={cartLoading}
                    className="flex-1 h-12 text-base"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </AddToCartButton>

                  <button
                    onClick={handleToggleWishlist}
                    className={`w-12 h-12 rounded-md border-2 flex items-center justify-center transition-colors ${
                      inWishlist
                        ? "border-red-600 bg-red-50 text-red-600"
                        : "border-neutral-300 hover:border-neutral-400 text-neutral-600"
                    }`}
                    aria-label={
                      inWishlist ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <Heart
                      className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
                    />
                  </button>

                  <ShareButton
                    title={product.name}
                    url={`/products/${product.slug}`}
                    className="w-12 h-12"
                  />
                </div>
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
                src={images[selectedImage]?.url}
                alt={images[selectedImage]?.alt || product.name}
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
    </div>
  );
}
