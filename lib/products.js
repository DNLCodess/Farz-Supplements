import { supabase } from "@/lib/supabase/client";

/**
 * Helper function to convert category slug to UUID
 * Returns null if category not found
 */
async function getCategoryIdFromSlug(categorySlug) {
  if (!categorySlug) return null;

  // Check if it's already a UUID (skip conversion)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(categorySlug)) {
    return categorySlug;
  }

  // It's a slug, convert to ID
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.warn(`Category not found for slug: ${categorySlug}`);
    return null;
  }

  return data.id;
}

/**
 * Fetch all active products with pagination
 * Used for: Product listing page with infinite scroll
 */
export async function getProducts({
  page = 1,
  limit = 24,
  category = null, // Can be slug or UUID
  minPrice = null,
  maxPrice = null,
  inStock = null,
  sortBy = "relevance",
  searchQuery = null,
}) {
  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
      { count: "exact" },
    )
    .eq("is_active", true);

  // Category filter - Convert slug to UUID if needed
  if (category) {
    const categoryId = await getCategoryIdFromSlug(category);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    } else {
      // Category not found - return empty results instead of error
      return {
        products: [],
        totalCount: 0,
        page,
        limit,
        hasMore: false,
      };
    }
  }

  // Price range filter
  if (minPrice !== null && minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }
  if (maxPrice !== null && maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }

  // Stock filter
  if (inStock === true) {
    query = query.gt("stock_quantity", 0);
  } else if (inStock === false) {
    query = query.eq("stock_quantity", 0);
  }

  // Search query with full-text search
  if (searchQuery && searchQuery.trim()) {
    query = query.textSearch("search_vector", searchQuery.trim(), {
      type: "websearch",
      config: "english",
    });
  }

  // Sorting
  switch (sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "name-desc":
      query = query.order("name", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "relevance":
    default:
      if (searchQuery) {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });
      }
      break;
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return {
    products: data || [],
    totalCount: count || 0,
    page,
    limit,
    hasMore: count ? from + limit < count : false,
  };
}

/**
 * Fetch single product by slug
 * Used for: Product detail page
 */
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch featured products
 * Used for: Homepage, mega menu
 */
export async function getFeaturedProducts(limit = 8) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
    )
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fetch related products (same category, exclude current)
 * Used for: Product detail page
 */
export async function getRelatedProducts(productId, categoryId, limit = 4) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
    )
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fetch products by category slug
 * Used for: Category pages
 */
export async function getProductsByCategory(
  categorySlug,
  { page = 1, limit = 24 },
) {
  const categoryId = await getCategoryIdFromSlug(categorySlug);

  if (!categoryId) {
    throw new Error("Category not found");
  }

  return getProducts({ page, limit, category: categoryId });
}

/**
 * Search products with smart matching
 * Used for: Search page, search bar autocomplete
 */
export async function searchProducts(searchQuery, { limit = 10 }) {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return [];
  }

  const trimmedQuery = searchQuery.trim();

  // Strategy 1: Exact name match (highest priority)
  const { data: exactMatches } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
    )
    .eq("is_active", true)
    .ilike("name", `%${trimmedQuery}%`)
    .limit(limit);

  if (exactMatches && exactMatches.length > 0) {
    return exactMatches;
  }

  // Strategy 2: Full-text search (semantic matching)
  const { data: fullTextMatches } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
    )
    .eq("is_active", true)
    .textSearch("search_vector", trimmedQuery, {
      type: "websearch",
      config: "english",
    })
    .limit(limit);

  if (fullTextMatches && fullTextMatches.length > 0) {
    return fullTextMatches;
  }

  // Strategy 3: Fuzzy matching on SKU
  const { data: skuMatches } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
    )
    .eq("is_active", true)
    .ilike("sku", `%${trimmedQuery}%`)
    .limit(limit);

  return skuMatches || [];
}

/**
 * Get search suggestions
 * Used for: Search autocomplete
 */
export async function getSearchSuggestions(query, limit = 5) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const { data } = await supabase
    .from("products")
    .select("name, slug")
    .eq("is_active", true)
    .ilike("name", `%${query.trim()}%`)
    .limit(limit);

  return data || [];
}

/**
 * Get product with average rating and review count
 * Used for: Product cards, detail page
 */
export async function getProductWithRating(productId) {
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
    )
    .eq("id", productId)
    .single();

  if (!product) throw new Error("Product not found");

  // Get rating stats (if reviews table exists)
  const { data: reviews } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return {
    ...product,
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews?.length || 0,
  };
}

/**
 * Get low stock products (admin)
 * Used for: Admin dashboard alerts
 */
export async function getLowStockProducts(limit = 10) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .lt("stock_quantity", 10)
    .order("stock_quantity", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Check product availability
 * Used for: Add to cart validation
 */
export async function checkProductAvailability(productId, quantity) {
  const { data, error } = await supabase
    .from("products")
    .select("stock_quantity, name")
    .eq("id", productId)
    .single();

  if (error) throw error;

  return {
    available: data.stock_quantity >= quantity,
    stock: data.stock_quantity,
    name: data.name,
  };
}

/**
 * Get new arrivals
 * Used for: Homepage
 */
export async function getNewArrivals(limit = 8) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get products on sale
 * Used for: Sales/Deals page
 */
export async function getProductsOnSale({ page = 1, limit = 24 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
      { count: "exact" },
    )
    .eq("is_active", true)
    .not("compare_at_price", "is", null)
    .filter("price", "lt", "compare_at_price")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    products: data || [],
    totalCount: count || 0,
    hasMore: count ? from + limit < count : false,
  };
}
