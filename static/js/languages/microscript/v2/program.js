this.Program = class Program {
  constructor() {
    this.statements = [];
  }

  add(statement) {
    return this.statements.push(statement);
  }

  isAssignment() {
    return this.statements.length > 0 && this.statements[this.statements.length - 1] instanceof Program.Assignment;
  }

};

this.Program.Expression = class Expression {
  constructor() {}

};

this.Program.Assignment = class Assignment {
  constructor(token1, field1, expression1, local) {
    this.token = token1;
    this.field = field1;
    this.expression = expression1;
    this.local = local;
  }

};

this.Program.SelfAssignment = class SelfAssignment {
  constructor(token1, field1, operation, expression1) {
    this.token = token1;
    this.field = field1;
    this.operation = operation;
    this.expression = expression1;
  }

};

this.Program.Value = (function() {
  class Value {
    constructor(token1, type, value1) {
      this.token = token1;
      this.type = type;
      this.value = value1;
    }

  };

  Value.TYPE_NUMBER = 1;

  Value.TYPE_STRING = 2;

  Value.TYPE_ARRAY = 3;

  Value.TYPE_OBJECT = 4;

  Value.TYPE_FUNCTION = 5;

  Value.TYPE_CLASS = 6;

  return Value;

}).call(this);

this.Program.CreateFieldAccess = function(token, expression, field) {
  if (expression instanceof Program.Field) {
    expression.appendField(field);
    return expression;
  } else {
    return new Program.Field(token, expression, [field]);
  }
};

this.Program.Variable = class Variable {
  constructor(token1, identifier) {
    this.token = token1;
    this.identifier = identifier;
  }

};

this.Program.Field = class Field {
  constructor(token1, expression1, chain) {
    this.token = token1;
    this.expression = expression1;
    this.chain = chain;
    this.token = this.expression.token;
  }

  appendField(field) {
    return this.chain.push(field);
  }

};

this.Program.BuildOperations = function(ops, terms) {
  var i, o, o1, o2, prec, t1, t2;
  while (ops.length > 1) {
    i = 0;
    prec = 0;
    while (i < ops.length - 1) {
      o1 = ops[i];
      o2 = ops[i + 1];
      if (Program.Precedence[o2.operation] <= Program.Precedence[o1.operation]) {
        break;
      }
      i++;
    }
    t1 = terms[i];
    t2 = terms[i + 1];
    o = new Program.Operation(ops[i].token, ops[i].operation, t1, t2);
    terms.splice(i, 2, o);
    ops.splice(i, 1);
  }
  return new Program.Operation(ops[0].token, ops[0].operation, terms[0], terms[1]);
};

this.Program.Operation = class Operation {
  constructor(token1, operation, term1, term2) {
    this.token = token1;
    this.operation = operation;
    this.term1 = term1;
    this.term2 = term2;
  }

};

