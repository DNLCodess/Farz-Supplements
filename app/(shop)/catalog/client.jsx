"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, Shield, Truck, Award } from "lucide-react";
import SearchBarWrapper from "@/components/common/search-bar-wrapper";
import { useCategories } from "@/hooks/use-categories";
import { useFeaturedProducts } from "@/hooks/use-products";
import ProductCard from "@/components/shared/product/card";

// Hero Section
function HeroSection() {
  return (
    <section className="relative bg-linear-to-br from-green-50 via-white to-green-50 overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Natural Wellness,{" "}
                <span className="text-green-900">Delivered to You</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-xl">
                Premium herbal supplements crafted from nature&apos;s finest
                ingredients. Trusted by Nigerians for quality and authenticity.
              </p>
            </div>

            {/* Search Bar with Suspense */}
            <div className="max-w-2xl">
              <SearchBarWrapper
                placeholder="Search for supplements, teas, wellness products..."
                className="w-full"
              />
              <p className="mt-3 text-sm text-gray-600">
                Popular searches:{" "}
                <Link
                  href="/products?q=moringa"
                  className="text-green-900 hover:underline font-medium"
                >
                  Moringa
                </Link>
                ,{" "}
                <Link
                  href="/products?q=green tea"
                  className="text-green-900 hover:underline font-medium"
                >
                  Green Tea
                </Link>
                ,{" "}
                <Link
                  href="/products?q=ginger"
                  className="text-green-900 hover:underline font-medium"
                >
                  Ginger
                </Link>
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-green-900" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">100%</div>
                  <div className="text-xs text-gray-600">Natural</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-900" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    Certified
                  </div>
                  <div className="text-xs text-gray-600">Quality</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-green-900" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">2 Days</div>
                  <div className="text-xs text-gray-600">Delivery</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-green-900" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">500+</div>
                  <div className="text-xs text-gray-600">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/bg/bg-3.jpg"
                alt="Natural wellness supplements and herbal products"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-green-200 rounded-full blur-3xl opacity-30 -z-10" />
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-green-300 rounded-full blur-3xl opacity-20 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Categories Section
function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();

  // Show first 6 categories
  const displayCategories = categories.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of natural health products
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-green-900"
            >
              {/* Category Icon/Image */}
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-200">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    "🌿"
                  )}
                </div>
              </div>

              {/* Category Name */}
              <h3 className="text-center font-bold text-gray-900 group-hover:text-green-900 transition-colors text-sm lg:text-base">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-base"
          >
            View All Categories
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Featured Products Section
function FeaturedProductsSection() {
  const { data: products = [], isLoading } = useFeaturedProducts(8);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular and trusted wellness products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-900 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors text-base"
          >
            Explore All Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-green-900 to-green-800 text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-lg lg:text-xl text-green-50 max-w-2xl mx-auto leading-relaxed">
            Join thousands of Nigerians who trust Farz Supplements for their
            natural health needs. Free delivery on orders over ₦20,000.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/products"
              className="w-full sm:w-auto px-8 py-4 bg-white text-green-900 font-bold rounded-xl hover:bg-green-50 transition-colors text-base inline-flex items-center justify-center gap-2"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-green-900 transition-all text-base"
            >
              Learn More About Us
            </Link>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-green-700">
            <div>
              <div className="text-3xl font-bold mb-1">2 Days</div>
              <div className="text-green-100 text-sm">
                Fast Delivery in Lagos
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-green-100 text-sm">Natural Ingredients</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-green-100 text-sm">Satisfied Customers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main Page Component
export default function CatalogPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <Suspense fallback={<CategoriesSection />}>
        <CategoriesSection />
      </Suspense>
      <Suspense fallback={<FeaturedProductsSection />}>
        <FeaturedProductsSection />
      </Suspense>
      <CTASection />
    </main>
  );
}
