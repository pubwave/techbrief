import { useEffect, useState } from "react";
import {
  DEFAULT_TWEAKS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  LIST_WIDTH_MAX,
  LIST_WIDTH_MIN,
  type CardStyle,
  type TweaksState
} from "../components/tweaks";

const storageKey = "techbrief.web.tweaks";
const CARD_STYLES: CardStyle[] = ["compact", "comfortable", "magazine"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readStoredTweaks(): TweaksState {
  if (typeof window === "undefined") {
    return DEFAULT_TWEAKS;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return DEFAULT_TWEAKS;
    }

    const parsed = JSON.parse(raw) as Partial<TweaksState>;
    return {
      cardStyle: CARD_STYLES.includes(parsed.cardStyle as CardStyle)
        ? (parsed.cardStyle as CardStyle)
        : DEFAULT_TWEAKS.cardStyle,
      fontSize: typeof parsed.fontSize === "number"
        ? clamp(parsed.fontSize, FONT_SIZE_MIN, FONT_SIZE_MAX)
        : DEFAULT_TWEAKS.fontSize,
      listWidth: typeof parsed.listWidth === "number"
        ? clamp(parsed.listWidth, LIST_WIDTH_MIN, LIST_WIDTH_MAX)
        : DEFAULT_TWEAKS.listWidth
    };
  } catch {
    return DEFAULT_TWEAKS;
  }
}

export function useTweaks() {
  const [tweaks, setTweaks] = useState<TweaksState>(readStoredTweaks);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(tweaks));
  }, [tweaks]);

  return { tweaks, setTweaks };
}
