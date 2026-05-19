import type { TechBriefLocaleCatalog } from "../types.js";

export const zhCnCatalog: TechBriefLocaleCatalog = {
  stageTitle: "正在启动 TechBrief",
  readyTitle: "TechBrief 已就绪",
  readyHint: "打开上方 URL 即可使用。",
  substageLabels: {
    "prepare-runtime": "准备 runtime 工作区",
    "stop-old-services": "停止旧的后台服务",
    "start-api": "启动 API 服务",
    "start-web": "启动 Web 服务",
    "sync-feed": "同步源",
    "enrich-feed": "处理文章",
    "article-processing": "处理文章",
    "mobile-install": "安装移动端应用",
    "open-browser": "打开浏览器"
  },
  freshnessTitle: "新鲜度（天）",
  freshnessHint: "只保留这段时间内的新条目。",
  freshnessLabels: { 1: "1 天", 3: "3 天", 5: "5 天", 7: "7 天" },
  freshnessRowLabel: "新鲜度（天）",
  scheduleLabel: "调度模式",
  sourcesLabel: "启用的源集合"
};
