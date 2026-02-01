"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";

export default function ProductError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Product page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-medium text-neutral-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-base text-neutral-600 mb-6">
            We encountered an error while loading this product. This might be a
            temporary issue.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors font-medium"
            >
              <RefreshCcw className="w-5 h-5" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-900 border-2 border-neutral-900 rounded-md hover:bg-neutral-50 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-neutral-100 rounded-md text-left">
              <p className="text-xs font-medium text-neutral-900 mb-2">
                Error Details (Development):
              </p>
              <pre className="text-xs text-neutral-700 overflow-x-auto">
                {error.message}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
