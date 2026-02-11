"use client";

import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsInWishlist,
} from "@/hooks/use-wishlist";
import { useRouter } from "next/navigation";

export default function WishlistButton({ productId, className = "" }) {
  const router = useRouter();
  const { user } = useAuth();
  const isInWishlist = useIsInWishlist(productId);
  const { mutate: addToWishlist, isPending: isAdding } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemoving } =
    useRemoveFromWishlist();

  const isPending = isAdding || isRemoving;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
        isInWishlist
          ? "bg-green-900 text-white hover:bg-green-800"
          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
      } ${className}`}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Heart className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`} />
      )}
    </button>
  );
}
