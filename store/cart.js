"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Add item to cart
      addToCart: async (item) => {
        set({ isLoading: true });

        try {
          const { items } = get();
          const existingItem = items.find(
            (i) => i.product_id === item.product_id,
          );

          if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + (item.quantity || 1);
            const maxStock = item.product?.stock_quantity || 999;

            if (newQuantity > maxStock) {
              toast.error("Cannot add more items than available in stock");
              set({ isLoading: false });
              return;
            }

            set({
              items: items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: newQuantity }
                  : i,
              ),
            });

            toast.success("Cart updated");
          } else {
            // Add new item
            set({
              items: [
                ...items,
                {
                  ...item,
                  quantity: item.quantity || 1,
                  added_at: new Date().toISOString(),
                },
              ],
            });

            toast.success("Added to cart");
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          toast.error("Failed to add to cart");
        } finally {
          set({ isLoading: false });
        }
      },

      // Remove item from cart
      removeFromCart: (productId) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.product_id !== productId),
        });
        toast.success("Removed from cart");
      },

      // Update item quantity
      updateQuantity: (productId, quantity) => {
        const { items } = get();
        const item = items.find((i) => i.product_id === productId);

        if (!item) return;

        const maxStock = item.product?.stock_quantity || 999;

        if (quantity > maxStock) {
          toast.error("Cannot add more items than available in stock");
          return;
        }

        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set({
          items: items.map((i) =>
            i.product_id === productId ? { ...i, quantity } : i,
          ),
        });
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] });
        toast.success("Cart cleared");
      },

      // Get cart total
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = parseFloat(item.product?.price || 0);
          return total + price * item.quantity;
        }, 0);
      },

      // Get cart item count
      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      // Get total items (alias for getCartCount - used by Header)
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      // Check if item is in cart
      isInCart: (productId) => {
        const { items } = get();
        return items.some((item) => item.product_id === productId);
      },

      // Get item quantity
      getItemQuantity: (productId) => {
        const { items } = get();
        const item = items.find((i) => i.product_id === productId);
        return item?.quantity || 0;
      },
    }),
    {
      name: "farz-cart-storage",
      version: 1,
    },
  ),
);

// Export the hook that components can use
export const useCartStore = useCart;
