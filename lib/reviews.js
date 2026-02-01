import { supabase } from "@/lib/supabase/client";

/**
 * Get product reviews with optional filters
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

  let query = supabase
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
  const reviews = data.map((review) => ({
    ...review,
    customer_name: review.customer
      ? `${review.customer.first_name} ${review.customer.last_name}`.trim()
      : "Anonymous",
  }));

  const totalPages = Math.ceil(count / limit);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
    },
    hasMore: page < totalPages,
  };
}

/**
 * Get product rating summary
 */
export async function getProductRatingSummary(productId) {
  try {
    // Get all approved reviews for the product
    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("is_approved", true);

    if (error) {
      console.error("Error fetching rating summary:", error);
      return null;
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
    return null;
  }
}

/**
 * Create a new product review
 */
export async function createProductReview(reviewData) {
  const {
    product_id,
    customer_id,
    rating,
    title,
    comment,
    is_verified_purchase = false,
  } = reviewData;

  // Check if customer has already reviewed this product
  const { data: existingReview } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", product_id)
    .eq("customer_id", customer_id)
    .single();

  if (existingReview) {
    return {
      success: false,
      error: "You have already reviewed this product",
    };
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id,
      customer_id,
      rating,
      title,
      comment,
      is_verified_purchase,
      is_approved: false, // Reviews need approval
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    return {
      success: false,
      error: "Failed to submit review",
    };
  }

  return {
    success: true,
    data,
  };
}

/**
 * Update a product review
 */
export async function updateProductReview(reviewId, updateData) {
  const { data, error } = await supabase
    .from("product_reviews")
    .update(updateData)
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    console.error("Error updating review:", error);
    return {
      success: false,
      error: "Failed to update review",
    };
  }

  return {
    success: true,
    data,
  };
}

/**
 * Delete a product review
 */
export async function deleteProductReview(reviewId) {
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      error: "Failed to delete review",
    };
  }

  return {
    success: true,
  };
}

/**
 * Check if customer can review a product (has purchased it)
 */
export async function canCustomerReview(productId, customerId) {
  // Check if customer has a completed order with this product
  const { data: orders, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      order:orders (
        id,
        status,
        customer_id
      )
    `,
    )
    .eq("product_id", productId);

  if (error) {
    console.error("Error checking review eligibility:", error);
    return false;
  }

  // Check if any order is completed and belongs to the customer
  const hasCompletedPurchase = orders.some(
    (item) =>
      item.order &&
      item.order.customer_id === customerId &&
      ["completed", "delivered"].includes(item.order.status),
  );

  return hasCompletedPurchase;
}
