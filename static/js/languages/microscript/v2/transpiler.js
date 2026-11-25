var E, H, Transpiler, TranspilerSegment, compareOp, numericOp, shiftOp, typeName;

Transpiler = (function() {
  class Transpiler {
    constructor() {}

    transpile(r) {
      var i, j;
      i = 0;
      while (i < r.opcodes.length) {
        if (this.transpilable(r.opcodes[i], r.arg1[i])) {
          j = i + 1;
          while (j < r.opcodes.length && r.removeable(j) && this.transpilable(r.opcodes[j], r.arg1[j])) {
            j += 1;
          }
          j -= 1;
          if (j - i + 1 >= Transpiler.MIN_SEGMENT) {
            this.transpileSegment(r, i, j);
          }
        }
        i += 1;
      }
    }

    transpilable(opcode, arg) {
      return TranspilerSegment.emitters[OPCODES[opcode]] != null;
    }

    transpileSegment(r, i, j) {
      var err, f, k, l, ref1, ref2, segment;
      segment = new TranspilerSegment(r, i, j);
      try {
        f = segment.build();
      } catch (error) {
        err = error;
        console.error("Transpiler: segment build failed");
        console.error(err);
        return;
      }
      if (Transpiler.debug) {
        console.info(segment.source);
      }
      Transpiler.stats.segments += 1;
      Transpiler.stats.ops += j - i + 1;
      r.opcodes[i] = OPCODES.COMPILED;
      r.arg1[i] = f;
      for (k = l = ref1 = i + 1, ref2 = j; l <= ref2; k = l += 1) {
        r.remove(i + 1);
      }
    }

  };

  Transpiler.MIN_SEGMENT = 2;

  Transpiler.debug = false;

  Transpiler.stats = {
    segments: 0,
    ops: 0
  };

  return Transpiler;

}).call(this);

TranspilerSegment = (function() {
  class TranspilerSegment {
    constructor(routine, start, end) {
      this.routine = routine;
      this.start = start;
      this.end = end;
      this.code = [];
      this.vcount = 0;
      this.sym = [];
      this.floor = 0;
      this.origin = {};
      this.local_cache = {};
      this.consts = [];
      this.refs = [];
      this.numeric = {};
    }

    build() {
      var delta, e, factory, idx, k, l, len, m, name, offset, ref1, ref2, ref3;
      for (k = l = ref1 = this.start, ref2 = this.end; l <= ref2; k = l += 1) {
        this.k = k - this.start;
        this.refs.push(this.routine.ref[k]);
        name = OPCODES[this.routine.opcodes[k]];
        this.code.push(`// ${name}`);
        TranspilerSegment.emitters[name].call(this, this.routine.arg1[k]);
      }
      ref3 = this.sym;
      for (idx = m = 0, len = ref3.length; m < len; idx = ++m) {
        e = ref3[idx];
        offset = idx - this.floor + 1;
        if ((this.origin[e] != null) && this.origin[e] === offset) {
          continue;
        }
        this.code.push(`${this.slot(offset)} = ${e} ;`);
      }
      delta = this.sym.length - this.floor;
      if (delta !== 0) {
        this.code.push(`return stack_index+(${delta}) ;`);
      } else {
        this.code.push("return stack_index ;");
      }
      this.source = `return function compiled_segment(stack,stack_index,locals,locals_offset,object,global,context,processor,routine) {\n${this.code.join("\n")}\n} ;`;
      factory = new Function("H", "A", "R", this.source);
      return factory(Transpiler.helpers, this.consts, this.refs);
    }

    slot(offset) {
      if (offset === 0) {
        return "stack[stack_index]";
      } else if (offset < 0) {
        return `stack[stack_index-${-offset}]`;
      } else {
        return `stack[stack_index+${offset}]`;
      }
    }

    temp(expr) {
      var v;
      v = `v${this.vcount++}`;
      this.code.push(`let ${v} = ${expr} ;`);
      return v;
    }

    emit(line) {
      return this.code.push(line);
    }

    push(e) {
      return this.sym.push(e);
    }

    pop() {
      var offset, v;
      if (this.sym.length > 0) {
        return this.sym.pop();
      } else {
        offset = -this.floor;
        this.floor += 1;
        v = this.temp(this.slot(offset));
        this.origin[v] = offset;
        return v;
      }
    }

    drop() {
      if (this.sym.length > 0) {
        this.sym.pop();
      } else {
        this.floor += 1;
      }
    }

    ref() {
      return `R[${this.k}]`;
    }

    constant(value) {
      var e;
      if (typeof value === "number") {
        if (Object.is(value, -0)) {
          return "(-0)";
        } else if (Number.isFinite(value)) {
          e = value < 0 ? `(${value})` : `${value}`;
          this.numeric[e] = true;
          return e;
        } else {
          return this.constRef(value);
        }
      } else if (typeof value === "string") {
        return JSON.stringify(value);
      } else {
        return this.constRef(value);
      }
    }

    constRef(value) {
      this.consts.push(value);
      return `A[${this.consts.length - 1}]`;
    }

    localSlot(index) {
      return `locals[locals_offset+${index}]`;
    }

    isNum(e) {
      return this.numeric[e] === true;
    }

    pushNum(e) {
      this.numeric[e] = true;
      return this.push(e);
    }

  };

  TranspilerSegment.emitters = {
    LOAD_VALUE: function(arg) {
      return this.push(this.constant(arg));
    },
    LOAD_THIS: function() {
      return this.push("object");
    },
    LOAD_GLOBAL: function() {
      return this.push("global");
    },
    LOAD_IMPORT: function(arg) {
      return this.push(this.temp(`routine.import_values[${arg}]`));
    },
    LOAD_LOCAL: function(arg) {
      var v;
      if (this.local_cache[arg] != null) {
        return this.push(this.local_cache[arg]);
      } else {
        v = this.temp(this.localSlot(arg));
        this.local_cache[arg] = v;
        return this.push(v);
      }
    },
    STORE_LOCAL: function(arg) {
      var v;
      v = this.pop();
      this.emit(`${this.localSlot(arg)} = ${v} ;`);
      this.local_cache[arg] = v;
      return this.push(v);
    },
    POP: function() {
      return this.drop();
    }
  };

  return TranspilerSegment;

}).call(this);

