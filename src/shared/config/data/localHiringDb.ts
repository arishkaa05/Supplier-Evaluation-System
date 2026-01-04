import { CriterionDbTable } from "./type";
 
export const localHiringDb: CriterionDbTable = {
  name: "Local hiring",
  range: [50, 100],
  impactFactor: 0.2,
  epsilon: 1,
  rows: [
    {
      description: "Low and increasing",
      value: { level: "L", trend: "up" },
      direction: "up",
      parameters: [49.9, 50, 50, 75],
    },
    {
      description: "Medium and increasing",
      value: { level: "M", trend: "up" },
      direction: "up",
      parameters: [50, 75, 75, 100],
    },
    {
      description: "High and increasing",
      value: { level: "H", trend: "up" },
      direction: "up",
      parameters: [75, 100, 100, 100.1],
    },
    {
      description: "Low and decreasing",
      value: { level: "L", trend: "down" },
      direction: "down",
      parameters: [75, 50, 50, 49.9],
    },
    {
      description: "Medium and decreasing",
      value: { level: "M", trend: "down" },
      direction: "down",
      parameters: [100, 75, 75, 50],
    },
    {
      description: "High and decreasing",
      value: { level: "H", trend: "down" },
      direction: "down",
      parameters: [100.1, 100, 100, 75],
    },
  ],
};