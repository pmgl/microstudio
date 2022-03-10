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

this.Statement = (function() {
  function Statement() {}

  return Statement;

})();

this.Program.Expression = (function() {
  function Expression() {}

  return Expression;

})();

this.Program.Assignment = (function() {
  function Assignment(token1, field1, expression1, local1) {
    this.token = token1;
    this.field = field1;
    this.expression = expression1;
    this.local = local1;
    if (this.expression instanceof Program.CreateClass && this.field instanceof Program.Variable) {
      this.evaluate = (function(_this) {
        return function(context, hold) {
          context.location = _this;
          if (_this.local) {
            return _this.field.hotUpdate(context, context.local, _this.expression.evaluate(context, true));
          } else {
            return _this.field.hotUpdate(context, null, _this.expression.evaluate(context, true));
          }
        };
      })(this);
    }
  }

  Assignment.prototype.evaluate = function(context, hold) {
    context.location = this;
    if (this.local) {
      return this.field.assign(context, context.local, this.expression.evaluate(context, true));
    } else {
      return this.field.assign(context, null, this.expression.evaluate(context, true));
    }
  };

  return Assignment;

})();

this.Program.SelfAssignment = (function() {
  function SelfAssignment(token1, field1, operation, expression1) {
    this.token = token1;
    this.field = field1;
    this.operation = operation;
    this.expression = expression1;
  }

  SelfAssignment.prototype.evaluate = function(context, hold) {
    var exp;
    context.location = this;
    exp = this.expression.evaluate(context, true);
    switch (this.operation) {
      case Token.TYPE_PLUS_EQUALS:
        return this.field.add(context, exp);
      case Token.TYPE_MINUS_EQUALS:
        return this.field.sub(context, exp);
      case Token.TYPE_MULTIPLY_EQUALS:
        return this.field.mul(context, exp);
      case Token.TYPE_DIVIDE_EQUALS:
        return this.field.div(context, exp);
    }
  };

  return SelfAssignment;

})();

