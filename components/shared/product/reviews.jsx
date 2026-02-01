"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, User, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import StarRating from "@/components/common/ui/star-rating";
import { useQuery } from "@tanstack/react-query";
import { getProductReviews } from "@/lib/reviews";

export default function ProductReviews({
  productId,
  initialReviews,
  ratingSummary,
}) {
  const [selectedRating, setSelectedRating] = useState(null);
  const [page, setPage] = useState(1);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["product-reviews", productId, selectedRating, page],
    queryFn: () =>
      getProductReviews(productId, {
        rating: selectedRating,
        page,
        limit: 10,
        approved: true,
      }),
    initialData: page === 1 && !selectedRating ? initialReviews : undefined,
    staleTime: 5 * 60 * 1000,
  });

  if (!ratingSummary || ratingSummary.total_reviews === 0) {
    return (
      <motion.div
        className="mt-12 lg:mt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.3 }}
      >
        <div className="bg-white rounded-lg border border-neutral-200 p-6 lg:p-8">
          <h2 className="text-2xl font-medium text-neutral-900 mb-6">
            Customer Reviews
          </h2>
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-base text-neutral-600">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const ratingDistribution = ratingSummary.rating_distribution || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  return (
    <motion.div
      className="mt-12 lg:mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.3 }}
    >
      <div className="bg-white rounded-lg border border-neutral-200 p-6 lg:p-8">
        <h2 className="text-2xl font-medium text-neutral-900 mb-6">
          Customer Reviews
        </h2>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-neutral-200">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-medium text-neutral-900 mb-2">
              {ratingSummary.average_rating.toFixed(1)}
            </div>
            <StarRating
              rating={ratingSummary.average_rating}
              size="lg"
              className="mb-2 justify-center md:justify-start"
            />
            <p className="text-sm text-neutral-600">
              Based on {ratingSummary.total_reviews}{" "}
              {ratingSummary.total_reviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage =
                  ratingSummary.total_reviews > 0
                    ? (count / ratingSummary.total_reviews) * 100
                    : 0;

                return (
                  <button
                    key={rating}
                    onClick={() =>
                      setSelectedRating(
                        selectedRating === rating ? null : rating,
                      )
                    }
                    className={`w-full flex items-center gap-3 group ${
                      selectedRating === rating
                        ? "opacity-100"
                        : "opacity-80 hover:opacity-100"
                    } transition-opacity`}
                  >
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm text-neutral-700">{rating}</span>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-600 w-12 text-right">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Info */}
        {selectedRating && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-neutral-700">
              Showing {selectedRating}-star reviews
            </p>
            <button
              onClick={() => setSelectedRating(null)}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="mt-8 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse border-b border-neutral-200 pb-6 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-neutral-200 rounded w-1/4" />
                      <div className="h-4 bg-neutral-200 rounded w-1/3" />
                      <div className="h-20 bg-neutral-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews && reviews.reviews?.length > 0 ? (
            reviews.reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-neutral-200 pb-6 last:border-0"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-neutral-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-medium text-neutral-900">
                            {review.customer_name || "Anonymous"}
                          </h4>
                          {review.is_verified_purchase && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">
                              <CheckCircle className="w-3 h-3" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <span className="text-sm text-neutral-500 flex-shrink-0">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h5 className="text-base font-medium text-neutral-900 mb-2">
                        {review.title}
                      </h5>
                    )}

                    {/* Review Comment */}
                    <p className="text-base text-neutral-700 leading-relaxed mb-3">
                      {review.comment}
                    </p>

                    {/* Helpful Button */}
                    <button className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-base text-neutral-600">
                No reviews found for this rating.
              </p>
            </div>
          )}
        </div>

        {/* Load More */}
        {reviews && reviews.hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoading}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {isLoading ? "Loading..." : "Load More Reviews"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
