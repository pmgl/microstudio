var JSTranspiler;

JSTranspiler = (function() {
  function JSTranspiler(program, strict) {
    var context, i, indent, j, k, l, len, len1, line, m, ref, ref1, ref2, s;
    this.program = program;
    this.strict = strict != null ? strict : false;
    this.code_saves = [];
    this.code = "var _msResolveVariable = function(v) {\n  let res = context.meta[v] ;\n  if (res == null) {\n    res = context.object[v] ;\n    if (res == null) {\n      res = context.global[v] ;\n    }\n  }\n  return res == null? 0 : res ;\n};\n\nvar _msResolveField = function(v,f) {\n  var res = v[f];\n  while (res == null && v[\"class\"] != null) {\n    v = v[\"class\"] ;\n    res = v[f] ;\n  }\n  return res!=null? res: 0 ;\n} ;\n\nvar _msResolveParentClass = function(obj) {\n  if (obj.class != null && typeof obj.class == \"string\") {\n    if (context.global[obj.class] != null) {\n      obj.class = context.global[obj.class] ;\n    }\n    _msResolveParentClass(obj.class);\n  }\n  else if (obj.class != null) {\n    _msResolveParentClass(obj.class);\n  }\n} ;\n\nvar _msApply = function(parent,field, ...args) {\n  let save = context.object ;\n  let currentClass = context.currentClass ;\n  let childName = context.childName ;\n\n  context.object = parent ;\n  context.currentClass = parent ;\n  context.childName = field ;\n\n  let c = parent ;\n  let f = c[field] ;\n  while (f == null && c[\"class\"] != null) {\n    c = c[\"class\"] ;\n    f = c[field] ;\n    context.currentClass = c ;\n  }\n\n  let res = 0 ;\n  if (f != null) {\n    if (typeof f == \"function\") {\n      res = f.apply(parent,args) ;\n    }\n    else {\n      res = f ;\n    }\n  }\n\n  context.object = save ;\n  context.currentClass = currentClass ;\n  context.childName = childName ;\n\n  if (res != null) {\n    return res ;\n  }\n  else {\n    return 0 ;\n  }\n};\n\nvar _msInvoke = function(field, ...args) {\n  let f = null ;\n  let res = 0 ;\n\n  if (context.meta.hasOwnProperty(field)) {\n    f = context.meta[field] ;\n    res = f.apply(null,args) ;\n  }\n  else {\n    let currentClass = context.currentClass ;\n    let childName = context.childName ;\n\n    if (field == \"super\") {\n      let c = currentClass ;\n      f = null ;\n      while (f == null && c[\"class\"] != null) {\n        c = c[\"class\"] ;\n        f = c[childName] ;\n        context.currentClass = c ;\n      }\n    }\n    else {\n      context.currentClass = context.object ;\n      context.childName = field ;\n      let c = context.object ;\n      f = c[field] ;\n      while (f == null && c[\"class\"] != null) {\n        c = c[\"class\"] ;\n        f = c[field] ;\n        context.currentClass = c ;\n      }\n    }\n\n    if (f != null) {\n      if (typeof f == \"function\") {\n        res = f.apply(context.object,args) ;\n      }\n      else {\n        res = f ;\n      }\n    }\n    else if (context.global[field] != null) {\n      f = context.global[field] ;\n      let save = context.object ;\n      context.object = context.global ;\n      if (typeof f == \"function\") {\n        res = f.apply(context.object,args) ;\n      }\n      else {\n        res = f ;\n      }\n      context.object = save ;\n    }\n\n    context.currentClass = currentClass ;\n    context.childName = childName ;\n  }\n\n  if (res != null) {\n    return res ;\n  }\n  else {\n    return 0 ;\n  }\n};\n";
    this.code = [this.code];
    context = {
      local_variables: {},
      temp_variable_count: 0,
      tmpcount: 0
    };
    ref = this.program.statements;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      s = ref[i];
      if (i === this.program.statements.length - 1) {
        this.code.push("return " + (this.transpile(s, context, true)) + " ;");
      } else {
        this.code.push(this.transpile(s, context, false) + " ;");
      }
    }
    this.code = this.code.join("\n");
    this.code = this.code.split("\n");
    indent = 0;
    ref1 = this.code;
    for (l = k = 0, len1 = ref1.length; k < len1; l = ++k) {
      line = ref1[l];
      indent -= (line.match(/}/g) || []).length;
      for (i = m = 0, ref2 = indent - 1; m <= ref2; i = m += 1) {
        this.code[l] = "  " + this.code[l];
      }
      indent += (line.match(/{/g) || []).length;
    }
    this.code = this.code.join("\n");
    console.info(this.code);
  }

  JSTranspiler.prototype.transpile = function(statement, context, retain) {
    if (statement instanceof Program.Assignment) {
      return this.transpileAssignment(statement, context, retain);
    }
    if (statement instanceof Program.SelfAssignment) {
      return this.transpileSelfAssignment(statement, context, retain);
    } else if (statement instanceof Program.Operation) {
      return this.transpileOperation(statement, context);
    } else if (statement instanceof Program.Braced) {
      return this.transpileBraced(statement, context, retain);
    } else if (statement instanceof Program.Negate) {
      return this.transpileNegate(statement, context, retain);
    } else if (statement instanceof Program.Not) {
      return this.transpileNot(statement, context, retain);
    } else if (statement instanceof Program.Value) {
      return this.transpileValue(statement, context);
    } else if (statement instanceof Program.Variable) {
      return this.transpileVariable(statement, context);
    } else if (statement instanceof Program.Field) {
      return this.transpileField(statement, context);
    } else if (statement instanceof Program.FunctionCall) {
      return this.transpileFunctionCall(statement, context, retain);
    } else if (statement instanceof Program.For) {
      return this.transpileFor(statement, context, retain);
    } else if (statement instanceof Program.ForIn) {
      return this.transpileForIn(statement, context, retain);
    } else if (statement instanceof Program.While) {
      return this.transpileWhile(statement, context, retain);
    } else if (statement instanceof Program.Break) {
      return this.transpileBreak(statement, context);
    } else if (statement instanceof Program.Continue) {
      return this.transpileContinue(statement, context);
    } else if (statement instanceof Program.Function) {
      return this.transpileFunction(statement, context);
    } else if (statement instanceof Program.Return) {
      return this.transpileReturn(statement, context);
    } else if (statement instanceof Program.Condition) {
      return this.transpileCondition(statement, context, retain);
    } else if (statement instanceof Program.CreateObject) {
      return this.transpileCreateObject(statement, context);
    } else if (statement instanceof Program.CreateClass) {
      return this.transpileCreateClass(statement, context);
    } else if (statement instanceof Program.NewCall) {
      return this.transpileNewCall(statement, context);
    }
  };

  JSTranspiler.prototype.transpileAssignment = function(statement, context, retain) {
    var chain, f, i, j, recipient, ref, v;
    if (statement.local) {
      if (statement.field instanceof Program.Variable) {
        context.local_variables[statement.field.identifier] = true;
        if (retain) {
          this.prepend("var " + statement.field.identifier + " = " + (this.transpile(statement.expression, context, true)) + " ;\n");
          return statement.field.identifier;
        } else {
          return "var " + statement.field.identifier + " = " + (this.transpile(statement.expression, context, true)) + " ;\n";
        }
      } else {
        throw "illegal";
      }
    } else {
      if (statement.field instanceof Program.Variable) {
        if (context.local_variables[statement.field.identifier]) {
          return statement.field.identifier + " = " + (this.transpile(statement.expression, context, true)) + (retain ? "" : ";");
        } else if (statement.expression instanceof Program.CreateClass) {
          return "context.object[\"" + statement.field.identifier + "\"] = " + (this.transpileUpdateClass(statement.expression, context, statement.field.identifier));
        } else {
          return "context.object[\"" + statement.field.identifier + "\"] = " + (this.transpile(statement.expression, context, true));
        }
      } else {
        f = statement.field;
        if (f.expression instanceof Program.Variable) {
          if (f.expression.identifier === "this") {
            recipient = "context.object";
          } else if (context.local_variables[f.expression.identifier]) {
            this.code.push("if (" + f.expression.identifier + " == null) {" + f.expression.identifier + " = {};}");
            recipient = f.expression.identifier;
          } else if (f.expression.identifier === "global") {
            recipient = "context.global";
          } else {
            recipient = this.createTempVariable(context);
            this.prepend("var " + recipient + " = context.object[\"" + f.expression.identifier + "\"] ;");
            this.prepend("if (" + recipient + " == null) " + recipient + " = context.global[\"" + f.expression.identifier + "\"] ;");
            this.prepend("if (" + recipient + " == null) " + recipient + " = context.object[\"" + f.expression.identifier + "\"] = {} ;");
          }
        } else {
          recipient = this.createTempVariable(context);
          this.prepend("var " + recipient + " = " + (this.transpile(f.expression, context, true)) + " ;");
        }
        chain = recipient;
        for (i = j = 0, ref = f.chain.length - 2; j <= ref; i = j += 1) {
          v = this.evaluated(f.chain[i], context);
          chain += "[" + v + "]";
          this.code.push("if (" + chain + " == null) {" + chain + " = {} ;}");
        }
        return chain + "[" + (this.transpile(f.chain[f.chain.length - 1], context, true)) + "] = " + (this.transpile(statement.expression, context, true));
      }
    }
  };

  JSTranspiler.prototype.transpileSelfAssignment = function(statement, context, retain) {
    var chain, f, i, j, op, recipient, ref, v;
    switch (statement.operation) {
      case Token.TYPE_PLUS_EQUALS:
        op = "+";
        break;
      case Token.TYPE_MINUS_EQUALS:
        op = "-";
        break;
      case Token.TYPE_MULTIPLY_EQUALS:
        op = "*";
        break;
      case Token.TYPE_DIVIDE_EQUALS:
        op = "/";
    }
    if (statement.field instanceof Program.Variable) {
      if (context.local_variables[statement.field.identifier]) {
        return statement.field.identifier + " " + op + "= " + (this.transpile(statement.expression, context, true));
      } else {
        v = this.createTempVariable(context);
        this.prepend("var " + v + " = context.object[\"" + statement.field.identifier + "\"] ;");
        return "context.object[\"" + statement.field.identifier + "\"] = (" + v + " != null ? " + v + " : 0) " + op + " " + (this.transpile(statement.expression, context, true));
      }
    } else {
      f = statement.field;
      if (f.expression instanceof Program.Variable) {
        if (f.expression.identifier === "this") {
          recipient = "context.object";
        } else if (context.local_variables[f.expression.identifier]) {
          this.code.push("if (" + f.expression.identifier + " == null) {" + f.expression.identifier + " = {};}");
          recipient = f.expression.identifier;
        } else {
          this.code.push("if (context.object[\"" + f.expression.identifier + "\"] == null) {context.object[\"" + f.expression.identifier + "\"] = {};}");
          recipient = "context.object[\"" + f.expression.identifier + "\"]";
        }
      } else {
        recipient = this.evaluated(f.expression, context);
      }
      chain = recipient;
      if (f.chain.length > 1) {
        for (i = j = 0, ref = f.chain.length - 2; j <= ref; i = j += 1) {
          v = this.evaluated(f.chain[i], context);
          chain += "[" + v + "]";
          this.code.push("if (" + chain + " == null) {" + chain + " = {} ;}");
        }
      }
      v = this.evaluated(f.chain[f.chain.length - 1], context);
      return chain + "[" + v + "] = (" + chain + "[" + v + "] != null ? " + chain + "[" + v + "] : 0) " + op + " " + (this.transpile(statement.expression, context, true));
    }
  };

  JSTranspiler.prototype.transpileOperation = function(op, context) {
    var ref, ref1, ref2;
    if ((ref = op.operation) === "+") {
      return this.transpile(op.term1, context, true) + op.operation + this.transpile(op.term2, context, true);
    } else if ((ref1 = op.operation) === "-" || ref1 === "*" || ref1 === "/" || ref1 === "%") {
      return "((" + (this.transpile(op.term1, context, true)) + " " + op.operation + " " + (this.transpile(op.term2, context, true)) + ")||0)";
    } else if ((ref2 = op.operation) === "==" || ref2 === "!=" || ref2 === "<" || ref2 === ">" || ref2 === "<=" || ref2 === ">=") {
      return "((" + (this.transpile(op.term1, context, true)) + " " + op.operation + " " + (this.transpile(op.term2, context, true)) + ")? 1 : 0)";
    } else if (op.operation === "and") {
      return "((" + (this.transpile(op.term1, context, true)) + " && " + (this.transpile(op.term2, context, true)) + ")? 1 : 0)";
    } else if (op.operation === "or") {
      return "((" + (this.transpile(op.term1, context, true)) + " || " + (this.transpile(op.term2, context, true)) + ")? 1 : 0)";
    } else if (op.operation === "^") {
      return "Math.pow(" + (this.transpile(op.term1, context, true)) + "," + (this.transpile(op.term2, context, true)) + ")";
    } else {
      return "";
    }
  };

  JSTranspiler.prototype.transpileBraced = function(expression, context, retain) {
    return "(" + (this.transpile(expression.expression, context, retain)) + ")";
  };

  JSTranspiler.prototype.transpileNegate = function(expression, context, retain) {
    return "- " + (this.transpile(expression.expression, context, retain));
  };

  JSTranspiler.prototype.transpileNot = function(expression, context, retain) {
    return "((" + (this.transpile(expression.expression, context, retain)) + ")? 0 : 1)";
  };

  JSTranspiler.prototype.evaluated = function(expression, context) {
    var v;
    if (expression instanceof Program.Value) {
      if (expression.type === Program.Value.TYPE_NUMBER) {
        return "" + expression.value;
      } else if (expression.type === Program.Value.TYPE_STRING) {
        return "\"" + (expression.value.replace(/"/g, '\\\"')) + "\"";
      }
    } else if (expression instanceof Program.Variable) {
      if (context.local_variables[expression.identifier]) {
        return expression.identifier;
      }
    }
    v = this.createTempVariable(context);
    this.prepend("var " + v + " = " + (this.transpile(expression, context, true)) + " ;");
    return v;
  };

  JSTranspiler.prototype.transpileValue = function(value, context) {
    var e, i, j, len, ref, res;
    switch (value.type) {
      case Program.Value.TYPE_NUMBER:
        return "" + value.value;
      case Program.Value.TYPE_STRING:
        return "\"" + (value.value.replace(/"/g, '\\\"')) + "\"";
      case Program.Value.TYPE_ARRAY:
        res = "[";
        ref = value.value;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          e = ref[i];
          if (i !== 0) {
            res += ", ";
          }
          res += this.transpile(e, context, true);
        }
        res += "]";
        return res;
    }
  };

  JSTranspiler.prototype.transpileVariable = function(variable, context) {
    var v;
    v = variable.identifier;
    if (v === "this") {
      return "context.object";
    } else if (context.local_variables[v]) {
      return "" + v;
    } else {
      return "_msResolveVariable(\"" + v + "\")";
    }
  };

  JSTranspiler.prototype.transpileField = function(field, context) {
    var c, j, len, ref, res;
    if (field.expression instanceof Program.Variable && field.expression.identifier === "this") {
      res = "context.object";
    } else {
      res = this.transpile(field.expression, context, true);
    }
    ref = field.chain;
    for (j = 0, len = ref.length; j < len; j++) {
      c = ref[j];
      res = "_msResolveField(" + res + "," + (this.transpile(c, context, true)) + ")";
    }
    return res;
  };

  JSTranspiler.prototype.transpileFieldParent = function(field, context) {
    var c, i, j, ref, res;
    res = this.transpile(field.expression, context, true);
    for (i = j = 0, ref = field.chain.length - 2; j <= ref; i = j += 1) {
      c = field.chain[i];
      res = "_msResolveField(" + res + "," + (this.transpile(c, context, true)) + ")";
    }
    return res;
  };

  JSTranspiler.prototype.transpileFunctionCall = function(call, context) {
    var a, args, field, i, j, k, len, len1, len2, len3, len4, m, n, o, parent, ref, ref1, ref2, ref3, ref4, res, v;
    if (call.expression instanceof Program.Field) {
      parent = this.transpileFieldParent(call.expression, context);
      field = this.transpile(call.expression.chain[call.expression.chain.length - 1], context, true);
      res = "_msApply(" + parent + "," + field;
      ref = call.args;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        a = ref[i];
        res += ", ";
        res += this.transpile(a, context, true);
      }
      res += ")";
      return res;
    } else if (call.expression instanceof Program.Variable) {
      if (JSTranspiler.predefined_functions[call.expression.identifier] != null) {
        res = JSTranspiler.predefined_functions[call.expression.identifier];
        res += "(";
        ref1 = call.args;
        for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
          a = ref1[i];
          if (i > 0) {
            res += ", ";
          }
          res += this.transpile(a, context, true);
        }
        res += ")";
        return res;
      } else if (context.local_variables[call.expression.identifier] != null) {
        v = call.expression.identifier;
        args = "";
        ref2 = call.args;
        for (i = m = 0, len2 = ref2.length; m < len2; i = ++m) {
          a = ref2[i];
          if (i > 0) {
            args += ", ";
          }
          args += this.transpile(a, context, true);
        }
        return res = "((typeof " + v + " == \"function\")? (" + v + "(" + args + ")) : " + v + ")";
      } else {
        res = "_msInvoke(\"" + call.expression.identifier + "\" ";
        ref3 = call.args;
        for (i = n = 0, len3 = ref3.length; n < len3; i = ++n) {
          a = ref3[i];
          res += ", ";
          res += this.transpile(a, context, true);
        }
        res += ")";
        return res;
      }
    } else {
      res = this.transpile(call.expression, context, true);
      res += "(";
      ref4 = call.args;
      for (i = o = 0, len4 = ref4.length; o < len4; i = ++o) {
        a = ref4[i];
        if (i > 0) {
          res += ", ";
        }
        res += this.transpile(a, context, true);
      }
      res += ")";
      return res;
    }
  };

  JSTranspiler.prototype.transpileSequence = function(sequence, context, retain) {
    var i, j, len, res, s;
    for (i = j = 0, len = sequence.length; j < len; i = ++j) {
      s = sequence[i];
      res = this.transpile(s, context, (i === sequence.length - 1) && retain);
      if (i < sequence.length - 1) {
        this.prepend(res + " ;");
      } else if (s.no_expression) {
        this.prepend(res + " ;");
        res = "0";
      }
    }
    return res;
  };

  JSTranspiler.prototype.transpileFor = function(forloop, context, retain) {
    var range_by, range_from, range_to, res, save_breakable, save_continuable, timeout_count;
    range_from = this.createTempVariable(context);
    range_to = this.createTempVariable(context);
    range_by = this.createTempVariable(context);
    timeout_count = this.createTempVariable(context);
    this.code.push("var " + range_from + " = " + (this.transpile(forloop.range_from, context, true)) + " ;");
    this.code.push("var " + range_to + " = " + (this.transpile(forloop.range_to, context, true)) + " ;");
    this.code.push("var " + timeout_count + " = 0 ;");
    if (forloop.range_by !== 0) {
      this.code.push("var " + range_by + " = " + (this.transpile(forloop.range_by, context, true)) + " ;");
    } else {
      this.code.push("var " + range_by + " = " + range_from + "<" + range_to + " ? 1 : -1 ;");
    }
    context.local_variables[forloop.iterator] = true;
    this.prepend("for (var " + forloop.iterator + "=" + range_from + " ; " + range_by + ">0?" + forloop.iterator + "<=" + range_to + ":" + forloop.iterator + ">=" + range_to + " ; " + forloop.iterator + "+=" + range_by + ") {\n");
    save_breakable = context.breakable;
    save_continuable = context.continuable;
    context.breakable = true;
    context.continuable = true;
    this.openBlock();
    this.prepend("\nif (" + timeout_count + "++>1000) {\n  " + timeout_count + " = 0 ;\n  if (Date.now()>context.timeout) {\n    context.location = {\n      token: {\n        line: " + forloop.token.line + ",\n        column: " + forloop.token.column + "\n      }\n    }\n    throw('Timeout');\n  }\n}");
    res = this.transpileSequence(forloop.sequence, context);
    res += "\n}";
    this.code.push(res);
    this.closeBlock();
    context.breakable = save_breakable;
    context.continuable = save_continuable;
    return "0";
  };

  JSTranspiler.prototype.transpileForIn = function(forloop, context, retain) {
    var iter, length, list, res, save_breakable, save_continuable, source, timeout_count;
    source = this.createTempVariable(context);
    list = this.createTempVariable(context);
    length = this.createTempVariable(context);
    timeout_count = this.createTempVariable(context);
    iter = this.createTempVariable(context);
    this.prepend("var " + source + " = " + (this.transpile(forloop.list, context, true)) + " ; ");
    this.prepend("var " + list + " = Array.isArray(" + source + ") ? " + source + " : Object.keys(" + source + ") ;");
    this.prepend("var " + length + " = " + list + ".length ;");
    this.prepend("var " + timeout_count + " = 0 ;");
    this.prepend("var " + forloop.iterator + " ;");
    context.local_variables[forloop.iterator] = true;
    this.prepend("for (var " + iter + " = 0 ; " + iter + "<" + length + " ; " + iter + "++ ) {\n");
    this.prepend(forloop.iterator + " = " + list + "[" + iter + "] ;");
    save_breakable = context.breakable;
    save_continuable = context.continuable;
    context.breakable = true;
    context.continuable = true;
    this.openBlock();
    this.prepend("\nif (" + timeout_count + "++>1000) {\n  " + timeout_count + " = 0 ;\n  if (Date.now()>context.timeout) {\n    context.location = {\n      token: {\n        line: " + forloop.token.line + ",\n        column: " + forloop.token.column + "\n      }\n    }\n    throw('Timeout');\n  }\n}");
    this.prepend("if (" + forloop.iterator + " == null) { continue ; }");
    res = this.transpileSequence(forloop.sequence, context);
    res += "\n}";
    this.code.push(res);
    this.closeBlock();
    context.breakable = save_breakable;
    context.continuable = save_continuable;
    return "0";
  };

  JSTranspiler.prototype.transpileWhile = function(whiloop, context, retain) {
    var res, save_breakable, save_continuable, timeout_count;
    timeout_count = this.createTempVariable(context);
    this.code.push("var " + timeout_count + " = 0 ;");
    this.prepend("while (true) {\n");
    this.prepend("  if (! (" + (this.transpile(whiloop.condition, context, true)) + ")) { break ; }\n");
    save_breakable = context.breakable;
    save_continuable = context.continuable;
    context.breakable = true;
    context.continuable = true;
    this.openBlock();
    this.prepend("\nif (" + timeout_count + "++>1000) {\n  " + timeout_count + " = 0 ;\n  if (Date.now()>context.timeout) {\n    context.location = {\n      token: {\n        line: " + whiloop.token.line + ",\n        column: " + whiloop.token.column + "\n      }\n    }\n    throw('Timeout');\n  }\n}");
    res = this.transpileSequence(whiloop.sequence, context);
    res += "\n}";
    this.code.push(res);
    this.closeBlock();
    context.breakable = save_breakable;
    context.continuable = save_continuable;
    return "0";
  };

  JSTranspiler.prototype.transpileBreak = function(statement, context) {
    if (context.breakable) {
      return "break";
    } else {
      return "";
    }
  };

  JSTranspiler.prototype.transpileContinue = function(statement, context) {
    if (context.continuable) {
      return "continue";
    } else {
      return "";
    }
  };

  JSTranspiler.prototype.transpileFunction = function(func, context) {
    var a, i, j, k, len, len1, ref, ref1, res, save, seq;
    save = context.local_variables;
    context.local_variables = {};
    this.openBlock();
    res = "function(";
    ref = func.args;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      a = ref[i];
      if (i > 0) {
        res += ", ";
      }
      res += a.name;
      context.local_variables[a.name] = true;
    }
    res += ") {";
    this.prepend(res);
    ref1 = func.args;
    for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
      a = ref1[i];
      if (a["default"] != null) {
        this.prepend("if (" + a.name + " == null) " + a.name + " = " + (this.transpile(a["default"])) + " ;");
      } else {
        this.prepend("if (" + a.name + " == null) " + a.name + " = 0 ;");
      }
    }
    seq = func.sequence;
    if (seq.length > 0) {
      res = this.transpileSequence(seq, context, true);
      if (!(seq[func.sequence.length - 1] instanceof Program.Return)) {
        this.prepend("return " + res + " ;");
      } else {
        this.prepend(res);
      }
    }
    this.prepend("}");
    context.local_variables = save;
    return this.closeBlockNoPush();
  };

  JSTranspiler.prototype.transpileReturn = function(ret, context) {
    if (ret.expression != null) {
      return "return " + (this.transpile(ret.expression, context, true)) + " ;";
    } else {
      return "return ;";
    }
  };

  JSTranspiler.prototype.prepend = function(line) {
    return this.code.push(line);
  };

  JSTranspiler.prototype.openBlock = function() {
    this.code_saves.push(this.code);
    return this.code = [];
  };

  JSTranspiler.prototype.closeBlock = function() {
    var append;
    append = this.code.join("\n");
    this.code = this.code_saves.splice(this.code_saves.length - 1, 1)[0];
    return this.code.push(append);
  };

  JSTranspiler.prototype.closeBlockNoPush = function() {
    var append;
    append = this.code.join("\n");
    this.code = this.code_saves.splice(this.code_saves.length - 1, 1)[0];
    return append;
  };

  JSTranspiler.prototype.createTempVariable = function(context) {
    return "__temp_" + context.temp_variable_count++;
  };

  JSTranspiler.prototype.transpileConditionCase = function(chain, index, context, temp) {
    var c, res;
    c = chain[index];
    this.prepend("if (" + (this.transpile(c.condition, context, true)) + ") {");
    this.openBlock();
    res = this.transpileSequence(c.sequence, context, temp != null);
    this.closeBlock();
    if (temp != null) {
      this.prepend(temp + " = " + res + " ;");
    } else {
      this.prepend(res + " ;");
    }
    this.prepend("}");
    if (index < chain.length - 1) {
      this.prepend("else {");
      this.openBlock();
      this.transpileConditionCase(chain, index + 1, context, temp);
      this.closeBlock();
      return this.prepend("}");
    } else if (c["else"]) {
      this.prepend("else {");
      this.openBlock();
      res = this.transpileSequence(c["else"], context, temp != null);
      this.closeBlock();
      if (temp != null) {
        this.prepend(temp + " = " + res + " ;");
      } else {
        this.prepend(res + " ;");
      }
      return this.prepend("}");
    }
  };

  JSTranspiler.prototype.transpileCondition = function(condition, context, retain) {
    var temp;
    temp = null;
    if (retain) {
      temp = this.createTempVariable(context);
      this.prepend("  var " + temp + " = 0 ;");
    }
    this.transpileConditionCase(condition.chain, 0, context, temp);
    if (retain) {
      return temp;
    } else {
      return "";
    }
  };

  JSTranspiler.prototype.formatField = function(field) {
    if (field === "constructor") {
      field = "_constructor";
    }
    return field.toString().replace(/"/g, "\\\"");
  };

  JSTranspiler.prototype.transpileCreateObject = function(statement, context) {
    var f, j, len, ref, res;
    res = "{\n";
    ref = statement.fields;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      res += "  \"" + (this.formatField(f.field)) + "\": " + (this.transpile(f.value, context, true)) + ",\n";
    }
    res += "}";
    return res;
  };

  JSTranspiler.prototype.transpileCreateClass = function(statement, context) {
    var classvar, f, j, len, ref, res;
    if (statement.ext != null) {
      classvar = this.createTempVariable(context);
      this.prepend("var " + classvar + " = " + (this.transpile(statement.ext, context, true)) + " ;");
      if (statement.ext instanceof Program.Variable) {
        this.prepend("if (!" + classvar + ") { " + classvar + " = \"" + statement.ext.identifier + "\" }");
      }
    }
    res = "{\n";
    ref = statement.fields;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      res += "  \"" + (this.formatField(f.field)) + "\": " + (this.transpile(f.value, context, true)) + ",\n";
    }
    if (statement.ext != null) {
      res += "  \"class\": " + classvar + " , ";
    }
    res += "}";
    return res;
  };

  JSTranspiler.prototype.transpileUpdateClass = function(statement, context, variable) {
    var classvar, cls, f, j, key, len, ref, res;
    if (statement.ext != null) {
      classvar = this.createTempVariable(context);
      this.prepend("var " + classvar + " = " + (this.transpile(statement.ext, context, true)) + " ;");
      if (statement.ext instanceof Program.Variable) {
        this.prepend("if (!" + classvar + ") { " + classvar + " = \"" + statement.ext.identifier + "\" }");
      }
    }
    res = "{\n";
    ref = statement.fields;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      res += "  \"" + (this.formatField(f.field)) + "\": " + (this.transpile(f.value, context, true)) + ",\n";
    }
    if (statement.ext != null) {
      res += "  \"class\": " + classvar + " , ";
    }
    res += "  \"classname\": \"" + variable + "\" , ";
    res += "}";
    cls = this.createTempVariable(context);
    key = this.createTempVariable(context);
    this.prepend("if (context.object[\"" + variable + "\"] != null) {\n  for (" + key + " in " + res + ") {\n    context.object[\"" + variable + "\"][" + key + "] = " + res + "[" + key + "] ;\n  }\n  " + cls + " = context.object[\"" + variable + "\"] ;\n}\nelse {\n  " + cls + " = " + res + " ;\n}");
    return cls;
  };

  JSTranspiler.prototype.transpileNewCall = function(statement, context) {
    var a, classvar, constructor, fconstructor, funcall, i, j, len, objvar, ref;
    funcall = statement.expression;
    classvar = this.createTempVariable(context);
    objvar = this.createTempVariable(context);
    constructor = "_msApply(" + objvar + ",\"_constructor\" ";
    fconstructor = "new " + classvar + "(";
    ref = funcall.args;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      a = ref[i];
      a = this.transpile(a, context, true);
      constructor += ", ";
      constructor += a;
      if (i > 0) {
        fconstructor += ", ";
      }
      fconstructor += a;
    }
    constructor += ") ;";
    fconstructor += ") ;";
    this.prepend("var " + classvar + " = " + (this.transpile(funcall.expression, context, true)) + " ;");
    this.prepend("if (typeof " + classvar + " == \"function\") {\n  var " + objvar + " = " + fconstructor + " ;\n} else {\n  var " + objvar + " = { \"class\": " + classvar + "} ;\n  _msResolveParentClass(" + objvar + ") ;\n  " + constructor + "\n} ");
    return objvar;
  };

  JSTranspiler.prototype.exec = function(context) {
    eval("var f = function(context) {" + this.code + " }");
    return f(context);
  };

  JSTranspiler.predefined_functions = {
    "abs": "Math.abs",
    "max": "Math.max",
    "cos": "Math.cos",
    "sin": "Math.sin"
  };

  return JSTranspiler;

})();
