import { Inter } from "next/font/google";
import QueryProvider from "@/lib/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://farzsupplements.com.ng"),
  title: {
    default: "Farz Supplements - Natural Health & Wellness Products",
    template: "%s | Farz Supplements",
  },
  description:
    "Premium herbal supplements and wellness products. Shop natural health solutions including teas, capsules, powders, and more. Fast delivery across Nigeria.",
  keywords: [
    "herbal supplements",
    "natural health",
    "wellness products",
    "Nigerian supplements",
    "health store",
    "vitamins",
    "herbal tea",
    "natural remedies",
  ],
  authors: [{ name: "Farz Supplements" }],
  creator: "Farz Supplements",
  publisher: "Farz Supplements",
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
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://farzsupplements.com.ng",
    siteName: "Farz Supplements",
    title: "Farz Supplements - Natural Health & Wellness Products",
    description:
      "Premium herbal supplements and wellness products for your health journey.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Farz Supplements",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Farz Supplements - Natural Health & Wellness Products",
    description:
      "Premium herbal supplements and wellness products for your health journey.",
    images: ["/images/og-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://farzsupplements.com.ng",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#2D5016",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-inter">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
