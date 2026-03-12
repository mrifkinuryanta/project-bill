import { id, enUS } from "date-fns/locale";

/**
 * Detects the browser's language and returns the corresponding date-fns locale.
 * Defaults to enUS if no match is found or if running on the server.
 */
export const getBrowserLocale = () => {
  if (typeof window === "undefined") return enUS;

  const lang = navigator.language.split("-")[0];

  const localeMap: Record<string, any> = {
    id: id,
    en: enUS,
  };

  return localeMap[lang] || enUS;
};