this.Program.Value = (function() {
  function Value(token1, type, value1) {
    this.token = token1;
    this.type = type;
    this.value = value1;
    if (this.type === Program.Value.TYPE_ARRAY) {
      this.evaluate = this.evaluateArray;
    }
  }

  Value.prototype.optimize = function() {
    if (this.type !== Program.Value.TYPE_ARRAY) {
      return this.constant = this.value;
    }
  };

  Value.prototype.evaluate = function(context) {
    return this.value;
  };

  Value.prototype.evaluateArray = function(context) {
    var j, len1, ref, res, v;
    res = [];
    ref = this.value;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      v = ref[j];
      res.push(v.evaluate(context, true));
    }
    return res;
  };

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

  Variable.prototype.assign = function(context, scope, value) {
    if (scope == null) {
      if (context.local[this.identifier] != null) {
        scope = context.local;
      } else {
        scope = context.object;
      }
    }
    return scope[this.identifier] = value;
  };

  Variable.prototype.hotUpdate = function(context, scope, value) {
    var key, val;
    if (scope == null) {
      if (context.local[this.identifier] != null) {
        scope = context.local;
      } else {
        scope = context.object;
      }
    }
    if (scope[this.identifier] != null) {
      for (key in value) {
        val = value[key];
        scope[this.identifier][key] = val;
      }
      return scope[this.identifier];
    } else {
      value.classname = this.identifier;
      return scope[this.identifier] = value;
    }
  };

  Variable.prototype.ensureCreated = function(context) {
    var id, scope, v;
    if (this.identifier === "this") {
      return context.object;
    }
    if (context.meta[this.identifier] != null) {
      scope = context.meta;
    } else if (context.local[this.identifier] != null) {
      scope = context.local;
    } else if ((context.object[this.identifier] != null) || (context.global[this.identifier] == null)) {
      scope = context.object;
    } else {
      scope = context.global;
    }
    v = scope[this.identifier];
    if ((v != null) && (Array.isArray(v) || typeof v === "object")) {
      return v;
    } else {
      id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column;
      if (!context.warnings.assigning_field_to_undefined[id]) {
        context.warnings.assigning_field_to_undefined[id] = {
          file: this.token.tokenizer.filename,
          line: this.token.line,
          column: this.token.column,
          expression: this.identifier
        };
      }
      return scope[this.identifier] = {};
    }
  };

  Variable.prototype.evaluate = function(context, hold, warn) {
    var c, id, n, obj, v;
    if (warn == null) {
      warn = true;
    }
    if (this.identifier === "this") {
      return context.object;
    }
    if (this.identifier === "super") {
      if ((context.superClass != null) && (context.childName != null)) {
        c = context.superClass;
        n = context.childName;
        while ((c[n] == null) && (c["class"] != null)) {
          c = c["class"];
        }
        this.childName = context.childName;
        this.superClass = c["class"];
        this.parentObject = context.object;
        if (c[n] != null) {
          return c[n];
        } else {
          return 0;
        }
      }
    }
    context.location = this;
    this.scope = null;
    v = context.meta[this.identifier];
    if (v == null) {
      v = context.local[this.identifier];
      if (v == null) {
        obj = context.object;
        v = obj[this.identifier];
        while ((v == null) && (obj["class"] != null)) {
          obj = obj["class"];
          v = obj[this.identifier];
        }
        if (v != null) {
          this.childName = this.identifier;
          this.superClass = obj["class"];
          this.parentObject = context.object;
        }
        if (v != null) {
          this.scope = context.object;
        }
        if (v == null) {
          v = context.global[this.identifier];
        }
      }
    }
    if (v != null) {
      return v;
    } else {
      if (warn) {
        id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column;
        if (!context.warnings.using_undefined_variable[id]) {
          context.warnings.using_undefined_variable[id] = {
            file: this.token.tokenizer.filename,
            line: this.token.line,
            column: this.token.column,
            expression: this.identifier
          };
        }
      }
      return 0;
    }
  };

  Variable.prototype.getScope = function(context) {
    if (context.local[this.identifier] != null) {
      return context.local;
    } else if (context.object[this.identifier] != null) {
      return context.object;
    } else if (context.global[this.identifier] != null) {
      return context.global;
    } else {
      return null;
    }
  };

  Variable.prototype.add = function(context, value) {
    var id, scope;
    scope = this.getScope(context);
    if (scope == null) {
      id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column;
      if (!context.warnings.using_undefined_variable[id]) {
        context.warnings.using_undefined_variable[id] = {
          file: this.token.tokenizer.filename,
          line: this.token.line,
          column: this.token.column,
          expression: this.identifier
        };
      }
      return context.global[this.identifier] = 0 + value;
    } else {
      return scope[this.identifier] += value;
    }
  };

  Variable.prototype.sub = function(context, value) {
    var id, scope;
    scope = this.getScope(context);
    if (scope == null) {
      id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column;
      if (!context.warnings.using_undefined_variable[id]) {
        context.warnings.using_undefined_variable[id] = {
          file: this.token.tokenizer.filename,
          line: this.token.line,
          column: this.token.column,
          expression: this.identifier
        };
      }
      return context.global[this.identifier] = 0 - value;
    } else {
      return scope[this.identifier] -= value;
    }
  };

  Variable.prototype.mul = function(context, value) {
    var id, scope;
    scope = this.getScope(context);
    if (scope == null) {
      id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column;
      if (!context.warnings.using_undefined_variable[id]) {
        context.warnings.using_undefined_variable[id] = {
          file: this.token.tokenizer.filename,
          line: this.token.line,
          column: this.token.column,
          expression: this.identifier
        };
      }
      return context.global[this.identifier] = 0;
    } else {
      return scope[this.identifier] *= value;
    }
  };

  Variable.prototype.div = function(context, value) {
    var id, scope;
    scope = this.getScope(context);
    if (scope == null) {
      id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column;
      if (!context.warnings.using_undefined_variable[id]) {
        context.warnings.using_undefined_variable[id] = {
          file: this.token.tokenizer.filename,
          line: this.token.line,
          column: this.token.column,
          expression: this.identifier
        };
      }
      return context.global[this.identifier] = 0;
    } else {
      return scope[this.identifier] /= value;
    }
  };

  Variable.prototype.toString = function() {
    return this.identifier;
  };

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

  Field.prototype.assign = function(context, scope, value) {
    var c, i, id, j, len1, ref, v;
    if (this.expression.ensureCreated != null) {
      v = this.expression.ensureCreated(context);
    } else {
      v = this.expression.evaluate(context, true);
    }
    ref = this.chain;
    for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
      c = ref[i];
      c = c.evaluate(context, true) || 0;
      if ((v[c] == null) && i < this.chain.length - 1) {
        id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column + "-" + i;
        if (!context.warnings.assigning_field_to_undefined[id]) {
          context.warnings.assigning_field_to_undefined[id] = {
            file: this.token.tokenizer.filename,
            line: this.token.line,
            column: this.token.column,
            expression: this.token.tokenizer.input.substring(this.token.start, this.chain[i].token.start + this.chain[i].token.length)
          };
        }
        v[c] = {};
      }
      if (i === this.chain.length - 1) {
        v[c] = value;
      } else {
        v = v[c];
      }
    }
    return value;
  };

  Field.prototype.add = function(context, value) {
    var c, i, j, len1, ref, v, v2, val;
    if (this.expression.ensureCreated != null) {
      v = this.expression.ensureCreated(context);
    } else {
      v = this.expression.evaluate(context, true);
    }
    ref = this.chain;
    for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
      c = ref[i];
      c = c.evaluate(context, true) || 0;
      if (i < this.chain.length - 1) {
        v2 = v[c];
        if (!v2) {
          this.reportAssignWarning(context, i);
          v2 = v[c] = {};
        }
        v = v2;
      } else {
        val = v[c];
        if (val == null) {
          this.reportUndefinedWarning(context, i);
        }
        return v[c] = (val != null ? val : 0) + value;
      }
    }
    return v[c];
  };

  Field.prototype.sub = function(context, value) {
    var c, i, j, len1, ref, v, v2;
    if (this.expression.ensureCreated != null) {
      v = this.expression.ensureCreated(context);
    } else {
      v = this.expression.evaluate(context, true);
    }
    ref = this.chain;
    for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
      c = ref[i];
      c = c.evaluate(context, true) || 0;
      if (i < this.chain.length - 1) {
        v2 = v[c];
        if (!v2) {
          this.reportAssignWarning(context, i);
          v2 = v[c] = {};
        }
        v = v2;
      } else {
        if (v[c] == null) {
          this.reportUndefinedWarning(context, i);
        }
        return v[c] = (v[c] || 0) - value;
      }
    }
    return v[c];
  };

  Field.prototype.mul = function(context, value) {
    var c, i, j, len1, ref, v, v2;
    if (this.expression.ensureCreated != null) {
      v = this.expression.ensureCreated(context);
    } else {
      v = this.expression.evaluate(context, true);
    }
    ref = this.chain;
    for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
      c = ref[i];
      c = c.evaluate(context, true) || 0;
      if (i < this.chain.length - 1) {
        v2 = v[c];
        if (!v2) {
          this.reportAssignWarning(context, i);
          v2 = v[c] = {};
        }
        v = v2;
      } else {
        if (v[c] == null) {
          this.reportUndefinedWarning(context, i);
        }
        return v[c] = (v[c] || 0) * value;
      }
    }
    return v[c];
  };

  Field.prototype.div = function(context, value) {
    var c, i, j, len1, ref, v, v2;
    if (this.expression.ensureCreated != null) {
      v = this.expression.ensureCreated(context);
    } else {
      v = this.expression.evaluate(context, true);
    }
    ref = this.chain;
    for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
      c = ref[i];
      c = c.evaluate(context, true) || 0;
      if (i < this.chain.length - 1) {
        v2 = v[c];
        if (!v2) {
          this.reportAssignWarning(context, i);
          v2 = v[c] = {};
        }
        v = v2;
      } else {
        if (v[c] == null) {
          this.reportUndefinedWarning(context, i);
        }
        return v[c] = (v[c] || 0) / value;
      }
    }
    return v[c];
  };

  Field.prototype.reportAssignWarning = function(context, i) {
    var id;
    id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column + "-" + i;
    if (!context.warnings.assigning_field_to_undefined[id]) {
      return context.warnings.assigning_field_to_undefined[id] = {
        file: this.token.tokenizer.filename,
        line: this.token.line,
        column: this.token.column,
        expression: this.token.tokenizer.input.substring(this.token.start, this.chain[i].token.start + this.chain[i].token.length)
      };
    }
  };

  Field.prototype.reportUndefinedWarning = function(context, i) {
    var id;
    id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column + "-" + i;
    if (!context.warnings.using_undefined_variable[id]) {
      return context.warnings.using_undefined_variable[id] = {
        file: this.token.tokenizer.filename,
        line: this.token.line,
        column: this.token.column,
        expression: this.token.tokenizer.input.substring(this.token.start, this.chain[i].token.start + this.chain[i].token.length)
      };
    }
  };

  Field.prototype.evaluate = function(context) {
    var c, i, id, j, len1, p, ref, v;
    context.location = this;
    v = this.expression.evaluate(context);
    if (v == null) {
      return 0;
    } else {
      ref = this.chain;
      for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
        c = ref[i];
        p = this.parentObject = v;
        c = c.evaluate(context, true) || 0;
        v = v[c];
        while ((v == null) && (p["class"] != null)) {
          p = p["class"];
          v = p[c];
        }
        if (v == null) {
          id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column;
          if (!context.warnings.using_undefined_variable[id]) {
            context.warnings.using_undefined_variable[id] = {
              file: this.token.tokenizer.filename,
              line: this.token.line,
              column: this.token.column,
              expression: this.token.tokenizer.input.substring(this.token.start, this.chain[i].token.start + this.chain[i].token.length)
            };
          }
          return 0;
        }
      }
      this.childName = c;
      this.superClass = p["class"];
      return v;
    }
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
    this.f = Program.BinaryOps[this.operation];
  }

  Operation.prototype.evaluate = function(context, hold) {
    context.location = this;
    return this.f(context, this.term1, this.term2);
  };

  return Operation;

})();

