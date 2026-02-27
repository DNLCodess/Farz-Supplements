"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X, Clock, ArrowRight, Loader2 } from "lucide-react";
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
  placeholder = "Search products…",
  autoFocus = false,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: suggestions = [], isLoading } =
    useSearchSuggestions(debouncedQuery);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    const q = searchQuery.trim();
    if (!q) return;
    addToSearchHistory(q);
    setSearchHistory(getSearchHistory());
    router.push(`/shop?q=${encodeURIComponent(q)}`);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  const handleRemoveHistoryItem = (e, q) => {
    e.stopPropagation();
    removeFromSearchHistory(q);
    setSearchHistory(getSearchHistory());
  };

  const showSuggestions = isOpen && query.length >= 2;
  const showHistory = isOpen && query.length === 0 && searchHistory.length > 0;
  const dropdownOpen = showSuggestions || showHistory;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* ── Input ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div
          className={`relative flex items-center transition-all duration-200 ${dropdownOpen ? "ring-2 ring-green-900/20" : ""}`}
        >
          {/* Search icon / spinner */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            {isLoading && query.length >= 2 ? (
              <Loader2 className="w-4 h-4 text-green-700 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-gray-400" />
            )}
          </div>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            className={`w-full pl-10 pr-9 py-2.5 text-[14px] bg-white border border-gray-200 text-stone-900 placeholder:text-gray-400 focus:outline-none focus:border-green-800 transition-colors duration-150 font-sans ${
              dropdownOpen
                ? "rounded-t-xl rounded-b-none border-b-transparent"
                : "rounded-xl"
            }`}
          />

          {/* Clear */}
        </div>
      </form>

      {/* ── Dropdown ────────────────────────────────────────────────── */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 border-t-0 rounded-b-xl shadow-lg z-[100] overflow-hidden">
          {/* Suggestions */}
          {showSuggestions && (
            <>
              {isLoading ? (
                <div className="px-4 py-5 flex items-center justify-center gap-2 text-[13px] text-gray-400 font-sans">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching…
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="px-4 pt-3 pb-1.5">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 font-sans">
                      Suggestions
                    </p>
                  </div>
                  <ul>
                    {suggestions.map((s, i) => (
                      <li key={i}>
                        <Link
                          href={`/shop/${s.slug}`}
                          onClick={() => {
                            addToSearchHistory(s.name);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors group"
                        >
                          <Search className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-600 transition-colors shrink-0" />
                          <span className="flex-1 text-[14px] text-stone-800 group-hover:text-green-900 transition-colors font-sans truncate">
                            {s.name}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-green-600 transition-all shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {/* View all */}
                  <div className="border-t border-gray-100 mx-3 mt-1" />
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full flex items-center justify-between px-4 py-3 text-[13px] font-semibold text-green-800 hover:bg-green-50 transition-colors font-sans group"
                  >
                    <span>
                      See all results for{" "}
                      <span className="text-green-900">
                        &ldquo;{query}&rdquo;
                      </span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              ) : (
                /* No results */
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 text-gray-200 mx-auto mb-2.5" />
                  <p className="text-[14px] font-semibold text-stone-700 font-sans">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[12px] text-gray-400 mt-1 font-sans">
                    Try a different keyword
                  </p>
                </div>
              )}
            </>
          )}

          {/* Recent searches */}
          {showHistory && (
            <>
              <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 font-sans">
                  Recent Searches
                </p>
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] font-semibold text-green-700 hover:text-green-900 transition-colors font-sans"
                >
                  Clear all
                </button>
              </div>
              <ul className="pb-1">
                {searchHistory.map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => handleSearch(item.query)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors group text-left"
                    >
                      <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="flex-1 text-[14px] text-stone-700 font-sans truncate">
                        {item.query}
                      </span>
                      <button
                        onClick={(e) => handleRemoveHistoryItem(e, item.query)}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
