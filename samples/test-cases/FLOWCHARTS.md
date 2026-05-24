# Блок-схемы математических ядер двух ИС

Mermaid-диаграммы открываются на GitHub. Внизу — текстовое описание каждой
формулы.

---

## 1. Нечёткая логика (Fuzzy)

```mermaid
flowchart TD
    A["Вход: data[N] = {month, lh, c, d, quality{}}"] --> B{"lastBad = max i,<br/>где quality[i] ∈ {0,2,3}"}
    B -->|"lastBad ≥ 0"| C["used = data[lastBad+1 .. N]"]
    B -->|"lastBad = −1"| C2["used = data"]
    C --> D{"|used| ≥ 2?"}
    C2 --> D
    D -->|"нет"| BLOCK["status = blocked<br/>blockers по последней строке"]
    D -->|"да"| E["Для каждой метрики m ∈ {lh, c, d}:<br/>r_m = pearson(values_m, months)"]
    E --> F["trend_m = (r_m &gt; −0.2) ? up : down"]
    F --> G["Для каждой метрики:<br/>x_m = last_value<br/>μ_m,L = trapezoid(x_m, params[L, trend_m])<br/>μ_m,M = trapezoid(...)<br/>μ_m,H = trapezoid(...)"]
    G --> H["Active terms_m = {l ∈ {L,M,H} : μ_m,l &gt; 0}"]
    H --> I["Cross-product:<br/>∀ (l_lh, l_c, l_d) ∈ A_lh × A_c × A_d<br/>искать в KB правило с такими level/trend"]
    I --> J["Для каждого сработавшего правила r:<br/>computeRuleCrisp(r, values, ctx) → crisp_r"]
    J --> K["finalScore = Σ crisp_r / |fired_rules|<br/>zone = classify(finalScore)"]

    style BLOCK fill:#fee,stroke:#c00
    style J fill:#cfe,stroke:#080
```

### Ключевые формулы

**Trapezoidal membership** (нормализованная по возрастанию):

```
trapezoid(x, [a, b, c, d]):
   если x ≤ a или x ≥ d  →  0
   если b ≤ x ≤ c        →  1
   если a < x < b        →  (x − a) / (b − a)
   если c < x < d        →  (d − x) / (d − c)
```

**Pearson correlation** (используется только для определения знака тренда,
не для значения):

```
r = Σ (t_i − t̄)(y_i − ȳ)  /  √( Σ(t_i − t̄)²  ·  Σ(y_i − ȳ)² )
```

Порог `-0.2` — асимметричный: даже слабо отрицательное r читается как down.

---

## 2. Теория мультиопераций (Multiop)

```mermaid
flowchart TD
    A["Вход: data[N] = {month, lh, c, d, quality{}}"] --> B["Для каждой метрики m:<br/>aggQ_m = aggregate(quality[*, m])<br/>имеется q=0 → 3<br/>иначе q=2 → 2<br/>иначе → 1"]
    B --> C["Pearson для определения<br/>направления (только если aggQ ≠ 3):<br/>r_m → trend_m"]
    C --> D{"aggQ_m == 3?"}
    D -->|"да"| E1["push parametr m_up и m_down<br/>с last_value, exactly=3"]
    D -->|"нет"| E2["push parametr с trend_m<br/>с last_value, exactly=aggQ_m"]
    E1 --> F["Для каждой пары (parametr, symptom):<br/>status = getSymptomStatus(<br/>  symptom.range, parametr.exactly, parametr.value)"]
    E2 --> F
    F --> G["Для каждой area (правила KB):<br/>area.formula = s_lh ∧ s_c ∧ s_d<br/>area.status = metaconjunction(...)"]
    G --> H{"area.status ∈ {2,4,6}?"}
    H -->|"нет"| SKIP["правило не идёт в среднее"]
    H -->|"да"| J["computeRuleCrisp(rule, values, ctx) → crisp"]
    J --> K["finalScore = Σ crisp / contributing<br/>zone = classify(finalScore)"]

    style J fill:#cfe,stroke:#080
    style SKIP fill:#eee,stroke:#888
```

### Ключевые формулы

**getSymptomStatus(symptom_range = [start, end], exactly, value):**

```
exactly = 0 →  "0"   (источник не дал данных)
exactly = 1 →  value ∈ [start, end] ? "2" : "1"   (точные данные)
exactly = 2 →  value ∈ [start, end] ? "6" : "5"   (эксперт)
exactly = 3 →  "4"   (неопределённое направление)
```

**Метаконъюнкция (база)**:

```
       1   2   4
   1 | 1   1   1
   2 | 1   2   4
   4 | 1   4   4
```

Для составных статусов {3, 5, 6, 7} — операция через множества:
`setsArr["6"] = {"2","4"}`, и так далее. Результат — XOR-like объединение
базовых исходов (сумма уникальных кодов).

**Аггрегация финального балла:**

```
finalScore = Σ computeRuleCrisp(r) для r ∈ {area : status ∈ {2,4,6}}
             ─────────────────────────────────────────────────────────
                  |{area : status ∈ {2,4,6}}|
```

Status 5 (терм ложен по доступным данным) в среднее не идёт — это
«отбракованные» правила.

---

## 3. Общий хелпер `computeRuleCrisp` (shared)