this.Program.Negate = (function() {
  function Negate(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
    this.optimize();
  }

  Negate.prototype.optimize = function() {
    var value;
    if (this.expression.optimize != null) {
      this.expression.optimize();
    }
    if (this.expression.constant != null) {
      value = this.expression.constant || 0;
      return this.evaluate = function() {
        return -value;
      };
    }
  };

  Negate.prototype.evaluate = function(context) {
    context.location = this;
    return -(this.expression.evaluate(context, true) || 0);
  };

  return Negate;

})();

this.Program.Not = (function() {
  function Not(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

  Not.prototype.evaluate = function(context) {
    context.location = this;
    if (this.expression.evaluate(context, true)) {
      return 0;
    } else {
      return 1;
    }
  };

  return Not;

})();

this.Program.Braced = (function() {
  function Braced(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
  }

  Braced.prototype.evaluate = function(context, hold) {
    context.location = this;
    return this.expression.evaluate(context, hold);
  };

  return Braced;

})();

this.Program.SequenceEvaluator = function(context, sequence, local, hold) {
  var i, j, len1, local_save, res, s;
  if (local != null) {
    local_save = context.local;
    context.local = local;
  }
  res = 0;
  if (Date.now() > context.timeout) {
    throw "Timeout";
  }
  for (i = j = 0, len1 = sequence.length; j < len1; i = ++j) {
    s = sequence[i];
    res = s.evaluate(context, hold && i === sequence.length - 1);
    if (context["return"]) {
      break;
    }
    if ((context["break"] && context.breakable > 0) || (context["continue"] && context.continuable > 0)) {
      break;
    }
    if (Date.now() > context.timeout) {
      throw "Timeout";
    }
  }
  if (local != null) {
    context.local = local_save;
  }
  return res;
};

this.Program.Return = (function() {
  function Return(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
    this.no_expression = true;
  }

  Return.prototype.evaluate = function(context) {
    var v;
    if (this.expression != null) {
      v = this.expression.evaluate(context, true);
    } else {
      v = 0;
    }
    context["return"] = true;
    return v;
  };

  return Return;

})();

this.Program.Condition = (function() {
  function Condition(token1, chain) {
    this.token = token1;
    this.chain = chain;
  }

  Condition.prototype.evaluate = function(context, hold) {
    var c, j, len1, ref;
    context.location = this;
    ref = this.chain;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      c = ref[j];
      if (c.condition.evaluate(context, hold)) {
        return Program.SequenceEvaluator(context, c.sequence, null, hold);
      } else if (c["else"] != null) {
        return Program.SequenceEvaluator(context, c["else"], null, hold);
      }
    }
    return 0;
  };

  return Condition;

})();

