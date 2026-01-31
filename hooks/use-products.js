import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
  getProductsByCategory,
  searchProducts,
  getSearchSuggestions,
  getProductWithRating,
  getNewArrivals,
  getProductsOnSale,
} from "@/lib/products";

// Query Keys
export const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, "detail"],
  detail: (slug) => [...productKeys.details(), slug],
  featured: () => [...productKeys.all, "featured"],
  newArrivals: () => [...productKeys.all, "new-arrivals"],
  onSale: () => [...productKeys.all, "on-sale"],
  related: (productId) => [...productKeys.all, "related", productId],
  search: (query) => [...productKeys.all, "search", query],
  suggestions: (query) => [...productKeys.all, "suggestions", query],
  withRating: (productId) => [...productKeys.all, "with-rating", productId],
};

/**
 * Infinite scroll for products list
 * Used for: Main products page
 */
export function useInfiniteProducts(filters = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      getProducts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Regular paginated products
 * Used for: Admin panel, category pages with page numbers
 */
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Single product by slug
 * Used for: Product detail page
 */
export function useProduct(slug) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Featured products
 * Used for: Homepage, mega menu
 */
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => getFeaturedProducts(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Related products
 * Used for: Product detail page
 */
export function useRelatedProducts(productId, categoryId, limit = 4) {
  return useQuery({
    queryKey: productKeys.related(productId),
    queryFn: () => getRelatedProducts(productId, categoryId, limit),
    enabled: !!productId && !!categoryId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Products by category
 * Used for: Category filter pages
 */
export function useProductsByCategory(categorySlug, options = {}) {
  return useQuery({
    queryKey: productKeys.list({ category: categorySlug, ...options }),
    queryFn: () => getProductsByCategory(categorySlug, options),
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Search products
 * Used for: Search page
 */
export function useSearchProducts(searchQuery, options = {}) {
  return useQuery({
    queryKey: productKeys.search(searchQuery),
    queryFn: () => searchProducts(searchQuery, options),
    enabled: !!searchQuery && searchQuery.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Search suggestions for autocomplete
 * Used for: Search bar dropdown
 */
export function useSearchSuggestions(query) {
  return useQuery({
    queryKey: productKeys.suggestions(query),
    queryFn: () => getSearchSuggestions(query),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Product with rating
 * Used for: Product cards with ratings
 */
export function useProductWithRating(productId) {
  return useQuery({
    queryKey: productKeys.withRating(productId),
    queryFn: () => getProductWithRating(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * New arrivals
 * Used for: Homepage
 */
export function useNewArrivals(limit = 8) {
  return useQuery({
    queryKey: productKeys.newArrivals(),
    queryFn: () => getNewArrivals(limit),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Products on sale
 * Used for: Deals/Sales page
 */
export function useProductsOnSale(options = {}) {
  return useQuery({
    queryKey: productKeys.onSale(),
    queryFn: () => getProductsOnSale(options),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch product for better UX
 * Used for: Hover effects, predictive loading
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (slug) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(slug),
      queryFn: () => getProductBySlug(slug),
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Invalidate product queries
 * Used for: After mutations (create, update, delete)
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
    invalidateLists: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    invalidateDetail: (slug) =>
      queryClient.invalidateQueries({ queryKey: productKeys.detail(slug) }),
    invalidateFeatured: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.featured() }),
  };
}
