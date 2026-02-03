import Lexeme from "./Lexeme";
import { AND, OR, L_BR, NOT, R_BR, OPER, EOF } from "./types";

const lexer = (str) => { 
  const lexemes = [];
  let pos = 0;

  for (pos; pos < str.length; ) {
    str = str.replace(/ /g, "");
    switch (str[pos]) {
      case "&": {
        lexemes.push(new Lexeme(AND, str[pos]));
        pos++;
        break;
      }
      case "+": {
        lexemes.push(new Lexeme(OR, str[pos]));
        pos++;
        break;
      }
      case "(": {
        lexemes.push(new Lexeme(L_BR, str[pos]));
        pos++;
        break;
      }
      case ")": {
        lexemes.push(new Lexeme(R_BR, str[pos]));
        pos++;
        break;
      }
      case "!": {
        lexemes.push(new Lexeme(NOT, str[pos]));
        pos++;
        break;
      }
      default: {
        if (
          (str[pos] >= "A" && str[pos] <= "Z") ||
          (str[pos] >= "a" && str[pos] <= "z") ||
          (str[pos]) >= 0 && str[pos] <= 9
        ) {
          const sb = [];
          let c;
          do {
            sb.push(str[pos]);
            pos++;
            if (pos >= str.length) break;
            c = str[pos];
          } while ((c >= "A" && c <= "Z") || (c >= "a" && c <= "z") || (str[pos]) >= 0 && str[pos] <= 9);
          lexemes.push(new Lexeme(OPER, sb.join("")));
        } else {
          if (str[pos] !== " ") {
            throw new Error("Unexpected character: " + str[pos]);
          }
          pos++;
        }
      }
    }
  }
  lexemes.push(new Lexeme(EOF, ""));
  return lexemes;
};

export default lexer;
