import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Get product reviews (SERVER-SIDE)
 * Use this in Server Components only
 */
export async function getProductReviews(productId, options = {}) {
  const {
    page = 1,
    limit = 10,
    rating = null,
    approved = true,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  const offset = (page - 1) * limit;

  try {
    let query = supabaseServer
      .from("product_reviews")
      .select(
        `
        *,
        customer:customers (
          id,
          first_name,
          last_name
        )
      `,
        { count: "exact" },
      )
      .eq("product_id", productId);

    if (approved !== null) {
      query = query.eq("is_approved", approved);
    }

    if (rating !== null) {
      query = query.eq("rating", rating);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching reviews:", error);
      return {
        reviews: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        hasMore: false,
      };
    }

    // Format reviews with customer names
    const reviews = (data || []).map((review) => ({
      ...review,
      customer_name: review.customer
        ? `${review.customer.first_name} ${review.customer.last_name}`.trim()
        : "Anonymous",
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
      hasMore: page < totalPages,
    };
  } catch (error) {
    console.error("Error in getProductReviews:", error);
    return {
      reviews: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
      hasMore: false,
    };
  }
}

/**
 * Get product rating summary (SERVER-SIDE)
 * Use this in Server Components only
 */
export async function getProductRatingSummary(productId) {
  try {
    // Get all approved reviews for the product
    const { data: reviews, error } = await supabaseServer
      .from("product_reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("is_approved", true);

    if (error) {
      console.error("Error fetching rating summary:", error);
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    if (!reviews || reviews.length === 0) {
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Calculate rating distribution
    const ratingDistribution = reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    );

    return {
      average_rating: averageRating,
      total_reviews: reviews.length,
      rating_distribution: ratingDistribution,
    };
  } catch (error) {
    console.error("Error calculating rating summary:", error);
    return {
      average_rating: 0,
      total_reviews: 0,
      rating_distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }
}
