"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { useSearchSuggestions } from "@/hooks/use-products";
import {
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
} from "@/utils/search";
import { useDebounce } from "@/hooks/use-debounce";

export default function SearchBar({
  className = "",
  placeholder = "Search products...",
  autoFocus = false,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce query for API calls
  const debouncedQuery = useDebounce(query, 300);

  // Get suggestions from API
  const { data: suggestions = [], isLoading } =
    useSearchSuggestions(debouncedQuery);

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length === 0) return;

    // Add to history
    addToSearchHistory(trimmedQuery);
    setSearchHistory(getSearchHistory());

    // Navigate to search results
    router.push(`/products?q=${encodeURIComponent(trimmedQuery)}`);
    setIsOpen(false);

    // Blur input on mobile
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  const handleRemoveHistoryItem = (e, historyQuery) => {
    e.stopPropagation();
    removeFromSearchHistory(historyQuery);
    setSearchHistory(getSearchHistory());
  };

  const showSuggestions = isOpen && query.length >= 2 && suggestions.length > 0;
  const showHistory = isOpen && query.length === 0 && searchHistory.length > 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-12 pr-12 py-3 md:py-3.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          />

          {/* Search Icon */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown - Suggestions or History - FIXED Z-INDEX */}
      {(showSuggestions || showHistory) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && query.length >= 2 && (
            <div className="p-4 text-center text-gray-600">
              <div className="inline-block w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && !isLoading && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                Suggestions
              </div>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <Link
                      href={`/products/${suggestion.slug}`}
                      onClick={() => {
                        addToSearchHistory(suggestion.name);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors group"
                    >
                      <Search className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                      <span className="flex-1 text-charcoal group-hover:text-green-900">
                        {suggestion.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* View All Results */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-green-900 hover:bg-green-50 transition-colors flex items-center justify-between"
                >
                  <span>View all results for &quot;{query}&quot;</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Search History */}
          {showHistory && (
            <div>
              <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Recent Searches
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-green-900 hover:text-green-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              <ul>
                {searchHistory.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSearch(item.query)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group text-left"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 text-charcoal">{item.query}</span>
                      <button
                        onClick={(e) => handleRemoveHistoryItem(e, item.query)}
                        className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto mb-3" />
              </div>
              <p className="text-charcoal font-medium mb-1">
                No suggestions found
              </p>
              <p className="text-sm text-gray-600">
                Try searching for something else
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
