import { useCallback, useEffect, useLayoutEffect, useState } from "react";

const BOTTOM_EPSILON = 1;

interface UseDetailScrollRelayOptions {
  articleId: string | undefined;
  canAdvanceToNext: boolean;
}

export function useDetailScrollRelay({
  articleId,
  canAdvanceToNext
}: UseDetailScrollRelayOptions) {
  const [detailElement, setDetailElement] = useState<HTMLElement | null>(null);
  const [showAdvanceHint, setShowAdvanceHint] = useState(false);

  useEffect(() => {
    if (!detailElement || window.innerWidth < 768) {
      return;
    }
    const detail = detailElement;

    function handleScroll(): void {
      const canScrollDown =
        detail.scrollTop + detail.clientHeight < detail.scrollHeight - BOTTOM_EPSILON;
      setShowAdvanceHint(canAdvanceToNext && !canScrollDown);
    }

    function handleWheel(event: WheelEvent): void {
      const canScroll = detail.scrollHeight > detail.clientHeight + BOTTOM_EPSILON;
      if (!canScroll) {
        event.preventDefault();
        return;
      }

      const isScrollingDown = event.deltaY > 0;
      const isScrollingUp = event.deltaY < 0;
      const atBottom =
        detail.scrollTop + detail.clientHeight >= detail.scrollHeight - BOTTOM_EPSILON;
      const atTop = detail.scrollTop <= BOTTOM_EPSILON;

      if ((isScrollingDown && atBottom) || (isScrollingUp && atTop)) {
        event.preventDefault();
      }
    }

    handleScroll();
    detail.addEventListener("scroll", handleScroll, { passive: true });
    detail.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      detail.removeEventListener("scroll", handleScroll);
      detail.removeEventListener("wheel", handleWheel);
    };
  }, [articleId, canAdvanceToNext, detailElement]);

  useLayoutEffect(() => {
    if (!detailElement) {
      return;
    }
    const detail = detailElement;

    detail.scrollTop = 0;
    setShowAdvanceHint(false);
  }, [articleId, detailElement]);

  const detailRef = useCallback((element: HTMLElement | null) => {
    setDetailElement(element);
  }, []);

  return {
    detailElement,
    detailRef,
    showAdvanceHint
  };
}
