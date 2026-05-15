import { useId } from "react";

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
  dotC: "var(--tb-icon-dot-c)"
};

export function resolveTechBriefAppIconPalette(
  overrides: Partial<TechBriefAppIconPalette> = {}
): TechBriefAppIconPalette {
  return { ...defaultPalette, ...overrides };
}

interface TechBriefAppIconProps {
  className?: string;
  palette?: Partial<TechBriefAppIconPalette>;
  title?: string;
}

export function TechBriefAppIcon({ className, palette, title = "Tech Brief" }: TechBriefAppIconProps) {
  const id = useId().replace(/:/g, "");
  const colors = resolveTechBriefAppIconPalette(palette);
  const bgId = `tb-bg-${id}`;
  const lineAId = `tb-line-a-${id}`;
  const lineBId = `tb-line-b-${id}`;
  const lineCId = `tb-line-c-${id}`;

  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={className}
      role="img"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={bgId} gradientUnits="userSpaceOnUse" x1="126" x2="892" y1="90" y2="936">
          <stop offset="0" stopColor={colors.bgStart} />
          <stop offset="0.54" stopColor={colors.bgMiddle} />
          <stop offset="1" stopColor={colors.bgEnd} />
        </linearGradient>
        <linearGradient id={lineAId} gradientUnits="userSpaceOnUse" x1="288" x2="736" y1="360" y2="360">
          <stop offset="0" stopColor={colors.lineAStart} />
          <stop offset="1" stopColor={colors.lineAEnd} />
        </linearGradient>
        <linearGradient id={lineBId} gradientUnits="userSpaceOnUse" x1="288" x2="736" y1="512" y2="512">
          <stop offset="0" stopColor={colors.lineBStart} />
          <stop offset="1" stopColor={colors.lineBEnd} />
        </linearGradient>
        <linearGradient id={lineCId} gradientUnits="userSpaceOnUse" x1="288" x2="736" y1="664" y2="664">
          <stop offset="0" stopColor={colors.lineCStart} />
          <stop offset="1" stopColor={colors.lineCEnd} />
        </linearGradient>
      </defs>

      <rect fill={`url(#${bgId})`} height="896" rx="224" width="896" x="64" y="64" />
      <path d="M300 360H660" stroke={`url(#${lineAId})`} strokeLinecap="round" strokeWidth="64" />
      <path d="M300 512H720" stroke={`url(#${lineBId})`} strokeLinecap="round" strokeWidth="64" />
      <path d="M300 664H604" stroke={`url(#${lineCId})`} strokeLinecap="round" strokeWidth="64" />
      <circle cx="724" cy="360" fill={colors.dotA} r="32" />
      <circle cx="780" cy="512" fill={colors.dotB} r="32" />
      <circle cx="668" cy="664" fill={colors.dotC} r="32" />
    </svg>
  );
}
