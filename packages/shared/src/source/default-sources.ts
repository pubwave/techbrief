import type { ContentType } from "../content/types.js";
import type { SourceDefinition, SourceDiscoveryMethod, SourceLinkScope, TechNewsSourceKind } from "./types.js";

type SourceSeed = {
  id: string;
  name: string;
  homepage: string;
  discoveryMethod: SourceDiscoveryMethod;
  feedUrl?: string;
  linkScope?: SourceLinkScope;
  techNewsKind?: TechNewsSourceKind;
  tags: string[];
};

// Default ranking priority per built-in source: AI-first + reputation.
// Tiers: 30 top AI labs · 24 major AI/dev platforms + curated · 20 big-tech /
// launch feeds / known builders · 16 mainstream tech media · 12 indie & eng
// communities · 8 secondary/vertical media · 5 PR/consumer. Anything not listed
// falls back to DEFAULT_BUILTIN_PRIORITY.
const DEFAULT_BUILTIN_PRIORITY = 8;
const DEFAULT_SOURCE_PRIORITIES: Record<string, number> = {
  "openai-blog": 30,
  "anthropic-news": 30,
  "google-deepmind-blog": 30,
  "nvidia-blog": 24,
  "github-blog": 24,
  "hackernews-frontpage": 24,
  "hackernews-show-hn": 24,
  "google-blog": 20,
  "microsoft-devblogs": 20,
  "cloudflare-blog": 20,
  "vercel-blog": 20,
  "simon-willison-blog": 20,
  "hackernews-launch-hn": 20,
  "techcrunch": 16,
  "the-verge": 16,
  "venturebeat": 16,
  "ars-technica": 16,
  "mit-technology-review": 16,
  "wired": 16,
  "indie-hackers": 12,
  "devto-build-in-public": 12,
  "devto-saas": 12,
  "bootstrapped-founder": 12,
  "infoq": 12,
  "microsoft-news": 12,
  "stripe-blog": 12,
  "shopify-engineering": 12,
  "engadget": 8,
  "9to5mac": 8,
  "9to5google": 8,
  "zdnet": 8,
  "techradar": 8,
  "xda-developers": 8,
  "hashnode-indie": 8,
  "hashnode-saas": 8,
  "apple-newsroom": 5,
  "meta-newsroom": 5
};

function createDefaultSource(category: ContentType, seed: SourceSeed): SourceDefinition {
  return {
    id: seed.id,
    name: seed.name,
    category,
    preset: "core-default",
    state: "enabled",
    access: "public",
    homepage: seed.homepage,
    ...(seed.feedUrl ? { feedUrl: seed.feedUrl } : {}),
    discoveryMethod: seed.discoveryMethod,
    ...(seed.linkScope ? { linkScope: seed.linkScope } : {}),
    ...(seed.techNewsKind ? { techNewsKind: seed.techNewsKind } : {}),
    description: `${seed.name} default source`,
    tags: seed.tags,
    priority: DEFAULT_SOURCE_PRIORITIES[seed.id] ?? DEFAULT_BUILTIN_PRIORITY
  };
}

function buildSources(category: ContentType, seeds: SourceSeed[]): SourceDefinition[] {
  return seeds.map((seed) => createDefaultSource(category, seed));
}