this.Program.For = (function() {
  function For(token1, iterator, range_from1, range_to1, range_by1, sequence1) {
    this.token = token1;
    this.iterator = iterator;
    this.range_from = range_from1;
    this.range_to = range_to1;
    this.range_by = range_by1;
    this.sequence = sequence1;
  }

  For.prototype.evaluate = function(context, hold) {
    var i, j, list, local, range_by, range_from, range_to, ref, ref1, ref2, res;
    context.location = this;
    context.breakable += 1;
    context.continuable += 1;
    res = 0;
    context.iterations = 0;
    if (hold) {
      list = [];
    }
    range_from = this.range_from.evaluate(context, true);
    range_to = this.range_to.evaluate(context, true);
    if (this.range_by === 0) {
      range_by = range_to > range_from ? 1 : -1;
    } else {
      range_by = this.range_by.evaluate(context, true);
    }
    local = context.local;
    for (i = j = ref = range_from, ref1 = range_to, ref2 = range_by; ref2 > 0 ? j <= ref1 : j >= ref1; i = j += ref2) {
      local[this.iterator] = i;
      res = Program.SequenceEvaluator(context, this.sequence, null, hold);
      if (hold) {
        list.push(res);
      }
      if (context["return"]) {
        list = res;
        break;
      }
      if (context["break"]) {
        context["break"] = false;
        break;
      } else if (context["continue"]) {
        context["continue"] = false;
      }
      context.iterations++;
    }
    context.breakable -= 1;
    context.continuable -= 1;
    if (hold) {
      return list;
    } else {
      return res;
    }
  };

  return For;

})();

