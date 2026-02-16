"use client";

import Link from "next/link";

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
    <div className="absolute left-0 right-0 w-full bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Categories Grid - 9 columns */}
          <div className="col-span-9">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">
              Shop by Category
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="group p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0">{category.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 group-hover:text-green-900 transition-colors mb-0.5">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {category.description}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Link */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-900 hover:text-green-700 transition-colors"
              >
                View All Products
                <svg
                  className="w-4 h-4"
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
          <div className="col-span-3 border-l border-gray-100 pl-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">
              Featured Products
            </h3>

            <div className="space-y-3">
              {featuredProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg shrink-0 flex items-center justify-center border border-gray-100">
                      <span className="text-2xl">🌿</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 group-hover:text-green-900 transition-colors mb-1 line-clamp-2">
                        {product.name}
                      </div>
                      <div className="text-green-900 font-semibold">
                        ₦{product.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Promo Banner */}
          </div>
        </div>
      </div>
    </div>
  );
}