Transpiler.helpers = {};

E = TranspilerSegment.emitters;

TranspilerSegment.prototype.result = function() {
  return `v${this.vcount++}`;
};

E.ADD = function(arg) {
  var a, b, r;
  b = this.pop();
  a = this.pop();
  r = this.result();
  if (this.isNum(a)) {
    if (this.isNum(b)) {
      this.emit(`let ${r} = ${a} + ${b} ; if (!isFinite(${r})) ${r} = 0 ;`);
      return this.pushNum(r);
    } else {
      this.emit(`let ${r} = ${a} + ${b} ; if (!(isFinite(${r}) || typeof ${b} == "string")) ${r} = 0 ;`);
      return this.push(r);
    }
  }
  this.emit(`let ${r} ; if (typeof ${a} == "number") { ${r} = ${a} + ${b} ; if (!(isFinite(${r}) || typeof ${b} == "string")) ${r} = 0 ; } else ${r} = processor.add(context,${a},${b},${this.constant(arg)}) ;`);
  return this.push(r);
};

E.SUB = function(arg) {
  var a, b, r;
  b = this.pop();
  a = this.pop();
  r = this.result();
  if (this.isNum(a)) {
    this.emit(`let ${r} = ${a} - ${b} ; if (!isFinite(${r})) ${r} = 0 ;`);
    return this.pushNum(r);
  }
  this.emit(`let ${r} ; if (typeof ${a} == "number") { ${r} = ${a} - ${b} ; if (!isFinite(${r})) ${r} = 0 ; } else ${r} = processor.sub(context,${a},${b},${this.constant(arg)}) ;`);
  return this.push(r);
};

numericOp = function(op, slow) {
  return function(arg) {
    var a, b, r;
    b = this.pop();
    a = this.pop();
    r = this.result();
    if (this.isNum(a)) {
      this.emit(`let ${r} = ${a} ${op} ${b} ; if (!isFinite(${r})) ${r} = 0 ;`);
      return this.pushNum(r);
    }
    this.emit(`let ${r} ; if (typeof ${a} == "number") { ${r} = ${a} ${op} ${b} ; if (!isFinite(${r})) ${r} = 0 ; } else ${r} = processor.${slow}(context,${a},${b}) ;`);
    return this.push(r);
  };
};

