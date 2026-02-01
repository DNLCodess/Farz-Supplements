import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

export const metadata = {
  title: {
    default: "Shop Natural Health Products",
    template: "%s | Farz Supplements",
  },
  description:
    "Browse our collection of premium herbal supplements, teas, capsules, and wellness products.",
};

export default function ShopLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 relative z-0">{children}</main>
      <Footer />
    </div>
  );
}
