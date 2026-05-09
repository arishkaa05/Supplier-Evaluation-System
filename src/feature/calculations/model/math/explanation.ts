export const explanationSymptom = (status, term, symptom_name) => {
  const explanationSymptomModel = {
    "0": `Эксперт не квалифирован для определения ${symptom_name}`,
    "1": `У поставщика нет ${symptom_name}`,
    "2": `У поставщика есть ${symptom_name}`,
    "3": `Невозможно определить состояние ${symptom_name}, так как мнение эксперта и аппарата не сходятся`,
    "4": `Невозможно определить состояние ${symptom_name}, так как аппарат не работает`,
    "5": `На основе опыта эксперта можно сказать, что ${symptom_name} нет у поставщика`,
    "6": `На основе опыта эксперта можно сказать, что ${symptom_name} есть у поставщика`,
    "7": ""
  }
  term["explanation"] = [explanationSymptomModel[status]];
} 

export const explanationSolveForArea = (solve, name) => {
  const explanationAreaModel = {
    "0": `Для правила ${name} эксперт не достаточно квалифицирован`,
    "1": `Правило ${name} не подходит`,
    "2": `Правило ${name} подходит`,
    "3": `Из-за противоречия эксперта и машины невозможно точно определить состояние области ${name}`,
    "4": `Невозможно определить состояние правила ${name}, так как не для всех симптомов имеется информация`,
    "5": `Основываясь на опыте эксперта можно сказать, что правило ${name} не подходит`,
    "6": `Основываясь на опыте эксперта можно сказать, что правило ${name} подходит`,
    "7": `Для более точного определения состояния правила ${name} необходимы уточнения в симптомах`
  }
  return explanationAreaModel[solve];
}

export const explanationSolveForQuality = (quality) => {
  const explanationQualityModel = { 
    "1": `Направление определяется точно`,
    "2": `Основываясь на опыте эксперта можно сказать, что направление определено верно`,
    "3": `Невозможно точно определить направление для правила`
  }
  return explanationQualityModel[quality];
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