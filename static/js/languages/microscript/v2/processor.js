this.Processor = (function() {
  function Processor(runner) {
    this.runner = runner;
    this.locals = [];
    this.stack = [];
    this.call_stack = [];
    this.log = false;
    this.time_limit = 2e308;
    this.done = true;
  }

  Processor.prototype.load = function(routine1) {
    this.routine = routine1;
    return this.resetState();
  };

  Processor.prototype.resetState = function() {
    this.local_index = 0;
    this.stack_index = -1;
    this.op_index = 0;
    this.call_stack_index = 0;
    this.global = null;
    this.object = null;
    this.locals_offset = 0;
    this.call_super = null;
    this.call_supername = "";
    return this.done = false;
  };

  Processor.prototype.resolveParentClass = function(obj, global) {
    if ((obj["class"] != null) && typeof obj["class"] === "string") {
      if (global[obj["class"]] != null) {
        obj["class"] = global[obj["class"]];
        return this.resolveParentClass(obj["class"], global);
      }
    } else if (obj["class"] != null) {
      return this.resolveParentClass(obj["class"], global);
    }
  };

  Processor.prototype.applyFunction = function(args) {};

  Processor.prototype.run = function(context) {
    var a, arg1, args, argv, b, c, call_stack, call_stack_index, call_super, call_supername, con, cs, f, field, global, i, id, index, iter, iterator, j, k, key, l, length, local_index, locals, locals_offset, loop_by, loop_to, m, n, name, o, obj, object, op_count, op_index, opcodes, p, parent, q, r, ref, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, res, restore_op_index, routine, sleep_time, src, stack, stack_index, sup, t, token, v, v1, v2, value;
    routine = this.routine;
    opcodes = this.routine.opcodes;
    arg1 = this.routine.arg1;
    length = opcodes.length;
    op_index = this.op_index;
    stack = this.stack;
    stack_index = this.stack_index;
    locals = this.locals;
    local_index = this.local_index;
    global = this.global || context.global;
    object = this.object || global;
    call_stack = this.call_stack;
    call_stack_index = this.call_stack_index;
    call_super = this.call_super || global;
    call_supername = this.call_supername || "";
    locals_offset = this.locals_offset;
    op_count = 0;
    restore_op_index = -1;
    while (op_index < length) {
      switch (opcodes[op_index]) {
        case 5:
          stack[++stack_index] = object;
          op_index++;
          break;
        case 6:
          stack[++stack_index] = global;
          op_index++;
          break;
        case 8:
          name = arg1[op_index];
          v = object[name];
          obj = object;
          while ((v == null) && (obj["class"] != null)) {
            obj = obj["class"];
            v = obj[name];
          }
          if (v != null) {
            stack[++stack_index] = object;
            stack[++stack_index] = v;
          } else {
            v = global[name];
            if (v == null) {
              v = 0;
            }
            stack[++stack_index] = global;
            stack[++stack_index] = v;
          }
          op_index++;
          break;
        case 9:
          obj = stack[stack_index - 1];
          v = obj[stack[stack_index]];
          stack[stack_index] = v != null ? v : 0;
          op_index++;
          break;
        case 10:
          stack[++stack_index] = arg1[op_index++];
          break;
        case 11:
          stack[++stack_index] = locals[locals_offset + arg1[op_index++]];
          break;
        case 12:
          name = arg1[op_index];
          v = object[name];
          if ((v == null) && (object["class"] != null)) {
            obj = object;
            while ((v == null) && (obj["class"] != null)) {
              obj = obj["class"];
              v = obj[v];
            }
          }
          if (v == null) {
            v = global[name];
          }
          if (v == null) {
            token = routine.ref[op_index].token;
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
          stack[++stack_index] = v != null ? v : 0;
          op_index++;
          break;
        case 13:
          o = locals[locals_offset + arg1[op_index]];
          if (typeof o !== "object") {
            o = locals[locals_offset + arg1[op_index]] = {};
            token = routine.ref[op_index].token;
            id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
            if (!context.warnings.assigning_field_to_undefined[id]) {
              context.warnings.assigning_field_to_undefined[id] = {
                file: token.tokenizer.filename,
                line: token.line,
                column: token.column,
                expression: token.value
              };
            }
          }
          stack[++stack_index] = o;
          op_index++;
          break;
        case 14:
          v = object[arg1[op_index]];
          if (typeof v !== "object") {
            v = object[arg1[op_index]] = {};
            token = routine.ref[op_index].token;
            id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
            if (!context.warnings.assigning_field_to_undefined[id]) {
              context.warnings.assigning_field_to_undefined[id] = {
                file: token.tokenizer.filename,
                line: token.line,
                column: token.column,
                expression: arg1[op_index]
              };
            }
          }
          stack[++stack_index] = v;
          op_index++;
          break;
        case 15:
          stack_index--;
          op_index++;
          break;
        case 16:
          obj = stack[stack_index - 1];
          name = stack[stack_index];
          v = obj[name];
          while ((v == null) && (obj["class"] != null)) {
            obj = obj["class"];
            v = obj[name];
          }
          stack[--stack_index] = v != null ? v : 0;
          op_index++;
          break;
        case 17:
          v = stack[stack_index - 1][stack[stack_index]];
          if (typeof v !== "object") {
            v = stack[stack_index - 1][stack[stack_index]] = {};
            token = routine.ref[op_index].token;
            id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
            if (!context.warnings.assigning_field_to_undefined[id]) {
              context.warnings.assigning_field_to_undefined[id] = {
                file: token.tokenizer.filename,
                line: token.line,
                column: token.column,
                expression: stack[stack_index]
              };
            }
          }
          stack[--stack_index] = v;
          op_index++;
          break;
        case 18:
          stack[++stack_index] = {};
          op_index++;
          break;
        case 19:
          if (typeof stack[stack_index] !== "object") {
            stack[stack_index] = {};
          }
          op_index++;
          break;
        case 20:
          stack[++stack_index] = [];
          op_index++;
          break;
        case 21:
          locals[locals_offset + arg1[op_index]] = stack[stack_index];
          op_index++;
          break;
        case 22:
          locals[locals_offset + arg1[op_index]] = stack[stack_index--];
          op_index++;
          break;
        case 23:
          object[arg1[op_index++]] = stack[stack_index];
          break;
        case 24:
          obj = stack[stack_index - 2];
          field = stack[stack_index - 1];
          obj[field] = stack[stack_index];
          stack_index -= 2;
          op_index++;
          break;
        case 25:
          obj = stack[stack_index - 2];
          field = stack[stack_index - 1];
          stack[stack_index - 2] = obj[field] = stack[stack_index];
          stack_index -= 2;
          op_index++;
          break;
        case 27:
          name = arg1[op_index];
          if (object[name] != null) {
            obj = object[name];
            src = stack[stack_index];
            for (key in src) {
              value = src[key];
              obj[key] = value;
            }
          } else {
            object[name] = stack[stack_index];
          }
          op_index++;
          break;
        case 28:
          res = {};
          parent = stack[stack_index];
          if (parent) {
            res["class"] = parent;
          } else if (arg1[op_index]) {
            res["class"] = arg1[op_index];
          }
          stack[stack_index] = res;
          op_index++;
          break;
        case 29:
          c = stack[stack_index];
          args = arg1[op_index];
          if (typeof c === "function") {
            a = [];
            for (i = j = 0, ref = args - 1; j <= ref; i = j += 1) {
              a.push(stack[stack_index - args + i]);
            }
            stack_index -= args;
            stack[stack_index - 1] = new c(...a);
          } else {
            this.resolveParentClass(c, global);
            res = {
              "class": c
            };
            con = c.constructor;
            while (!con && (c["class"] != null)) {
              c = c["class"];
              con = c.constructor;
            }
            if ((con != null) && con instanceof Routine) {
              stack[stack_index - args - 1] = res;
              stack_index--;
              cs = call_stack[call_stack_index] || (call_stack[call_stack_index] = {});
              call_stack_index++;
              cs.routine = routine;
              cs.object = object;
              cs["super"] = call_super;
              cs.supername = call_supername;
              cs.op_index = op_index + 1;
              locals_offset += routine.locals_size;
              routine = con;
              opcodes = con.opcodes;
              arg1 = con.arg1;
              op_index = 0;
              length = opcodes.length;
              object = res;
              call_super = c;
              call_supername = "constructor";
              if (args < con.num_args) {
                for (i = k = ref1 = args + 1, ref2 = con.num_args; k <= ref2; i = k += 1) {
                  stack[++stack_index] = 0;
                }
              } else if (args > con.num_args) {
                stack_index -= args - con.num_args;
              }
            } else {
              stack_index -= args;
              stack[stack_index] = res;
              op_index++;
            }
          }
          break;
        case 30:
          b = stack[stack_index--];
          a = stack[stack_index];
          if (typeof a === "number" && typeof b === "number") {
            if (isFinite(a + b)) {
              stack[stack_index] = a + b;
            } else {
              stack[stack_index] = 0;
            }
          } else if (Array.isArray(a)) {
            if (Array.isArray(b)) {
              stack[stack_index] = a.concat(b);
            } else {
              a.push(b);
              stack[stack_index] = a;
            }
          } else if (typeof a === "string" || typeof b === "string") {
            stack[stack_index] = a + b;
          } else {
            stack[++stack_index] = a;
            stack[++stack_index] = "+";
            this.applyFunction(2);
          }
          op_index++;
          break;
        case 31:
          stack[stack_index - 1] -= stack[stack_index--];
          op_index++;
          break;
        case 32:
          stack[stack_index - 1] *= stack[stack_index--];
          op_index++;
          break;
        case 33:
          stack[stack_index - 1] /= stack[stack_index--];
          op_index++;
          break;
        case 34:
          stack[stack_index - 1] %= stack[stack_index--];
          op_index++;
          break;
        case 39:
          stack[stack_index] = -stack[stack_index];
          op_index++;
          break;
        case 50:
          stack[stack_index] = stack[stack_index] === 0 ? 1 : 0;
          op_index++;
          break;
        case 60:
          stack[stack_index] = locals[locals_offset + arg1[op_index]] += stack[stack_index];
          op_index++;
          break;
        case 61:
          stack[stack_index] = locals[locals_offset + arg1[op_index]] -= stack[stack_index];
          op_index++;
          break;
        case 64:
          v1 = object[arg1[op_index]];
          if (v1 == null) {
            v1 = 0;
          }
          v2 = stack[stack_index];
          if (typeof v1 === "number" && typeof v2 === "number") {
            v1 += v2;
            stack[stack_index] = object[arg1[op_index]] = isFinite(v1) ? v1 : 0;
          }
          op_index++;
          break;
        case 65:
          v1 = object[arg1[op_index]];
          if (v1 == null) {
            v1 = 0;
          }
          v2 = stack[stack_index];
          if (typeof v1 === "number" && typeof v2 === "number") {
            v1 -= v2;
            stack[stack_index] = object[arg1[op_index]] = isFinite(v1) ? v1 : 0;
          }
          op_index++;
          break;
        case 68:
          obj = stack[stack_index - 2];
          field = stack[stack_index - 1];
          v1 = obj[field];
          v2 = stack[stack_index];
          if (v1 == null) {
            v1 = 0;
          }
          if (typeof v1 === "number" && typeof v2 === "number") {
            v1 += v2;
            stack[stack_index - 2] = obj[field] = isFinite(v1) ? v1 : 0;
          }
          stack_index -= 2;
          op_index++;
          break;
        case 69:
          obj = stack[stack_index - 2];
          field = stack[stack_index - 1];
          v1 = obj[field];
          v2 = stack[stack_index];
          if (v1 == null) {
            v1 = 0;
          }
          if (typeof v1 === "number" && typeof v2 === "number") {
            v1 -= v2;
            stack[stack_index - 2] = obj[field] = isFinite(v1) ? v1 : 0;
          }
          stack_index -= 2;
          op_index++;
          break;
        case 70:
          obj = stack[stack_index - 2];
          field = stack[stack_index - 1];
          v1 = obj[field];
          v2 = stack[stack_index];
          if (v1 == null) {
            v1 = 0;
          }
          if (typeof v1 === "number" && typeof v2 === "number") {
            v1 *= v2;
            stack[stack_index - 2] = obj[field] = isFinite(v1) ? v1 : 0;
          }
          stack_index -= 2;
          op_index++;
          break;
        case 71:
          obj = stack[stack_index - 2];
          field = stack[stack_index - 1];
          v1 = obj[field];
          v2 = stack[stack_index];
          if (v1 == null) {
            v1 = 0;
          }
          if (typeof v1 === "number" && typeof v2 === "number") {
            v1 /= v2;
            stack[stack_index - 2] = obj[field] = isFinite(v1) ? v1 : 0;
          }
          stack_index -= 2;
          op_index++;
          break;
        case 40:
          stack[stack_index - 1] = stack[stack_index] === stack[stack_index - 1] ? 1 : 0;
          stack_index--;
          op_index++;
          break;
        case 41:
          stack[stack_index - 1] = stack[stack_index] !== stack[stack_index - 1] ? 1 : 0;
          stack_index--;
          op_index++;
          break;
        case 42:
          stack[stack_index - 1] = stack[stack_index - 1] < stack[stack_index] ? 1 : 0;
          stack_index--;
          op_index++;
          break;
        case 43:
          stack[stack_index - 1] = stack[stack_index - 1] > stack[stack_index] ? 1 : 0;
          stack_index--;
          op_index++;
          break;
        case 44:
          stack[stack_index - 1] = stack[stack_index - 1] <= stack[stack_index] ? 1 : 0;
          stack_index--;
          op_index++;
          break;
        case 45:
          stack[stack_index - 1] = stack[stack_index - 1] >= stack[stack_index] ? 1 : 0;
          stack_index--;
          op_index++;
          break;
        case 95:
          iter = arg1[op_index][0];
          loop_to = locals[locals_offset + iter + 1] = stack[stack_index - 1];
          loop_by = stack[stack_index];
          iterator = locals[locals_offset + iter];
          stack[--stack_index] = 0;
          if (loop_by === 0) {
            locals[locals_offset + iter + 2] = loop_to > iterator ? 1 : -1;
            op_index++;
          } else {
            locals[locals_offset + iter + 2] = loop_by;
            if ((loop_by > 0 && iterator > loop_to) || (loop_by < 0 && iterator < loop_to)) {
              op_index = arg1[op_index][1];
            } else {
              op_index++;
            }
          }
          break;
        case 96:
          iter = arg1[op_index][0];
          loop_by = locals[locals_offset + iter + 2];
          loop_to = locals[locals_offset + iter + 1];
          iterator = locals[locals_offset + iter];
          iterator += loop_by;
          if ((loop_by > 0 && iterator > loop_to) || (loop_by < 0 && iterator < loop_to)) {
            op_index++;
          } else {
            locals[locals_offset + iter] = iterator;
            op_index = arg1[op_index][1];
          }
          if (op_count++ > 100) {
            op_count = 0;
            if (Date.now() > this.time_limit) {
              restore_op_index = op_index;
              op_index = length;
            }
          }
          break;
        case 97:
          v = stack[stack_index];
          stack[stack_index] = 0;
          iterator = arg1[op_index][0];
          if (typeof v === "object") {
            if (Array.isArray(v)) {
              locals[locals_offset + iterator + 1] = v;
            } else {
              v = locals[locals_offset + iterator + 1] = Object.keys(v);
            }
          } else if (typeof v === "string") {
            v = locals[locals_offset + iterator + 1] = v.split("");
          } else {
            v = locals[locals_offset + iterator + 1] = [v];
          }
          if (v.length === 0) {
            op_index = arg1[op_index][1];
          } else {
            locals[locals_offset + arg1[op_index][0]] = v[0];
            locals[locals_offset + iterator + 2] = 0;
            op_index++;
          }
          break;
        case 98:
          iterator = arg1[op_index][0];
          index = locals[locals_offset + iterator + 2] += 1;
          v = locals[locals_offset + iterator + 1];
          if (index < v.length) {
            locals[locals_offset + iterator] = v[index];
            op_index = arg1[op_index][1];
          } else {
            op_index++;
          }
          if (op_count++ > 100) {
            op_count = 0;
            if (Date.now() > this.time_limit) {
              restore_op_index = op_index;
              op_index = length;
            }
          }
          break;
        case 80:
          op_index = arg1[op_index];
          if (op_count++ > 100) {
            op_count = 0;
            if (Date.now() > this.time_limit) {
              restore_op_index = op_index;
              op_index = length;
            }
          }
          break;
        case 81:
          if (stack[stack_index--]) {
            op_index = arg1[op_index];
          } else {
            op_index++;
          }
          break;
        case 82:
          if (!stack[stack_index--]) {
            op_index = arg1[op_index];
          } else {
            op_index++;
          }
          break;
        case 83:
          if (stack[stack_index]) {
            op_index = arg1[op_index];
          } else {
            op_index++;
          }
          break;
        case 84:
          if (!stack[stack_index]) {
            op_index = arg1[op_index];
          } else {
            op_index++;
          }
          break;
        case 90:
          args = arg1[op_index];
          f = stack[stack_index];
          if (f instanceof Routine) {
            stack_index--;
            cs = call_stack[call_stack_index] || (call_stack[call_stack_index] = {});
            call_stack_index++;
            cs.routine = routine;
            cs.object = object;
            cs["super"] = call_super;
            cs.supername = call_supername;
            cs.op_index = op_index + 1;
            locals_offset += routine.locals_size;
            routine = f;
            opcodes = f.opcodes;
            arg1 = f.arg1;
            op_index = 0;
            length = opcodes.length;
            object = global;
            call_super = global;
            call_supername = "";
            if (args < f.num_args) {
              for (i = l = ref3 = args + 1, ref4 = f.num_args; l <= ref4; i = l += 1) {
                stack[++stack_index] = 0;
              }
            } else if (args > f.num_args) {
              stack_index -= args - f.num_args;
            }
          } else if (typeof f === "function") {
            switch (args) {
              case 0:
                v = f();
                stack[stack_index] = v != null ? v : 0;
                break;
              case 1:
                v = f(stack[stack_index - 1]);
                stack[stack_index - 1] = v != null ? v : 0;
                stack_index -= 1;
                break;
              default:
                throw "Error, " + f + " arg count not supported, please finish the job";
            }
            op_index++;
          } else {
            stack_index -= args;
            stack[stack_index] = f != null ? f : 0;
            token = routine.ref[op_index].token;
            id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
            if (!context.warnings.invoking_non_function[id]) {
              context.warnings.invoking_non_function[id] = {
                file: token.tokenizer.filename,
                line: token.line,
                column: token.column,
                expression: ""
              };
            }
            op_index++;
          }
          break;
        case 91:
          name = stack[stack_index];
          sup = obj = object;
          f = obj[name];
          if (f == null) {
            while ((f == null) && (sup["class"] != null)) {
              sup = sup["class"];
              f = sup[name];
            }
            if (f == null) {
              f = global[name];
              sup = global;
              obj = global;
            }
          }
          args = arg1[op_index];
          if (f instanceof Routine) {
            stack_index -= 1;
            cs = call_stack[call_stack_index] || (call_stack[call_stack_index] = {});
            call_stack_index++;
            cs.routine = routine;
            cs.object = object;
            cs["super"] = call_super;
            cs.supername = call_supername;
            cs.op_index = op_index + 1;
            locals_offset += routine.locals_size;
            routine = f;
            opcodes = f.opcodes;
            arg1 = f.arg1;
            op_index = 0;
            length = opcodes.length;
            object = obj;
            call_super = sup;
            call_supername = name;
            if (args < f.num_args) {
              for (i = m = ref5 = args + 1, ref6 = f.num_args; m <= ref6; i = m += 1) {
                stack[++stack_index] = 0;
              }
            } else if (args > f.num_args) {
              stack_index -= args - f.num_args;
            }
          } else if (typeof f === "function") {
            switch (args) {
              case 0:
                v = f.call(obj);
                stack[stack_index] = v != null ? v : 0;
                break;
              case 1:
                v = f.call(obj, stack[stack_index - 1]);
                stack[--stack_index] = v != null ? v : 0;
                break;
              default:
                argv = [];
                stack_index -= args;
                for (i = n = 0, ref7 = args - 1; n <= ref7; i = n += 1) {
                  argv[i] = stack[stack_index + i];
                }
                v = f.apply(obj, argv);
                stack[stack_index] = v != null ? v : 0;
            }
            op_index++;
          } else {
            stack_index -= args;
            stack[stack_index] = f != null ? f : 0;
            token = routine.ref[op_index].token;
            id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
            if (!context.warnings.invoking_non_function[id]) {
              context.warnings.invoking_non_function[id] = {
                file: token.tokenizer.filename,
                line: token.line,
                column: token.column,
                expression: ""
              };
            }
            op_index++;
          }
          break;
        case 92:
          obj = stack[stack_index - 1];
          sup = obj;
          name = stack[stack_index];
          f = obj[name];
          while ((f == null) && (sup["class"] != null)) {
            sup = sup["class"];
            f = sup[name];
          }
          args = arg1[op_index];
          if (f instanceof Routine) {
            stack_index -= 2;
            cs = call_stack[call_stack_index] || (call_stack[call_stack_index] = {});
            call_stack_index++;
            cs.object = object;
            cs["super"] = call_super;
            cs.supername = call_supername;
            cs.routine = routine;
            cs.op_index = op_index + 1;
            locals_offset += routine.locals_size;
            routine = f;
            opcodes = f.opcodes;
            arg1 = f.arg1;
            op_index = 0;
            length = opcodes.length;
            object = obj;
            call_super = sup;
            call_supername = name;
            if (args < f.num_args) {
              for (i = p = ref8 = args + 1, ref9 = f.num_args; p <= ref9; i = p += 1) {
                stack[++stack_index] = 0;
              }
            } else if (args > f.num_args) {
              stack_index -= args - f.num_args;
            }
          } else if (typeof f === "function") {
            switch (args) {
              case 0:
                v = f.call(obj);
                stack[--stack_index] = v != null ? v : 0;
                break;
              case 1:
                v = f.call(obj, stack[stack_index - 2]);
                stack[stack_index - 2] = v != null ? v : 0;
                stack_index -= 2;
                break;
              default:
                argv = [];
                stack_index -= args + 1;
                for (i = q = 0, ref10 = args - 1; q <= ref10; i = q += 1) {
                  argv[i] = stack[stack_index + i];
                }
                v = f.apply(obj, argv);
                stack[stack_index] = v != null ? v : 0;
            }
            op_index++;
          } else {
            stack_index -= args + 1;
            stack[stack_index] = f != null ? f : 0;
            token = routine.ref[op_index].token;
            id = token.tokenizer.filename + "-" + token.line + "-" + token.column;
            if (!context.warnings.invoking_non_function[id]) {
              context.warnings.invoking_non_function[id] = {
                file: token.tokenizer.filename,
                line: token.line,
                column: token.column,
                expression: ""
              };
            }
            op_index++;
          }
          break;
        case 93:
          if ((call_super != null) && (call_supername != null)) {
            sup = call_super;
            f = null;
            while ((f == null) && (sup["class"] != null)) {
              sup = sup["class"];
              f = sup[call_supername];
            }
            if ((f != null) && f instanceof Routine) {
              args = arg1[op_index];
              cs = call_stack[call_stack_index] || (call_stack[call_stack_index] = {});
              call_stack_index++;
              cs.object = object;
              cs["super"] = call_super;
              cs.supername = call_supername;
              cs.routine = routine;
              cs.op_index = op_index + 1;
              locals_offset += routine.locals_size;
              routine = f;
              opcodes = f.opcodes;
              arg1 = f.arg1;
              op_index = 0;
              length = opcodes.length;
              call_super = sup;
              if (args < f.num_args) {
                for (i = r = ref11 = args + 1, ref12 = f.num_args; r <= ref12; i = r += 1) {
                  stack[++stack_index] = 0;
                }
              } else if (args > f.num_args) {
                stack_index -= args - f.num_args;
              }
            }
          }
          break;
        case 94:
          local_index -= arg1[op_index];
          if (call_stack_index <= 0) {
            op_index = length;
          } else {
            cs = call_stack[--call_stack_index];
            object = cs.object;
            call_super = cs["super"];
            call_supername = cs.supername;
            routine = cs.routine;
            op_index = cs.op_index;
            opcodes = routine.opcodes;
            arg1 = routine.arg1;
            locals_offset -= routine.locals_size;
            length = opcodes.length;
          }
          break;
        case 100:
          v = arg1[op_index](stack[stack_index]);
          stack[stack_index] = isFinite(v) ? v : 0;
          op_index++;
          break;
        case 101:
          v = arg1[op_index](stack[stack_index - 1], stack[stack_index]);
          stack[--stack_index] = isFinite(v) ? v : 0;
          op_index++;
          break;
        case 110:
          t = this.runner.createThread(stack[stack_index - 1], stack[stack_index], false);
          stack[--stack_index] = t;
          op_index += 1;
          break;
        case 111:
          t = this.runner.createThread(stack[stack_index - 1], stack[stack_index], true);
          stack[--stack_index] = t;
          op_index += 1;
          break;
        case 112:
          t = this.runner.createThread(stack[stack_index], 0, false);
          stack[stack_index] = t;
          op_index += 1;
          break;
        case 113:
          sleep_time = isFinite(stack[stack_index]) ? stack[stack_index] : 0;
          this.runner.sleep(sleep_time);
          op_index += 1;
          restore_op_index = op_index;
          op_index = length;
          break;
        case 200:
          stack_index = arg1[op_index](stack, stack_index, locals, locals_offset, object);
          op_index++;
          break;
        default:
          throw "Unsupported operation: " + opcodes[op_index];
      }
    }
    if (restore_op_index >= 0) {
      this.op_index = restore_op_index;
      this.routine = routine;
      this.stack_index = stack_index;
      this.local_index = local_index;
      this.object = object;
      this.call_stack_index = call_stack_index;
      this.call_super = call_super;
      this.call_supername = call_supername;
      this.locals_offset = locals_offset;
      this.done = false;
    } else {
      this.op_index = 0;
      this.done = true;
      if (this.routine.callback != null) {
        this.routine.callback(stack[stack_index]);
        this.routine.callback = null;
      }
    }
    if (this.log) {
      console.info("total operations: " + op_count);
      console.info("stack_index: " + stack_index);
      console.info("result: " + stack[stack_index]);
    }
    return stack[stack_index];
  };

  return Processor;

})();
