"use client";

import Link from "next/link";
import { Reveal } from "@/components/common/reveal";
import { useCategoriesWithCount } from "@/hooks/use-categories";

/* ─── Category icon map ─────────────────────────────────────────────────────
   Maps category slugs to a relevant emoji. Falls back to 🌿 if not matched.
   Extend as needed when new categories are added in the DB.
────────────────────────────────────────────────────────────────────────────── */
const CATEGORY_ICONS = {
  "herbal-supplements": "🌿",
  "immune-boosters": "🛡️",
  "beauty-skin-care": "✨",
  "weight-management": "⚖️",
  "fertility-products": "🌸",
  "detox-cleanse": "💧",
  "energy-vitality": "⚡",
  "diabetes-support": "🩺",
  "bone-joint-care": "🦴",
};

function getCategoryIcon(slug) {
  return CATEGORY_ICONS[slug] ?? "🌿";
}

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[80px] bg-stone-100 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}

/* ─── Single category card ──────────────────────────────────────────────── */
function CategoryCard({ cat }) {
  return (
    <Link
      href={`/shop?category=${cat.slug}`}
      className="group relative flex flex-col justify-between p-4 bg-white border border-stone-200 rounded-2xl hover:border-green-300 hover:shadow-sm transition-all duration-200 overflow-hidden min-h-[80px]"
    >
      {/* Hover fill */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <span className="text-xl leading-none">
          {getCategoryIcon(cat.slug)}
        </span>
        {cat.count > 0 && (
          <span className="text-[11px] font-semibold text-stone-400 group-hover:text-green-600 transition-colors font-sans tabular-nums">
            {cat.count}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-3">
        <span className="text-[13px] font-semibold text-stone-800 group-hover:text-green-900 transition-colors leading-tight font-sans">
          {cat.name}
        </span>
      </div>
    </Link>
  );
}

/* ─── Section ───────────────────────────────────────────────────────────── */
export function StorySection() {
  const { data: categories = [], isLoading } = useCategoriesWithCount();

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* ── Left: Story copy ── */}
        <Reveal>
          <p className="text-xl font-black tracking-[0.2em] uppercase text-green-600 mb-3 font-sans">
            Who We Are
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5 leading-snug font-display">
            Good health is the foundation of a fulfilling life
          </h2>
          <p className="text-[17px] text-stone-700 leading-relaxed mb-4 font-sans">
            Farz Supplements and Herbal Store was built on one belief: the
            answers to many health challenges lie in nature. We are a globally
            recognised retailer and wholesaler of premium supplements and herbal
            products, sourcing exclusively from the world&apos;s most trusted
            brands.
          </p>
          <p className="text-[17px] text-stone-700 leading-relaxed font-sans">
            We don&apos;t just sell products — we empower individuals to take
            charge of their health naturally and responsibly.
          </p>

          <Link
            href="/shop"
            className="hidden md:inline-flex items-center gap-2 mt-8 text-[14px] font-semibold text-green-700 hover:text-green-900 transition-colors font-sans group"
          >
            Browse all products
            <span className="group-hover:translate-x-1 transition-transform duration-150">
              →
            </span>
          </Link>
        </Reveal>

        {/* ── Right: Category grid ── */}
        <Reveal delay={80}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xl font-black tracking-[0.2em] uppercase text-green-600 font-sans">
              What We Offer
            </p>
            <Link
              href="/shop"
              className="text-lg font-semibold text-stone-400 hover:text-green-700 transition-colors font-sans"
            >
              View all →
            </Link>
          </div>

          {isLoading ? (
            <CategorySkeleton />
          ) : categories.length === 0 ? (
            <p className="text-[15px] text-stone-500 font-sans py-4">
              No categories available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} cat={cat} />
              ))}
            </div>
          )}

          <Link
            href="/products"
            className="md:hidden inline-flex items-center gap-2 mt-5 text-[14px] font-semibold text-green-700 hover:text-green-900 transition-colors font-sans group"
          >
            Browse all products
            <span className="group-hover:translate-x-1 transition-transform duration-150">
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
