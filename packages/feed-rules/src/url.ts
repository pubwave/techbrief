const TRACKING_PARAM_PATTERN = /^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|ref$)/i;

export function normalizeArticleUrl(input: string): string | null {
  try {
    const url = new URL(input);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();

    const nextParams = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (!TRACKING_PARAM_PATTERN.test(key)) {
        nextParams.append(key, value);
      }
    }

    url.search = nextParams.toString();
    url.pathname = normalizeArticlePath(url);
    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeArticlePath(url: URL): string {
  if (!isHashnodeArticleHost(url.hostname)) {
    return url.pathname;
  }

  return url.pathname.replace(/(-\d+)-[0-9a-f]{8}$/i, "$1");
}

function isHashnodeArticleHost(hostname: string): boolean {
  return hostname === "hashnode.dev" || hostname.endsWith(".hashnode.dev");
}