const techNewsSeeds: SourceSeed[] = [
  { id: "openai-blog", name: "OpenAI News", homepage: "https://openai.com/news/", feedUrl: "https://openai.com/news/rss.xml", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["ai", "company"] },
  { id: "anthropic-news", name: "Anthropic Newsroom", homepage: "https://www.anthropic.com/news", discoveryMethod: "html", techNewsKind: "official-site", tags: ["ai", "company"] },
  { id: "google-blog", name: "Google Blog", homepage: "https://blog.google/", feedUrl: "https://blog.google/rss/", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["company", "product"] },
  { id: "google-deepmind-blog", name: "Google DeepMind Blog", homepage: "https://deepmind.google/blog/", feedUrl: "https://deepmind.google/blog/rss.xml", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["ai", "research"] },
  { id: "microsoft-news", name: "Microsoft Bing Blogs", homepage: "https://blogs.bing.com/search/", feedUrl: "https://blogs.bing.com/search/feed", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["company", "product", "search"] },
  { id: "microsoft-devblogs", name: "Microsoft Dev Blogs", homepage: "https://devblogs.microsoft.com/", feedUrl: "https://devblogs.microsoft.com/feed/", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["engineering", "developer"] },
  { id: "apple-newsroom", name: "Apple Newsroom", homepage: "https://www.apple.com/newsroom/", feedUrl: "https://www.apple.com/newsroom/rss-feed.rss", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["company", "product"] },
  { id: "meta-newsroom", name: "Meta Newsroom", homepage: "https://about.fb.com/news/", discoveryMethod: "html", techNewsKind: "official-site", tags: ["company", "product"] },
  { id: "github-blog", name: "GitHub Blog", homepage: "https://github.blog/", feedUrl: "https://github.blog/feed/", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["developer", "platform"] },
  { id: "cloudflare-blog", name: "Cloudflare Blog", homepage: "https://blog.cloudflare.com/", feedUrl: "https://blog.cloudflare.com/rss/", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["infrastructure", "engineering"] },
  { id: "nvidia-blog", name: "NVIDIA Blog", homepage: "https://blogs.nvidia.com/", feedUrl: "https://blogs.nvidia.com/feed/", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["ai", "hardware"] },
  { id: "techcrunch", name: "TechCrunch", homepage: "https://techcrunch.com/", feedUrl: "https://techcrunch.com/feed/", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["media", "startups"] },
  { id: "the-verge", name: "The Verge", homepage: "https://www.theverge.com/tech", feedUrl: "https://www.theverge.com/rss/index.xml", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["media", "consumer-tech"] },
  { id: "ars-technica", name: "Ars Technica", homepage: "https://arstechnica.com/", feedUrl: "https://feeds.arstechnica.com/arstechnica/index", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["media", "engineering"] },
  { id: "engadget", name: "Engadget", homepage: "https://www.engadget.com/", feedUrl: "https://www.engadget.com/rss.xml", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["media", "consumer-tech"] },
  { id: "venturebeat", name: "VentureBeat", homepage: "https://venturebeat.com/", feedUrl: "https://venturebeat.com/feed/", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["media", "ai"] },
  { id: "wired", name: "WIRED", homepage: "https://www.wired.com/", discoveryMethod: "html", techNewsKind: "tech-media", tags: ["media", "innovation"] },
  { id: "mit-technology-review", name: "MIT Technology Review", homepage: "https://www.technologyreview.com/", discoveryMethod: "html", techNewsKind: "tech-media", tags: ["media", "innovation"] },
  { id: "stripe-blog", name: "Stripe Blog", homepage: "https://stripe.com/blog", discoveryMethod: "html", techNewsKind: "official-site", tags: ["payments", "saas"] },
  { id: "vercel-blog", name: "Vercel Blog", homepage: "https://vercel.com/blog", feedUrl: "https://vercel.com/atom", discoveryMethod: "rss", techNewsKind: "official-site", tags: ["developer", "platform"] },
  { id: "shopify-engineering", name: "Shopify Engineering", homepage: "https://shopify.engineering/", discoveryMethod: "html", techNewsKind: "official-site", tags: ["engineering", "commerce"] },
  { id: "9to5mac", name: "9to5Mac", homepage: "https://9to5mac.com/", feedUrl: "https://9to5mac.com/feed/", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["apple", "media"] },
  { id: "9to5google", name: "9to5Google", homepage: "https://9to5google.com/", feedUrl: "https://9to5google.com/feed/", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["google", "media"] },
  { id: "zdnet", name: "ZDNet", homepage: "https://www.zdnet.com/", feedUrl: "https://www.zdnet.com/news/rss.xml", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["media", "enterprise"] },
  { id: "techradar", name: "TechRadar", homepage: "https://www.techradar.com/", feedUrl: "https://www.techradar.com/rss", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["media", "consumer-tech"] },
  { id: "xda-developers", name: "XDA Developers", homepage: "https://www.xda-developers.com/", feedUrl: "https://www.xda-developers.com/feed/", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["mobile", "developer"] },
  { id: "infoq", name: "InfoQ", homepage: "https://www.infoq.com/", feedUrl: "https://feed.infoq.com/", discoveryMethod: "rss", techNewsKind: "tech-media", tags: ["engineering", "architecture"] },
  { id: "hackernews-frontpage", name: "Hacker News Front Page", homepage: "https://news.ycombinator.com/", discoveryMethod: "api", techNewsKind: "tech-media", tags: ["community", "curated"] }
];

const indieDevSeeds: SourceSeed[] = [
  { id: "indie-hackers", name: "Indie Hackers", homepage: "https://www.indiehackers.com/", feedUrl: "https://feed.indiehackers.world/posts.rss", discoveryMethod: "rss", linkScope: "external-allowed", tags: ["community", "indie"] },
  { id: "devto-build-in-public", name: "DEV Build in Public", homepage: "https://dev.to/t/buildinpublic", discoveryMethod: "api", tags: ["developer", "indie"] },
  { id: "devto-saas", name: "DEV SaaS", homepage: "https://dev.to/t/saas", discoveryMethod: "api", tags: ["developer", "saas"] },
  { id: "hashnode-indie", name: "Hashnode Indie", homepage: "https://hashnode.com/tag/product-launch", discoveryMethod: "html", tags: ["blogging", "indie"] },
  { id: "hashnode-saas", name: "Hashnode SaaS", homepage: "https://hashnode.com/n/saas", discoveryMethod: "html", tags: ["blogging", "saas"] },
  { id: "hackernews-show-hn", name: "Hacker News Show HN", homepage: "https://news.ycombinator.com/show", discoveryMethod: "api", tags: ["community", "launch"] },
  { id: "hackernews-launch-hn", name: "Hacker News Launch HN", homepage: "https://news.ycombinator.com/", discoveryMethod: "api", tags: ["community", "launch"] },
  { id: "simon-willison-blog", name: "Simon Willison Blog", homepage: "https://simonwillison.net/", feedUrl: "https://simonwillison.net/atom/everything/", discoveryMethod: "rss", tags: ["blog", "builder"] },
  { id: "bootstrapped-founder", name: "Bootstrapped Founder", homepage: "https://thebootstrappedfounder.com/", feedUrl: "https://thebootstrappedfounder.com/feed/", discoveryMethod: "rss", tags: ["founder", "saas"] }
];

export const DEFAULT_SOURCES: SourceDefinition[] = [
  ...buildSources("tech-news", techNewsSeeds),
  ...buildSources("indie-dev", indieDevSeeds)
];
