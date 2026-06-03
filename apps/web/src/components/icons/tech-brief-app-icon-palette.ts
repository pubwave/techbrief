export interface TechBriefAppIconPalette {
  bgStart: string;
  bgMiddle: string;
  bgEnd: string;
  lineAStart: string;
  lineAEnd: string;
  lineBStart: string;
  lineBEnd: string;
  lineCStart: string;
  lineCEnd: string;
  dotA: string;
  dotB: string;
  dotC: string;
}

const defaultPalette: TechBriefAppIconPalette = {
  bgStart: "var(--tb-icon-bg-start)",
  bgMiddle: "var(--tb-icon-bg-middle)",
  bgEnd: "var(--tb-icon-bg-end)",
  lineAStart: "var(--tb-icon-line-a-start)",
  lineAEnd: "var(--tb-icon-line-a-end)",
  lineBStart: "var(--tb-icon-line-b-start)",
  lineBEnd: "var(--tb-icon-line-b-end)",
  lineCStart: "var(--tb-icon-line-c-start)",
  lineCEnd: "var(--tb-icon-line-c-end)",
  dotA: "var(--tb-icon-dot-a)",
  dotB: "var(--tb-icon-dot-b)",
  dotC: "var(--tb-icon-dot-c)",
};

export function resolveTechBriefAppIconPalette(
  overrides: Partial<TechBriefAppIconPalette> = {},
): TechBriefAppIconPalette {
  return { ...defaultPalette, ...overrides };
}
