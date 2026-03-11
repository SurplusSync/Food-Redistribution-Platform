const MYMEMORY_API = 'https://api.mymemory.translated.net/get';
const CONCURRENCY = 5;

function getCacheKey(lang: string): string {
  return `surplussync_i18n_${lang}`;
}

export function getCachedTranslations(lang: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(getCacheKey(lang));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(lang: string, data: Record<string, string>): void {
  try {
    localStorage.setItem(getCacheKey(lang), JSON.stringify(data));
  } catch { /* localStorage full - ignore */ }
}

/** Replace {{var}} placeholders with markers the translator won't touch */
function protectPlaceholders(text: string): { cleaned: string; slots: string[] } {
  const slots: string[] = [];
  const cleaned = text.replace(/\{\{(\w+)\}\}/g, (match) => {
    slots.push(match);
    return `[_${slots.length}_]`;
  });
  return { cleaned, slots };
}

function restorePlaceholders(text: string, slots: string[]): string {
  return text.replace(/\[_(\d+)_\]/g, (_, idx) => slots[parseInt(idx) - 1] || _);
}

async function translateOne(text: string, targetLang: string): Promise<string> {
  const { cleaned, slots } = protectPlaceholders(text);
  try {
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(cleaned)}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const json = await res.json();
    if (json.responseStatus === 200 && json.responseData?.translatedText) {
      const translated = json.responseData.translatedText;
      return slots.length > 0 ? restorePlaceholders(translated, slots) : translated;
    }
    return text;
  } catch {
    return text;
  }
}

/**
 * Translate all English strings to the target language.
 * Skips already-cached keys. Saves partial progress to localStorage.
 * Calls onBatch after each concurrency batch so the UI can update progressively.
 */
export async function translateAll(
  enStrings: Record<string, string>,
  targetLang: string,
  onBatch?: (result: Record<string, string>, done: number, total: number) => void,
): Promise<Record<string, string>> {
  const cached = getCachedTranslations(targetLang) || {};
  const entries = Object.entries(enStrings);
  const total = entries.length;

  // Filter out keys already cached
  const remaining = entries.filter(([key]) => !cached[key]);
  if (remaining.length === 0) {
    onBatch?.(cached, total, total);
    return cached;
  }

  const result: Record<string, string> = { ...cached };
  let done = total - remaining.length;
  onBatch?.(result, done, total);

  for (let i = 0; i < remaining.length; i += CONCURRENCY) {
    const batch = remaining.slice(i, i + CONCURRENCY);
    const translated = await Promise.all(
      batch.map(([, text]) => translateOne(text, targetLang)),
    );
    batch.forEach(([key], idx) => {
      result[key] = translated[idx];
    });
    done += batch.length;
    saveCache(targetLang, result);
    onBatch?.(result, done, total);
  }

  return result;
}

/** Wipe cached translations for a language (useful for debugging) */
export function clearTranslationCache(lang?: string): void {
  if (lang) {
    localStorage.removeItem(getCacheKey(lang));
  } else {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('surplussync_i18n_'))
      .forEach((k) => localStorage.removeItem(k));
  }
}