E.MUL = numericOp("*", "mul");

E.DIV = numericOp("/", "div");

E.BINARY_AND = numericOp("&", "band");

E.BINARY_OR = numericOp("|", "bor");

E.MODULO = function() {
  var a, b, r;
  b = this.pop();
  a = this.pop();
  r = this.result();
  if (this.isNum(a) && this.isNum(b)) {
    this.emit(`let ${r} = ${a} % ${b} ; if (!isFinite(${r})) ${r} = 0 ;`);
    return this.pushNum(r);
  }
  this.emit(`let ${r} ; if (typeof ${a} == "number" && typeof ${b} == "number") { ${r} = ${a} % ${b} ; if (!isFinite(${r})) ${r} = 0 ; } else ${r} = processor.modulo(context,${a},${b}) ;`);
  return this.push(r);
};

shiftOp = function(op) {
  return function() {
    var a, b;
    b = this.pop();
    a = this.pop();
    return this.pushNum(this.temp(`${a} ${op} ${b}`));
  };
};

E.SHIFT_LEFT = shiftOp("<<");

E.SHIFT_RIGHT = shiftOp(">>");

E.NEGATE = function() {
  var a, r;
  a = this.pop();
  r = this.result();
  if (this.isNum(a)) {
    this.emit(`let ${r} = -${a} ;`);
    return this.pushNum(r);
  }
  this.emit(`let ${r} ; if (typeof ${a} == "number") ${r} = -${a} ; else ${r} = processor.negate(context,${a}) ;`);
  return this.push(r);
};

E.EQ = function() {
  var a, b;
  b = this.pop();
  a = this.pop();
  return this.pushNum(this.temp(`(${b} === ${a}) ? 1 : 0`));
};

E.NEQ = function() {
  var a, b;
  b = this.pop();
  a = this.pop();
  return this.pushNum(this.temp(`(${b} !== ${a}) ? 1 : 0`));
};

compareOp = function(op) {
  return function() {
    var a, b;
    b = this.pop();
    a = this.pop();
    return this.pushNum(this.temp(`(${a} ${op} ${b}) ? 1 : 0`));
  };
};

E.LT = compareOp("<");

E.GT = compareOp(">");

E.LTE = compareOp("<=");

E.GTE = compareOp(">=");

E.NOT = function() {
  var a;
  a = this.pop();
  return this.pushNum(this.temp(`${a} ? 0 : 1`));
};

H = Transpiler.helpers;

H.loadVariable = function(object, global, name, ref, context) {
  var id, obj, token, v;
  v = object[name];
  if ((v == null) && (object.class != null)) {
    obj = object;
    while ((v == null) && (obj.class != null)) {
      obj = obj.class;
      v = obj[name];
    }
  }
  if (v == null) {
    v = global[name];
  }
  if ((v == null) && !ref.nowarning) {
    token = ref.token;
    id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
    if (!context.warnings.using_undefined_variable[id]) {
      context.warnings.using_undefined_variable[id] = {
        file: token.tokenizer.filename,
        line: token.line,
        column: token.column,
        expression: name
      };
    }
  }
  if (v != null) {
    return v;
  } else {
    return 0;
  }
};

H.loadLocalObject = function(locals, index, ref, context) {
  var id, o, token;
  o = locals[index] = {};
  token = ref.token;
  id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
  if (!context.warnings.assigning_field_to_undefined[id]) {
    context.warnings.assigning_field_to_undefined[id] = {
      file: token.tokenizer.filename,
      line: token.line,
      column: token.column,
      expression: token.value
    };
  }
  return o;
};