this.Program.Negate = class Negate {
  constructor(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

};

this.Program.Not = class Not {
  constructor(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

};

this.Program.Braced = class Braced {
  constructor(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

};

this.Program.Return = class Return {
  constructor(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

};

this.Program.Condition = class Condition {
  constructor(token1, chain) {
    this.token = token1;
    this.chain = chain;
  }

};

this.Program.For = class For {
  constructor(token1, iterator, range_from, range_to, range_by, sequence) {
    this.token = token1;
    this.iterator = iterator;
    this.range_from = range_from;
    this.range_to = range_to;
    this.range_by = range_by;
    this.sequence = sequence;
  }

};

this.Program.ForIn = class ForIn {
  constructor(token1, iterator, list, sequence) {
    this.token = token1;
    this.iterator = iterator;
    this.list = list;
    this.sequence = sequence;
  }

};

this.Program.toString = function(value, nesting = 0) {
  var i, j, k, key, len, pref, ref, s, v;
  if (value instanceof Routine) {
    if (nesting === 0) {
      return value.source || "[function]";
    } else {
      return "[function]";
    }
  } else if (typeof value === "function") {
    return "[native function]";
  } else if (typeof value === "string") {
    return `"${value}"`;
  } else if (Array.isArray(value)) {
    if (nesting >= 1) {
      return "[list]";
    }
    s = "[";
    for (i = j = 0, len = value.length; j < len; i = ++j) {
      v = value[i];
      s += Program.toString(v, nesting + 1) + (i < value.length - 1 ? "," : "");
    }
    return s + "]";
  } else if (typeof value === "object") {
    if (nesting >= 1) {
      return "[object]";
    }
    s = "object\n";
    pref = "";
    for (i = k = 1, ref = nesting; k <= ref; i = k += 1) {
      pref += "  ";
    }
    for (key in value) {
      v = value[key];
      s += pref + `  ${key} = ${Program.toString(v, nesting + 1)}\n`;
    }
    return s + pref + "end";
  }
  return value || 0;
};

this.Program.While = class While {
  constructor(token1, condition, sequence) {
    this.token = token1;
    this.condition = condition;
    this.sequence = sequence;
  }

};

this.Program.Break = class Break {
  constructor(token1) {
    this.token = token1;
    this.nopop = true;
  }

};

this.Program.Continue = class Continue {
  constructor(token1) {
    this.token = token1;
    this.nopop = true;
  }

};

this.Program.Function = class Function {
  constructor(token1, args, sequence, end) {
    this.token = token1;
    this.args = args;
    this.sequence = sequence;
    this.source = "function" + this.token.tokenizer.input.substring(this.token.index, end.index + 2);
  }

};

this.Program.FunctionCall = class FunctionCall {
  constructor(token1, expression1, args) {
    this.token = token1;
    this.expression = expression1;
    this.args = args;
  }

};

this.Program.CreateObject = class CreateObject {
  constructor(token1, fields) {
    this.token = token1;
    this.fields = fields;
  }

};

this.Program.CreateClass = class CreateClass {
  constructor(token1, ext, fields) {
    this.token = token1;
    this.ext = ext;
    this.fields = fields;
  }

};

this.Program.NewCall = class NewCall {
  constructor(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
    if (!(this.expression instanceof Program.FunctionCall)) {
      this.expression = new Program.FunctionCall(this.token, this.expression, []);
    }
  }

};

this.Program.After = class After {
  constructor(token1, delay, sequence, end, multiplier) {
    this.token = token1;
    this.delay = delay;
    this.sequence = sequence;
    this.multiplier = multiplier;
    this.source = "after " + this.token.tokenizer.input.substring(this.token.index, end.index + 2);
  }

};

this.Program.Every = class Every {
  constructor(token1, delay, sequence, end, multiplier) {
    this.token = token1;
    this.delay = delay;
    this.sequence = sequence;
    this.multiplier = multiplier;
    this.source = "every " + this.token.tokenizer.input.substring(this.token.index, end.index + 2);
  }

};

this.Program.Do = class Do {
  constructor(token1, sequence, end) {
    this.token = token1;
    this.sequence = sequence;
    this.source = "do " + this.token.tokenizer.input.substring(this.token.index, end.index + 2);
  }

};

this.Program.Sleep = class Sleep {
  constructor(token1, delay, multiplier) {
    this.token = token1;
    this.delay = delay;
    this.multiplier = multiplier;
  }

};

this.Program.Delete = class Delete {
  constructor(token1, field1) {
    this.token = token1;
    this.field = field1;
  }

};

this.Program.Precedence = {
  "^": 21,
  "/": 20,
  "*": 19,
  "%": 18,
  "+": 17,
  "-": 17,
  "<": 16,
  "<=": 15,
  ">": 14,
  ">=": 13,
  "==": 12,
  "!=": 11,
  "<<": 10,
  ">>": 9,
  "&": 8,
  "|": 7,
  "and": 6,
  "or": 5
};
