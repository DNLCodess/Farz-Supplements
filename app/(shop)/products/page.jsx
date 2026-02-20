import { Suspense } from "react";
import ProductsContent from "./client";
import SearchBar from "@/components/common/search-bar";
import Image from "next/image";
import Link from "next/link";

const BASE_URL = "https://farz-supplements.vercel.app";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata = {
  title: "Natural Health Supplements | Shop All Products",
  description:
    "Shop premium herbal supplements, teas, capsules, and natural wellness products. 100% natural ingredients. Fast delivery across Nigeria. Trusted by thousands.",
  keywords: [
    "herbal supplements Nigeria",
    "natural health products",
    "wellness supplements",
    "herbal teas Nigeria",
    "natural capsules",
    "health supplements Lagos",
    "Farz Supplements",
    "buy supplements online Nigeria",
  ],
  alternates: {
    canonical: `${BASE_URL}/products`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Natural Health Supplements | Farz Supplements Nigeria",
    description:
      "Browse our complete collection of premium herbal supplements, teas, capsules, and natural wellness products. Fast delivery across Nigeria.",
    url: `${BASE_URL}/products`,
    siteName: "Farz Supplements",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/og/products.jpg`,
        width: 1200,
        height: 630,
        alt: "Farz Supplements – Premium Natural Health Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Natural Health Supplements | Farz Supplements Nigeria",
    description:
      "Shop premium herbal supplements and wellness products. Fast delivery across Nigeria.",
    images: [`${BASE_URL}/og/products.jpg`],
    site: "@farzsupplements",
  },
};

// ─── JSON-LD Structured Data ───────────────────────────────────────────────────

function ProductsJsonLd() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "All Products",
        item: `${BASE_URL}/products`,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Natural Health Supplements – All Products",
    description:
      "Browse our complete collection of premium herbal supplements, teas, capsules, and natural wellness products. Fast delivery across Nigeria.",
    url: `${BASE_URL}/products`,
    publisher: {
      "@type": "Organization",
      name: "Farz Supplements",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbSchema.itemListElement,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <ProductsJsonLd />

      {/* Hero Section with Search */}
      <section
        className="relative border-b border-gray-200"
        aria-label="Product search"
      >
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/bg/plants.jpg"
            alt="Natural herbal supplement ingredients"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-green-900/50" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto text-center">
            {/* Breadcrumb – visible to crawlers, visually subtle */}
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center justify-center gap-2 text-sm text-green-100/70">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-white font-medium">
                  All Products
                </li>
              </ol>
            </nav>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Natural Health Supplements
            </h1>

            <p className="text-lg text-green-50 mb-6">
              Premium herbal supplements, teas &amp; wellness products —
              delivered across Nigeria
            </p>

            <Suspense fallback={<SearchBarSkeleton />}>
              <div className="relative z-20">
                <SearchBar
                  className="max-w-2xl mx-auto"
                  placeholder="Search supplements, teas, capsules, ingredients..."
                />
              </div>
            </Suspense>
          </div>
        </div>
      </section>

      {/* Products Content */}
      <Suspense fallback={<ProductsLoadingState />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}

// ─── Skeletons ─────────────────────────────────────────────────────────────────

function SearchBarSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="w-full h-12 md:h-14 bg-white/20 rounded-lg animate-pulse" />
    </div>
  );
}

function ProductsLoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
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