H.loadVariableObject = function(object, global, name, ref, context) {
  var id, obj, token, v;
  obj = object;
  v = obj[name];
  while ((v == null) && (obj.class != null)) {
    obj = obj.class;
    v = obj[name];
  }
  if ((v == null) && (global[name] != null)) {
    obj = global;
    v = global[name];
  }
  if ((v == null) || typeof v !== "object") {
    v = obj[name] = {};
    token = ref.token;
    id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
    if (!context.warnings.assigning_field_to_undefined[id]) {
      context.warnings.assigning_field_to_undefined[id] = {
        file: token.tokenizer.filename,
        line: token.line,
        column: token.column,
        expression: name
      };
    }
  }
  return v;
};

H.loadProperty = function(obj, name, ref, context) {
  var id, token, v;
  v = obj[name];
  while ((v == null) && (obj.class != null)) {
    obj = obj.class;
    v = obj[name];
  }
  if (v == null) {
    v = 0;
    if (!ref.nowarning) {
      ref.nowarning = true;
      if (!Array.isArray(obj)) {
        token = ref.token;
        id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
        context.warnings.using_undefined_variable[id] = {
          file: token.tokenizer.filename,
          line: token.line,
          column: token.column,
          expression: name
        };
      }
    }
  }
  return v;
};

H.loadPropertyObject = function(obj, name, ref, context) {
  var id, token, v;
  v = obj[name] = {};
  token = ref.token;
  id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
  if (!context.warnings.assigning_field_to_undefined[id]) {
    context.warnings.assigning_field_to_undefined[id] = {
      file: token.tokenizer.filename,
      line: token.line,
      column: token.column,
      expression: name
    };
  }
  return v;
};

E.LOAD_VARIABLE = function(arg) {
  var name, v;
  name = this.constant(arg);
  v = this.temp(`object[${name}]`);
  this.emit(`if (${v} == null) ${v} = H.loadVariable(object,global,${name},${this.ref()},context) ;`);
  return this.push(v);
};

E.STORE_VARIABLE = function(arg) {
  var v;
  v = this.pop();
  this.emit(`object[${this.constant(arg)}] = ${v} ;`);
  return this.push(v);
};

E.LOAD_VARIABLE_OBJECT = function(arg) {
  var name, v;
  name = this.constant(arg);
  v = this.temp(`object[${name}]`);
  this.emit(`if (${v} == null || typeof ${v} != "object") ${v} = H.loadVariableObject(object,global,${name},${this.ref()},context) ;`);
  return this.push(v);
};

E.LOAD_LOCAL_OBJECT = function(arg) {
  var source, v;
  source = this.local_cache[arg] != null ? this.local_cache[arg] : this.localSlot(arg);
  v = this.temp(source);
  this.emit(`if (typeof ${v} != "object") ${v} = H.loadLocalObject(locals,locals_offset+${arg},${this.ref()},context) ;`);
  this.local_cache[arg] = v;
  return this.push(v);
};

E.LOAD_PROPERTY = function() {
  var name, obj, v;
  name = this.pop();
  obj = this.pop();
  v = this.temp(`${obj}[${name}]`);
  this.emit(`if (${v} == null) ${v} = H.loadProperty(${obj},${name},${this.ref()},context) ;`);
  return this.push(v);
};

E.LOAD_PROPERTY_ATOP = function() {
  var name, obj, v;
  name = this.pop();
  obj = this.pop();
  v = this.temp(`${obj}[${name}]`);
  this.emit(`if (${v} == null) ${v} = H.loadProperty(${obj},${name},${this.ref()},context) ;`);
  this.push(obj);
  this.push(name);
  return this.push(v);
};

E.LOAD_PROPERTY_OBJECT = function() {
  var name, obj, v;
  name = this.pop();
  obj = this.pop();
  v = this.temp(`${obj}[${name}]`);
  this.emit(`if (typeof ${v} != "object") ${v} = H.loadPropertyObject(${obj},${name},${this.ref()},context) ;`);
  return this.push(v);
};

E.STORE_PROPERTY = function() {
  var name, obj, v;
  v = this.pop();
  name = this.pop();
  obj = this.pop();
  this.emit(`${obj}[${name}] = ${v} ;`);
  return this.push(v);
};

H.type = function(v) {
  switch (typeof v) {
    case "number":
      return "number";
    case "string":
      return "string";
    case "function":
      return "function";
    case "object":
      if (Array.isArray(v)) {
        return "list";
      } else if (v instanceof Routine) {
        return "function";
      } else {
        return "object";
      }
      break;
    default:
      return v;
  }
};

