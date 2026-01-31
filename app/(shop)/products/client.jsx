"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, X, ChevronDown, Loader2 } from "lucide-react";
import { useInfiniteProducts } from "@/hooks/use-products";
import { useInView } from "@/hooks/use-in-view";
import ProductCard from "@/components/shared/product/card";
import ProductFilters from "@/components/shared/product/filters";
import {
  parseFiltersFromURL,
  buildFilterURL,
  sortByRelevance,
  getDidYouMeanSuggestions,
  getSavedFilters,
  saveSearchFilters,
  clearSearchFilters,
} from "@/utils/search";

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

export default function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [didYouMean, setDidYouMean] = useState(null);

  // Parse filters from URL or load from localStorage
  const filters = useMemo(() => {
    const urlFilters = parseFiltersFromURL(searchParams);

    // If no filters in URL, try to load from localStorage
    if (!urlFilters.query && !urlFilters.category && !urlFilters.sortBy) {
      const savedFilters = getSavedFilters();
      if (savedFilters) {
        return savedFilters;
      }
    }

    return urlFilters;
  }, [searchParams]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (Object.values(filters).some((v) => v !== null && v !== "")) {
      saveSearchFilters(filters);
    }
  }, [filters]);

  // Fetch products with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteProducts({
    ...filters,
    limit: 24,
  });

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Get all products from pages
  const allProducts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.products || []);
  }, [data]);

  // Sort products by relevance if searching
  const sortedProducts = useMemo(() => {
    if (filters.query && filters.sortBy === "relevance") {
      return sortByRelevance(allProducts, filters.query);
    }
    return allProducts;
  }, [allProducts, filters.query, filters.sortBy]);

  // Get total count
  const totalCount = data?.pages?.[0]?.totalCount || 0;

  // Check for "Did you mean" suggestions
  useEffect(() => {
    if (filters.query && allProducts.length === 0 && !isLoading) {
      const productNames = allProducts.map((p) => p.name);
      const suggestions = getDidYouMeanSuggestions(filters.query, productNames);
      if (suggestions.length > 0) {
        setDidYouMean(suggestions[0]);
      }
    } else {
      setDidYouMean(null);
    }
  }, [filters.query, allProducts, isLoading]);

  const handleFilterChange = (newFilters) => {
    const url = `/products${buildFilterURL({ ...filters, ...newFilters })}`;
    router.push(url);
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    clearSearchFilters();
    router.push("/products");
  };

  const hasActiveFilters =
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock !== null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-charcoal">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-green-900 hover:text-green-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            <ProductFilters filters={filters} onChange={handleFilterChange} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header - Results Count & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              {filters.query ? (
                <h2 className="text-xl font-bold text-charcoal">
                  Search results for &quot;{filters.query}&quot;
                </h2>
              ) : filters.category ? (
                <h2 className="text-xl font-bold text-charcoal">
                  {filters.category}
                </h2>
              ) : (
                <h2 className="text-xl font-bold text-charcoal">
                  All Products
                </h2>
              )}
              <p className="text-gray-600 mt-1">
                {isLoading
                  ? "Loading..."
                  : `${totalCount.toLocaleString()} products found`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filters Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-green-600 rounded-full" />
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    handleFilterChange({ sortBy: e.target.value })
                  }
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer font-medium text-charcoal"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.category && (
                <FilterPill
                  label={`Category: ${filters.category}`}
                  onRemove={() => handleFilterChange({ category: null })}
                />
              )}
              {filters.minPrice !== null && (
                <FilterPill
                  label={`Min: ₦${filters.minPrice.toLocaleString()}`}
                  onRemove={() => handleFilterChange({ minPrice: null })}
                />
              )}
              {filters.maxPrice !== null && (
                <FilterPill
                  label={`Max: ₦${filters.maxPrice.toLocaleString()}`}
                  onRemove={() => handleFilterChange({ maxPrice: null })}
                />
              )}
              {filters.inStock !== null && (
                <FilterPill
                  label="In Stock Only"
                  onRemove={() => handleFilterChange({ inStock: null })}
                />
              )}
            </div>
          )}

          {/* Did You Mean Suggestion */}
          {didYouMean && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Did you mean:{" "}
                <button
                  onClick={() => handleFilterChange({ query: didYouMean })}
                  className="font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  {didYouMean}
                </button>
                ?
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12">
              <p className="text-error-600 mb-2">Failed to load products</p>
              <p className="text-gray-600 text-sm">{error?.message}</p>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !isError && (
            <>
              {sortedProducts.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  hasFilters={hasActiveFilters || !!filters.query}
                  onClearFilters={handleClearFilters}
                />
              )}

              {/* Load More Trigger */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading more products...</span>
                    </div>
                  ) : (
                    <div className="h-20" /> // Spacer to trigger inView
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <MobileFiltersDrawer
          filters={filters}
          onChange={handleFilterChange}
          onClose={() => setMobileFiltersOpen(false)}
          onClearAll={handleClearFilters}
        />
      )}
    </div>
  );
}

// Filter Pill Component
function FilterPill({ label, onRemove }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-900 rounded-full text-sm font-medium">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Empty State Component
function EmptyState({ hasFilters, onClearFilters }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-5xl">🔍</span>
      </div>
      <h3 className="text-xl font-bold text-charcoal mb-2">
        No products found
      </h3>
      <p className="text-gray-600 mb-6">
        {hasFilters
          ? "Try adjusting your filters or search terms"
          : "We couldn't find any products at the moment"}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-green-900 text-white rounded-lg hover:bg-green-800 transition-colors font-semibold"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

// Product Card Skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Mobile Filters Drawer
function MobileFiltersDrawer({ filters, onChange, onClose, onClearAll }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-charcoal/50 z-50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal">Filters</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearAll}
              className="text-sm text-green-900 hover:text-green-700 font-medium"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <ProductFilters filters={filters} onChange={onChange} />
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-900 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors"
          >
            View Results
          </button>
        </div>
      </div>
    </>
  );
}
