"use client";

import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  maxRating = 5,
  size = "md",
  showNumber = false,
  interactive = false,
  onRatingChange,
  className = "",
}) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const iconSize = sizes[size] || sizes.md;

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(rating);
          const isPartial = starValue === Math.ceil(rating) && rating % 1 !== 0;

          return (
            <button
              key={index}
              onClick={() => handleClick(starValue)}
              disabled={!interactive}
              className={`relative ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
              aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
            >
              {isPartial ? (
                <div className="relative">
                  <Star className={`${iconSize} text-neutral-300`} />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${(rating % 1) * 100}%` }}
                  >
                    <Star
                      className={`${iconSize} text-amber-400 fill-amber-400`}
                    />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${iconSize} ${
                    isFilled
                      ? "text-amber-400 fill-amber-400"
                      : "text-neutral-300"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm text-neutral-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
