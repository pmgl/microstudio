this.Routine = (function() {
  function Routine(num_args) {
    this.num_args = num_args;
    this.ops = [];
    this.opcodes = [];
    this.arg1 = [];
    this.ref = [];
    this.table = {};
    this.label_count = 0;
    this.labels = {};
    this.transpile = false;
    this.import_refs = [];
    this.import_values = [];
    this.import_self = -1;
  }

  Routine.prototype.clone = function() {
    var r;
    r = new Routine(this.num_args);
    r.opcodes = this.opcodes;
    r.arg1 = this.arg1;
    r.ref = this.ref;
    r.locals_size = this.locals_size;
    return r;
  };

  Routine.prototype.createLabel = function(str) {
    var name;
    if (str == null) {
      str = "label";
    }
    return name = ":" + str + "_" + this.label_count++;
  };

  Routine.prototype.setLabel = function(name) {
    return this.labels[name] = this.opcodes.length;
  };

  Routine.prototype.optimize = function() {
    if (this.transpile) {
      new Transpiler().transpile(this);
    }
  };

  Routine.prototype.removeable = function(index) {
    var label, ref1, value;
    ref1 = this.labels;
    for (label in ref1) {
      value = ref1[label];
      if (value === index) {
        return false;
      }
    }
    return true;
  };

  Routine.prototype.remove = function(index) {
    var label, ref1, value;
    ref1 = this.labels;
    for (label in ref1) {
      value = ref1[label];
      if (value === index) {
        return false;
      } else if (value > index) {
        this.labels[label] -= 1;
      }
    }
    this.opcodes.splice(index, 1);
    this.arg1.splice(index, 1);
    this.ref.splice(index, 1);
    return true;
  };

  Routine.prototype.resolveLabels = function() {
    var i, j, ref1, ref2, ref3, results;
    results = [];
    for (i = j = 0, ref1 = this.opcodes.length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
      if ((ref2 = this.opcodes[i]) === OPCODES.JUMP || ref2 === OPCODES.JUMPY || ref2 === OPCODES.JUMPN || ref2 === OPCODES.JUMPY_NOPOP || ref2 === OPCODES.JUMPN_NOPOP) {
        if (this.labels[this.arg1[i]]) {
          results.push(this.arg1[i] = this.labels[this.arg1[i]]);
        } else {
          results.push(void 0);
        }
      } else if ((ref3 = this.opcodes[i]) === OPCODES.FORLOOP_CONTROL || ref3 === OPCODES.FORLOOP_INIT || ref3 === OPCODES.FORIN_CONTROL || ref3 === OPCODES.FORIN_INIT) {
        if (this.labels[this.arg1[i][1]]) {
          results.push(this.arg1[i][1] = this.labels[this.arg1[i][1]]);
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Routine.prototype.OP = function(code, ref, v1) {
    if (v1 == null) {
      v1 = 0;
    }
    this.opcodes.push(code);
    this.arg1.push(v1);
    return this.ref.push(ref);
  };

  Routine.prototype.OP_INSERT = function(code, ref, v1, index) {
    var label, ref1, value;
    if (v1 == null) {
      v1 = 0;
    }
    this.opcodes.splice(index, 0, code);
    this.arg1.splice(index, 0, v1);
    this.ref.splice(index, 0, ref);
    ref1 = this.labels;
    for (label in ref1) {
      value = ref1[label];
      if (value >= index) {
        this.labels[label] += 1;
      }
    }
  };

  Routine.prototype.TYPE = function(ref) {
    return this.OP(OPCODES.TYPE, ref);
  };

  Routine.prototype.VARIABLE_TYPE = function(variable, ref) {
    return this.OP(OPCODES.VARIABLE_TYPE, ref, variable);
  };

  Routine.prototype.PROPERTY_TYPE = function(ref) {
    return this.OP(OPCODES.PROPERTY_TYPE, ref);
  };

  Routine.prototype.LOAD_THIS = function(ref) {
    return this.OP(OPCODES.LOAD_THIS, ref);
  };

  Routine.prototype.LOAD_GLOBAL = function(ref) {
    return this.OP(OPCODES.LOAD_GLOBAL, ref);
  };

  Routine.prototype.LOAD_VALUE = function(value, ref) {
    return this.OP(OPCODES.LOAD_VALUE, ref, value);
  };

  Routine.prototype.LOAD_LOCAL = function(index, ref) {
    return this.OP(OPCODES.LOAD_LOCAL, ref, index);
  };

  Routine.prototype.LOAD_VARIABLE = function(variable, ref) {
    return this.OP(OPCODES.LOAD_VARIABLE, ref, variable);
  };

  Routine.prototype.LOAD_LOCAL_OBJECT = function(index, ref) {
    return this.OP(OPCODES.LOAD_LOCAL_OBJECT, ref, index);
  };

  Routine.prototype.LOAD_VARIABLE_OBJECT = function(variable, ref) {
    return this.OP(OPCODES.LOAD_VARIABLE_OBJECT, ref, variable);
  };

  Routine.prototype.POP = function(ref) {
    return this.OP(OPCODES.POP, ref);
  };

  Routine.prototype.LOAD_PROPERTY = function(ref) {
    return this.OP(OPCODES.LOAD_PROPERTY, ref);
  };

  Routine.prototype.LOAD_PROPERTY_OBJECT = function(ref) {
    return this.OP(OPCODES.LOAD_PROPERTY_OBJECT, ref);
  };

  Routine.prototype.CREATE_OBJECT = function(ref) {
    return this.OP(OPCODES.CREATE_OBJECT, ref);
  };

  Routine.prototype.MAKE_OBJECT = function(ref) {
    return this.OP(OPCODES.MAKE_OBJECT, ref);
  };

  Routine.prototype.CREATE_ARRAY = function(ref) {
    return this.OP(OPCODES.CREATE_ARRAY, ref);
  };

  Routine.prototype.CREATE_CLASS = function(parent_var, ref) {
    return this.OP(OPCODES.CREATE_CLASS, ref, parent_var);
  };

  Routine.prototype.UPDATE_CLASS = function(variable, ref) {
    return this.OP(OPCODES.UPDATE_CLASS, ref, variable);
  };

  Routine.prototype.NEW_CALL = function(args, ref) {
    return this.OP(OPCODES.NEW_CALL, ref, args);
  };

  Routine.prototype.ADD = function(ref, self) {
    if (self == null) {
      self = 0;
    }
    return this.OP(OPCODES.ADD, ref, self);
  };

  Routine.prototype.SUB = function(ref, self) {
    if (self == null) {
      self = 0;
    }
    return this.OP(OPCODES.SUB, ref, self);
  };

  Routine.prototype.MUL = function(ref) {
    return this.OP(OPCODES.MUL, ref);
  };

  Routine.prototype.DIV = function(ref) {
    return this.OP(OPCODES.DIV, ref);
  };

  Routine.prototype.MODULO = function(ref) {
    return this.OP(OPCODES.MODULO, ref);
  };

  Routine.prototype.BINARY_AND = function(ref) {
    return this.OP(OPCODES.BINARY_AND, ref);
  };

  Routine.prototype.BINARY_OR = function(ref) {
    return this.OP(OPCODES.BINARY_OR, ref);
  };

  Routine.prototype.SHIFT_LEFT = function(ref) {
    return this.OP(OPCODES.SHIFT_LEFT, ref);
  };

  Routine.prototype.SHIFT_RIGHT = function(ref) {
    return this.OP(OPCODES.SHIFT_RIGHT, ref);
  };

  Routine.prototype.NEGATE = function(ref) {
    return this.OP(OPCODES.NEGATE, ref);
  };

  Routine.prototype.LOAD_PROPERTY_ATOP = function(ref) {
    return this.OP(OPCODES.LOAD_PROPERTY_ATOP, ref);
  };

  Routine.prototype.EQ = function(ref) {
    return this.OP(OPCODES.EQ, ref);
  };

  Routine.prototype.NEQ = function(ref) {
    return this.OP(OPCODES.NEQ, ref);
  };

  Routine.prototype.LT = function(ref) {
    return this.OP(OPCODES.LT, ref);
  };

  Routine.prototype.GT = function(ref) {
    return this.OP(OPCODES.GT, ref);
  };

  Routine.prototype.LTE = function(ref) {
    return this.OP(OPCODES.LTE, ref);
  };

  Routine.prototype.GTE = function(ref) {
    return this.OP(OPCODES.GTE, ref);
  };

  Routine.prototype.NOT = function(ref) {
    return this.OP(OPCODES.NOT, ref);
  };

  Routine.prototype.FORLOOP_INIT = function(iterator, ref) {
    return this.OP(OPCODES.FORLOOP_INIT, ref, iterator);
  };

  Routine.prototype.FORLOOP_CONTROL = function(args, ref) {
    return this.OP(OPCODES.FORLOOP_CONTROL, ref, args);
  };

  Routine.prototype.FORIN_INIT = function(args, ref) {
    return this.OP(OPCODES.FORIN_INIT, ref, args);
  };

  Routine.prototype.FORIN_CONTROL = function(args, ref) {
    return this.OP(OPCODES.FORIN_CONTROL, ref, args);
  };

  Routine.prototype.JUMP = function(index, ref) {
    return this.OP(OPCODES.JUMP, ref, index);
  };

  Routine.prototype.JUMPY = function(index, ref) {
    return this.OP(OPCODES.JUMPY, ref, index);
  };

  Routine.prototype.JUMPN = function(index, ref) {
    return this.OP(OPCODES.JUMPN, ref, index);
  };

  Routine.prototype.JUMPY_NOPOP = function(index, ref) {
    return this.OP(OPCODES.JUMPY_NOPOP, ref, index);
  };

  Routine.prototype.JUMPN_NOPOP = function(index, ref) {
    return this.OP(OPCODES.JUMPN_NOPOP, ref, index);
  };

  Routine.prototype.STORE_LOCAL = function(index, ref) {
    return this.OP(OPCODES.STORE_LOCAL, ref, index);
  };

  Routine.prototype.STORE_VARIABLE = function(field, ref) {
    return this.OP(OPCODES.STORE_VARIABLE, ref, field);
  };

  Routine.prototype.CREATE_PROPERTY = function(ref) {
    return this.OP(OPCODES.CREATE_PROPERTY, ref);
  };

  Routine.prototype.STORE_PROPERTY = function(ref) {
    return this.OP(OPCODES.STORE_PROPERTY, ref);
  };

  Routine.prototype.LOAD_ROUTINE = function(value, ref) {
    return this.OP(OPCODES.LOAD_ROUTINE, ref, value);
  };

  Routine.prototype.FUNCTION_CALL = function(args, ref) {
    return this.OP(OPCODES.FUNCTION_CALL, ref, args);
  };

  Routine.prototype.FUNCTION_APPLY_VARIABLE = function(args, ref) {
    return this.OP(OPCODES.FUNCTION_APPLY_VARIABLE, ref, args);
  };

  Routine.prototype.FUNCTION_APPLY_PROPERTY = function(args, ref) {
    return this.OP(OPCODES.FUNCTION_APPLY_PROPERTY, ref, args);
  };

  Routine.prototype.SUPER_CALL = function(args, ref) {
    return this.OP(OPCODES.SUPER_CALL, ref, args);
  };

  Routine.prototype.RETURN = function(ref) {
    return this.OP(OPCODES.RETURN, ref);
  };

  Routine.prototype.AFTER = function(ref) {
    return this.OP(OPCODES.AFTER, ref);
  };

  Routine.prototype.EVERY = function(ref) {
    return this.OP(OPCODES.EVERY, ref);
  };

  Routine.prototype.DO = function(ref) {
    return this.OP(OPCODES.DO, ref);
  };

  Routine.prototype.SLEEP = function(ref) {
    return this.OP(OPCODES.SLEEP, ref);
  };

  Routine.prototype.UNARY_OP = function(f, ref) {
    return this.OP(OPCODES.UNARY_OP, ref, f);
  };

  Routine.prototype.BINARY_OP = function(f, ref) {
    return this.OP(OPCODES.BINARY_OP, ref, f);
  };

  Routine.prototype.toString = function() {
    var i, j, len, op, ref1, s;
    s = "";
    ref1 = this.opcodes;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      op = ref1[i];
      s += OPCODES[op];
      if (this.arg1[i]) {
        s += " " + this.arg1[i];
      }
      s += "\n";
    }
    return s;
  };

  return Routine;

})();

this.OPCODES_CLASS = (function() {
  function OPCODES_CLASS() {
    this.table = {};
    this.set("TYPE", 1);
    this.set("VARIABLE_TYPE", 2);
    this.set("PROPERTY_TYPE", 3);
    this.set("LOAD_IMPORT", 4);
    this.set("LOAD_THIS", 5);
    this.set("LOAD_GLOBAL", 6);
    this.set("LOAD_VALUE", 10);
    this.set("LOAD_LOCAL", 11);
    this.set("LOAD_VARIABLE", 12);
    this.set("LOAD_LOCAL_OBJECT", 13);
    this.set("LOAD_VARIABLE_OBJECT", 14);
    this.set("POP", 15);
    this.set("LOAD_PROPERTY", 16);
    this.set("LOAD_PROPERTY_OBJECT", 17);
    this.set("CREATE_OBJECT", 18);
    this.set("MAKE_OBJECT", 19);
    this.set("CREATE_ARRAY", 20);
    this.set("STORE_LOCAL", 21);
    this.set("STORE_VARIABLE", 23);
    this.set("CREATE_PROPERTY", 24);
    this.set("STORE_PROPERTY", 25);
    this.set("UPDATE_CLASS", 27);
    this.set("CREATE_CLASS", 28);
    this.set("NEW_CALL", 29);
    this.set("ADD", 30);
    this.set("SUB", 31);
    this.set("MUL", 32);
    this.set("DIV", 33);
    this.set("MODULO", 34);
    this.set("BINARY_AND", 35);
    this.set("BINARY_OR", 36);
    this.set("SHIFT_LEFT", 37);
    this.set("SHIFT_RIGHT", 38);
    this.set("NEGATE", 39);
    this.set("EQ", 40);
    this.set("NEQ", 41);
    this.set("LT", 42);
    this.set("GT", 43);
    this.set("LTE", 44);
    this.set("GTE", 45);
    this.set("NOT", 50);
    this.set("LOAD_PROPERTY_ATOP", 68);
    this.set("JUMP", 80);
    this.set("JUMPY", 81);
    this.set("JUMPN", 82);
    this.set("JUMPY_NOPOP", 83);
    this.set("JUMPN_NOPOP", 84);
    this.set("LOAD_ROUTINE", 89);
    this.set("FUNCTION_CALL", 90);
    this.set("FUNCTION_APPLY_VARIABLE", 91);
    this.set("FUNCTION_APPLY_PROPERTY", 92);
    this.set("SUPER_CALL", 93);
    this.set("RETURN", 94);
    this.set("FORLOOP_INIT", 95);
    this.set("FORLOOP_CONTROL", 96);
    this.set("FORIN_INIT", 97);
    this.set("FORIN_CONTROL", 98);
    this.set("UNARY_OP", 100);
    this.set("BINARY_OP", 101);
    this.set("COMPILED", 200);
    this.set("AFTER", 110);
    this.set("EVERY", 111);
    this.set("DO", 112);
    this.set("SLEEP", 113);
  }

  OPCODES_CLASS.prototype.set = function(op, code) {
    this[op] = code;
    return this[code] = op;
  };

  return OPCODES_CLASS;

})();

this.OPCODES = new this.OPCODES_CLASS;
