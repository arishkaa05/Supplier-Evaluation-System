// конъюнкция аргументов
export const metaconjunction = (left, right) => {
  if (left === "0" || right === "0") return "0";
  const conjuction = {
    "11": "1", "12": "1", "14": "1",
    "21": "1", "22": "2", "24": "4",
    "41": "1", "42": "4", "44": "4"
  };
  return conjuction[`${left}${right}`];
}
// дизъюнкция аргументов
export const metadisjunction = (left, right) => {
  if (left === "0" || right === "0") return "0";
  const disjunction = {
    "11": "1", "12": "2", "14": "4",
    "21": "2", "22": "2", "24": "2",
    "41": "4", "42": "2", "44": "2"
  };
  return disjunction[`${left}${right}`];
}
// отрицание 
export const metanegation = (value) => {
  const negated = {
    "0": "0", "1": "2", "2": "1", "3": "3",
    "4": "4", "5": "6", "6": "5", "7": "7"
  }
  return negated[value];
}