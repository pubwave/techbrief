import { getSourceColor } from "../lib/source-colors";

interface SourceAvatarProps {
  source: string;
  size?: number;
}

// Two-letter initials, matching the mobile SourceAvatar: first letter of the
// first two words, or the first two characters of a single-word name.
function sourceInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return ((words[0]?.charAt(0) ?? "") + (words[1]?.charAt(0) ?? "")).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function SourceAvatar({ source, size = 24 }: SourceAvatarProps) {
  const color = getSourceColor(source);
  const initials = sourceInitials(source);
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-[8px] font-bold"
      style={{
        width: size,
        height: size,
        background: `${color}22`,
        border: `1px solid ${color}44`,
        color,
        fontSize: Math.round(size * (initials.length > 1 ? 0.38 : 0.46)),
        letterSpacing: "-0.02em"
      }}
    >
      {initials}
    </div>
  );
}
