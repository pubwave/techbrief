import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "tb-accent": "var(--tb-accent)",
        "tb-accent-ink": "var(--tb-accent-ink)",
        "tb-accent-secondary": "var(--tb-accent-secondary)",
        "tb-border": "var(--tb-border)",
        "tb-border-subtle": "var(--tb-border-subtle)",
        "tb-border-strong": "var(--tb-border-strong)",
        "tb-border-hover": "var(--tb-border-hover)",
        "tb-surface-app": "var(--tb-surface-app)",
        "tb-surface-shell": "var(--tb-surface-shell)",
        "tb-surface-card": "var(--tb-surface-card)",
        "tb-surface-card-hover": "var(--tb-surface-card-hover)",
        "tb-surface-card-selected": "var(--tb-surface-card-selected)",
        "tb-surface-subtle": "var(--tb-surface-subtle)",
        "tb-surface-input": "var(--tb-surface-input)",
        "tb-surface-button": "var(--tb-surface-button)",
        "tb-surface-nav": "var(--tb-surface-nav)",
        "tb-surface-reader": "var(--tb-surface-reader)",
        "tb-text-primary": "var(--tb-text-primary)",
        "tb-text-secondary": "var(--tb-text-secondary)",
        "tb-text-body": "var(--tb-text-body)",
        "tb-text-muted": "var(--tb-text-muted)",
        "tb-text-subtle": "var(--tb-text-subtle)",
        "tb-text-faint": "var(--tb-text-faint)",
        "tb-text-deepest": "var(--tb-text-deepest)",
        "tb-text-tag": "var(--tb-text-tag)"
      },
      backgroundImage: {
        "tb-app": "var(--tb-background-app)"
      },
      borderRadius: {
        "tb-shell": "18px",
        "tb-button": "10px"
      },
      boxShadow: {
        "tb-card-selected": "var(--tb-shadow-card-selected)"
      }
    }
  }
} satisfies Config;
