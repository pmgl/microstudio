this.Routine = class Routine {
  constructor(num_args) {
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

  clone() {
    var r;
    r = new Routine(this.num_args);
    r.opcodes = this.opcodes;
    r.arg1 = this.arg1;
    r.ref = this.ref;
    r.locals_size = this.locals_size;
    r.uses_arguments = this.uses_arguments;
    return r;
  }

  createLabel(str = "label") {
    var name;
    return name = ":" + str + "_" + this.label_count++;
  }

  setLabel(name) {
    return this.labels[name] = this.opcodes.length;
  }

  optimize() {
    if (this.transpile) {
      new Transpiler().transpile(this);
    }
  }

  removeable(index) {
    var label, ref1, value;
    ref1 = this.labels;
    for (label in ref1) {
      value = ref1[label];
      if (value === index) {
        return false;
      }
    }
    return true;
  }

  remove(index) {
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
  }

  resolveLabels() {
    var i, j, ref1, ref2, ref3, results;
    results = [];
    for (i = j = 0, ref1 = this.opcodes.length - 1; (0 <= ref1 ? j <= ref1 : j >= ref1); i = 0 <= ref1 ? ++j : --j) {
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
  }

  OP(code, ref, v1 = 0) {
    this.opcodes.push(code);
    this.arg1.push(v1);
    return this.ref.push(ref);
  }

  OP_INSERT(code, ref, v1 = 0, index) {
    var label, ref1, value;
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
  }

  TYPE(ref) {
    return this.OP(OPCODES.TYPE, ref);
  }

  VARIABLE_TYPE(variable, ref) {
    return this.OP(OPCODES.VARIABLE_TYPE, ref, variable);
  }

  PROPERTY_TYPE(ref) {
    return this.OP(OPCODES.PROPERTY_TYPE, ref);
  }

  LOAD_THIS(ref) {
    return this.OP(OPCODES.LOAD_THIS, ref);
  }

  LOAD_GLOBAL(ref) {
    return this.OP(OPCODES.LOAD_GLOBAL, ref);
  }

  LOAD_VALUE(value, ref) {
    return this.OP(OPCODES.LOAD_VALUE, ref, value);
  }

  LOAD_LOCAL(index, ref) {
    return this.OP(OPCODES.LOAD_LOCAL, ref, index);
  }

  LOAD_VARIABLE(variable, ref) {
    return this.OP(OPCODES.LOAD_VARIABLE, ref, variable);
  }

  LOAD_LOCAL_OBJECT(index, ref) {
    return this.OP(OPCODES.LOAD_LOCAL_OBJECT, ref, index);
  }

  LOAD_VARIABLE_OBJECT(variable, ref) {
    return this.OP(OPCODES.LOAD_VARIABLE_OBJECT, ref, variable);
  }

  POP(ref) {
    return this.OP(OPCODES.POP, ref);
  }

  LOAD_PROPERTY(ref) {
    return this.OP(OPCODES.LOAD_PROPERTY, ref);
  }

  LOAD_PROPERTY_OBJECT(ref) {
    return this.OP(OPCODES.LOAD_PROPERTY_OBJECT, ref);
  }

  CREATE_OBJECT(ref) {
    return this.OP(OPCODES.CREATE_OBJECT, ref);
  }

  MAKE_OBJECT(ref) {
    return this.OP(OPCODES.MAKE_OBJECT, ref);
  }

  CREATE_ARRAY(ref) {
    return this.OP(OPCODES.CREATE_ARRAY, ref);
  }

  CREATE_CLASS(parent_var, ref) {
    return this.OP(OPCODES.CREATE_CLASS, ref, parent_var);
  }

  UPDATE_CLASS(variable, ref) {
    return this.OP(OPCODES.UPDATE_CLASS, ref, variable);
  }

  NEW_CALL(args, ref) {
    return this.OP(OPCODES.NEW_CALL, ref, args);
  }

  ADD(ref, self = 0) {
    return this.OP(OPCODES.ADD, ref, self);
  }

  SUB(ref, self = 0) {
    return this.OP(OPCODES.SUB, ref, self);
  }

  MUL(ref) {
    return this.OP(OPCODES.MUL, ref);
  }

  DIV(ref) {
    return this.OP(OPCODES.DIV, ref);
  }

  MODULO(ref) {
    return this.OP(OPCODES.MODULO, ref);
  }

  BINARY_AND(ref) {
    return this.OP(OPCODES.BINARY_AND, ref);
  }

  BINARY_OR(ref) {
    return this.OP(OPCODES.BINARY_OR, ref);
  }

  SHIFT_LEFT(ref) {
    return this.OP(OPCODES.SHIFT_LEFT, ref);
  }

  SHIFT_RIGHT(ref) {
    return this.OP(OPCODES.SHIFT_RIGHT, ref);
  }

  NEGATE(ref) {
    return this.OP(OPCODES.NEGATE, ref);
  }

  LOAD_PROPERTY_ATOP(ref) {
    return this.OP(OPCODES.LOAD_PROPERTY_ATOP, ref);
  }

  EQ(ref) {
    return this.OP(OPCODES.EQ, ref);
  }

  NEQ(ref) {
    return this.OP(OPCODES.NEQ, ref);
  }

  LT(ref) {
    return this.OP(OPCODES.LT, ref);
  }

  GT(ref) {
    return this.OP(OPCODES.GT, ref);
  }

  LTE(ref) {
    return this.OP(OPCODES.LTE, ref);
  }

  GTE(ref) {
    return this.OP(OPCODES.GTE, ref);
  }

  NOT(ref) {
    return this.OP(OPCODES.NOT, ref);
  }

  FORLOOP_INIT(iterator, ref) {
    return this.OP(OPCODES.FORLOOP_INIT, ref, iterator);
  }

  FORLOOP_CONTROL(args, ref) {
    return this.OP(OPCODES.FORLOOP_CONTROL, ref, args);
  }

  FORIN_INIT(args, ref) {
    return this.OP(OPCODES.FORIN_INIT, ref, args);
  }

  FORIN_CONTROL(args, ref) {
    return this.OP(OPCODES.FORIN_CONTROL, ref, args);
  }

  JUMP(index, ref) {
    return this.OP(OPCODES.JUMP, ref, index);
  }

  JUMPY(index, ref) {
    return this.OP(OPCODES.JUMPY, ref, index);
  }

  JUMPN(index, ref) {
    return this.OP(OPCODES.JUMPN, ref, index);
  }

  JUMPY_NOPOP(index, ref) {
    return this.OP(OPCODES.JUMPY_NOPOP, ref, index);
  }

  JUMPN_NOPOP(index, ref) {
    return this.OP(OPCODES.JUMPN_NOPOP, ref, index);
  }

  STORE_LOCAL(index, ref) {
    return this.OP(OPCODES.STORE_LOCAL, ref, index);
  }

  STORE_VARIABLE(field, ref) {
    return this.OP(OPCODES.STORE_VARIABLE, ref, field);
  }

  CREATE_PROPERTY(ref) {
    return this.OP(OPCODES.CREATE_PROPERTY, ref);
  }

  STORE_PROPERTY(ref) {
    return this.OP(OPCODES.STORE_PROPERTY, ref);
  }

  LOAD_ROUTINE(value, ref) {
    return this.OP(OPCODES.LOAD_ROUTINE, ref, value);
  }

  FUNCTION_CALL(args, ref) {
    return this.OP(OPCODES.FUNCTION_CALL, ref, args);
  }

  FUNCTION_APPLY_VARIABLE(args, ref) {
    return this.OP(OPCODES.FUNCTION_APPLY_VARIABLE, ref, args);
  }

  FUNCTION_APPLY_PROPERTY(args, ref) {
    return this.OP(OPCODES.FUNCTION_APPLY_PROPERTY, ref, args);
  }

  SUPER_CALL(args, ref) {
    return this.OP(OPCODES.SUPER_CALL, ref, args);
  }

  RETURN(ref) {
    return this.OP(OPCODES.RETURN, ref);
  }

  AFTER(ref) {
    return this.OP(OPCODES.AFTER, ref);
  }

  EVERY(ref) {
    return this.OP(OPCODES.EVERY, ref);
  }

  DO(ref) {
    return this.OP(OPCODES.DO, ref);
  }

  SLEEP(ref) {
    return this.OP(OPCODES.SLEEP, ref);
  }

  DELETE(ref) {
    return this.OP(OPCODES.DELETE, ref);
  }

  UNARY_OP(f, ref) {
    return this.OP(OPCODES.UNARY_OP, ref, f);
  }

  BINARY_OP(f, ref) {
    return this.OP(OPCODES.BINARY_OP, ref, f);
  }

  toString() {
    var i, j, len, op, ref1, s;
    s = "";
    ref1 = this.opcodes;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      op = ref1[i];
      s += OPCODES[op];
      if (this.arg1[i] != null) {
        //if typeof @arg1[i] != "function"
        s += ` ${this.arg1[i]}`;
      }
      s += "\n";
    }
    return s;
  }

};

this.OPCODES_CLASS = class OPCODES_CLASS {
  constructor() {
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
    this.set("DELETE", 26);
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

  set(op, code) {
    this[op] = code;
    return this[code] = op;
  }

};

this.OPCODES = new this.OPCODES_CLASS;
