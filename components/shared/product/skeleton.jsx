export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumbs Skeleton */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 bg-neutral-200 rounded w-64 animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-200 rounded-lg animate-pulse" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-neutral-200 rounded-md animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div className="h-4 bg-neutral-200 rounded w-32 animate-pulse" />
            <div className="space-y-3">
              <div className="h-10 bg-neutral-200 rounded w-3/4 animate-pulse" />
              <div className="h-10 bg-neutral-200 rounded w-2/3 animate-pulse" />
            </div>
            <div className="h-6 bg-neutral-200 rounded w-48 animate-pulse" />
            <div className="h-12 bg-neutral-200 rounded w-40 animate-pulse" />
            <div className="h-10 bg-neutral-200 rounded w-32 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded w-5/6 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-neutral-200 rounded-md animate-pulse" />
              <div className="w-12 h-12 bg-neutral-200 rounded-md animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-neutral-200 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="mt-12 lg:mt-16">
          <div className="bg-white rounded-lg border border-neutral-200 p-6 lg:p-8">
            <div className="h-8 bg-neutral-200 rounded w-48 mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded w-5/6 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Reviews Skeleton */}
        <div className="mt-12 lg:mt-16">
          <div className="bg-white rounded-lg border border-neutral-200 p-6 lg:p-8">
            <div className="h-8 bg-neutral-200 rounded w-56 mb-6 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="h-12 bg-neutral-200 rounded w-24 animate-pulse" />
                <div className="h-6 bg-neutral-200 rounded w-32 animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-40 animate-pulse" />
              </div>
              <div className="md:col-span-2 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 bg-neutral-200 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-12 lg:mt-16">
          <div className="h-8 bg-neutral-200 rounded w-56 mb-6 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
                <div className="h-6 bg-neutral-200 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
