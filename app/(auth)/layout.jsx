import Footer from "@/components/layout/footer";
import Link from "next/link";

export const metadata = {
  title: {
    default: "Account",
    template: "%s | Farz Supplements",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Header - Logo only */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-xl">
                  F
                </span>
              </div>
              <div>
                <div className="font-bold text-green-900 text-lg md:text-xl">
                  Farz Supplements
                </div>
                <div className="text-xs text-gray-600 hidden sm:block">
                  Nature&lsquo;s Power. Your Health.
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center bg-warm-white py-12">
        <div className="w-full max-w-md px-4">{children}</div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
