import { useCallback, useRef } from "react";

export function useScrollSelectedArticle(onSelect: (id: string) => void) {
  const articleElementsRef = useRef(new Map<string, HTMLElement>());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const selectArticle = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  const advanceToArticle = useCallback((id: string) => {
    onSelect(id);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollArticleToTop(id);
      });
    });
  }, [onSelect]);

  function setArticleElement(id: string, element: HTMLElement | null): void {
    if (element) {
      articleElementsRef.current.set(id, element);
      return;
    }

    articleElementsRef.current.delete(id);
  }

  function setScrollContainer(element: HTMLDivElement | null): void {
    scrollContainerRef.current = element;
  }

  function scrollArticleToTop(id: string): void {
    const scrollContainer = scrollContainerRef.current;
    const articleElement = articleElementsRef.current.get(id);

    if (!scrollContainer || !articleElement) {
      return;
    }

    const nextTop =
      scrollContainer.scrollTop + articleElement.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top;

    scrollContainer.scrollTo({
      top: Math.max(nextTop, 0),
      behavior: "smooth"
    });
  }

  return {
    advanceToArticle,
    setArticleElement,
    setScrollContainer,
    selectArticle
  };
}
