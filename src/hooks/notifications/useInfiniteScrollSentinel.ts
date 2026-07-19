import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  onIntersect: () => void;
  enabled: boolean;
  rootMargin?: string;
}

/**
 * Returns a ref to attach to a sentinel element at the bottom of a list.
 * When that element scrolls into view (with `rootMargin` as a lookahead
 * buffer, so the next page starts loading slightly before the user hits
 * the literal bottom), `onIntersect` fires. `enabled` should be
 * `hasNextPage && !isFetchingNextPage` from the infinite query — this hook
 * doesn't know anything about React Query itself, it's a plain DOM utility.
 */
export function useInfiniteScrollSentinel({
  onIntersect,
  enabled,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, rootMargin]);

  return sentinelRef;
}
