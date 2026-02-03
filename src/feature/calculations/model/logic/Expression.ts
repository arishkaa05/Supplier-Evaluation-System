
class Term {
  constructor(type) {
    this.type = type;
    this.negated = false;

    switch (type) {
      case Term.AND:
      case Term.OR:
        this.left = arguments[1];
        this.right = arguments[2];
        break;
      case Term.LITERAL:
        this.literal = arguments[1];
        break;
    }
  }
  negate() {
    this.negated = !this.negated;
    return this;
  }
  deMorgen() {
    if (this.hasChildren()) {
      this.negate();
      this.type = this.oppositeType();
      this.left.negate();
      this.right.negate();
    }
    return this;
  }

  shoveNegation() {
    if (this.negated)
      this.deMorgen();

    if (this.hasChildren()) {
      this.left.shoveNegation();
      this.right.shoveNegation();
    }

    return this;
  }
  distributeDisjunction() {
    if (this.hasChildren()) {
      this.left.distributeDisjunction();
      this.right.distributeDisjunction();
    }

    if (this.type == Term.OR) {
      // (Q && R) + P -> (Q + P) && (R + P)
      let decomposeTarget; // (Q && R)
      let injectTarget; // P

      if (this.left.type == Term.AND) {
        decomposeTarget = this.left;
        injectTarget = this.right;
      } else if (this.right.type == Term.AND) {
        decomposeTarget = this.right;
        injectTarget = this.left;
      } else {
        // nothing to do
        return this;
      }

      // (Q + P)
      let newLeft = injectTarget.equalTo(decomposeTarget.left)
        ? injectTarget
        : new Term(
          Term.OR,
          decomposeTarget.left,
          injectTarget // P
        );

      // (R + P)
      let newRight = injectTarget.equalTo(decomposeTarget.right)
        ? injectTarget
        : new Term(
          Term.OR,
          decomposeTarget.right,
          injectTarget // P
        );

      this.type = Term.AND;
      this.left = newLeft;
      this.right = newRight;
    }

    return this;
  }
  toCNF() {
    this.shoveNegation();
    this.distributeDisjunction();
    return this;
  }
  oppositeType() {
    return this.type == Term.AND ? Term.OR : Term.AND;
  }
  hasChildren() {
    return this.type != Term.LITERAL;
  }
  // deeply compare
  equalTo(term) {
    if (this.type != term.type)
      return false;

    if (this.type == Term.LITERAL)
      return this.literal == term.literal;

    return this.type == term.type &&
      this.left.equalTo(term.left) &&
      this.right.equalTo(term.right);
  }
  toString() {
    return this.stringExpression(this.type);
  }
  stringExpression(parentType) {
    let str;

    switch (this.type) {
      case Term.LITERAL:
        str = this.literal.value;
        break;
      case Term.AND:
      case Term.OR:
        str =
          this.left.stringExpression(this.type) +
          this.type +
          this.right.stringExpression(this.type);
        if (this.negated + this.type != parentType)
          str = "(" + str + ")";
        break;
    }

    return (this.negated ? "!" : "") + str;
  }
}

Term.AND     = " && ",
Term.OR      = " + ",  
Term.LITERAL = " LITERAL ";

export default Term;