import type { WizardLocale, WizardLocaleCatalog } from "../types.js";
import { deCatalog } from "./de.js";
import { enCatalog } from "./en.js";
import { esCatalog } from "./es.js";
import { frCatalog } from "./fr.js";
import { jaCatalog } from "./ja.js";
import { koCatalog } from "./ko.js";
import { ptCatalog } from "./pt.js";
import { zhCnCatalog } from "./zh-cn.js";
import { zhTwCatalog } from "./zh-tw.js";

export const WIZARD_LOCALE_CATALOGS: Record<WizardLocale, WizardLocaleCatalog> = {
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
