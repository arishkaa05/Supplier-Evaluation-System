import { AND, OR, L_BR, R_BR, NOT, EOF } from './types';
import Term from './Expression';


function setPriority(value) {
  if (value === ' + ') return 1;
  else if (value === ' && ')  return 2;
  else if (value === ' ! ')  return 3;
  else return null; 
}


export default function parseTerm(str) {
  let operandStack = [];
  let operatorStack = [];
  str.forEach((element) => {
    switch(element.type){
      case L_BR:
        operatorStack.push('(')
        break;
      case OR:
        if (setPriority(operatorStack[operatorStack.length - 1]) && setPriority(operatorStack[operatorStack.length - 1]) === 1) { // если в стеке +
          calculate(operandStack, operatorStack)
        }
        else if (setPriority(operatorStack[operatorStack.length - 1]) && setPriority(operatorStack[operatorStack.length - 1]) >= 2) { // если в стеке && или !
          calculate(operandStack, operatorStack) }
        operatorStack.push(" + ")
        break;
      case AND:
        if (setPriority(operatorStack[operatorStack.length - 1]) && setPriority(operatorStack[operatorStack.length - 1]) >= 2) { // если в стеке && или !
          calculate(operandStack, operatorStack)
        }
        operatorStack.push( " && ")
        break;
      case NOT:
        operatorStack.push( " ! ")
        break;
      case R_BR:
        calculate(operandStack, operatorStack)
        break;
      case EOF:
          while (operatorStack.length > 0) calculate(operandStack, operatorStack)
        break;
      default:
        operandStack.push(new Term(Term.LITERAL, element))
    }
  });
  return operandStack[0];
}

function calculate(operandStack, operatorStack) {
  const operator = operatorStack.pop();
  if (operator === ' ! ')  {
    const left = operandStack.pop();
    operandStack.push(left.negate())
  } else {
    const left = operandStack.pop();
    const right = operandStack.pop();
    let result = new Term(operator, left, right);

    if (operatorStack[operatorStack.length - 1] === '(') operatorStack.pop();
    operandStack.push(result);
  }
}