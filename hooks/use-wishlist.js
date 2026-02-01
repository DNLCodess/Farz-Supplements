"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export const useWishlist = create(
  persist(
    (set, get) => ({
      items: [],

      // Add item to wishlist
      addToWishlist: (product) => {
        const { items } = get();

        if (items.some((item) => item.id === product.id)) {
          toast.info("Already in wishlist");
          return;
        }

        set({
          items: [
            ...items,
            {
              ...product,
              added_at: new Date().toISOString(),
            },
          ],
        });

        toast.success("Added to wishlist");
      },

      // Remove item from wishlist
      removeFromWishlist: (productId) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.id !== productId),
        });
        toast.success("Removed from wishlist");
      },

      // Clear wishlist
      clearWishlist: () => {
        set({ items: [] });
        toast.success("Wishlist cleared");
      },

      // Check if item is in wishlist
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.id === productId);
      },

      // Get wishlist count
      getWishlistCount: () => {
        const { items } = get();
        return items.length;
      },

      // Toggle wishlist
      toggleWishlist: (product) => {
        const { isInWishlist, addToWishlist, removeFromWishlist } = get();

        if (isInWishlist(product.id)) {
          removeFromWishlist(product.id);
        } else {
          addToWishlist(product);
        }
      },
    }),
    {
      name: "farz-wishlist-storage",
      version: 1,
    },
  ),
);
