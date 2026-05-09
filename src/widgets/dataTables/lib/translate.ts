// Перевод описаний термов из английских строк ("Low and increasing") в русские.
const LEVEL_MAP: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

const TREND_MAP: Record<string, string> = {
  increasing: "растёт",
  decreasing: "падает",
};

export function translateDescription(raw: string): string {
  // "Low and increasing" / "Medium and decreasing" / etc.
  const m = raw.trim().match(/^(\w+)\s+and\s+(\w+)$/i);
  if (!m) return raw;
  const level = LEVEL_MAP[m[1].toLowerCase()] ?? m[1];
  const trend = TREND_MAP[m[2].toLowerCase()] ?? m[2];
  return `${level}, ${trend}`;
}