this.Program.ForIn = (function() {
  function ForIn(token1, iterator, list1, sequence1) {
    this.token = token1;
    this.iterator = iterator;
    this.list = list1;
    this.sequence = sequence1;
  }

  ForIn.prototype.evaluate = function(context, hold) {
    var i, j, len, list, local, ref, res, source;
    context.location = this;
    context.breakable += 1;
    context.continuable += 1;
    res = 0;
    context.iterations = 0;
    if (hold) {
      list = [];
    }
    source = this.list.evaluate(context, true);
    local = context.local;
    if (Array.isArray(source)) {
      len = source.length;
      for (i = j = 0, ref = len - 1; j <= ref; i = j += 1) {
        local[this.iterator] = source[i];
        res = Program.SequenceEvaluator(context, this.sequence, null, hold);
        if (hold) {
          list.push(res);
        }
        if (context["return"]) {
          list = res;
          break;
        }
        if (context["break"]) {
          context["break"] = false;
          break;
        } else if (context["continue"]) {
          context["continue"] = false;
        }
        context.iterations++;
      }
    } else if (typeof source === "object") {
      for (i in source) {
        local[this.iterator] = i;
        res = Program.SequenceEvaluator(context, this.sequence, null, hold);
        if (hold) {
          list.push(res);
        }
        if (context["return"]) {
          list = res;
          break;
        }
        if (context["break"]) {
          context["break"] = false;
          break;
        } else if (context["continue"]) {
          context["continue"] = false;
        }
        context.iterations++;
      }
    } else {
      res = list = 0;
    }
    context.breakable -= 1;
    context.continuable -= 1;
    if (hold) {
      return list;
    } else {
      return res;
    }
  };

  return ForIn;

})();

