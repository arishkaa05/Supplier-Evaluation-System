import lexer from "./lexer";
import parseTerm from "./parser";
import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);

export function cnf(str: string) {
  let lexemes = parse(str);

  let term = parseTerm(lexemes);
  let formulaCNF = term.toCNF().toString();
  formulaCNF = formulaCNF.replace(/[()]/g, "");

  let arr = formulaCNF.split(" && ");
  arr.forEach((element, i) => {
    element = element.replace(/ /g, "");
    let temp = element.split("+");
    temp = [...new Set(temp)].sort();
    arr[i] = temp.join("+");
  });
  let res = arr.sort().join("&");
  return bcrypt.hashSync(res, salt);
}

const parse = (str) => {
  const lexemes = lexer(str);
  return lexemes;
};
