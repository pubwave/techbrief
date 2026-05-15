export const ui = {
  shell: "rounded-tb-shell border border-tb-border bg-tb-surface-shell",
  card: "rounded-2xl border border-tb-border bg-tb-surface-card",
  cardSelected:
    "rounded-2xl border border-tb-border-strong bg-tb-surface-card-selected shadow-tb-card-selected ring-1 ring-[var(--tb-accent-soft)]",
  subtlePanel: "rounded-xl border border-tb-border bg-tb-surface-subtle",
  inputShell: "rounded-xl border border-tb-border bg-tb-surface-input",
  button: "rounded-tb-button border border-tb-border bg-tb-surface-button text-tb-text-primary",
  accentButton:
    "rounded-tb-button border border-transparent bg-tb-accent text-tb-accent-ink",
  tag: "rounded-full bg-[var(--tb-tag-background)] px-[9px] py-[7px] text-[11px]",
  tagDefault: "text-tb-text-tag",
  tagAccent: "text-tb-accent",
  eyebrow: "text-[11px] uppercase tracking-[0.08em] text-tb-accent",
  mutedMeta: "text-[11px] text-tb-text-muted",
  bodyText: "m-0 leading-[1.55] text-tb-text-secondary"
} as const;