Program.toString = function(value, nesting) {
  var i, j, k, key, len1, pref, ref, s, v;
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
    for (i = j = 0, len1 = value.length; j < len1; i = ++j) {
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
  function While(token1, condition, sequence1) {
    this.token = token1;
    this.condition = condition;
    this.sequence = sequence1;
  }

  While.prototype.evaluate = function(context, hold) {
    var list, res;
    context.location = this;
    context.breakable += 1;
    context.continuable += 1;
    res = 0;
    context.iterations = 0;
    if (hold) {
      list = [];
    }
    while (this.condition.evaluate(context, true)) {
      res = Program.SequenceEvaluator(context, this.sequence, null, hold);
      if (hold) {
        list.push(res);
      }
      if (context["return"]) {
        list = res;
        break;
      }
      if (context["break"]) {
        context["break"] = false;
        break;
      } else if (context["continue"]) {
        context["continue"] = false;
      }
      context.iterations++;
    }
    context.breakable -= 1;
    context.continuable -= 1;
    if (hold) {
      return list;
    } else {
      return res;
    }
  };

  return While;

})();

this.Program.Break = (function() {
  function Break(token1) {
    this.token = token1;
    this.no_expression = true;
  }

  Break.prototype.evaluate = function(context) {
    context.location = this;
    context["break"] = true;
    return 0;
  };

  return Break;

})();

this.Program.Continue = (function() {
  function Continue(token1) {
    this.token = token1;
    this.no_expression = true;
  }

  Continue.prototype.evaluate = function(context) {
    context.location = this;
    context["continue"] = true;
    return 0;
  };

  return Continue;

})();

this.Program.Function = (function() {
  function Function(token1, args, sequence1, end) {
    this.token = token1;
    this.args = args;
    this.sequence = sequence1;
    this.source = "function" + this.token.tokenizer.input.substring(this.token.index, end.index + 2);
  }

  Function.prototype.evaluate = function(context) {
    context.location = this;
    return this;
  };

  Function.prototype.call = function(context, argv, hold) {
    var a, i, j, len1, local, ref, res;
    local = {};
    ref = this.args;
    for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
      a = ref[i];
      local[a.name] = argv[i] != null ? argv[i] : (a["default"] != null ? a["default"].evaluate(context, true) : 0);
    }
    context.stack_size += 1;
    if (context.stack_size > 100) {
      throw "Stack overflow";
    }
    res = Program.SequenceEvaluator(context, this.sequence, local, hold);
    context.stack_size -= 1;
    context["return"] = false;
    return res;
  };

  return Function;

})();

