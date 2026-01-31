import { Suspense } from "react";
import ProductsContent from "./client";
import SearchBar from "@/components/common/search-bar";
import Image from "next/image";

export const metadata = {
  title: "All Products",
  description:
    "Browse our complete collection of premium herbal supplements, teas, capsules, powders, and natural wellness products. Fast delivery across Nigeria.",
  openGraph: {
    title: "All Products | Farz Supplements",
    description: "Browse our complete collection of natural health products",
    url: "https://farzsupplements.com.ng/products",
  },
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search - REMOVED overflow-hidden */}
      <section className="relative border-b border-gray-200">
        {/* Background Image Container - ADD overflow-hidden here instead */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/bg/plants.jpg" // image in /public
            alt="Healthy natural products background"
            fill
            priority
            className="object-cover"
          />
          {/* Green Tint Overlay */}
          <div className="absolute inset-0 bg-green-900/50" />
        </div>

        {/* Content - ADD higher z-index for search dropdown */}
        <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Discover Natural Health Products
            </h1>

            <p className="text-lg text-green-50 mb-6">
              Browse our complete collection of premium supplements and wellness
              products
            </p>

            {/* SearchBar with explicit z-index context */}
            <div className="relative z-20">
              <SearchBar
                className="max-w-2xl mx-auto"
                placeholder="Search for products, categories, or ingredients..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Content with Filters */}
      <Suspense fallback={<ProductsLoadingState />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}

// Loading state for initial page load
function ProductsLoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Skeleton */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-4 w-full bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Skeleton */}
        <div className="lg:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
