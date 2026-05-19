import type { TechBriefLocaleCatalog } from "../types.js";

export const koCatalog: TechBriefLocaleCatalog = {
  stageTitle: "TechBrief 시작 중",
  readyTitle: "TechBrief 실행 중",
  readyHint: "위의 URL을 열어 사용하세요.",
  substageLabels: {
    "prepare-runtime": "런타임 준비 중",
    "stop-old-services": "이전 서비스 중지 중",
    "start-api": "API 서버 시작 중",
    "start-web": "Web 서버 시작 중",
    "sync-feed": "피드 동기화 중",
    "enrich-feed": "기사 처리 중",
    "article-processing": "기사 처리 중",
    "mobile-install": "모바일 앱 설치 중",
    "open-browser": "브라우저 열기"
  },
  freshnessTitle: "기사 신선도(일)",
  freshnessHint: "이 기간보다 새 항목만 유지합니다.",
  freshnessLabels: { 1: "1 일", 3: "3 일", 5: "5 일", 7: "7 일" },
  freshnessRowLabel: "기사 신선도(일)",
  scheduleLabel: "스케줄 모드",
  sourcesLabel: "활성 소스 세트"
};