this.Program.FunctionCall = (function() {
  function FunctionCall(token1, expression1, args) {
    this.token = token1;
    this.expression = expression1;
    this.args = args;
  }

  FunctionCall.prototype.evaluate = function(context, hold) {
    var a, argv, child, convertArg, f, id, j, k, len1, len2, object, ref, ref1, res, superClass;
    context.location = this;
    f = this.expression.evaluate(context, true);
    if (f != null) {
      if (typeof f === "function") {
        convertArg = (function(_this) {
          return function(arg) {
            var funk;
            if ((arg != null) && arg instanceof Program.Function) {
              return funk = function() {
                return arg.call(context, arguments, true);
              };
            } else {
              return arg;
            }
          };
        })(this);
        switch (this.args.length) {
          case 0:
            res = f.call(this.expression.parentObject);
            break;
          case 1:
            res = f.call(this.expression.parentObject, convertArg(this.args[0].evaluate(context, true)));
            break;
          default:
            argv = [];
            ref = this.args;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              a = ref[j];
              argv.push(convertArg(a.evaluate(context, true)));
            }
            res = f.apply(this.expression.parentObject, argv);
        }
        if (res !== null) {
          return res;
        } else {
          return 0;
        }
      } else if (f instanceof Program.Function) {
        argv = [];
        ref1 = this.args;
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          a = ref1[k];
          argv.push(a.evaluate(context, true));
        }
        object = context.object;
        child = context.childName;
        superClass = context.superClass;
        if (this.expression.parentObject != null) {
          context.object = this.expression.parentObject;
          context.childName = this.expression.childName;
          context.superClass = this.expression.superClass;
        } else if (this.expression.scope === object) {
          context.object = object;
        } else {
          context.object = context.global;
        }
        res = f.call(context, argv, hold) || 0;
        context.object = object;
        context.childName = child;
        context.superClass = superClass;
        return res;
      } else {
        id = this.token.tokenizer.filename + "-" + this.token.line + "-" + this.token.column;
        if (!context.warnings.invoking_non_function[id]) {
          context.warnings.invoking_non_function[id] = {
            file: this.token.tokenizer.filename,
            line: this.token.line,
            column: this.token.column,
            expression: this.token.tokenizer.input.substring(this.expression.token.start, this.token.start - 1)
          };
        }
        return f;
      }
    }
  };

  return FunctionCall;

})();

this.Program.CreateObject = (function() {
  function CreateObject(token1, fields) {
    this.token = token1;
    this.fields = fields;
  }

  CreateObject.prototype.evaluate = function(context) {
    var f, j, len1, ref, res;
    res = {};
    ref = this.fields;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      f = ref[j];
      res[f.field] = f.value.evaluate(context, true);
    }
    return res;
  };

  return CreateObject;

})();

this.Program.CreateClass = (function() {
  function CreateClass(token1, ext, fields) {
    this.token = token1;
    this.ext = ext;
    this.fields = fields;
  }

  CreateClass.prototype.evaluate = function(context) {
    var e, f, j, len1, ref, res;
    res = {};
    ref = this.fields;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      f = ref[j];
      res[f.field] = f.value.evaluate(context, true);
    }
    if (this.ext != null) {
      if (this.ext instanceof Program.Variable) {
        e = this.ext.evaluate(context, true, false);
        res["class"] = e ? e : this.ext.identifier;
      } else {
        res["class"] = this.ext.evaluate(context, true);
      }
    }
    return res;
  };

  return CreateClass;

})();

this.Program.resolveParentClass = function(obj, context, token) {
  var id;
  if ((obj["class"] != null) && typeof obj["class"] === "string") {
    if (context.global[obj["class"]] != null) {
      obj["class"] = context.global[obj["class"]];
    } else {
      id = "classname-" + obj["class"];
      if (!context.warnings.using_undefined_variable[id]) {
        context.warnings.using_undefined_variable[id] = {
          file: token.tokenizer.filename,
          line: token.line,
          column: token.column,
          expression: obj["class"]
        };
      }
    }
  }
  if (obj["class"] != null) {
    return Program.resolveParentClass(obj["class"], context, token);
  }
};

