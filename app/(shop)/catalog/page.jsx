import CatalogPage from "./client";

export const metadata = {
  title: "Farz Supplements - Premium Natural Health Products in Nigeria",
  description:
    "Shop premium herbal supplements, teas, capsules, and wellness products. 100% natural ingredients. Fast delivery across Nigeria. Free shipping on orders over ₦20,000.",
  keywords: [
    "herbal supplements Nigeria",
    "natural health products",
    "herbal tea Lagos",
    "moringa capsules",
    "wellness products Nigeria",
    "organic supplements",
    "traditional medicine",
    "herbal remedies",
    "health supplements Lagos",
    "natural vitamins Nigeria",
  ],
  openGraph: {
    title: "Farz Supplements - Premium Natural Health Products",
    description:
      "Discover premium herbal supplements and wellness products. 100% natural, trusted by thousands of Nigerians.",
    type: "website",
    locale: "en_NG",
    siteName: "Farz Supplements",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Farz Supplements - Natural Health Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Farz Supplements - Premium Natural Health Products",
    description:
      "Shop premium herbal supplements and wellness products. Fast delivery across Nigeria.",
    images: ["/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://https://farz-supplements.vercel.app/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Farz Supplements",
  description:
    "Premium natural health products and herbal supplements in Nigeria",
  url: "https://https://farz-supplements.vercel.app/",
  potentialAction: {
    "@type": "SearchAction",
    target:
      "https://https://farz-supplements.vercel.app/products?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "Farz Supplements",
    logo: {
      "@type": "ImageObject",
      url: "https://https://farz-supplements.vercel.app/logo.png",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+2349123368239",
      contactType: "Customer Service",
      areaServed: "NG",
      availableLanguage: ["en"],
    },
  },
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CatalogPage />
    </>
  );
}
