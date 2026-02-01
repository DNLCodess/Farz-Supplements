import Link from "next/link";
import { PackageX, Home, Search } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageX className="w-8 h-8 text-neutral-600" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-medium text-neutral-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-base text-neutral-600 mb-6">
            We couldn&apos;t find the product you&apos;re looking for. It may
            have been removed or is no longer available.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors font-medium"
            >
              <Search className="w-5 h-5" />
              Browse Products
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-900 border-2 border-neutral-900 rounded-md hover:bg-neutral-50 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