this.Program.NewCall = (function() {
  function NewCall(token1, expression1) {
    this.token = token1;
    this.expression = expression1;
    if (!(this.expression instanceof Program.FunctionCall)) {
      this.expression = new Program.FunctionCall(this.token, this.expression, []);
    }
  }

  NewCall.prototype.evaluate = function(context) {
    var a, argv, c, child, f, fc, j, k, len1, len2, object, ref, ref1, res, superClass, v;
    res = {};
    if (this.expression instanceof Program.FunctionCall) {
      context.location = this;
      fc = this.expression;
      f = fc.expression.evaluate(context, true);
      if (f != null) {
        if (typeof f === "function") {
          switch (this.expression.args.length) {
            case 0:
              return new f();
            case 1:
              v = this.expression.args[0].evaluate(context, true);
              return new f(v != null ? v : 0);
            default:
              argv = [];
              ref = this.expression.args;
              for (j = 0, len1 = ref.length; j < len1; j++) {
                a = ref[j];
                v = a.evaluate(context, true);
                argv.push(v != null ? v : 0);
              }
              return (function(func, args, ctor) {
                ctor.prototype = func.prototype;
                var child = new ctor, result = func.apply(child, args);
                return Object(result) === result ? result : child;
              })(f, argv, function(){});
          }
        } else {
          res["class"] = f;
          Program.resolveParentClass(res, context, this.token);
          argv = [];
          ref1 = fc.args;
          for (k = 0, len2 = ref1.length; k < len2; k++) {
            a = ref1[k];
            argv.push(a.evaluate(context, true));
          }
          object = context.object;
          child = context.childName;
          superClass = context.superClass;
          context.object = res;
          context.childName = "constructor";
          c = f.constructor;
          while ((c == null) && (f.data != null)) {
            f = f.data;
            c = f.constructor;
          }
          context.superClass = f["class"];
          if (c != null) {
            if (c instanceof Program.Function) {
              c.call(context, argv, false);
            } else if (typeof c === "function") {
              c.apply(res, argv);
            }
          }
          context.object = object;
          context.childName = child;
          context.superClass = superClass;
        }
      }
    } else {
      c = this.expression.evaluate(context, true);
      res["class"] = c;
    }
    return res;
  };

  return NewCall;

})();

this.Program.BinaryOps = {
  "+": function(context, a, b) {
    var key, res, value;
    a = a.evaluate(context, true);
    b = b.evaluate(context, true);
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.concat(b);
    } else if (typeof a === "object" && typeof b === "object") {
      res = {};
      for (key in b) {
        value = b[key];
        res[key] = value;
      }
      for (key in a) {
        value = a[key];
        res[key] = value;
      }
      return res;
    }
    return (a + b) || 0;
  },
  "*": function(context, a, b) {
    return (a.evaluate(context, true) * b.evaluate(context, true)) || 0;
  },
  "-": function(context, a, b) {
    return (a.evaluate(context, true) - b.evaluate(context, true)) || 0;
  },
  "/": function(context, a, b) {
    return (a.evaluate(context, true) / b.evaluate(context, true)) || 0;
  },
  "%": function(context, a, b) {
    return (a.evaluate(context, true) % b.evaluate(context, true)) || 0;
  },
  "^": function(context, a, b) {
    return (Math.pow(a.evaluate(context, true), b.evaluate(context, true))) || 0;
  },
  "and": function(context, a, b) {
    if (a.evaluate(context, true)) {
      if (b.evaluate(context, true)) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  },
  "or": function(context, a, b) {
    if (a.evaluate(context, true)) {
      return 1;
    } else {
      if (b.evaluate(context, true)) {
        return 1;
      } else {
        return 0;
      }
    }
  },
  "==": function(context, a, b) {
    if (a.evaluate(context,true) == b.evaluate(context,true)) {
      return 1;
    } else {
      return 0;
    }
  },
  "!=": function(context, a, b) {
    if (a.evaluate(context,true) != b.evaluate(context,true)) {
      return 1;
    } else {
      return 0;
    }
  },
  "<": function(context, a, b) {
    if (a.evaluate(context, true) < b.evaluate(context, true)) {
      return 1;
    } else {
      return 0;
    }
  },
  ">": function(context, a, b) {
    if (a.evaluate(context, true) > b.evaluate(context, true)) {
      return 1;
    } else {
      return 0;
    }
  },
  "<=": function(context, a, b) {
    if (a.evaluate(context, true) <= b.evaluate(context, true)) {
      return 1;
    } else {
      return 0;
    }
  },
  ">=": function(context, a, b) {
    if (a.evaluate(context, true) >= b.evaluate(context, true)) {
      return 1;
    } else {
      return 0;
    }
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
  "and": 10,
  "or": 9
};
