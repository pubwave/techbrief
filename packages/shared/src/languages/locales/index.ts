import type { TechBriefLocale, TechBriefLocaleCatalog } from "../types.js";
import { enCatalog } from "./en.js";
import { zhCnCatalog } from "./zh-cn.js";
import { zhTwCatalog } from "./zh-tw.js";
import { jaCatalog } from "./ja.js";
import { koCatalog } from "./ko.js";
import { esCatalog } from "./es.js";
import { frCatalog } from "./fr.js";
import { deCatalog } from "./de.js";
import { ptCatalog } from "./pt.js";

export const TECHBRIEF_LOCALE_CATALOGS: Record<TechBriefLocale, TechBriefLocaleCatalog> = {
  en: enCatalog,
  "zh-CN": zhCnCatalog,
  "zh-TW": zhTwCatalog,
  ja: jaCatalog,
  ko: koCatalog,
  es: esCatalog,
  fr: frCatalog,
  de: deCatalog,
  pt: ptCatalog
};
