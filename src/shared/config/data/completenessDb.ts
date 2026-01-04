import { CriterionDbTable } from "./type";

export const completenessDb: CriterionDbTable = {
  name: "Completeness",
  range: [70, 100],
  impactFactor: 0.3,
  epsilon: 1,

  rows: [
    {
      description: "Low and increasing",
      value: { level: "L", trend: "up" },
      direction: "up",
      parameters: [69.9, 70, 70, 90],
    },
    {
      description: "Medium and increasing",
      value: { level: "M", trend: "up" },
      direction: "up",
      parameters: [70, 90, 90, 100],
    },
    {
      description: "High and increasing",
      value: { level: "H", trend: "up" },
      direction: "up",
      parameters: [90, 100, 100, 100.1],
    },
    {
      description: "Low and decreasing",
      value: { level: "L", trend: "down" },
      direction: "down",
      parameters: [90, 70, 70, 69.9],
    },
    {
      description: "Medium and decreasing",
      value: { level: "M", trend: "down" },
      direction: "down",
      parameters: [100, 90, 90, 70],
    },
    {
      description: "High and decreasing",
      value: { level: "H", trend: "down" },
      direction: "down",
      parameters: [100.1, 100, 100, 90],
    },
  ],
};
