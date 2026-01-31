"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useCategoriesWithCount } from "@/hooks/use-categories";

const PRICE_RANGES = [
  { label: "Under ₦5,000", min: 0, max: 5000 },
  { label: "₦5,000 - ₦10,000", min: 5000, max: 10000 },
  { label: "₦10,000 - ₦20,000", min: 10000, max: 20000 },
  { label: "₦20,000 - ₦50,000", min: 20000, max: 50000 },
  { label: "Over ₦50,000", min: 50000, max: null },
];

export default function ProductFilters({ filters, onChange }) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    availability: true,
  });

  // Fetch categories with product counts using React Query
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategoriesWithCount();

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categorySlug) => {
    onChange({
      category: filters.category === categorySlug ? null : categorySlug,
    });
  };

  const handlePriceRangeChange = (range) => {
    const isActive =
      filters.minPrice === range.min && filters.maxPrice === range.max;

    if (isActive) {
      onChange({ minPrice: null, maxPrice: null });
    } else {
      onChange({ minPrice: range.min, maxPrice: range.max });
    }
  };

  const handleCustomPriceChange = (type, value) => {
    const numValue = value === "" ? null : parseInt(value);
    onChange({
      [type === "min" ? "minPrice" : "maxPrice"]: numValue,
    });
  };

  const handleStockChange = (value) => {
    onChange({ inStock: value === filters.inStock ? null : value });
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="font-semibold text-charcoal">Categories</h3>
          {expandedSections.categories ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.categories && (
          <div className="space-y-2">
            {categoriesLoading ? (
              // Loading skeleton
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              // Empty state
              <p className="text-sm text-gray-500 py-2">
                No categories available
              </p>
            ) : (
              // Categories list
              categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.category === category.slug}
                    onChange={() => handleCategoryChange(category.slug)}
                    className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <span className="flex-1 text-gray-700 group-hover:text-green-900 transition-colors">
                    {category.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({category.count})
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="font-semibold text-charcoal">Price Range</h3>
          {expandedSections.price ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.price && (
          <div className="space-y-4">
            {/* Preset Ranges */}
            <div className="space-y-2">
              {PRICE_RANGES.map((range, index) => {
                const isActive =
                  filters.minPrice === range.min &&
                  filters.maxPrice === range.max;

                return (
                  <label
                    key={index}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      checked={isActive}
                      onChange={() => handlePriceRangeChange(range)}
                      className="w-4 h-4 text-green-900 border-gray-300 focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-green-900 transition-colors">
                      {range.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Custom Range */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Range
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ""}
                    onChange={(e) =>
                      handleCustomPriceChange("min", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
                <span className="text-gray-500">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ""}
                    onChange={(e) =>
                      handleCustomPriceChange("max", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability */}
      <div>
        <button
          onClick={() => toggleSection("availability")}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="font-semibold text-charcoal">Availability</h3>
          {expandedSections.availability ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.availability && (
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.inStock === true}
                onChange={() => handleStockChange(true)}
                className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
              />
              <span className="text-gray-700 group-hover:text-green-900 transition-colors">
                In Stock Only
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.inStock === false}
                onChange={() => handleStockChange(false)}
                className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
              />
              <span className="text-gray-700 group-hover:text-green-900 transition-colors">
                Out of Stock
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
