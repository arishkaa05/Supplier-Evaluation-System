import {
  MetricKey,
  Supplier,
  SupplierData,
  QualityValue,
} from "@/shared/store/suppliers/type/supplierType";

const METRIC_ORDER: MetricKey[] = ["localHiring", "completeness", "defects"];

const DATE_RE = /^\d{1,2}\.\d{1,2}\.\d{4}$/;

type RawRow = {
  date: string;
  // null означает «значение в строке было пустым».
  values: Record<MetricKey, number | null>;
};

const parseNumber = (raw: string): number | null => {
  const t = raw.trim();
  if (t === "" || t === "—" || t === "-" || t.toLowerCase() === "null") return null;
  const v = Number(t.replace(",", "."));
  return Number.isFinite(v) ? v : null;
};

// Делим строку по табу / запятой / точке с запятой / нескольким пробелам.
const splitRow = (line: string): string[] =>
  line.split(/\t|,|;|\s{2,}|\s+(?=\d)/).map((s) => s.trim()).filter((_, i, a) =>
    // удаляем пустые «пары», возникающие, когда разделитель встречается дважды подряд
    !(a.length > 4 && a[i] === "" && i !== a.length - 1),
  );

const isHeader = (cells: string[]): boolean => {
  if (cells.length === 0) return true;
  if (DATE_RE.test(cells[0])) return false;
  // Похоже на заголовок, если первая ячейка — текст без даты и без чисел.
  return Number.isNaN(Number(cells[0]?.replace(",", ".")));
};

export type ParsedSupplier = {
  name: string;
  rows: number;
  duplicates: number;
};

const monthFromDate = (d: string): { y: number; m: number; day: number } => {
  const [day, m, y] = d.split(".").map(Number);
  return { y, m, day };
};

const compareDates = (a: string, b: string): number => {
  const A = monthFromDate(a);
  const B = monthFromDate(b);
  if (A.y !== B.y) return A.y - B.y;
  if (A.m !== B.m) return A.m - B.m;
  return A.day - B.day;
};

// Группируем дубликаты по дате, разрешаем по последней записи. Если в дубликатах
// конкретная метрика принимала разные значения — quality="2" (экспертное),
// если она была пуста хотя бы где-то и нигде явно не указана — quality="0".
function resolveDuplicates(raws: RawRow[]): SupplierData[] {
  const grouped = new Map<string, RawRow[]>();
  for (const r of raws) {
    const arr = grouped.get(r.date);
    if (arr) arr.push(r);
    else grouped.set(r.date, [r]);
  }

  const dates = Array.from(grouped.keys()).sort(compareDates);

  return dates.map((date, idx) => {
    const rows = grouped.get(date)!;
    const quality: Record<MetricKey, QualityValue> = {
      localHiring: "1",
      completeness: "1",
      defects: "1",
    };
    const values: Record<MetricKey, number> = {
      localHiring: 0,
      completeness: 0,
      defects: 0,
    };

    for (const m of METRIC_ORDER) {
      const all = rows.map((r) => r.values[m]);
      const nonNull = all.filter((v): v is number => v !== null);

      if (nonNull.length === 0) {
        quality[m] = "0";
        values[m] = 0;
        continue;
      }

      const allEqual = nonNull.every((v) => v === nonNull[0]);
      const last = nonNull[nonNull.length - 1];
      values[m] = last;
      // Если значения по дубликатам различались — помечаем как экспертное.
      // Если в каких-то строках пусто, а в других есть — тоже считаем неточным.
      if (!allEqual || nonNull.length !== all.length) {
        quality[m] = "2";
      } else {
        quality[m] = "1";
      }
    }

    return {
      month: idx + 1,
      date,
      quality,
      ...values,
    };
  });
}

export type CsvParseResult = {
  supplier: Supplier | null;
  errors: string[];
  duplicates: number;
};

export function parseSuppliersCsv(
  text: string,
  fileName: string,
  id: number,
): CsvParseResult {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { supplier: null, errors: ["Файл пуст."], duplicates: 0 };
  }

  const startIdx = isHeader(splitRow(lines[0])) ? 1 : 0;
  const raws: RawRow[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const cells = splitRow(lines[i]);
    if (cells.length < 4) {
      errors.push(`Строка ${i + 1}: ожидалось 4 столбца, получено ${cells.length}.`);
      continue;
    }
    const [dateRaw, lh, comp, def] = cells;
    if (!DATE_RE.test(dateRaw)) {
      errors.push(`Строка ${i + 1}: «${dateRaw}» не похоже на дату DD.MM.YYYY.`);
      continue;
    }
    raws.push({
      date: dateRaw,
      values: {
        localHiring: parseNumber(lh),
        completeness: parseNumber(comp),
        defects: parseNumber(def),
      },
    });
  }

  if (raws.length === 0) {
    return { supplier: null, errors: errors.length ? errors : ["Не удалось распознать ни одной строки."], duplicates: 0 };
  }

  const data = resolveDuplicates(raws);
  const duplicates = raws.length - data.length;

  const name =
    fileName.replace(/\.[^.]+$/, "").trim() ||
    `Поставщик из CSV ${id}`;

  return {
    supplier: { id, supplier: name, data },
    errors,
    duplicates,
  };
}
