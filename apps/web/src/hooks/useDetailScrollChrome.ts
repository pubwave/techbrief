import { useEffect, useRef, useState } from "react";

const NAV_REVEAL_DISTANCE = 40;

interface UseDetailScrollChromeOptions {
  articleId: string | undefined;
  detailElement: HTMLElement | null;
}

export function useDetailScrollChrome({
  articleId,
  detailElement
}: UseDetailScrollChromeOptions) {
  const [progress, setProgress] = useState(0);
  const [nearBottom, setNearBottom] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!detailElement) {
      return;
    }
    const detail = detailElement;

    function updateScrollState() {
      const maxScrollTop = detail.scrollHeight - detail.clientHeight;
      if (maxScrollTop <= 0) {
        setProgress(0);
        setNearBottom(false);
        return;
      }

      const nextProgress = Math.min(100, Math.max(0, (detail.scrollTop / maxScrollTop) * 100));
      const remaining = maxScrollTop - detail.scrollTop;

      setProgress(nextProgress);
      setNearBottom(remaining <= NAV_REVEAL_DISTANCE);
    }

    function handleScroll() {
      if (frameRef.current != null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        updateScrollState();
      });
    }

    const contentElement = detail.firstElementChild;
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            updateScrollState();
          });

    resizeObserver?.observe(detail);
    if (contentElement instanceof HTMLElement) {
      resizeObserver?.observe(contentElement);
    }

    updateScrollState();
    detail.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      detail.removeEventListener("scroll", handleScroll);
      resizeObserver?.disconnect();
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [articleId, detailElement]);

  useEffect(() => {
    setProgress(0);
    setNearBottom(false);
  }, [articleId]);

  return {
    progress,
    nearBottom
  };
}
