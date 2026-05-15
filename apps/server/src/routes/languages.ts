import { SUPPORTED_LANGUAGES } from "@techbrief/shared";
import type { RequestContext } from "../http.js";
import { sendJson } from "../http.js";

export function handleLanguagesRoute({ response }: RequestContext): void {
  sendJson(response, 200, SUPPORTED_LANGUAGES);
}
