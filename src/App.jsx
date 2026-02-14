import React, { useState, useCallback, useEffect, useRef } from "react";
import NewsCard from "./components/NewsCard";
import NewsCardSkeleton from "./components/NewsCardSkeleton";
import { useNews } from "./hooks/useNews";
import {
  animateCardsIn,
  animateCardsOut,
  setupScrollAnimations,
  killCardTweens,
} from "./animations/gsapAnimations";
import "./App.css";

const CATEGORIES = ["All", "Tech", "Sports", "World", "Business"];
const SKELETON_COUNT = 8;

function formatLastUpdated(date) {
  if (!date) return null;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedIds, setLikedIds] = useState(() => new Set());
  // Displayed articles: synced from API, or held during category transition for exit animation
  const [displayedArticles, setDisplayedArticles] = useState([]);

  const gridRef = useRef(null);
  const prevCategoryRef = useRef(null);
  const latestArticlesRef = useRef([]);
  const isExitingRef = useRef(false);
  const scrollCleanupRef = useRef(null);

  const {
    articles,
    loading,
    error,
    lastUpdated,
    hasNewNews,
    dismissNewBadge,
  } = useNews(activeCategory);

  latestArticlesRef.current = articles;

  // Sync displayed articles when not in category transition (initial load + 60s refresh)
  useEffect(() => {
    if (isExitingRef.current) return;
    if (articles.length && activeCategory === prevCategoryRef.current) {
      setDisplayedArticles(articles);
    }
  }, [articles, activeCategory]);

  // Initialize displayed articles and prev category on first load
  useEffect(() => {
    if (prevCategoryRef.current === null) {
      prevCategoryRef.current = activeCategory;
      if (articles.length) setDisplayedArticles(articles);
    }
  }, [articles, activeCategory]);

  // Category change: animate out current cards, then show new category's articles
  useEffect(() => {
    if (prevCategoryRef.current === null) return;
    if (prevCategoryRef.current === activeCategory) return;

    const els = gridRef.current?.children;
    isExitingRef.current = true;

    if (els?.length) {
      killCardTweens(els);
      animateCardsOut(els, () => {
        setDisplayedArticles(latestArticlesRef.current);
        prevCategoryRef.current = activeCategory;
        isExitingRef.current = false;
      });
    } else {
      setDisplayedArticles(latestArticlesRef.current);
      prevCategoryRef.current = activeCategory;
      isExitingRef.current = false;
    }
  }, [activeCategory]);

  // When displayed articles are set, run enter animation (stagger in) or setup scroll trigger
  useEffect(() => {
    if (!displayedArticles.length) {
      scrollCleanupRef.current?.();
      scrollCleanupRef.current = null;
      return;
    }

    const grid = gridRef.current;
    if (!grid?.children?.length) return;

    scrollCleanupRef.current?.();

    const raf = requestAnimationFrame(() => {
      scrollCleanupRef.current = setupScrollAnimations(gridRef);
    });

    return () => {
      cancelAnimationFrame(raf);
      scrollCleanupRef.current?.();
      scrollCleanupRef.current = null;
    };
  }, [displayedArticles]);

  const toggleLike = useCallback((id) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const showSkeleton = loading && displayedArticles.length === 0;
  const showGrid = displayedArticles.length > 0 && !error;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <h1>newToday</h1>
          <div className="header-meta">
            {lastUpdated && (
              <span className="last-updated">
                Last updated {formatLastUpdated(lastUpdated)}
                {hasNewNews && (
                  <button
                    type="button"
                    className="new-badge"
                    onClick={dismissNewBadge}
                    aria-label="New news available"
                  >
                    New
                  </button>
                )}
              </span>
            )}
          </div>
        </div>
      </header>

      <nav className="categories" role="tablist" aria-label="News categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat}
            className={activeCategory === cat ? "active" : ""}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      <main className="main">
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {showSkeleton && (
          <div className="grid" role="list" aria-busy="true">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        )}

        {showGrid && (
          <div className="grid" ref={gridRef} role="list">
            {displayedArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                liked={likedIds.has(article.id)}
                onToggleLike={toggleLike}
              />
            ))}
          </div>
        )}

        {!loading && !displayedArticles.length && !error && (
          <p className="empty-state">No headlines for this category right now.</p>
        )}
      </main>
    </div>
  );
}
