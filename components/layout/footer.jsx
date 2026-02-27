import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-text.png"
                alt="Farz Supplements"
                width={48}
                height={48}
                className="w-12 h-12 lg:w-28 lg:h-28 object-contain"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Premium herbal supplements and wellness products for your natural
              health journey.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-base mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-base mb-4">Customer Service</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/returns"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-base mb-4">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href="tel:+2349123368239"
                  className="flex items-start gap-3 text-gray-300 hover:text-green-500 transition-colors group"
                >
                  <Phone className="w-5 h-5 shrink-0 mt-0.5 text-green-500 group-hover:text-green-400" />
                  <div>
                    <div className="font-medium text-white mb-1">Phone</div>
                    <div>+234 912 336 8239</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Mon-Sat: 9am - 6pm
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:farstore02@gmail.com"
                  className="flex items-start gap-3 text-gray-300 hover:text-green-500 transition-colors group"
                >
                  <Mail className="w-5 h-5 shrink-0 mt-0.5 text-green-500 group-hover:text-green-400" />
                  <div>
                    <div className="font-medium text-white mb-1">Email</div>
                    <div className="break-all">farstore02@gmail.com</div>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-green-500" />
                  <div>
                    <div className="font-medium text-white mb-1">Location</div>
                    <div>Lagos, Nigeria</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment & Trust Badges */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
              <span className="text-sm text-gray-400">We Accept:</span>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-gray-700 rounded text-xs font-medium">
                  Card
                </div>
                <div className="px-3 py-1.5 bg-gray-700 rounded text-xs font-medium">
                  Bank Transfer
                </div>
                <div className="px-3 py-1.5 bg-gray-700 rounded text-xs font-medium">
                  Pay on Delivery
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Secure Payment
              </span>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Quality Products
              </span>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Fast Delivery
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-400">
            <div className="text-center md:text-left">
              © {currentYear} Farz Supplements. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-xs">
              <Link
                href="/privacy-policy"
                className="hover:text-green-500 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-green-500 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className="hover:text-green-500 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/2349123368239"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center z-40 transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg
          className="w-7 h-7 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </footer>
  );
}
