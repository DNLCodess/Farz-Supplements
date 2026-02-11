import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Get user's wishlist
export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await fetch("/api/wishlist");
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      return response.json();
    },
  });
}

// Add item to wishlist
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to wishlist");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// Remove item from wishlist
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove from wishlist");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// Check if product is in wishlist (returns a function)
export function useIsInWishlist() {
  const { data } = useWishlist();
  const wishlistItems = data?.items || [];

  return (productId) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };
}

// Get wishlist item count
export function useWishlistCount() {
  const { data } = useWishlist();
  return data?.count || 0;
}
