"use client";

import { Suspense } from "react";
import SearchBar from "@/components/common/search-bar";

// Fallback component while search bar loads
function SearchBarFallback() {
  return (
    <div className="w-full">
      <div className="relative">
        <div className="w-full h-14 bg-white border-2 border-gray-300 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function SearchBarWrapper({ placeholder, className }) {
  return (
    <Suspense fallback={<SearchBarFallback />}>
      <SearchBar placeholder={placeholder} className={className} />
    </Suspense>
  );
}
