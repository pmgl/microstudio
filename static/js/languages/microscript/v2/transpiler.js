var Transpiler;

Transpiler = (function() {
  function Transpiler() {}

  Transpiler.prototype.transpile = function(r) {
    var i, j, l, op, ref, results;
    results = [];
    for (i = l = 0, ref = r.opcodes.length - 1; l <= ref; i = l += 1) {
      op = OPCODES[r.opcodes[i]];
      if (this.transpilable(op, r.arg1[i])) {
        j = i + 1;
        while (j < r.opcodes.length && r.removeable(j) && this.transpilable(OPCODES[r.opcodes[j]], r.arg1[j])) {
          j += 1;
        }
        j -= 1;
        if (j - i >= 2) {
          results.push(this.transpileSegment(r, i, j));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Transpiler.prototype.transpileSegment = function(r, i, j) {
    var comp, err, k, l, m, n, ref, ref1, ref2, ref3, ref4, s;
    this.vcount = 0;
    this.stack = new Stack();
    this.locals = {};
    this.variables = {};
    s = "f = function(stack,stack_index,locals,locals_offset,object) {\n";
    for (k = l = ref = i, ref1 = j; l <= ref1; k = l += 1) {
      comp = this[OPCODES[r.opcodes[k]]](r.arg1[k]);
      if (comp) {
        s += comp + "\n";
      }
    }
    if (this.stack.index > 0) {
      if (this.stack.touched[0]) {
        s += "stack[stack_index] = " + (this.stack.get(-this.stack.index)) + " ;\n";
      }
      for (k = m = 1, ref2 = this.stack.index; m <= ref2; k = m += 1) {
        s += "stack[++stack_index] = " + (this.stack.get(-this.stack.index + k)) + " ;\n";
      }
    } else if (this.stack.index < 0) {
      s += "stack_index -= " + (-this.stack.index) + " ;\n";
      if (this.stack.touched[this.stack.index]) {
        s += "stack[stack_index] = " + this.stack.stack[this.stack.index] + " ;\n";
      }
    } else {
      if (this.stack.touched[0]) {
        s += "stack[stack_index] = " + (this.stack.get()) + " ;\n";
      }
    }
    s += "return stack_index ;\n}";
    console.info(s);
    try {
      eval(s);
    } catch (error) {
      err = error;
      console.error(err);
    }
    r.opcodes[i] = 200;
    r.arg1[i] = f;
    for (k = n = ref3 = i + 1, ref4 = j; n <= ref4; k = n += 1) {
      r.remove(i + 1);
    }
  };

  Transpiler.prototype.createVariable = function() {
    return "v" + (this.vcount++);
  };

  Transpiler.prototype.transpilable = function(op, arg) {
    var ref;
    if (op === "LOAD_VALUE") {
      return (ref = typeof arg) === "string" || ref === "number";
    } else {
      return this[op] != null;
    }
  };

  Transpiler.prototype.LOAD_VALUE = function(arg) {
    if (typeof arg === "string") {
      this.stack.push(" \"" + arg + "\" ");
    } else if (typeof arg === "number") {
      this.stack.push(arg + "");
    }
    return "";
  };

  Transpiler.prototype.LOAD_LOCAL = function(arg) {
    var v;
    if (this.locals[arg] != null) {
      this.stack.push(this.locals[arg]);
      return "";
    } else {
      v = this.createVariable();
      this.locals[arg] = v;
      this.stack.push(v);
      return " let " + v + " = locals[locals_offset+" + arg + "] ";
    }
  };

  Transpiler.prototype.LOAD_LOCAL_OBJECT = function(arg) {
    var res, v;
    if (this.locals[arg] != null) {
      v = this.locals[arg];
      this.stack.push(v);
      return "if (typeof " + v + " != \"object\") { " + v + " = locals[locals_offset+" + arg + "] = {} } ;";
    } else {
      v = this.createVariable();
      res = "let " + v + " = locals[locals_offset+" + arg + "] ;\nif (typeof " + v + " != \"object\") { " + v + " = locals[locals_offset+" + arg + "] = {} } ;";
      this.stack.push(v);
      this.locals[arg] = v;
      return res;
    }
  };

  Transpiler.prototype.STORE_LOCAL = function(arg) {
    if (this.locals[arg] != null) {
      return this.locals[arg] + " = locals[locals_offset+" + arg + "] = " + (this.stack.get()) + " ;";
    } else {
      return "locals[locals_offset+" + arg + "] = " + (this.stack.get()) + " ;";
    }
  };

  Transpiler.prototype.POP = function() {
    this.stack.pop();
    return "";
  };

  Transpiler.prototype.STORE_LOCAL_POP = function(arg) {
    return "locals[locals_offset+" + arg + "] = " + (this.stack.pop()) + " ;";
  };

  Transpiler.prototype.DIV = function() {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = " + (this.stack.get(-1)) + " / " + (this.stack.get()) + " ;";
    this.stack.pop();
    this.stack.pop();
    this.stack.push(v);
    return res;
  };

  Transpiler.prototype.MUL = function() {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = " + (this.stack.get(-1)) + " * " + (this.stack.get()) + " ;";
    this.stack.pop();
    this.stack.pop();
    this.stack.push(v);
    return res;
  };

  Transpiler.prototype.ADD = function() {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = " + (this.stack.get(-1)) + " + " + (this.stack.get()) + " ;";
    this.stack.pop();
    this.stack.pop();
    this.stack.push(v);
    return res;
  };

  Transpiler.prototype.SUB = function() {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = " + (this.stack.get(-1)) + "-" + (this.stack.get()) + " ;";
    this.stack.pop();
    this.stack.pop();
    this.stack.push(v);
    return res;
  };

  Transpiler.prototype.CREATE_PROPERTY = function(arg) {
    var res;
    res = (this.stack.get(-2)) + "[" + (this.stack.get(-1)) + "] = " + (this.stack.get()) + " ;";
    this.stack.pop();
    this.stack.pop();
    return res;
  };

  Transpiler.prototype.LOAD_PROPERTY = function(arg) {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = " + (this.stack.get(-1)) + "[" + (this.stack.get()) + "] ; // LOAD_PROPERTY\nif (" + v + " == null) { " + v + " = 0 ; }";
    this.stack.pop();
    this.stack.pop();
    this.stack.push(v);
    return res;
  };

  Transpiler.prototype.ADD_PROPERTY = function(arg) {
    var res, v1, v2;
    v1 = this.createVariable();
    v2 = this.createVariable();
    res = "let " + v1 + " = " + (this.stack.get(-2)) + "[" + (this.stack.get(-1)) + "] ; // ADD_PROPERTY\nlet " + v2 + " = " + (this.stack.get()) + " ;\nif (typeof " + v1 + " == \"number\" && typeof " + v2 + " == \"number\") {\n  " + v1 + " += " + v2 + " ;\n  " + v1 + " = isFinite(" + v1 + ") ? " + v1 + " : 0 ;\n  " + (this.stack.get(-2)) + "[" + (this.stack.get(-1)) + "] = " + v1 + " ;\n}";
    this.stack.pop();
    this.stack.pop();
    this.stack.pop();
    this.stack.push(v1);
    return res;
  };

  Transpiler.prototype.SUB_PROPERTY = function(arg) {
    var res, v1, v2;
    v1 = this.createVariable();
    v2 = this.createVariable();
    res = "let " + v1 + " = " + (this.stack.get(-2)) + "[" + (this.stack.get(-1)) + "] ; // SUB_PROPERTY\nlet " + v2 + " = " + (this.stack.get()) + " ;\nif (typeof " + v1 + " == \"number\" && typeof " + v2 + " == \"number\") {\n  " + v1 + " -= " + v2 + " ;\n  " + v1 + " = isFinite(" + v1 + ") ? " + v1 + " : 0 ;\n  " + (this.stack.get(-2)) + "[" + (this.stack.get(-1)) + "] = " + v1 + " ;\n}";
    this.stack.pop();
    this.stack.pop();
    this.stack.pop();
    this.stack.push(v1);
    return res;
  };

  Transpiler.prototype.ADD_LOCAL = function(arg) {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = locals[locals_offset+" + arg + "] += " + (this.stack.get()) + " ; // ADD_LOCAL";
    this.stack.pop();
    this.stack.push(v);
    return res;
  };

  Transpiler.prototype.NEW_OBJECT = function() {
    var v;
    v = this.createVariable();
    this.stack.push(v);
    return "let " + v + " = {} ;";
  };

  Transpiler.prototype.NEW_ARRAY = function() {
    var v;
    v = this.createVariable();
    this.stack.push(v);
    return "let " + v + " = [] ;";
  };

  Transpiler.prototype.MAKE_OBJECT = function() {
    var v;
    v = this.createVariable();
    this.stack.pop();
    this.stack.push(v);
    return "let " + v + " = " + (this.stack.get()) + " ;\n" + v + " = typeof v == \"object\" ? " + v + " : {}";
  };

  Transpiler.prototype.NEGATE = function() {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = - " + (this.stack.get()) + " ; // NEGATE\nif (" + v + " == null) { " + v + " = 0 ;};";
    this.stack.pop();
    this.stack.push(v);
    return res;
  };

  Transpiler.prototype.SQRT = function() {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = Math.sqrt(" + (this.stack.get()) + ") ;";
    this.stack.pop();
    this.stack.push(v);
    return res;
  };

  Transpiler.prototype.LOAD_VARIABLE = function(arg) {
    var res, v;
    if (this.variables[arg] != null) {
      this.stack.push(this.variables[arg]);
      return "";
    } else {
      v = this.createVariable();
      res = "let " + v + " = object[\"" + arg + "\"] ; // LOAD_VARIABLE\nif (" + v + " == null) {\n  let obj = object ;\n  while ((" + v + " == null) && (obj[\"class\"] != null)) { obj = obj[\"class\"] ; " + v + " = obj[\"" + arg + "\"] }\n  if (" + v + " == null) v = global[\"" + arg + "\"] ;\n  if (" + v + " == null) { " + v + " = 0 ; }\n}";
      this.stack.push(v);
      this.variables[arg] = v;
      return res;
    }
  };

  Transpiler.prototype.STORE_VARIABLE = function(arg) {
    if (this.variables[arg] != null) {
      return this.variables[arg] + " = object[\"" + arg + "\"] = " + (this.stack.get()) + " ; // STORE_VARIABLE";
    } else {
      return "object[\"" + arg + "\"] = " + (this.stack.get()) + " ; // STORE_VARIABLE";
    }
  };

  return Transpiler;

})();

this.Stack = (function() {
  function Stack() {
    this.stack = ["stack[stack_index]"];
    this.index = 0;
    this.touched = {};
  }

  Stack.prototype.push = function(value) {
    this.stack[++this.index] = value;
    return this.touched[this.index] = true;
  };

  Stack.prototype.pop = function() {
    var res;
    if (this.index >= 0) {
      res = this.stack.splice(this.index, 1)[0];
    } else if (this.stack[this.index] != null) {
      res = this.stack[this.index];
    } else {
      res = "stack[stack_index-" + this.index + "]";
    }
    this.index -= 1;
    return res;
  };

  Stack.prototype.get = function(index) {
    var i;
    if (index == null) {
      index = 0;
    }
    i = this.index + index;
    if (i >= 0) {
      return this.stack[i];
    } else if (this.stack[i] != null) {
      return this.stack[i];
    } else {
      return "stack[stack_index-" + (-i) + "]";
    }
  };

  return Stack;

})();
