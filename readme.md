# Supplier Evaluation System — Frontend

Дашборд для оценки поставщиков по двум интеллектуальным системам (нечёткая логика и теория мультиопераций). Импорт данных через CSV, редактор критериев и базы знаний, визуализация результата расчёта с разбивкой по зонам.

Технологии: **React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Zustand + Recharts/ECharts**.

## Структура

```
src/
├── page/             страницы (dashboard, suppliers, ...)
├── feature/
│   ├── csvImport/    парсер CSV + drag-and-drop
│   ├── calculations/ модель результатов (зоны, агрегация)
│   └── dragdrop/
├── shared/
│   ├── api/          HTTP-клиент
│   ├── store/        zustand-хранилища (suppliers, evaluation, ...)
│   ├── config/       статичные справочники
│   └── lib/          утилиты (cn, форматирование)
└── main.tsx          точка входа
```

## Запуск

Сначала нужен запущенный бэкенд на `http://localhost:8081` (см. [server_system/README.md](../server_system/README.md)).

```bash
npm install
npm run dev            # dev-сервер на http://localhost:5173
```

## Прочие команды

```bash
npm run build          # production-сборка в dist/
npm run preview        # просмотр production-сборки локально
npm run lint           # линтер
```

## Тестовые данные

В [`samples/test-cases/`](./samples/test-cases) лежат CSV-файлы разных сценариев (точные данные, экспертные оценки, пропуски, комбинации). Используются для сравнительного анализа двух систем — см. [`COMPARISON.md`](./samples/test-cases/COMPARISON.md).

Импортировать в дашборд: перетащить файл на страницу «Поставщики».

## Документация по математике и архитектуре

- [`SYSTEMS.md`](./samples/test-cases/SYSTEMS.md) — пошаговое описание обеих систем
- [`FLOWCHARTS.md`](./samples/test-cases/FLOWCHARTS.md) — Mermaid-блок-схемы алгоритмов
- [`diagrams/`](./samples/test-cases/diagrams) — drawio-схемы по ГОСТ 19.701-90 (fuzzy, multiop, crisp, architecture, sequence)
