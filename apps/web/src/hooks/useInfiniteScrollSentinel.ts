import { useEffect, useRef } from "react";

interface UseInfiniteScrollSentinelInput {
  disabled?: boolean;
  rootRef?: React.RefObject<Element | null>;
  onReachEnd: () => void;
}

export function useInfiniteScrollSentinel({
  disabled = false,
  rootRef,
  onReachEnd
}: UseInfiniteScrollSentinelInput) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onReachEndRef = useRef(onReachEnd);
  const wasIntersectingRef = useRef(false);

  useEffect(() => {
    onReachEndRef.current = onReachEnd;
  }, [onReachEnd]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || disabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);

        if (!isIntersecting) {
          wasIntersectingRef.current = false;
          return;
        }

        if (!wasIntersectingRef.current) {
          wasIntersectingRef.current = true;
          onReachEndRef.current();
        }
      },
      {
        root: rootRef?.current ?? null,
        rootMargin: "240px 0px"
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [disabled, rootRef]);

  return sentinelRef;
}
