export type CardStyle = "compact" | "comfortable" | "magazine";

export interface TweaksState {
  cardStyle: CardStyle;
  fontSize: number;
  listWidth: number;
}

export const DEFAULT_TWEAKS: TweaksState = {
  cardStyle: "compact",
  fontSize: 15,
  listWidth: 350,
};

export const LIST_WIDTH_MIN = 300;
export const LIST_WIDTH_MAX = 520;
export const FONT_SIZE_MIN = 13;
export const FONT_SIZE_MAX = 20;
