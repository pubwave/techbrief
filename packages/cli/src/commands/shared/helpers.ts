import type { ContentType } from "@techbrief/shared";

export function resolveCategory(input: string | boolean | undefined): ContentType {
  return input === "indie-dev" ? "indie-dev" : "tech-news";
}
