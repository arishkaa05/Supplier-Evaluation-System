import { CriterionDbTable } from "./type";

export const defectsDb: CriterionDbTable = {
  name: "Defects",
  range: [0, 30],
  impactFactor: 0.25,
  epsilon: -1,

  rows: [
    {
      description: "Low and increasing",
      value: { level: "L", trend: "up" },
      direction: "up",
      parameters: [-0.1, 0, 0, 5],
    },
    {
      description: "Medium and increasing",
      value: { level: "M", trend: "up" },
      direction: "up",
      parameters: [0, 10, 10, 20],
    },
    {
      description: "High and increasing",
      value: { level: "H", trend: "up" },
      direction: "up",
      parameters: [20, 30, 30, 30.1],
    },
    {
      description: "Low and decreasing",
      value: { level: "L", trend: "down" },
      direction: "down",
      parameters: [5, 0, 0, -0.1],
    },
    {
      description: "Medium and decreasing",
      value: { level: "M", trend: "down" },
      direction: "down",
      parameters: [20, 10, 10, 0],
    },
    {
      description: "High and decreasing",
      value: { level: "H", trend: "down" },
      direction: "down",
      parameters: [30.1, 30, 30, 20],
    },
  ],
};
