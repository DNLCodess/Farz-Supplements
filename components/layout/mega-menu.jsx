"use client";

import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    name: "Herbal Liquids",
    slug: "herbal-liquids",
    description: "Tonics, extracts, and bitters",
    icon: "🧪",
  },
  {
    name: "Teas & Coffee",
    slug: "teas-coffee",
    description: "Premium herbal teas and blends",
    icon: "☕",
  },
  {
    name: "Capsules",
    slug: "capsules",
    description: "Health and herbal capsules",
    icon: "💊",
  },
  {
    name: "Powders",
    slug: "powders",
    description: "Protein and supplement powders",
    icon: "🥤",
  },
  {
    name: "Gummies",
    slug: "gummies",
    description: "Vitamin and herbal gummies",
    icon: "🍬",
  },
  {
    name: "Drinks",
    slug: "drinks",
    description: "Health drinks and juices",
    icon: "🧃",
  },
  {
    name: "Oral Care",
    slug: "oral-care",
    description: "Toothpaste and mouthwash",
    icon: "🦷",
  },
  {
    name: "Hair Care",
    slug: "hair-care",
    description: "Shampoo and treatments",
    icon: "💇",
  },
  {
    name: "Face Care",
    slug: "face-care",
    description: "Cleansers and moisturizers",
    icon: "✨",
  },
  {
    name: "Seeds",
    slug: "seeds",
    description: "Herbal and nutritional seeds",
    icon: "🌱",
  },
];

const featuredProducts = [
  {
    name: "Green Tea - 25 Bags",
    slug: "green-tea-25-bags",
    price: 5500,
    image: "/images/products/placeholder.jpg",
  },
  {
    name: "Moringa Capsules",
    slug: "moringa-capsules-60",
    price: 8000,
    image: "/images/products/placeholder.jpg",
  },
];

export default function MegaMenu() {
  return (
    <div className="absolute left-0 right-0 top-full mt-0 bg-white border-t border-gray-200 shadow-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Categories Grid - 9 columns */}
          <div className="col-span-9">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Shop by Category
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="group p-4 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">
                      {category.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-charcoal group-hover:text-green-900 transition-colors mb-1">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-1">
                        {category.description}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-green-900 font-semibold hover:text-green-700 transition-colors"
              >
                View All Products
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Featured Products Sidebar - 3 columns */}
          <div className="col-span-3 border-l border-gray-200 pl-8">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Featured Products
              </h3>
            </div>

            <div className="space-y-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group block p-3 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl">🌿</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-charcoal group-hover:text-green-900 transition-colors mb-1 line-clamp-2">
                        {product.name}
                      </div>
                      <div className="text-green-900 font-bold">
                        ₦{product.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Promo Banner */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm font-semibold text-green-900 mb-1">
                Special Offer
              </div>
              <div className="text-sm text-gray-700">
                Free delivery on orders over ₦20,000
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
