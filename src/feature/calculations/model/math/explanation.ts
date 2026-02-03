export const explanationSymptom = (status, term, symptom_name) => {
  const explanationSymptomModel = {
    "0": `Эксперт не квалифирован для симптома ${symptom_name}`,
    "1": `Симптома ${symptom_name} нет у пациента`,
    "2": `Симптом ${symptom_name} есть у пациента`,
    "3": `Невозможно определить состояние симптома ${symptom_name}, так как мнение эксперта и аппарата не сходятся`,
    "4": `Невозможно определить состояние симптома ${symptom_name}, так как аппарат не работает`,
    "5": `На основе опыта эксперта можно сказать, что симптома ${symptom_name} нет у пациента`,
    "6": `На основе опыта эксперта можно сказать, что симптом ${symptom_name} есть у пациента`,
    "7": ""
  }
  term["explanation"] = [explanationSymptomModel[status]];
}

export const explanationSolveForArea = (solve, name) => {
  const explanationAreaModel = {
    "0": `Для области ${name} эксперт не достаточно квалифицирован`,
    "1": `Область ${name} не подходит`,
    "2": `Область ${name} подходит`,
    "3": `Из-за противоречия эксперта и машины невозможно точно определить состояние области ${name}`,
    "4": `Невозможно определить состояние области ${name}, так как не для всех симптомов имеется информация`,
    "5": `Основываясь на опыте эксперта можно сказать, что область ${name} не подходит`,
    "6": `Основываясь на опыте эксперта можно сказать, что область ${name} подходит`,
    "7": `Для более точного определения состояния область ${name} необходимы уточнения в симптомах`
  }
  return explanationAreaModel[solve];
}

export const explanationMetaoperation = (term) => {
  const status = Number(term.status),
    statusLeft = Number(term.left.status),
    statusRight = Number(term.right.status);
  if (status === 2 || status === 6) {
    if (statusLeft === 2 || statusLeft === 6) term.explanation = term.left.explanation;
    if (statusRight === 2 || statusRight === 6) {
      if (term.explanation && term.explanation.length > 0) term.explanation = term.explanation.concat(term.right.explanation);
      else term.explanation = term.right.explanation;
    }
  }
  else {
    if (statusLeft !== 2 && statusLeft !== 6) term.explanation = term.left.explanation;
    if (statusRight !== 2 && statusRight !== 6) {
      if (term.explanation && term.explanation.length > 0) term.explanation = term.explanation.concat(term.right.explanation);
      else term.explanation = term.right.explanation;
    }
  }
}