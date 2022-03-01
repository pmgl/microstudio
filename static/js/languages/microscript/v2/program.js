this.Program = (function() {
  function Program() {
    this.statements = [];
  }

  Program.prototype.add = function(statement) {
    return this.statements.push(statement);
  };

  Program.prototype.isAssignment = function() {
    return this.statements.length > 0 && this.statements[this.statements.length - 1] instanceof Program.Assignment;
  };

  return Program;

})();

this.Program.Expression = (function() {
  function Expression() {}

  return Expression;

})();

this.Program.Assignment = (function() {
  function Assignment(token1, field1, expression1, local) {
    this.token = token1;
    this.field = field1;
    this.expression = expression1;
    this.local = local;
  }

  return Assignment;

})();

this.Program.SelfAssignment = (function() {
  function SelfAssignment(token1, field1, operation, expression1) {
    this.token = token1;
    this.field = field1;
    this.operation = operation;
    this.expression = expression1;
  }

  return SelfAssignment;

})();

this.Program.Value = (function() {
  function Value(token1, type, value1) {
    this.token = token1;
    this.type = type;
    this.value = value1;
  }

  Value.TYPE_NUMBER = 1;

  Value.TYPE_STRING = 2;

  Value.TYPE_ARRAY = 3;

  Value.TYPE_OBJECT = 4;

  Value.TYPE_FUNCTION = 5;

  Value.TYPE_CLASS = 6;

  return Value;

})();

this.Program.CreateFieldAccess = function(token, expression, field) {
  if (expression instanceof Program.Field) {
    expression.appendField(field);
    return expression;
  } else {
    return new Program.Field(token, expression, [field]);
  }
};

this.Program.Variable = (function() {
  function Variable(token1, identifier) {
    this.token = token1;
    this.identifier = identifier;
  }

  return Variable;

})();

this.Program.Field = (function() {
  function Field(token1, expression1, chain) {
    this.token = token1;
    this.expression = expression1;
    this.chain = chain;
    this.token = this.expression.token;
  }

  Field.prototype.appendField = function(field) {
    return this.chain.push(field);
  };

  return Field;

})();

Program.BuildOperations = function(ops, terms) {
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

this.Program.Operation = (function() {
  function Operation(token1, operation, term1, term2) {
    this.token = token1;
    this.operation = operation;
    this.term1 = term1;
    this.term2 = term2;
  }

  return Operation;

})();

this.Program.Negate = (function() {
  function Negate(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

  return Negate;

})();

this.Program.Not = (function() {
  function Not(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

  return Not;

})();

this.Program.Braced = (function() {
  function Braced(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

  return Braced;

})();

this.Program.Return = (function() {
  function Return(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

  return Return;

})();

this.Program.Condition = (function() {
  function Condition(token1, chain) {
    this.token = token1;
    this.chain = chain;
  }

  return Condition;

})();

this.Program.For = (function() {
  function For(token1, iterator, range_from, range_to, range_by, sequence) {
    this.token = token1;
    this.iterator = iterator;
    this.range_from = range_from;
    this.range_to = range_to;
    this.range_by = range_by;
    this.sequence = sequence;
  }

  return For;

})();

this.Program.ForIn = (function() {
  function ForIn(token1, iterator, list, sequence) {
    this.token = token1;
    this.iterator = iterator;
    this.list = list;
    this.sequence = sequence;
  }

  return ForIn;

})();

Program.toString = function(value, nesting) {
  var i, j, k, key, len, pref, ref, s, v;
  if (nesting == null) {
    nesting = 0;
  }
  if (value instanceof Program.Function) {
    if (nesting === 0) {
      return value.source;
    } else {
      return "[function]";
    }
  } else if (typeof value === "function") {
    return "[native function]";
  } else if (typeof value === "string") {
    return "\"" + value + "\"";
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
      s += pref + ("  " + key + " = " + (Program.toString(v, nesting + 1)) + "\n");
    }
    return s + pref + "end";
  }
  return value || 0;
};

this.Program.While = (function() {
  function While(token1, condition, sequence) {
    this.token = token1;
    this.condition = condition;
    this.sequence = sequence;
  }

  return While;

})();

this.Program.Break = (function() {
  function Break(token1) {
    this.token = token1;
    this.nopop = true;
  }

  return Break;

})();

this.Program.Continue = (function() {
  function Continue(token1) {
    this.token = token1;
    this.nopop = true;
  }

  return Continue;

})();

this.Program.Function = (function() {
  function Function(token1, args, sequence, end) {
    this.token = token1;
    this.args = args;
    this.sequence = sequence;
    this.source = "function" + this.token.tokenizer.input.substring(this.token.index, end.index + 2);
  }

  return Function;

})();

this.Program.FunctionCall = (function() {
  function FunctionCall(token1, expression1, args) {
    this.token = token1;
    this.expression = expression1;
    this.args = args;
  }

  return FunctionCall;

})();

this.Program.CreateObject = (function() {
  function CreateObject(token1, fields) {
    this.token = token1;
    this.fields = fields;
  }

  return CreateObject;

})();

this.Program.CreateClass = (function() {
  function CreateClass(token1, ext, fields) {
    this.token = token1;
    this.ext = ext;
    this.fields = fields;
  }

  return CreateClass;

})();

this.Program.NewCall = (function() {
  function NewCall(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
    if (!(this.expression instanceof Program.FunctionCall)) {
      this.expression = new Program.FunctionCall(this.token, this.expression, []);
    }
  }

  return NewCall;

})();

this.Program.After = (function() {
  function After(token1, delay, sequence, end) {
    this.token = token1;
    this.delay = delay;
    this.sequence = sequence;
    this.source = "after " + this.token.tokenizer.input.substring(this.token.index, end.index + 2);
  }

  return After;

})();

this.Program.Every = (function() {
  function Every(token1, delay, sequence, end) {
    this.token = token1;
    this.delay = delay;
    this.sequence = sequence;
    this.source = "every " + this.token.tokenizer.input.substring(this.token.index, end.index + 2);
  }

  return Every;

})();

this.Program.Do = (function() {
  function Do(token1, sequence, end) {
    this.token = token1;
    this.sequence = sequence;
    this.source = "do " + this.token.tokenizer.input.substring(this.token.index, end.index + 2);
  }

  return Do;

})();

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
  "and": 10,
  "or": 9
};
