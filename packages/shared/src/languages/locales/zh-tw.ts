import type { TechBriefLocaleCatalog } from "../types.js";

export const zhTwCatalog: TechBriefLocaleCatalog = {
  stageTitle: "正在啟動 TechBrief",
  readyTitle: "TechBrief 已就緒",
  readyHint: "打開上方 URL 即可使用。",
  launchFailedLabel: "啟動失敗",
  serviceFailedLabel: "服務失敗",
  serviceStartFailedLabel: "服務啟動失敗",
  runtimeLabel: "執行目錄",
  noneLabel: "無",
  substageLabels: {
    "prepare-runtime": "準備 runtime 工作區",
    "stop-old-services": "停止舊的後台服務",
    "start-api": "啟動 API 服務",
    "start-web": "啟動 Web 服務",
    "sync-feed": "同步來源",
    "enrich-feed": "處理文章",
    "article-processing": "處理文章",
    "mobile-install": "安裝行動裝置應用",
    "open-browser": "開啟瀏覽器"
  },
  freshnessTitle: "新鮮度（天）",
  freshnessHint: "只保留這段時間內的新條目。",
  freshnessLabels: { 1: "1 天", 3: "3 天", 5: "5 天", 7: "7 天" },
  freshnessRowLabel: "新鮮度（天）",
  scheduleLabel: "排程模式",
  sourcesLabel: "啟用的來源集合"
};
