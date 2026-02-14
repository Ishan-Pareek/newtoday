import { useState, useEffect, useRef, useCallback } from "react";

const POLL_INTERVAL_MS = 60 * 1000; // 60 seconds

// Map UI categories to NewsAPI category parameter (or null for "All")
const CATEGORY_MAP = {
  All: null,
  Tech: "technology",
  Sports: "sports",
  World: "general",
  Business: "business",
};

/**
 * Normalize NewsAPI article into a stable shape with a unique id.
 * Deduplication is done by url (or title+publishedAt fallback).
 */
function normalizeArticle(article, index) {
  const id = article.url || `article-${article.publishedAt}-${index}`;
  return {
    id,
    title: article.title || "Untitled",
    sourceName: article.source?.name || "Unknown",
    image: article.urlToImage || null,
    publishedAt: article.publishedAt,
    url: article.url || "#",
  };
}

/**
 * Fetch top headlines from NewsAPI.
 * Uses VITE_NEWS_API_KEY. Requires country=us (or similar) for top-headlines.
 */
async function fetchHeadlines(apiKey, category) {
  const params = new URLSearchParams({
    country: "us",
    pageSize: "24",
    apiKey: apiKey,
  });
  if (category) params.set("category", category);

  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?${params.toString()}`
  );
  const data = await res.json();

  if (data.status !== "ok") {
    throw new Error(data.message || "News API request failed");
  }

  const seen = new Set();
  const articles = (data.articles || [])
    .filter((a) => a.title && a.url)
    .map((a, i) => normalizeArticle(a, i))
    .filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });

  return articles;
}

/**
 * Custom hook: fetch news from NewsAPI, auto-refresh every 60s, cleanup on unmount.
 * Returns { articles, loading, error, lastUpdated, hasNewNews, dismissNewBadge }.
 */
export function useNews(category) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasNewNews, setHasNewNews] = useState(false);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  const categoryParam = CATEGORY_MAP[category] ?? null;

  const load = useCallback(async () => {
    if (!apiKey?.trim()) {
      setError("Missing API key. Set VITE_NEWS_API_KEY in .env");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await fetchHeadlines(apiKey, categoryParam);
      if (!isMountedRef.current) return;

      setArticles(data);
      setLastUpdated(new Date());
      setHasNewNews(true);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err.message || "Failed to load news");
      setArticles((prev) => (prev.length ? prev : []));
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [apiKey, categoryParam]);

  // Initial fetch and set up 60s polling; clear interval on unmount
  useEffect(() => {
    isMountedRef.current = true;
    setLoading(true);
    load();

    intervalRef.current = setInterval(() => {
      load();
    }, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [load]);

  const dismissNewBadge = useCallback(() => setHasNewNews(false), []);

  return {
    articles,
    loading,
    error,
    lastUpdated,
    hasNewNews,
    dismissNewBadge,
  };
}
