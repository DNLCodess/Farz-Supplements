import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getProductReviews, getProductRatingSummary } from "@/lib/reviews";
import ProductDetailClient from "./client";

// Use dynamic rendering with revalidation for fresh data
export const revalidate = 300; // Revalidate every 5 minutes

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const imageUrl = product.images?.[0]?.url || "/images/placeholder.jpg";
  const price = parseFloat(product.price);
  const availability = product.stock_quantity > 0 ? "InStock" : "OutOfStock";

  return {
    title: product.meta_title || `${product.name} | Farz Supplements`,
    description:
      product.meta_description ||
      product.short_description ||
      product.description?.slice(0, 160) ||
      `Buy ${product.name} at Farz Supplements. Premium quality herbal supplements.`,
    keywords: [
      product.name,
      product.category?.name,
      "supplements",
      "herbal supplements",
      "Nigeria",
      "health",
      "wellness",
    ].filter(Boolean),
    openGraph: {
      title: product.name,
      description:
        product.short_description || product.description?.slice(0, 160),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
      siteName: "Farz Supplements",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description:
        product.short_description || product.description?.slice(0, 160),
      images: [imageUrl],
    },
    other: {
      "product:price:amount": price.toFixed(2),
      "product:price:currency": "NGN",
      "product:availability": availability,
      "product:condition": "new",
    },
  };
}

// Generate JSON-LD structured data for SEO
function generateProductJsonLd(product, ratingSummary) {
  const imageUrl = product.images?.[0]?.url || "/images/placeholder.jpg";
  const price = parseFloat(product.price);
  const compareAtPrice = product.compare_at_price
    ? parseFloat(product.compare_at_price)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.short_description,
    image: product.images?.map((img) => img.url) || [imageUrl],
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "Farz Supplements",
    },
    offers: {
      "@type": "Offer",
      url: `https://farzsupplements.com/products/${product.slug}`,
      priceCurrency: "NGN",
      price: price.toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      availability:
        product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  // Add rating if available
  if (ratingSummary && ratingSummary.total_reviews > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingSummary.average_rating.toFixed(1),
      reviewCount: ratingSummary.total_reviews,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return jsonLd;
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  // Fetch product data
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related data in parallel with error handling
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

  const jsonLd = generateProductJsonLd(product, ratingSummary);

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
