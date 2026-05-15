const ENGLISH_LANGUAGE = "en";

export function requiresAiForLanguage(language: string): boolean {
  return language !== ENGLISH_LANGUAGE;
}

export function skipsAiForLanguage(language: string): boolean {
  return !requiresAiForLanguage(language);
}