```mermaid
flowchart TD
    A["Вход: rule, values = {lh, c, d}, ctx"] --> B["Для каждой метрики m:<br/>params_m = ctx.criterionDb_m.find(level, trend)"]
    B --> C["D_m = (trend == up)<br/>? directionDeterminantUp(value, params)<br/>: directionDeterminantDown(value, params, ρ=0.25)"]
    C --> D["DA = (ε_lh · D_lh + ε_c · D_c + ε_d · D_d) / 3<br/>где ε_lh=+1, ε_c=+1, ε_d=−1"]
    D --> E["B = ctx.assessmentDb.find(<br/>  rule.assessment.level,<br/>  rule.assessment.trend).params"]
    E --> F["Bp = ofnShift(B, DA, rule.assessment.trend)<br/>сдвигает трапецию заключения в сторону<br/>лучше/хуже по знаку DA"]
    F --> G["crisp = defuzzify(Bp, μ=0.9)<br/>= (μ·a + b + (2−μ)·d) / 3"]
    G --> H["return crisp, DA"]

    style F fill:#fec,stroke:#a60
    style G fill:#cfe,stroke:#080
```

### Формулы хелпера

**directionDeterminantUp(x, [a, b, _, c]):** число в [−1; +1],
показывающее положение `x` относительно пика `b`:

```
если a < x ≤ b  →  (x − b) / (b − a)   (отрицательное, чем дальше от пика)
если b < x < c  →  (x − b) / (c − b)   (положительное)
иначе           →  0
```

**directionDeterminantDown(x, [d, e, _, f], ρ=0.25):** аналогично, но
с компенсирующим сдвигом `−ρ` (потому что метрика «дефекты» направлена
противоположно).

**ofnShift(B = [k, l, _, m], DA, outTrend):**

```
abs = |DA|
target = (outTrend == up)
         ? (DA ≤ 0 ? toK : toM)
         : (DA ≤ 0 ? toM : toK)

Bp = [
    k + abs · (target[0] − k),
    l + abs · (target[1] − l),
    l + abs · (target[2] − l),
    m + abs · (target[3] − m),
]
```

Где `toK = [k, k, k, k]` (сдвиг к нижней границе), `toM = [m, m, m, m]`
(сдвиг к верхней).

**defuzzify(Bp = [a, b, _, d], μ=0.9):**

```
crisp = (μ·a + b + (2 − μ)·d) / 3
```

Это **взвешенный центроид** OFN при заданной горизонтальной отсечке `μ`.

---

## 4. Соединительная схема: чем системы отличаются на каждом шаге

```mermaid
flowchart LR
    subgraph IN ["Вход"]
        DATA["data[N] +<br/>quality flags"]
    end

    DATA --> F1
    DATA --> M1

    subgraph FUZZY ["Fuzzy"]
        F1["TRIM: cut everything<br/>up to last bad row"]
        F2["Pearson на хвосте"]
        F3["μ-membership для last<br/>(все термы с μ &gt; 0)"]
        F4["Cross-product → fired rules"]
        F1 --> F2 --> F3 --> F4
    end

    subgraph MULTI ["Multiop"]
        M1["Aggregate quality<br/>по всей истории"]
        M2["Pearson на полном ряду"]
        M3["Range-check симптомов<br/>+ статусы по exactly"]
        M4["Metaconjunction → area status"]
        M1 --> M2 --> M3 --> M4
    end

    F4 --> CC["computeRuleCrisp<br/>SHARED"]
    M4 --> CC

    CC --> SF["Σ / N → finalScore<br/>(fuzzy)"]
    CC --> SM["Σ / N → finalScore<br/>(multiop)"]

    style CC fill:#cfe,stroke:#080,stroke-width:3px
```

---

## 5. Точки расхождения (где математика разная)

| Шаг | Fuzzy | Multiop |
|---|---|---|
| **Окно данных** | строго точный хвост `data[lastBad+1..]` | весь ряд `data[0..]` |
| **Pearson-окно** | по хвосту | по полному ряду |
| **Принадлежность level** | непрерывная μ ∈ [0; 1] (трапеция) | булева: `last_value ∈ symptom.range` |
| **Граничное значение** | в точке `x=b` (пик) μ=1, μ соседей могут быть 0 | range-проверки соседних диапазонов могут пересекаться → активируется больше уровней |
| **Реакция на эксперта** | блокируется, если эксперт в last | даёт status 5/6 |
| **Реакция на пропуск** | обрезает до точного хвоста | даёт status 4 |
| **Когда нет результата** | `used.length < 2` | `contributing == 0` (редко) |

## 6. Точки сходства (где математика одинаковая)

| Шаг | Где |
|---|---|
| **DA — совокупный определитель направления** | `(ε_lh · D_lh + ε_c · D_c + ε_d · D_d) / 3` |
| **OFN-сдвиг заключения** | `ofnShift(B, DA, trend)` |
| **Defuzzification** | `(μ·a + b + (2−μ)·d) / 3` |
| **Финальная агрегация** | среднее crisp по сработавшим правилам |
| **Зонирование** | `≤33.33 red`, `≤66.66 yellow`, `else green` |

Эти общие части вынесены в один хелпер `computeRuleCrisp` в
[server_system/src/calc/fuzzy/index.ts](../../../server_system/src/calc/fuzzy/index.ts).
