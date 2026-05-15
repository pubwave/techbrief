import { useEffect, useState } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

function readDesktopMatch() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(readDesktopMatch);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    function handleChange(event: MediaQueryListEvent) {
      setIsDesktop(event.matches);
    }

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDesktop;
}
