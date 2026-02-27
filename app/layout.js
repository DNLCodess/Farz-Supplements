import { DM_Serif_Display, Instrument_Sans, Inter } from "next/font/google";
import QueryProvider from "@/lib/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const displayFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://https://farz-supplements.vercel.app/.ng"),
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
    url: "https://https://farz-supplements.vercel.app/.ng",
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
    canonical: "https://https://farz-supplements.vercel.app/.ng",
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
    <html
      lang="en"
      className={`${inter.variable} ${displayFont.variable} ${bodyFont.variable}`}
    >
      <body className="antialiased font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
