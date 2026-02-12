"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Add item to cart
      addToCart: async (item) => {
        set({ isLoading: true });

        try {
          const { items } = get();
          // Use consistent ID - prefer product_id, fallback to id
          const itemId = item.product_id || item.id;

          if (!itemId) {
            toast.error("Invalid product");
            set({ isLoading: false });
            return;
          }

          const existingItem = items.find(
            (i) => (i.product_id || i.id) === itemId,
          );

          if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + (item.quantity || 1);
            const maxStock =
              item.product?.stock_quantity || item.stock_quantity || 999;

            if (newQuantity > maxStock) {
              toast.error("Cannot add more items than available in stock");
              set({ isLoading: false });
              return;
            }

            set({
              items: items.map((i) =>
                (i.product_id || i.id) === itemId
                  ? { ...i, quantity: newQuantity }
                  : i,
              ),
            });

            toast.success("Cart updated");
          } else {
            // Add new item with consistent structure
            const newItem = {
              ...item,
              id: itemId, // Ensure id exists
              product_id: itemId, // Ensure product_id exists
              quantity: item.quantity || 1,
              added_at: new Date().toISOString(),
            };

            set({
              items: [...items, newItem],
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
          items: items.filter(
            (item) => (item.product_id || item.id) !== productId,
          ),
        });
        toast.success("Removed from cart");
      },

      // Remove item by ID (alias for compatibility)
      removeItem: (id) => {
        const { items } = get();
        set({
          items: items.filter((item) => (item.id || item.product_id) !== id),
        });
        toast.success("Removed from cart");
      },

      // Update item quantity
      updateQuantity: (id, quantity) => {
        const { items } = get();
        const item = items.find((i) => (i.id || i.product_id) === id);

        if (!item) return;

        const maxStock = item.stock_quantity || 999;

        if (quantity > maxStock) {
          toast.error("Cannot add more items than available in stock");
          return;
        }

        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: items.map((i) =>
            (i.id || i.product_id) === id ? { ...i, quantity } : i,
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
          const price = parseFloat(item.price || 0);
          const quantity = parseInt(item.quantity || 0, 10);
          return (
            total + (isNaN(price) || isNaN(quantity) ? 0 : price * quantity)
          );
        }, 0);
      },

      // Get total price (alias for compatibility)
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = parseFloat(item.price || 0);
          const quantity = parseInt(item.quantity || 0, 10);
          return (
            total + (isNaN(price) || isNaN(quantity) ? 0 : price * quantity)
          );
        }, 0);
      },

      // Get cart item count
      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => {
          const quantity = parseInt(item.quantity || 0, 10);
          return count + (isNaN(quantity) ? 0 : quantity);
        }, 0);
      },

      // Get total items (alias for getCartCount)
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((count, item) => {
          const quantity = parseInt(item.quantity || 0, 10);
          return count + (isNaN(quantity) ? 0 : quantity);
        }, 0);
      },

      // Check if item is in cart
      isInCart: (productId) => {
        const { items } = get();
        return items.some((item) => (item.product_id || item.id) === productId);
      },

      // Get item quantity
      getItemQuantity: (productId) => {
        const { items } = get();
        const item = items.find((i) => (i.product_id || i.id) === productId);
        return item?.quantity || 0;
      },
    }),
    {
      name: "farz-cart-storage",
      version: 2, // Increment version to trigger migration
      storage: createJSONStorage(() => {
        // Only use localStorage on the client side
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Skip hydration during SSR
      skipHydration: typeof window === "undefined",
      // Migrate old cart data to ensure consistent ID structure
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Ensure all items have both id and product_id
          const migratedItems = (persistedState.items || []).map((item) => ({
            ...item,
            id: item.id || item.product_id,
            product_id: item.product_id || item.id,
          }));
          return {
            ...persistedState,
            items: migratedItems,
          };
        }
        return persistedState;
      },
    },
  ),
);

// Export the hook that components can use
export const useCart = useCartStore;