typeName = function(v) {
  switch (typeof v) {
    case "number":
      return "number";
    case "string":
      return "string";
    case "function":
      return "function";
    default:
      if (Array.isArray(v)) {
        return "list";
      } else if (v instanceof Routine) {
        return "function";
      } else {
        return "object";
      }
  }
};

H.variableType = function(object, global, name) {
  var v;
  v = object[name];
  if (v == null) {
    v = global[name];
  }
  if (v == null) {
    return 0;
  } else {
    return typeName(v);
  }
};

H.propertyType = function(obj, name) {
  var v;
  v = obj[name];
  if (v == null) {
    return 0;
  } else {
    return typeName(v);
  }
};

H.updateClass = function(object, name, src) {
  var key, obj, value;
  if ((object[name] != null) && typeof object[name] === "object") {
    obj = object[name];
    for (key in src) {
      value = src[key];
      obj[key] = value;
    }
  } else {
    object[name] = src;
  }
};

E.CREATE_OBJECT = function() {
  return this.push(this.temp("{}"));
};

E.CREATE_ARRAY = function() {
  return this.push(this.temp("[]"));
};

E.MAKE_OBJECT = function() {
  var a, v;
  a = this.pop();
  v = this.temp(a);
  this.emit(`if (typeof ${v} != "object") ${v} = {} ;`);
  return this.push(v);
};

E.CREATE_PROPERTY = function() {
  var name, obj, v;
  v = this.pop();
  name = this.pop();
  obj = this.pop();
  this.emit(`${obj}[${name}] = ${v} ;`);
  return this.push(obj);
};

E.DELETE = function() {
  var name, obj;
  name = this.pop();
  obj = this.pop();
  this.emit(`delete ${obj}[${name}] ;`);
  return this.push("0");
};

E.TYPE = function() {
  var a;
  a = this.pop();
  return this.push(this.temp(`H.type(${a})`));
};

E.VARIABLE_TYPE = function(arg) {
  return this.push(this.temp(`H.variableType(object,global,${this.constant(arg)})`));
};

E.PROPERTY_TYPE = function() {
  var name, obj;
  name = this.pop();
  obj = this.pop();
  return this.push(this.temp(`H.propertyType(${obj},${name})`));
};

E.UNARY_OP = function(arg) {
  var a, f, v;
  a = this.pop();
  f = this.constRef(arg);
  v = this.temp(`${f}(${a})`);
  this.emit(`if (!isFinite(${v})) ${v} = 0 ;`);
  return this.pushNum(v);
};

E.BINARY_OP = function(arg) {
  var a, b, f, v;
  b = this.pop();
  a = this.pop();
  f = this.constRef(arg);
  v = this.temp(`${f}(${a},${b})`);
  this.emit(`if (!isFinite(${v})) ${v} = 0 ;`);
  return this.pushNum(v);
};

E.CREATE_CLASS = function(arg) {
  var parent, v;
  parent = this.pop();
  v = this.temp("{}");
  if (arg) {
    this.emit(`if (${parent}) ${v}.class = ${parent} ; else ${v}.class = ${this.constant(arg)} ;`);
  } else {
    this.emit(`if (${parent}) ${v}.class = ${parent} ;`);
  }
  return this.push(v);
};

E.UPDATE_CLASS = function(arg) {
  var v;
  v = this.pop();
  this.emit(`H.updateClass(object,${this.constant(arg)},${v}) ;`);
  return this.push(v);
};

H.loadRoutine = function(r, locals, locals_offset, object) {
  var ir, l, len, rc, ref1;
  rc = r.clone();
  ref1 = r.import_refs;
  for (l = 0, len = ref1.length; l < len; l++) {
    ir = ref1[l];
    if (ir === r.import_self) {
      rc.import_values.push(rc);
    } else {
      rc.import_values.push(locals[locals_offset + ir]);
    }
  }
  rc.object = object;
  return rc;
};

E.LOAD_ROUTINE = function(arg) {
  return this.push(this.temp(`H.loadRoutine(${this.constRef(arg)},locals,locals_offset,object)`));
};
