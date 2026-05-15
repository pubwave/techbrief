import type { AppConfig } from "./types.js";
import { DEFAULT_OPENAI_MODEL } from "../ai/openai-models.js";

export const DEFAULT_APP_CONFIG: AppConfig = {
  app: {
    defaultLanguage: "en",
    freshnessDays: 3
  },
  schedule: {
    mode: "interval",
    intervalHours: 6,
    timezone: "UTC",
    perSource: {
      "openai-blog": {
        mode: "interval",
        intervalHours: 3
      },
      "indie-hackers": {
        mode: "cron",
        cron: "0 */6 * * *"
      }
    }
  },
  ai: {
    modelSource: "cloud",
    provider: "openai",
    model: DEFAULT_OPENAI_MODEL,
    apiKey: ""
  },
  sources: {
    techNews: {
      enabled: true,
      preset: "core-default",
      items: [
        "openai-blog",
        "anthropic-news",
        "google-blog",
        "google-deepmind-blog",
        "microsoft-news",
        "microsoft-devblogs",
        "apple-newsroom",
        "meta-newsroom",
        "github-blog",
        "cloudflare-blog",
        "nvidia-blog",
        "techcrunch",
        "the-verge",
        "ars-technica",
        "engadget",
        "venturebeat",
        "wired",
        "mit-technology-review",
        "stripe-blog",
        "vercel-blog",
        "shopify-engineering",
        "9to5mac",
        "9to5google",
        "zdnet",
        "techradar",
        "xda-developers",
        "infoq",
        "hackernews-frontpage"
      ]
    },
    indieDev: {
      enabled: true,
      preset: "core-default",
      items: [
        "indie-hackers",
        "devto-build-in-public",
        "devto-saas",
        "hashnode-indie",
        "hashnode-saas",
        "hackernews-show-hn",
        "hackernews-launch-hn",
        "product-hunt-launches",
        "curated-indie-rss-pack",
        "simon-willison-blog",
        "bootstrapped-founder",
        "indie-builders-rss-pack",
        "indie-newsletters-pack",
        "founder-public-rss-pack"
      ]
    },
    custom: {
      enabled: true,
      requireValidation: true,
      requireDeclaredCategory: true,
      allowCategories: ["tech-news", "indie-dev"]
    }
  },
  web: {
    docker: true
  },
  mobile: {
    ios: {
      enabled: true
    },
    android: {
      enabled: true
    }
  }
};
