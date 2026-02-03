import lexer from "../logic/lexer";
import parseTerm from "../logic/parser";

import { metaconjunction, metadisjunction, metanegation } from "./operations";
import {
  explanationSymptom,
  explanationSolveForArea,
  explanationMetaoperation,
} from "./explanation";
import { areas } from "@/shared/config/data/preparingknowledgeBase";
import { useSupplierStore } from "@/shared/store/suppliers";
import { pearsonCorrelation } from "@/shared/lib/pearsonCorrelation";

const result = (patientId: number) => {
  const parametrs = getParametrsByPatient(patientId);
  const symptoms = getSymptoms(parametrs);
  areas.forEach((area) => {
    const { status, explanation } = getAnswerForArea(symptoms, area);
    area["status"] = status;
    area["explanation"] = explanation;
    area["answer"] = explanationSolveForArea(area["status"], area.name_area);
  });
  return areas;
};
const getParametrSymprom = (id: number) => {
  try {
    const symptomsByParamId = {
      1: {
        symptoms: [
          {
            id: 1,
            name_symptom: "L↑",
            range_start_symptom: 49.9,
            range_end_symptom: 75,
            parametrs: [
              {
                id: 1,
                name_parametr: "local hiring↑",
                max_value_parametr: 100.1,
                min_value_parametr: 49.9,
              },
            ],
          },
          {
            id: 2,
            name_symptom: "M↑",
            range_start_symptom: 50,
            range_end_symptom: 100,
            parametrs: [
              {
                id: 1,
                name_parametr: "local hiring↑",
                max_value_parametr: 100.1,
                min_value_parametr: 49.9,
              },
            ],
          },
          {
            id: 3,
            name_symptom: "H↑",
            range_start_symptom: 75,
            range_end_symptom: 100.1,
            parametrs: [
              {
                id: 1,
                name_parametr: "local hiring↑",
                max_value_parametr: 100.1,
                min_value_parametr: 49.9,
              },
            ],
          },
        ],
      },

      2: {
        symptoms: [
          {
            id: 7,
            name_symptom: "L↑",
            range_start_symptom: 69.9,
            range_end_symptom: 90,
            parametrs: [
              {
                id: 2,
                name_parametr: "completeness↑",
                max_value_parametr: 100.1,
                min_value_parametr: 69.9,
              },
            ],
          },
          {
            id: 8,
            name_symptom: "M↑",
            range_start_symptom: 70,
            range_end_symptom: 100,
            parametrs: [
              {
                id: 2,
                name_parametr: "completeness↑",
                max_value_parametr: 100.1,
                min_value_parametr: 69.9,
              },
            ],
          },
          {
            id: 9,
            name_symptom: "H↑",
            range_start_symptom: 90,
            range_end_symptom: 100.1,
            parametrs: [
              {
                id: 2,
                name_parametr: "completeness↑",
                max_value_parametr: 100.1,
                min_value_parametr: 69.9,
              },
            ],
          },
        ],
      },

      3: {
        symptoms: [
          {
            id: 13,
            name_symptom: "L↑",
            range_start_symptom: 0.1,
            range_end_symptom: 5,
            parametrs: [
              {
                id: 3,
                name_parametr: "defects↑",
                max_value_parametr: 30.1,
                min_value_parametr: 0.1,
              },
            ],
          },
          {
            id: 14,
            name_symptom: "M↑",
            range_start_symptom: 0.1,
            range_end_symptom: 20,
            parametrs: [
              {
                id: 3,
                name_parametr: "defects↑",
                max_value_parametr: 30.1,
                min_value_parametr: 0.1,
              },
            ],
          },
          {
            id: 15,
            name_symptom: "H↑",
            range_start_symptom: 20,
            range_end_symptom: 30,
            parametrs: [
              {
                id: 3,
                name_parametr: "defects↑",
                max_value_parametr: 30.1,
                min_value_parametr: 0.1,
              },
            ],
          },
        ],
      },

      4: {
        symptoms: [
          {
            id: 4,
            name_symptom: "L↓",
            range_start_symptom: 49.9,
            range_end_symptom: 75,
            parametrs: [
              {
                id: 4,
                name_parametr: "local hiring↓",
                max_value_parametr: 100.1,
                min_value_parametr: 49.9,
              },
            ],
          },
          {
            id: 5,
            name_symptom: "M↓",
            range_start_symptom: 49.9,
            range_end_symptom: 100,
            parametrs: [
              {
                id: 4,
                name_parametr: "local hiring↓",
                max_value_parametr: 100.1,
                min_value_parametr: 49.9,
              },
            ],
          },
          {
            id: 6,
            name_symptom: "H↓",
            range_start_symptom: 49.9,
            range_end_symptom: 100.1,
            parametrs: [
              {
                id: 4,
                name_parametr: "local hiring↓",
                max_value_parametr: 100.1,
                min_value_parametr: 49.9,
              },
            ],
          },
        ],
      },

      5: {
        symptoms: [
          {
            id: 10,
            name_symptom: "L↓",
            range_start_symptom: 69.9,
            range_end_symptom: 90,
            parametrs: [
              {
                id: 5,
                name_parametr: "completeness↓",
                max_value_parametr: 100.1,
                min_value_parametr: 69.9,
              },
            ],
          },
          {
            id: 11,
            name_symptom: "M↓",
            range_start_symptom: 70,
            range_end_symptom: 100,
            parametrs: [
              {
                id: 5,
                name_parametr: "completeness↓",
                max_value_parametr: 100.1,
                min_value_parametr: 69.9,
              },
            ],
          },
          {
            id: 12,
            name_symptom: "H↓",
            range_start_symptom: 90,
            range_end_symptom: 100.1,
            parametrs: [
              {
                id: 5,
                name_parametr: "completeness↓",
                max_value_parametr: 100.1,
                min_value_parametr: 69.9,
              },
            ],
          },
        ],
      },

      6: {
        symptoms: [
          {
            id: 16,
            name_symptom: "L↓",
            range_start_symptom: 0.1,
            range_end_symptom: 5,
            parametrs: [
              {
                id: 6,
                name_parametr: "defects↓",
                max_value_parametr: 30.1,
              },
            ],
          },
          {
            id: 17,
            name_symptom: "M↓",
            range_start_symptom: 0.1,
            range_end_symptom: 20,
            parametrs: [
              {
                id: 6,
                name_parametr: "defects↓",
                max_value_parametr: 30.1,
                min_value_parametr: 0.1,
              },
            ],
          },
          {
            id: 18,
            name_symptom: "H↓",
            range_start_symptom: 20,
            range_end_symptom: 30,
            parametrs: [
              {
                id: 6,
                name_parametr: "defects↓",
                max_value_parametr: 30.1,
                min_value_parametr: 0.1,
              },
            ],
          },
        ],
      },
    } as const;
    return symptomsByParamId[id];
  } catch (e) {
    return e;
  }
};

