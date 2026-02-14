import React from "react";

/**
 * Skeleton placeholder for a news card while loading.
 * Matches NewsCard layout for a smooth transition.
 */
export default function NewsCardSkeleton() {
  return (
    <article className="card card-skeleton" aria-hidden="true">
      <div className="card-skeleton-image" />
      <div className="card-body">
        <span className="card-skeleton-line card-skeleton-source" />
        <span className="card-skeleton-line card-skeleton-title" />
        <span className="card-skeleton-line card-skeleton-date" />
        <div className="card-actions card-skeleton-actions">
          <span className="card-skeleton-line card-skeleton-cta" />
          <span className="card-skeleton-line card-skeleton-btn" />
        </div>
      </div>
    </article>
  );
}
