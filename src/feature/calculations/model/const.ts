// μ для defuzzification по формуле (11) из статьи Rudnik et al. (Entropy 2024).
// В тексте статьи указано μ=0.8, но численные значения в Table 6 (crisp assessment
// и итоговая оценка 68.2778 для Supplier A) воспроизводятся только при μ=0.9 —
// при μ=0.8 каждое crisp значение получается выше на ~1–2 пункта.
export const MU_DEFUZZ = 0.9;
export const RHO_DEFECTS = 0.25;
