import { CriterionDbTable } from "./type";

export const assessmentDb: CriterionDbTable = {
  name: "Assessment",
  range: [0, 100], 
  impactFactor: 1,
  epsilon: 1,
  rows: [
    {
      description: "Low and increasing",
      value: { level: "L", trend: "up" },
      direction: "up", // Positive
      parameters: [-25, 0, 0, 50],
    },
    {
      description: "Medium and increasing",
      value: { level: "M", trend: "up" },
      direction: "up", // Positive
      parameters: [25, 50, 50, 75],
    },
    {
      description: "High and increasing",
      value: { level: "H", trend: "up" },
      direction: "up", // Positive
      parameters: [50, 100, 100, 125],
    },
    {
      description: "Low and decreasing",
      value: { level: "L", trend: "down" },
      direction: "down", // Negative
      parameters: [50, 0, 0, -25],
    },
    {
      description: "Medium and decreasing",
      value: { level: "M", trend: "down" },
      direction: "down", // Negative
      parameters: [75, 50, 50, 25],
    },
    {
      description: "High and decreasing",
      value: { level: "H", trend: "down" },
      direction: "down", // Negative
      parameters: [125, 100, 100, 50],
    },
  ],
};