const getParametrsByPatient = (id: number) => {
  const supplier = useSupplierStore
    .getState()
    .supplier.find((x) => x.id === id);
  const data = supplier?.data ?? [];
  const t = data.map((d) => d.month);

  const localHiring = pearsonCorrelation(
    data.map((d) => d.localHiring),
    t,
  );

  const completeness = pearsonCorrelation(
    data.map((d) => d.completeness),
    t,
  );

  const defects = pearsonCorrelation(
    data.map((d) => d.defects),
    t,
  );
  const last = supplier?.data[supplier?.data.length - 1];

  console.log({ localHiring, completeness, defects });
  const parametrs = [];
  if (localHiring > 0.2) {
    parametrs.push({
      id: 1,
      name_parametr: "local hiring↑",
      patient_parametr: {
        value_parametr: last?.localHiring,
        exactly_parametr: last?.quality?.localHiring,
      },
    });
    parametrs.push({
      id: 4,
      name_parametr: "local hiring↓",
      patient_parametr: {
        value_parametr: null,
        exactly_parametr: 1,
      },
    });
  } else {
    parametrs.push({
      id: 1,
      name_parametr: "local hiring↑",
      patient_parametr: {
        value_parametr: null,
        exactly_parametr: 1,
      },
    });
    parametrs.push({
      id: 4,
      name_parametr: "local hiring↓",
      patient_parametr: {
        value_parametr: last?.localHiring,
        exactly_parametr: last?.quality?.localHiring,
      },
    });
  }
  if (completeness > 0.2) {
    parametrs.push({
      id: 2,
      name_parametr: "completeness↑",
      patient_parametr: {
        value_parametr: last?.completeness,
        exactly_parametr: last?.quality?.completeness,
      },
    });
    parametrs.push({
      id: 5,
      name_parametr: "completeness↓",
      patient_parametr: {
        value_parametr: null,
        exactly_parametr: 1,
      },
    });
  } else {
    parametrs.push({
      id: 2,
      name_parametr: "completeness↑",
      patient_parametr: {
        value_parametr: null,
        exactly_parametr: null,
      },
    });
    parametrs.push({
      id: 5,
      name_parametr: "completeness↓",
      patient_parametr: {
        value_parametr: last?.completeness,
        exactly_parametr: last?.quality?.completeness,
      },
    });
  }
  if (defects > 0.2) {
    parametrs.push({
      id: 3,
      name_parametr: "defects↑",
      patient_parametr: {
        value_parametr: last?.defects,
        exactly_parametr: last?.quality?.defects,
      },
    });
    parametrs.push({
      id: 6,
      name_parametr: "defects↓",
      patient_parametr: {
        value_parametr: null,
        exactly_parametr: 1,
      },
    });
  } else {
    parametrs.push({
      id: 3,
      name_parametr: "defects↑",
      patient_parametr: {
        value_parametr: null,
        exactly_parametr: 1,
      },
    });
    parametrs.push({
      id: 6,
      name_parametr: "defects↓",
      patient_parametr: {
        value_parametr: last?.defects,
        exactly_parametr: last?.quality?.defects,
      },
    });
  }
  return parametrs;
  // return {
  //   uq_patient: "356f3143-e804-40c8-8eed-8cedb5422902",
  //   name: "Попов",
  //   lastname: "Петр",
  //   fathername: null,
  //   parametrs: [
  //     {
  //       id: 1,
  //       name_parametr: "local hiring↑",
  //       patient_parametr: {
  //         value_parametr: 90,
  //         exactly_parametr: 2,
  //         createdAt: "2026-01-06T13:31:52.396Z",
  //       },
  //     },
  //     {
  //       id: 2,
  //       name_parametr: "completeness↑",
  //       patient_parametr: {
  //         value_parametr: 91,
  //         exactly_parametr: 2,
  //         createdAt: "2026-01-06T13:31:52.399Z",
  //       },
  //     },
  //     {
  //       id: 3,
  //       name_parametr: "defects↑",
  //       patient_parametr: {
  //         value_parametr: null,
  //         exactly_parametr: 2,
  //         createdAt: "2026-01-06T13:31:52.399Z",
  //       },
  //     },
  //     {
  //       id: 4,
  //       name_parametr: "local hiring↓",
  //       patient_parametr: {
  //         value_parametr: null,
  //         exactly_parametr: 2,
  //         createdAt: "2026-01-06T13:31:52.396Z",
  //       },
  //     },
  //     {
  //       id: 5,
  //       name_parametr: "completeness↓",
  //       patient_parametr: {
  //         value_parametr: null,
  //         exactly_parametr: 2,
  //         createdAt: "2026-01-06T13:31:52.399Z",
  //       },
  //     },
  //     {
  //       id: 6,
  //       name_parametr: "defects↓",
  //       patient_parametr: {
  //         value_parametr: 4,
  //         exactly_parametr: 2,
  //         createdAt: "2026-01-06T13:31:52.399Z",
  //       },
  //     },
  //   ],
  // };
};

