this.Routine = (function() {
  function Routine(num_args) {
    this.num_args = num_args;
    this.ops = [];
    this.opcodes = [];
    this.arg1 = [];
    this.arg2 = [];
    this.ref = [];
    this.table = {};
    this.label_count = 0;
    this.labels = {};
    this.transpile = false;
    this.set("OPCODE_TYPE", 1);
    this.set("OPCODE_VARIABLE_TYPE", 2);
    this.set("OPCODE_PROPERTY_TYPE", 3);
    this.set("OPCODE_LOAD_THIS", 5);
    this.set("OPCODE_LOAD_GLOBAL", 6);
    this.set("OPCODE_LOAD_CONTEXT_VARIABLE", 8);
    this.set("OPCODE_LOAD_CONTEXT_PROPERTY", 9);
    this.set("OPCODE_LOAD_VALUE", 10);
    this.set("OPCODE_LOAD_LOCAL", 11);
    this.set("OPCODE_LOAD_VARIABLE", 12);
    this.set("OPCODE_LOAD_LOCAL_OBJECT", 13);
    this.set("OPCODE_LOAD_VARIABLE_OBJECT", 14);
    this.set("OPCODE_POP", 15);
    this.set("OPCODE_LOAD_PROPERTY", 16);
    this.set("OPCODE_LOAD_PROPERTY_OBJECT", 17);
    this.set("OPCODE_CREATE_OBJECT", 18);
    this.set("OPCODE_MAKE_OBJECT", 19);
    this.set("OPCODE_CREATE_ARRAY", 20);
    this.set("OPCODE_STORE_LOCAL", 21);
    this.set("OPCODE_STORE_VARIABLE", 23);
    this.set("OPCODE_CREATE_PROPERTY", 24);
    this.set("OPCODE_STORE_PROPERTY", 25);
    this.set("OPCODE_UPDATE_CLASS", 27);
    this.set("OPCODE_CREATE_CLASS", 28);
    this.set("OPCODE_NEW_CALL", 29);
    this.set("OPCODE_ADD", 30);
    this.set("OPCODE_SUB", 31);
    this.set("OPCODE_MUL", 32);
    this.set("OPCODE_DIV", 33);
    this.set("OPCODE_MODULO", 34);
    this.set("OPCODE_NEGATE", 39);
    this.set("OPCODE_EQ", 40);
    this.set("OPCODE_NEQ", 41);
    this.set("OPCODE_LT", 42);
    this.set("OPCODE_GT", 43);
    this.set("OPCODE_LTE", 44);
    this.set("OPCODE_GTE", 45);
    this.set("OPCODE_NOT", 50);
    this.set("OPCODE_ADD_LOCAL", 60);
    this.set("OPCODE_SUB_LOCAL", 61);
    this.set("OPCODE_MUL_LOCAL", 62);
    this.set("OPCODE_DIV_LOCAL", 63);
    this.set("OPCODE_ADD_VARIABLE", 64);
    this.set("OPCODE_SUB_VARIABLE", 65);
    this.set("OPCODE_MUL_VARIABLE", 66);
    this.set("OPCODE_DIV_VARIABLE", 67);
    this.set("OPCODE_ADD_PROPERTY", 68);
    this.set("OPCODE_SUB_PROPERTY", 69);
    this.set("OPCODE_MUL_PROPERTY", 70);
    this.set("OPCODE_DIV_PROPERTY", 71);
    this.set("OPCODE_FORLOOP_INIT", 95);
    this.set("OPCODE_FORLOOP_CONTROL", 96);
    this.set("OPCODE_FORIN_INIT", 97);
    this.set("OPCODE_FORIN_CONTROL", 98);
    this.set("OPCODE_JUMP", 80);
    this.set("OPCODE_JUMPY", 81);
    this.set("OPCODE_JUMPN", 82);
    this.set("OPCODE_JUMPY_NOPOP", 83);
    this.set("OPCODE_JUMPN_NOPOP", 84);
    this.set("OPCODE_FUNCTION_CALL", 90);
    this.set("OPCODE_FUNCTION_APPLY_VARIABLE", 91);
    this.set("OPCODE_FUNCTION_APPLY_PROPERTY", 92);
    this.set("OPCODE_SUPER_CALL", 93);
    this.set("OPCODE_RETURN", 94);
    this.set("OPCODE_UNARY_OP", 100);
    this.set("OPCODE_BINARY_OP", 101);
    this.set("OPCODE_COMPILED", 200);
    this.set("OPCODE_AFTER", 110);
    this.set("OPCODE_EVERY", 111);
    this.set("OPCODE_DO", 112);
    this.set("OPCODE_SLEEP", 113);
  }

  Routine.prototype.set = function(op, code) {
    this[op] = code;
    return this.table[code] = op.substring(7);
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
    this.arg2.splice(index, 1);
    this.ref.splice(index, 1);
    return true;
  };

  Routine.prototype.resolveLabels = function() {
    var i, j, ref1, ref2, ref3, results;
    results = [];
    for (i = j = 0, ref1 = this.opcodes.length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
      if ((ref2 = this.opcodes[i]) === this.OPCODE_JUMP || ref2 === this.OPCODE_JUMPY || ref2 === this.OPCODE_JUMPN || ref2 === this.OPCODE_JUMPY_NOPOP || ref2 === this.OPCODE_JUMPN_NOPOP) {
        if (this.labels[this.arg1[i]]) {
          results.push(this.arg1[i] = this.labels[this.arg1[i]]);
        } else {
          results.push(void 0);
        }
      } else if ((ref3 = this.opcodes[i]) === this.OPCODE_FORLOOP_CONTROL || ref3 === this.OPCODE_FORLOOP_INIT || ref3 === this.OPCODE_FORIN_CONTROL || ref3 === this.OPCODE_FORIN_INIT) {
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

  Routine.prototype.OP = function(code, ref, v1, v2) {
    if (v1 == null) {
      v1 = 0;
    }
    if (v2 == null) {
      v2 = 0;
    }
    this.opcodes.push(code);
    this.arg1.push(v1);
    this.arg2.push(v2);
    return this.ref.push(ref);
  };

  Routine.prototype.LOAD_THIS = function(ref) {
    return this.OP(this.OPCODE_LOAD_THIS, ref);
  };

  Routine.prototype.LOAD_GLOBAL = function(ref) {
    return this.OP(this.OPCODE_LOAD_GLOBAL, ref);
  };

  Routine.prototype.LOAD_CONTEXT_VARIABLE = function(variable, ref) {
    return this.OP(this.OPCODE_LOAD_CONTEXT_VARIABLE, ref, variable);
  };

  Routine.prototype.LOAD_CONTEXT_PROPERTY = function(variable, ref) {
    return this.OP(this.OPCODE_LOAD_CONTEXT_PROPERTY, ref, variable);
  };

  Routine.prototype.LOAD_VALUE = function(value, ref) {
    return this.OP(this.OPCODE_LOAD_VALUE, ref, value);
  };

  Routine.prototype.LOAD_LOCAL = function(index, ref) {
    return this.OP(this.OPCODE_LOAD_LOCAL, ref, index);
  };

  Routine.prototype.LOAD_VARIABLE = function(variable, ref) {
    return this.OP(this.OPCODE_LOAD_VARIABLE, ref, variable);
  };

  Routine.prototype.LOAD_LOCAL_OBJECT = function(index, ref) {
    return this.OP(this.OPCODE_LOAD_LOCAL_OBJECT, ref, index);
  };

  Routine.prototype.LOAD_VARIABLE_OBJECT = function(variable, ref) {
    return this.OP(this.OPCODE_LOAD_VARIABLE_OBJECT, ref, variable);
  };

  Routine.prototype.POP = function(ref) {
    return this.OP(this.OPCODE_POP, ref);
  };

  Routine.prototype.LOAD_PROPERTY = function(ref) {
    return this.OP(this.OPCODE_LOAD_PROPERTY, ref);
  };

  Routine.prototype.LOAD_PROPERTY_OBJECT = function(ref) {
    return this.OP(this.OPCODE_LOAD_PROPERTY_OBJECT, ref);
  };

  Routine.prototype.CREATE_OBJECT = function(ref) {
    return this.OP(this.OPCODE_CREATE_OBJECT, ref);
  };

  Routine.prototype.MAKE_OBJECT = function(ref) {
    return this.OP(this.OPCODE_MAKE_OBJECT, ref);
  };

  Routine.prototype.CREATE_ARRAY = function(ref) {
    return this.OP(this.OPCODE_CREATE_ARRAY, ref);
  };

  Routine.prototype.CREATE_CLASS = function(parent_var, ref) {
    return this.OP(this.OPCODE_CREATE_CLASS, ref, parent_var);
  };

  Routine.prototype.UPDATE_CLASS = function(variable, ref) {
    return this.OP(this.OPCODE_UPDATE_CLASS, ref, variable);
  };

  Routine.prototype.NEW_CALL = function(args, ref) {
    return this.OP(this.OPCODE_NEW_CALL, ref, args);
  };

  Routine.prototype.ADD = function(ref) {
    return this.OP(this.OPCODE_ADD, ref);
  };

  Routine.prototype.SUB = function(ref) {
    return this.OP(this.OPCODE_SUB, ref);
  };

  Routine.prototype.MUL = function(ref) {
    return this.OP(this.OPCODE_MUL, ref);
  };

  Routine.prototype.DIV = function(ref) {
    return this.OP(this.OPCODE_DIV, ref);
  };

  Routine.prototype.MODULO = function(ref) {
    return this.OP(this.OPCODE_MODULO, ref);
  };

  Routine.prototype.NEGATE = function(ref) {
    return this.OP(this.OPCODE_NEGATE, ref);
  };

  Routine.prototype.ADD_LOCAL = function(index, ref) {
    return this.OP(this.OPCODE_ADD_LOCAL, ref, index);
  };

  Routine.prototype.SUB_LOCAL = function(index, ref) {
    return this.OP(this.OPCODE_SUB_LOCAL, ref, index);
  };

  Routine.prototype.MUL_LOCAL = function(index, ref) {
    return this.OP(this.OPCODE_MUL_LOCAL, ref, index);
  };

  Routine.prototype.DIV_LOCAL = function(index, ref) {
    return this.OP(this.OPCODE_DIV_LOCAL, ref, index);
  };

  Routine.prototype.ADD_VARIABLE = function(variable, ref) {
    return this.OP(this.OPCODE_ADD_VARIABLE, ref, variable);
  };

  Routine.prototype.SUB_VARIABLE = function(variable, ref) {
    return this.OP(this.OPCODE_SUB_VARIABLE, ref, variable);
  };

  Routine.prototype.MUL_VARIABLE = function(variable, ref) {
    return this.OP(this.OPCODE_MUL_VARIABLE, ref, variable);
  };

  Routine.prototype.DIV_VARIABLE = function(variable, ref) {
    return this.OP(this.OPCODE_DIV_VARIABLE, ref, variable);
  };

  Routine.prototype.ADD_PROPERTY = function(ref) {
    return this.OP(this.OPCODE_ADD_PROPERTY, ref);
  };

  Routine.prototype.SUB_PROPERTY = function(ref) {
    return this.OP(this.OPCODE_SUB_PROPERTY, ref);
  };

  Routine.prototype.MUL_PROPERTY = function(ref) {
    return this.OP(this.OPCODE_MUL_PROPERTY, ref);
  };

  Routine.prototype.DIV_PROPERTY = function(ref) {
    return this.OP(this.OPCODE_DIV_PROPERTY, ref);
  };

  Routine.prototype.EQ = function(ref) {
    return this.OP(this.OPCODE_EQ, ref);
  };

  Routine.prototype.NEQ = function(ref) {
    return this.OP(this.OPCODE_NEQ, ref);
  };

  Routine.prototype.LT = function(ref) {
    return this.OP(this.OPCODE_LT, ref);
  };

  Routine.prototype.GT = function(ref) {
    return this.OP(this.OPCODE_GT, ref);
  };

  Routine.prototype.LTE = function(ref) {
    return this.OP(this.OPCODE_LTE, ref);
  };

  Routine.prototype.GTE = function(ref) {
    return this.OP(this.OPCODE_GTE, ref);
  };

  Routine.prototype.NOT = function(ref) {
    return this.OP(this.OPCODE_NOT, ref);
  };

  Routine.prototype.FORLOOP_INIT = function(iterator, ref) {
    return this.OP(this.OPCODE_FORLOOP_INIT, ref, iterator);
  };

  Routine.prototype.FORLOOP_CONTROL = function(args, ref) {
    return this.OP(this.OPCODE_FORLOOP_CONTROL, ref, args);
  };

  Routine.prototype.FORIN_INIT = function(args, ref) {
    return this.OP(this.OPCODE_FORIN_INIT, ref, args);
  };

  Routine.prototype.FORIN_CONTROL = function(args, ref) {
    return this.OP(this.OPCODE_FORIN_CONTROL, ref, args);
  };

  Routine.prototype.JUMP = function(index, ref) {
    return this.OP(this.OPCODE_JUMP, ref, index);
  };

  Routine.prototype.JUMPY = function(index, ref) {
    return this.OP(this.OPCODE_JUMPY, ref, index);
  };

  Routine.prototype.JUMPN = function(index, ref) {
    return this.OP(this.OPCODE_JUMPN, ref, index);
  };

  Routine.prototype.JUMPY_NOPOP = function(index, ref) {
    return this.OP(this.OPCODE_JUMPY_NOPOP, ref, index);
  };

  Routine.prototype.JUMPN_NOPOP = function(index, ref) {
    return this.OP(this.OPCODE_JUMPN_NOPOP, ref, index);
  };

  Routine.prototype.STORE_LOCAL = function(index, ref) {
    return this.OP(this.OPCODE_STORE_LOCAL, ref, index);
  };

  Routine.prototype.STORE_VARIABLE = function(field, ref) {
    return this.OP(this.OPCODE_STORE_VARIABLE, ref, field);
  };

  Routine.prototype.CREATE_PROPERTY = function(ref) {
    return this.OP(this.OPCODE_CREATE_PROPERTY, ref);
  };

  Routine.prototype.STORE_PROPERTY = function(ref) {
    return this.OP(this.OPCODE_STORE_PROPERTY, ref);
  };

  Routine.prototype.FUNCTION_CALL = function(args, ref) {
    return this.OP(this.OPCODE_FUNCTION_CALL, ref, args);
  };

  Routine.prototype.FUNCTION_APPLY_VARIABLE = function(args, ref) {
    return this.OP(this.OPCODE_FUNCTION_APPLY_VARIABLE, ref, args);
  };

  Routine.prototype.FUNCTION_APPLY_PROPERTY = function(args, ref) {
    return this.OP(this.OPCODE_FUNCTION_APPLY_PROPERTY, ref, args);
  };

  Routine.prototype.SUPER_CALL = function(args, ref) {
    return this.OP(this.OPCODE_SUPER_CALL, ref, args);
  };

  Routine.prototype.RETURN = function(local_offset, ref) {
    return this.OP(this.OPCODE_RETURN, ref, local_offset);
  };

  Routine.prototype.AFTER = function(ref) {
    return this.OP(this.OPCODE_AFTER, ref);
  };

  Routine.prototype.EVERY = function(ref) {
    return this.OP(this.OPCODE_EVERY, ref);
  };

  Routine.prototype.DO = function(ref) {
    return this.OP(this.OPCODE_DO, ref);
  };

  Routine.prototype.SLEEP = function(ref) {
    return this.OP(this.OPCODE_SLEEP, ref);
  };

  Routine.prototype.UNARY_OP = function(f, ref) {
    return this.OP(this.OPCODE_UNARY_OP, ref, f);
  };

  Routine.prototype.BINARY_OP = function(f, ref) {
    return this.OP(this.OPCODE_BINARY_OP, ref, f);
  };

  Routine.prototype.toString = function() {
    var i, j, len, op, ref1, s;
    s = "";
    ref1 = this.opcodes;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      op = ref1[i];
      s += this.table[op];
      if (this.arg1[i] || this.arg2[i]) {
        s += " " + this.arg1[i];
        if (this.arg2[i]) {
          s += ", " + this.arg2[i];
        }
      }
      s += "\n";
    }
    return s;
  };

  return Routine;

})();
