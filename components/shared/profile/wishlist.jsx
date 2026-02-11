"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Loader2,
  Trash2,
  ShoppingCart,
  Package,
  Plus,
  Minus,
} from "lucide-react";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/use-wishlist";
import { useCartStore } from "@/store/cart";
import Image from "next/image";
import { toast } from "sonner";

export default function WishlistTab() {
  const router = useRouter();
  const { data: wishlistData, isLoading } = useWishlist();
  const { mutate: removeFromWishlist, isPending: isRemoving } =
    useRemoveFromWishlist();

  const wishlistItems = wishlistData?.items || [];

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-900 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
        {wishlistItems.length > 0 && (
          <span className="text-sm text-gray-600">
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Your wishlist is empty</p>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 bg-green-900 text-white rounded-lg font-bold hover:bg-green-800 transition-colors"
          >
            Explore Products
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={handleRemove}
              isRemoving={isRemoving}
              router={router}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistCard({ item, onRemove, isRemoving, router }) {
  const product = item.products;
  const isOutOfStock = product.stock_quantity <= 0;

  // Get cart methods and state with proper selectors for reactivity
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  // Use selector to get cart quantity - this will trigger re-render when it changes
  const cartQuantity = useCartStore((state) =>
    state.getItemQuantity(product.id),
  );

  const isInCart = cartQuantity > 0;

  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddToCart = async () => {
    setIsUpdating(true);
    try {
      await addToCart({
        product_id: product.id,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          images: product.images,
          stock_quantity: product.stock_quantity || 999,
        },
        quantity: 1,
      });
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
      removeFromCart(product.id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all duration-200">
      {/* Product Image */}
      <div
        className="relative aspect-square bg-gray-100 cursor-pointer group"
        onClick={() => router.push(`/products/${product.slug}`)}
      >
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package className="w-12 h-12" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-900">
              Out of Stock
            </span>
          </div>
        )}
        {isInCart && !isOutOfStock && (
          <div className="absolute top-3 left-3 bg-green-900 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md">
            In Cart: {cartQuantity}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3
          className="font-medium text-gray-900 mb-1 cursor-pointer hover:text-green-900 transition-colors line-clamp-2"
          onClick={() => router.push(`/products/${product.slug}`)}
        >
          {product.name}
        </h3>
        <p className="text-lg font-bold text-green-900 mb-3">
          ₦{product.price.toLocaleString()}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Add to Cart or Quantity Selector */}
          {!isInCart ? (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isUpdating}
              className="flex-1 bg-green-900 text-white py-2 px-3 rounded-lg font-medium hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 flex items-center bg-green-50 border-2 border-green-900 rounded-lg overflow-hidden">
              <button
                onClick={handleDecrement}
                className="flex-1 py-2 px-2 bg-white hover:bg-gray-100 transition-colors flex items-center justify-center border-r border-green-900"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-green-900" />
              </button>
              <div className="flex-1 py-2 px-2 flex items-center justify-center">
                <span className="text-base font-bold text-green-900">
                  {cartQuantity}
                </span>
              </div>
              <button
                onClick={handleIncrement}
                disabled={cartQuantity >= product.stock_quantity}
                className="flex-1 py-2 px-2 bg-white hover:bg-gray-100 transition-colors flex items-center justify-center border-l border-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 text-green-900" />
              </button>
            </div>
          )}

          {/* Remove from Wishlist */}
          <button
            onClick={() => onRemove(product.id)}
            disabled={isRemoving}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Warning */}
        {isInCart && cartQuantity >= product.stock_quantity && (
          <p className="text-xs text-orange-600 mt-2 font-medium">
            Maximum quantity reached
          </p>
        )}
      </div>
    </div>
  );
}
