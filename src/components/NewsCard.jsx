import React, { memo, useRef, useEffect } from "react";
import { setupCardHover } from "../animations/gsapAnimations";

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NewsCard({ article, liked, onToggleLike }) {
  const cardRef = useRef(null);
  const { id, title, sourceName, image, publishedAt, url } = article;

  useEffect(() => {
    return setupCardHover(cardRef);
  }, []);

  return (
    <article ref={cardRef} className="card" role="listitem">
      {image && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="card-image-link">
          <img src={image} alt="" className="card-image" loading="lazy" />
        </a>
      )}
      <div className="card-body">
        <span className="card-source">{sourceName}</span>
        <h2 className="card-title">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </h2>
        <time className="card-date" dateTime={publishedAt}>
          {formatDate(publishedAt)}
        </time>
        <div className="card-actions">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="read-more"
          >
            Read more
          </a>
          <button
            type="button"
            className={liked ? "like liked" : "like"}
            onClick={() => onToggleLike(id)}
            aria-pressed={liked}
            aria-label={liked ? "Unlike article" : "Like article"}
          >
            {liked ? "♥ Liked" : "♡ Like"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(NewsCard);
