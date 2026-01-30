export const metadata = {
  title: "Home",
  description:
    "Shop premium herbal supplements and natural wellness products. Fast delivery across Nigeria. Browse teas, capsules, powders, and more.",
  openGraph: {
    title: "Farz Supplements - Natural Health & Wellness Products",
    description: "Premium herbal supplements for your health journey",
    url: "https://farzsupplements.com.ng",
  },
};

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-900 to-green-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Nature's Power. Your Health.
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8">
              Discover premium herbal supplements and natural wellness products
              for your health journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-900 font-semibold rounded-lg hover:bg-green-50 transition-colors"
              >
                Shop Now
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-900 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto">
              Browse our wide selection of natural health products
            </p>
          </div>

          {/* Category Grid - Content will be added */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {/* Category cards will be added here */}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-warm-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal mb-4">
              Why Choose Farz Supplements?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                100% Natural
              </h3>
              <p className="text-gray-700">
                Premium quality herbal supplements from trusted sources
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-700">
                2 days delivery within Lagos, 2 working days outside Lagos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Quality Assured
              </h3>
              <p className="text-gray-700">
                All products are carefully selected and quality tested
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
