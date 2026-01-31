// Search history management with local storage
const SEARCH_HISTORY_KEY = "farz_search_history";
const MAX_HISTORY_ITEMS = 10;

/**
 * Get search history from local storage
 */
export function getSearchHistory() {
  if (typeof window === "undefined") return [];

  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error reading search history:", error);
    return [];
  }
}

/**
 * Add search query to history
 */
export function addToSearchHistory(query) {
  if (typeof window === "undefined" || !query || query.trim().length === 0)
    return;

  try {
    const history = getSearchHistory();
    const trimmedQuery = query.trim();

    // Remove if already exists (to move to top)
    const filtered = history.filter((item) => item.query !== trimmedQuery);

    // Add to beginning
    const updated = [
      {
        query: trimmedQuery,
        timestamp: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving search history:", error);
  }
}

/**
 * Clear search history
 */
export function clearSearchHistory() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing search history:", error);
  }
}

/**
 * Remove specific item from history
 */
export function removeFromSearchHistory(query) {
  if (typeof window === "undefined") return;

  try {
    const history = getSearchHistory();
    const filtered = history.filter((item) => item.query !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing from search history:", error);
  }
}

// Search filters management
const SEARCH_FILTERS_KEY = "farz_search_filters";

/**
 * Get saved search filters
 */
export function getSavedFilters() {
  if (typeof window === "undefined") return null;

  try {
    const filters = localStorage.getItem(SEARCH_FILTERS_KEY);
    return filters ? JSON.parse(filters) : null;
  } catch (error) {
    console.error("Error reading search filters:", error);
    return null;
  }
}

/**
 * Save search filters
 */
export function saveSearchFilters(filters) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SEARCH_FILTERS_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error("Error saving search filters:", error);
  }
}

/**
 * Clear search filters
 */
export function clearSearchFilters() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SEARCH_FILTERS_KEY);
  } catch (error) {
    console.error("Error clearing search filters:", error);
  }
}

// "Did you mean" suggestions using Levenshtein distance
export function calculateLevenshteinDistance(str1, str2) {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return track[str2.length][str1.length];
}

/**
 * Get "Did you mean" suggestions
 * @param {string} query - User's search query
 * @param {Array} availableTerms - Available product names/terms
 * @param {number} threshold - Maximum distance for suggestions (default: 3)
 */
export function getDidYouMeanSuggestions(query, availableTerms, threshold = 3) {
  if (!query || !availableTerms || availableTerms.length === 0) {
    return [];
  }

  const lowercaseQuery = query.toLowerCase();

  const suggestions = availableTerms
    .map((term) => ({
      term,
      distance: calculateLevenshteinDistance(
        lowercaseQuery,
        term.toLowerCase(),
      ),
    }))
    .filter((item) => item.distance > 0 && item.distance <= threshold)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3) // Top 3 suggestions
    .map((item) => item.term);

  return suggestions;
}

/**
 * Calculate relevance score for search results
 * Higher score = more relevant
 */
export function calculateRelevanceScore(product, searchQuery) {
  const query = searchQuery.toLowerCase().trim();
  const name = product.name.toLowerCase();
  const description = (product.description || "").toLowerCase();
  const sku = (product.sku || "").toLowerCase();

  let score = 0;

  // Exact name match - highest priority
  if (name === query) {
    score += 1000;
  }

  // Name starts with query
  else if (name.startsWith(query)) {
    score += 500;
  }

  // Query is in name
  else if (name.includes(query)) {
    score += 250;
  }

  // SKU match
  if (sku === query) {
    score += 200;
  } else if (sku.includes(query)) {
    score += 100;
  }

  // Description contains query
  if (description.includes(query)) {
    score += 50;
  }

  // Featured products get bonus
  if (product.is_featured) {
    score += 25;
  }

  // In stock products get bonus
  if (product.stock_quantity > 0) {
    score += 10;
  }

  // Word match count
  const queryWords = query.split(" ");
  const nameWords = name.split(" ");
  const matchingWords = queryWords.filter((word) =>
    nameWords.some((nameWord) => nameWord.includes(word)),
  ).length;
  score += matchingWords * 20;

  return score;
}

/**
 * Sort search results by relevance
 */
export function sortByRelevance(products, searchQuery) {
  if (!searchQuery) return products;

  return [...products].sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, searchQuery);
    const scoreB = calculateRelevanceScore(b, searchQuery);
    return scoreB - scoreA;
  });
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text, searchQuery) {
  if (!text || !searchQuery) return text;

  const query = searchQuery.trim();
  const regex = new RegExp(`(${query})`, "gi");

  return text.replace(
    regex,
    '<mark class="bg-green-100 text-green-900 font-medium">$1</mark>',
  );
}

/**
 * Format search query for display
 */
export function formatSearchQuery(query) {
  return query
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Parse filter parameters from URL
 */
export function parseFiltersFromURL(searchParams) {
  return {
    category: searchParams.get("category") || null,
    minPrice: searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice"))
      : null,
    maxPrice: searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice"))
      : null,
    inStock: searchParams.get("inStock") === "true" ? true : null,
    sortBy: searchParams.get("sortBy") || "relevance",
    query: searchParams.get("q") || "",
  };
}

/**
 * Build URL with filters
 */
export function buildFilterURL(filters) {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice !== null) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice !== null) params.set("maxPrice", filters.maxPrice);
  if (filters.inStock !== null) params.set("inStock", filters.inStock);
  if (filters.sortBy && filters.sortBy !== "relevance")
    params.set("sortBy", filters.sortBy);

  return params.toString() ? `?${params.toString()}` : "";
}
