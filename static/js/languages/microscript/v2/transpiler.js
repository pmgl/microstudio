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
    var comp, err, index, k, l, m, ref, ref1, ref2, ref3, s;
    this.vcount = 0;
    this.stack = new Stack();
    this.locals = {};
    this.variables = {};
    s = "f = function(stack,stack_index,locals,locals_offset,object,global) {\n";
    for (k = l = ref = i, ref1 = j; l <= ref1; k = l += 1) {
      console.info(OPCODES[r.opcodes[k]] + " " + r.arg1[k]);
      comp = this[OPCODES[r.opcodes[k]]](r.arg1[k]);
      if (comp) {
        s += comp + "\n";
      }
    }
    for (index in this.stack.touched) {
      if (this.stack.touched[index]) {
        if (index < 0) {
          s += "stack[stack_index-" + (Math.abs(index)) + "] = " + this.stack.stack[index] + " ;\n";
        } else if (index > 0) {
          s += "stack[stack_index+" + index + "] = " + this.stack.stack[index] + " ;\n";
        } else {
          s += "stack[stack_index] = " + this.stack.stack[index] + " ;\n";
        }
      }
    }
    if (this.stack.index < 0) {
      s += "stack_index -= " + (Math.abs(this.stack.index)) + " ;\n";
    } else if (this.stack.index > 0) {
      s += "stack_index += " + this.stack.index + " ;\n";
    }
    s += "return stack_index ;\n}";
    console.info(s);
    try {
      eval(s);
    } catch (error) {
      err = error;
      console.error(s);
      console.error(err);
    }
    r.opcodes[i] = 200;
    r.arg1[i] = f;
    for (k = m = ref2 = i + 1, ref3 = j; m <= ref3; k = m += 1) {
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
      this.stack.push(" \"" + (arg.replace(/"/g, "\\\"")) + "\" ");
    } else if (typeof arg === "number") {
      this.stack.push(arg + "");
    }
    return "";
  };

  Transpiler.prototype.LOAD_LOCAL = function(arg) {
    var v;
    v = this.createVariable();
    this.stack.push(v);
    return "let " + v + " = locals[locals_offset+" + arg + "] ; // LOAD_LOCAL";
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
    var v;
    v = this.stack.get();
    return "locals[locals_offset+" + arg + "] = " + v + " ; // STORE_LOCAL";
  };

  Transpiler.prototype.POP = function() {
    this.stack.pop();
    return "";
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

  Transpiler.prototype.LOAD_PROPERTY_ATOP = function(arg) {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = " + (this.stack.get(-1)) + "[" + (this.stack.get()) + "] ; // LOAD_PROPERTY_ATOP\nif (" + v + " == null) { " + v + " = 0 ; }";
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
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = " + (this.stack.get()) + " ;\nif (typeof " + v + " != \"object\") " + v + " = {} ; ";
    this.stack.pop();
    this.stack.push(v);
    return res;
  };

  Transpiler.prototype.STORE_VARIABLE = function(arg) {
    if (this.variables[arg] != null) {
      return this.variables[arg] + " = object[\"" + arg + "\"] = " + (this.stack.get()) + " ; // STORE_VARIABLE";
    } else {
      return "object[\"" + arg + "\"] = " + (this.stack.get()) + " ; // STORE_VARIABLE";
    }
  };

  Transpiler.prototype.STORE_PROPERTY = function(arg) {
    var res, v;
    v = this.createVariable();
    res = "let " + v + " = " + (this.stack.get(-2)) + "[" + (this.stack.get(-1)) + "] = " + (this.stack.get(0)) + " ; // STORE_PROPERTY";
    this.stack.pop();
    this.stack.pop();
    this.stack.pop();
    this.stack.push(v);
    return res;
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
