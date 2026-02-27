import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getProductReviews, getProductRatingSummary } from "@/lib/reviews";
import ProductDetailClient from "./client";

const BASE_URL = "https://https://farz-supplements.vercel.app/.ng";

export const revalidate = 300;

// ─── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  console.log(product);
  if (!product) {
    return {
      title: "Product Not Found | Farz Supplements",
      description: "The requested product could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const imageUrl = product.images?.[0]?.url || `${BASE_URL}/og/default.jpg`;
  const inStock = product.stock_quantity > 0;
  const price = parseFloat(product.price);

  const title =
    product.meta_title || `${product.name} | Farz Supplements Nigeria`;

  const description =
    product.meta_description ||
    product.short_description ||
    `Buy ${product.name} online in Nigeria. ${product.description?.slice(0, 100) || "Premium quality herbal supplement."} Fast delivery across Nigeria.`;

  const keywords = [
    product.name,
    `${product.name} Nigeria`,
    `buy ${product.name} online`,
    product.category?.name,
    `${product.category?.name} supplements`,
    "herbal supplements Nigeria",
    "natural supplements",
    "Farz Supplements",
    "health",
    "wellness",
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/products/${slug}`,
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
      title,
      description,
      url: `${BASE_URL}/products/${slug}`,
      siteName: "Farz Supplements",
      locale: "en_NG",
      type: "website", // "product" type not in Next.js OG spec — "website" is correct
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${product.name} – Farz Supplements`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      site: "@farzsupplements",
    },
    // Open Graph product-specific tags (Facebook/Pinterest commerce)
    other: {
      "product:price:amount": price.toFixed(2),
      "product:price:currency": "NGN",
      "product:availability": inStock ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": "Farz Supplements",
      "product:category": product.category?.name || "Supplements",
    },
  };
}

// ─── JSON-LD ───────────────────────────────────────────────────────────────────

function generateProductJsonLd(product, ratingSummary) {
  const imageUrl = product.images?.[0]?.url || `${BASE_URL}/og/default.jpg`;
  const price = parseFloat(product.price);
  const inStock = product.stock_quantity > 0;

  // 30-day price validity
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.short_description,
    image: product.images?.map((img) => img.url) || [imageUrl],
    sku: product.sku,
    ...(product.barcode && { gtin: product.barcode }),
    brand: {
      "@type": "Brand",
      name: "Farz Supplements",
    },
    category: product.category?.name,
    url: `${BASE_URL}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${product.slug}`,
      priceCurrency: "NGN",
      price: price.toFixed(2),
      priceValidUntil,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Farz Supplements",
        url: BASE_URL,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          currency: "NGN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "NG",
        },
      },
    },
  };

  // Aggregate rating
  if (ratingSummary?.total_reviews > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingSummary.average_rating.toFixed(1),
      reviewCount: ratingSummary.total_reviews,
      bestRating: "5",
      worstRating: "1",
    };
  }

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
        name: "Products",
        item: `${BASE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category?.name || "Supplements",
        item: product.category?.slug
          ? `${BASE_URL}/products?category=${product.category.slug}`
          : `${BASE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${BASE_URL}/products/${product.slug}`,
      },
    ],
  };

  return { productSchema, breadcrumbSchema };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [relatedProducts, reviews, ratingSummary] = await Promise.allSettled([
    getRelatedProducts(product.id, product.category_id, 4),
    getProductReviews(product.id, { limit: 10, approved: true }),
    getProductRatingSummary(product.id),
  ]).then((results) => [
    results[0].status === "fulfilled" ? results[0].value : [],
    results[1].status === "fulfilled"
      ? results[1].value
      : { reviews: [], pagination: {}, hasMore: false },
    results[2].status === "fulfilled" ? results[2].value : null,
  ]);

  const { productSchema, breadcrumbSchema } = generateProductJsonLd(
    product,
    ratingSummary,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts || []}
        initialReviews={reviews}
        ratingSummary={ratingSummary}
      />
    </>
  );
}
