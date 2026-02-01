"use client";

import { useState } from "react";
import { Share2, Check, Copy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareButton({ title, url, text = "", className = "" }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl =
    typeof window !== "undefined" ? window.location.origin + url : url;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: fullUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setShowMenu(true);
        }
      }
    } else {
      setShowMenu(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareLinks = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(title + " " + fullUrl)}`,
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className={`w-12 h-12 rounded-md border-2 border-neutral-300 hover:border-neutral-400 flex items-center justify-center text-neutral-600 transition-colors ${className}`}
        aria-label="Share product"
      >
        <Share2 className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
            />

            {/* Share Menu */}
            <motion.div
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-900">
                  Share this product
                </span>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-6 h-6 rounded hover:bg-neutral-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-neutral-600" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                {/* Social Links */}
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full px-4 py-2.5 rounded-md text-white text-sm font-medium transition-colors ${link.color}`}
                  >
                    Share on {link.name}
                  </a>
                ))}

                {/* Copy Link */}
                <button
                  onClick={copyToClipboard}
                  className="w-full px-4 py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
