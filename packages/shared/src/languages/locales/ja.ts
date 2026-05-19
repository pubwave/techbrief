import type { TechBriefLocaleCatalog } from "../types.js";

export const jaCatalog: TechBriefLocaleCatalog = {
  stageTitle: "TechBrief を起動中",
  readyTitle: "TechBrief が稼働中",
  readyHint: "上記の URL を開いて利用してください。",
  substageLabels: {
    "prepare-runtime": "ランタイムを準備中",
    "stop-old-services": "既存サービスを停止中",
    "start-api": "API サーバーを起動中",
    "start-web": "Web サーバーを起動中",
    "sync-feed": "フィードを同期中",
    "enrich-feed": "記事を処理中",
    "article-processing": "記事を処理中",
    "mobile-install": "モバイルアプリをインストール中",
    "open-browser": "ブラウザを開く"
  },
  freshnessTitle: "記事の鮮度（日数）",
  freshnessHint: "この期間より新しい項目のみを残します。",
  freshnessLabels: { 1: "1 日", 3: "3 日", 5: "5 日", 7: "7 日" },
  freshnessRowLabel: "記事の鮮度（日数）",
  scheduleLabel: "スケジュールモード",
  sourcesLabel: "有効なソースセット"
};
