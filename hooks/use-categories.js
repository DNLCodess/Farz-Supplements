import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

/**
 * Fetch all active categories
 * Used for: Filters, navigation, product forms
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get categories with product count
 * Used for: Filters with product counts
 */
export async function getCategoriesWithCount() {
  // First get all active categories
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (categoriesError) throw categoriesError;

  if (!categories || categories.length === 0) {
    return [];
  }

  // Get product counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("is_active", true);

      return {
        ...category,
        count: count || 0,
      };
    }),
  );

  return categoriesWithCounts;
}

/**
 * Get single category by slug
 * Used for: Category pages
 */
export async function getCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get category hierarchy (parent-child)
 * Used for: Nested navigation, mega menu
 */
export async function getCategoryHierarchy() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  // Build hierarchy
  const categoriesMap = new Map();
  const rootCategories = [];

  // First pass: create map of all categories
  data?.forEach((category) => {
    categoriesMap.set(category.id, { ...category, children: [] });
  });

  // Second pass: build hierarchy
  data?.forEach((category) => {
    if (category.parent_id) {
      const parent = categoriesMap.get(category.parent_id);
      if (parent) {
        parent.children.push(categoriesMap.get(category.id));
      }
    } else {
      rootCategories.push(categoriesMap.get(category.id));
    }
  });

  return rootCategories;
}

// ==================== REACT QUERY HOOKS ====================

/**
 * Hook to fetch all categories
 * Cached for 15 minutes
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch categories with product counts
 * Cached for 5 minutes (changes more frequently)
 */
export function useCategoriesWithCount() {
  return useQuery({
    queryKey: ["categories", "with-count"],
    queryFn: getCategoriesWithCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to fetch single category by slug
 */
export function useCategory(slug) {
  return useQuery({
    queryKey: ["categories", slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook to fetch category hierarchy
 */
export function useCategoryHierarchy() {
  return useQuery({
    queryKey: ["categories", "hierarchy"],
    queryFn: getCategoryHierarchy,
    staleTime: 15 * 60 * 1000,
  });
}