const getSymptoms = (parametrs) => {
  const symptoms = {};
  console.log(parametrs);
  for (const parametr of parametrs) {
    const response = getParametrSymprom(parametr.id);
    const data = { ...response };
    data.symptoms.forEach((symptom) => {
      const { range_end_symptom, range_start_symptom } = symptom;
      const { exactly_parametr, value_parametr } = parametr.patient_parametr;
      const status = getSymptomStatus(
        range_end_symptom,
        range_start_symptom,
        exactly_parametr,
        value_parametr,
        parametr.id,
        symptom.name_symptom,
      );
      symptom["status"] = status;
      symptoms[`s${symptom.id}`] = symptom;
    });
  }
  return symptoms;
};

// устанавливает статус симптома для пациента
const getSymptomStatus = (end, start, exactly, value) => {
  const endN = Number(end),
    startN = Number(start),
    valueN = Number(value),
    exactlyN = Number(exactly);
  if (exactlyN === 3) return "4";
  if (exactlyN === 2) {
    return valueN >= startN && valueN <= endN ? "6" : "5";
  }
  if (exactlyN === 1) {
    return valueN >= startN && valueN <= endN ? "2" : "1";
  }
  if (exactlyN === 0) {
    return "0";
  }
};

const getAnswerForArea = (symptoms, area) => {
  let lexemes = parse(area.formula_area);
  let term = parseTerm(lexemes);
  solveFormula(symptoms, term);
  return {
    status: term?.status,
    explanation: term.explanation,
  };
};

// рекурсивный обход логической формулы и установка статусы для каждого терма
const solveFormula = (symptoms, term) => {
  const type = term.type.trim();
  if (type !== "LITERAL") {
    solveFormula(symptoms, term.left);
    solveFormula(symptoms, term.right);
    metaoperation(type, term);
  } else {
    const symptom = term.literal.value;
    const statusTerm = symptoms[symptom].status;
    const status = defineStatusSymptomWithExplanation(
      statusTerm,
      term,
      symptoms[symptom].name_symptom,
    );
    term["status"] = status;
  }
};

const getAreas = async () => {
  return await getArea();
};

const parse = (str) => {
  const lexemes = lexer(str);
  return lexemes;
};

const metaoperation = (metaoperator, term) => {
  const setsArr = [
    ["0"],
    ["1"],
    ["2"],
    ["1", "2"],
    ["4"],
    ["1", "4"],
    ["2", "4"],
    ["1", "2", "4"],
  ];
  const leftSet = setsArr[Number(term.left.status)];
  const rightSet = setsArr[Number(term.right.status)];
  const resultSet = new Set();
  leftSet.forEach((valueLeftSet) => {
    rightSet.forEach((valueRightSet) => {
      const resultValue =
        metaoperator === "&&"
          ? metaconjunction(valueLeftSet, valueRightSet)
          : metadisjunction(valueLeftSet, valueRightSet);
      resultSet.add(resultValue);
    });
  });
  let result = 0;
  resultSet.forEach((item) => (result += Number(item)));
  term["status"] = result.toString();
  explanationMetaoperation(term);
};

// определяет статус симптома с объяснением
const defineStatusSymptomWithExplanation = (status, term, symptom_name) => {
  let newStatus = status;
  if (term.negated && status !== "4") {
    newStatus = metanegation(status);
  }
  explanationSymptom(newStatus, term, symptom_name);
  return newStatus;
};
export default result;
