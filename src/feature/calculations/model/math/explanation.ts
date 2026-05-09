export const explanationSymptom = (status, term, symptom_name) => {
  const explanationSymptomModel = {
    "0": `Эксперт не квалифирован для симптома ${symptom_name}`,
    "1": `Терм ${symptom_name} не подтверждается данными поставщика`,
    "2": `Терм ${symptom_name} подтверждается данными поставщика`,
    "3": `Невозможно определить состояние терма ${symptom_name}, так как мнение эксперта расходится с данными`,
    "4": `Невозможно определить состояние терма ${symptom_name}, так как по этому параметру отсутствует информация`,
    "5": `На опыте эксперта можно сказать, что терм ${symptom_name} не подтверждается`,
    "6": `На опыте эксперта можно сказать, что терм ${symptom_name} подтверждается`,
    "7": ""
  }
  term["explanation"] = [explanationSymptomModel[status]];
}

export const explanationSolveForArea = (solve, name) => {
  const explanationAreaModel = {
    "0": `Для правила ${name} эксперт недостаточно квалифицирован`,
    "1": `Правило ${name} не подходит`,
    "2": `Правило ${name} подходит`,
    "3": `Противоречие между мнением эксперта и данными — точное состояние правила ${name} установить нельзя`,
    "4": `Правило ${name} потенциально применимо, но направление одного из параметров не определено`,
    "5": `На опыте эксперта правило ${name} не подходит`,
    "6": `На опыте эксперта правило ${name} подходит`,
    "7": `Для уточнения правила ${name} требуется дополнительная информация`
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