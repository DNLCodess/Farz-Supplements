"use client";

import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export default function AddToCartButton({
  onClick,
  isLoading = false,
  disabled = false,
  children,
  className = "",
  variant = "primary",
}) {
  const variants = {
    primary:
      "bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-400",
    secondary:
      "bg-white text-neutral-900 border-2 border-neutral-900 hover:bg-neutral-50 disabled:border-neutral-400 disabled:text-neutral-400",
    outline:
      "bg-transparent text-neutral-900 border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 disabled:border-neutral-300 disabled:text-neutral-400",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2
        px-6 py-3 rounded-md
        font-medium text-sm
        transition-all duration-200
        disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2
        ${variants[variant]}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <span>Adding...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
