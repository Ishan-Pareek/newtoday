import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ----- Animation config (easy to tune for 60fps feel) -----
const DURATION = 0.5;
const STAGGER = 0.06;
const Y_OFFSET = 40;
const EASE = "power2.out";

/**
 * Animate cards in: slide up from bottom + fade in, staggered.
 * Call after DOM has been updated with new card elements.
 * @param {HTMLCollection | NodeList | Array} elements - Card wrapper elements (e.g. grid children)
 * @returns {gsap.core.Tween | null} - Timeline or tween for optional cleanup
 */
export function animateCardsIn(elements) {
  if (!elements?.length) return null;

  gsap.set(elements, { opacity: 0, y: Y_OFFSET, force3D: true });

  return gsap.to(elements, {
    opacity: 1,
    y: 0,
    duration: DURATION,
    stagger: STAGGER,
    ease: EASE,
    overwrite: "auto",
    clearProps: "transform",
  });
}

/**
 * Animate cards out: slide down + fade out, staggered (reverse order for polish).
 * onComplete is called when the animation finishes.
 * @param {HTMLCollection | NodeList | Array} elements - Card wrapper elements
 * @param {() => void} onComplete - Callback when exit animation completes
 * @returns {gsap.core.Tween | null}
 */
export function animateCardsOut(elements, onComplete) {
  if (!elements?.length) {
    onComplete?.();
    return null;
  }

  const arr = Array.from(elements);
  const reversed = arr.reverse();

  return gsap.to(reversed, {
    opacity: 0,
    y: Y_OFFSET,
    duration: DURATION * 0.8,
    stagger: STAGGER * 0.5,
    ease: "power2.in",
    overwrite: "auto",
    onComplete,
  });
}

/**
 * Set up scroll-triggered animation: cards animate when grid enters viewport.
 * If the grid is already in view on load, animates immediately; otherwise on scroll.
 * Call when grid has been updated (e.g. after displayedArticles is set).
 * @param {React.RefObject<HTMLElement>} containerRef - Ref to the grid container
 * @returns {() => void} - Cleanup function to kill ScrollTrigger instances
 */
export function setupScrollAnimations(containerRef) {
  const el = containerRef?.current;
  if (!el || !el.children?.length) return () => {};

  const children = el.children;
  gsap.set(children, { opacity: 0, y: Y_OFFSET, force3D: true });

  const runEnter = () => animateCardsIn(children);

  const rect = el.getBoundingClientRect();
  const isInView = rect.top < (typeof window !== "undefined" ? window.innerHeight : 9999);

  if (isInView) {
    runEnter();
    return () => {};
  }

  const st = ScrollTrigger.create({
    trigger: el,
    start: "top 95%",
    once: true,
    onEnter: runEnter,
  });

  return () => {
    st.kill();
  };
}

/**
 * Set up hover animation for a card: slight scale + soft shadow.
 * Call from NewsCard with a ref to the card element; returns cleanup.
 * Uses GSAP quickTo for smooth 60fps hover.
 * @param {React.RefObject<HTMLElement>} cardRef - Ref to the card root element
 * @returns {() => void} - Cleanup (kill tweens)
 */
export function setupCardHover(cardRef) {
  const el = cardRef?.current;
  if (!el) return () => {};

  const scaleUp = gsap.quickTo(el, "scale", { duration: 0.25, ease: "power2.out" });
  const boxShadow = gsap.quickTo(el, "boxShadow", { duration: 0.25, ease: "power2.out" });

  const defaultShadow = getComputedStyle(el).boxShadow || "none";

  const onEnter = () => {
    scaleUp(1.02);
    boxShadow("0 12px 40px rgba(0,0,0,0.08)");
  };

  const onLeave = () => {
    scaleUp(1);
    boxShadow(defaultShadow);
  };

  el.addEventListener("mouseenter", onEnter);
  el.addEventListener("mouseleave", onLeave);

  return () => {
    el.removeEventListener("mouseenter", onEnter);
    el.removeEventListener("mouseleave", onLeave);
    gsap.killTweensOf(el);
  };
}

/**
 * Kill any running tweens on elements to avoid conflicts on re-render/category change.
 * @param {HTMLCollection | NodeList | Array} elements
 */
export function killCardTweens(elements) {
  if (!elements?.length) return;
  gsap.killTweensOf(elements);
}
