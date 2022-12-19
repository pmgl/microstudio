var Compiler, LocalLayer;

Compiler = (function() {
  class Compiler {
    constructor(program) {
      var i, j, len, ref, s;
      this.program = program;
      this.code_saves = [];
      this.code = "";
      this.code = [this.code];
      this.routine = new Routine();
      this.locals = new Locals(this);
      this.count = 0;
      ref = this.program.statements;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        s = ref[i];
        this.compile(s);
        if (i < this.program.statements.length - 1) {
          this.routine.POP(s);
        }
      }
      this.routine.optimize();
      this.routine.resolveLabels();
      this.count += this.routine.opcodes.length;
      this.routine.locals_size = this.locals.max_index;
    }

    // console.info(@routine.toString())
    // console.info("total length: "+@count)
    compile(statement) {
      if (statement instanceof Program.Value) {
        return this.compileValue(statement);
      } else if (statement instanceof Program.Operation) {
        return this.compileOperation(statement);
      } else if (statement instanceof Program.Assignment) {
        return this.compileAssignment(statement);
      } else if (statement instanceof Program.Variable) {
        return this.compileVariable(statement);
      } else if (statement instanceof Program.Function) {
        return this.compileFunction(statement);
      } else if (statement instanceof Program.FunctionCall) {
        return this.compileFunctionCall(statement);
      } else if (statement instanceof Program.While) {
        return this.compileWhile(statement);
      }
      if (statement instanceof Program.SelfAssignment) {
        return this.compileSelfAssignment(statement);
      } else if (statement instanceof Program.Braced) {
        return this.compileBraced(statement);
      } else if (statement instanceof Program.CreateObject) {
        return this.compileCreateObject(statement);
      } else if (statement instanceof Program.Field) {
        return this.compileField(statement);
      } else if (statement instanceof Program.Negate) {
        return this.compileNegate(statement);
      } else if (statement instanceof Program.For) {
        return this.compileFor(statement);
      } else if (statement instanceof Program.ForIn) {
        return this.compileForIn(statement);
      } else if (statement instanceof Program.Not) {
        return this.compileNot(statement);
      } else if (statement instanceof Program.Return) {
        return this.compileReturn(statement);
      } else if (statement instanceof Program.Condition) {
        return this.compileCondition(statement);
      } else if (statement instanceof Program.Break) {
        return this.compileBreak(statement);
      } else if (statement instanceof Program.Continue) {
        return this.compileContinue(statement);
      } else if (statement instanceof Program.CreateClass) {
        return this.compileCreateClass(statement);
      } else if (statement instanceof Program.NewCall) {
        return this.compileNewCall(statement);
      } else if (statement instanceof Program.After) {
        return this.compileAfter(statement);
      } else if (statement instanceof Program.Every) {
        return this.compileEvery(statement);
      } else if (statement instanceof Program.Do) {
        return this.compileDo(statement);
      } else if (statement instanceof Program.Sleep) {
        return this.compileSleep(statement);
      } else if (statement instanceof Program.Delete) {
        return this.compileDelete(statement);
      } else if (true) {
        console.info(statement);
        throw "Not implemented";
      }
    }

    compileAssignment(statement) {
      var arg_index, f, i, index, j, ref;
      if (statement.local) {
        if (statement.field instanceof Program.Variable) {
          if (statement.expression instanceof Program.Function) {
            index = this.locals.register(statement.field.identifier); //# register function locally first
            this.compile(statement.expression); //# then compile function which may refer to itself
            this.routine.arg1[this.routine.arg1.length - 1].import_self = index;
            return this.routine.STORE_LOCAL(index, statement);
          } else if (statement.expression instanceof Program.After || statement.expression instanceof Program.Do || statement.expression instanceof Program.Every) {
            index = this.locals.register(statement.field.identifier); //# register thread locally first
            arg_index = this.routine.arg1.length; //# thread main routine will land here
            this.compile(statement.expression); //# then compile function which may refer to itself
            this.routine.arg1[arg_index].import_self = index;
            return this.routine.STORE_LOCAL(index, statement);
          } else {
            this.compile(statement.expression); //# first compile expression which may refer to another local with same name
            index = this.locals.register(statement.field.identifier); //# then register a local for that name
            return this.routine.STORE_LOCAL(index, statement);
          }
        } else {
          throw "illegal";
        }
      } else {
        if (statement.field instanceof Program.Variable) {
          if (this.locals.get(statement.field.identifier) != null) {
            this.compile(statement.expression);
            index = this.locals.get(statement.field.identifier);
            this.routine.STORE_LOCAL(index, statement);
          } else if (statement.expression instanceof Program.CreateClass) {
            return this.compileUpdateClass(statement.expression, statement.field.identifier);
          } else {
            this.compile(statement.expression);
            this.routine.STORE_VARIABLE(statement.field.identifier, statement);
          }
        } else {
          f = statement.field;
          if (f.expression instanceof Program.Variable) {
            if (f.expression.identifier === "this") {
              this.routine.LOAD_THIS(f);
            } else if (this.locals.get(f.expression.identifier) != null) {
              index = this.locals.get(f.expression.identifier);
              this.routine.LOAD_LOCAL_OBJECT(index, f.expression);
            } else if (f.expression.identifier === "global") {
              this.routine.LOAD_GLOBAL(f);
            } else {
              this.routine.LOAD_VARIABLE_OBJECT(f.expression.identifier, statement);
            }
          } else {
            this.compile(f.expression);
            this.routine.MAKE_OBJECT(statement);
          }
          for (i = j = 0, ref = f.chain.length - 2; j <= ref; i = j += 1) {
            this.compile(f.chain[i]);
            this.routine.LOAD_PROPERTY_OBJECT(f.chain[i]);
          }
          this.compile(f.chain[f.chain.length - 1]);
          this.compile(statement.expression);
          return this.routine.STORE_PROPERTY(statement);
        }
      }
    }

    compileSelfAssignment(statement) {
      var c, f, i, index, j, op, ref;
      switch (statement.operation) {
        case Token.TYPE_PLUS_EQUALS:
          op = "ADD";
          break;
        case Token.TYPE_MINUS_EQUALS:
          op = "SUB";
          break;
        case Token.TYPE_MULTIPLY_EQUALS:
          op = "MUL";
          break;
        case Token.TYPE_DIVIDE_EQUALS:
          op = "DIV";
          break;
        case Token.TYPE_MODULO_EQUALS:
          op = "MODULO";
          break;
        case Token.TYPE_AND_EQUALS:
          op = "BINARY_AND";
          break;
        case Token.TYPE_OR_EQUALS:
          op = "BINARY_OR";
      }
      if (statement.field instanceof Program.Variable) {
        if (this.locals.get(statement.field.identifier) != null) {
          index = this.locals.get(statement.field.identifier);
          this.routine.LOAD_LOCAL(index, statement);
          this.compile(statement.expression);
          this.routine[op](statement, 1);
          this.routine.STORE_LOCAL(index, statement);
        } else {
          this.routine.LOAD_VARIABLE(statement.field.identifier, statement);
          this.compile(statement.expression);
          this.routine[op](statement, 1);
          this.routine.STORE_VARIABLE(statement.field.identifier, statement);
        }
      } else {
        f = statement.field;
        if (f.expression instanceof Program.Variable) {
          if (f.expression.identifier === "this") {
            this.routine.LOAD_THIS(f);
          } else if (this.locals.get(f.expression.identifier) != null) {
            index = this.locals.get(f.expression.identifier);
            this.routine.LOAD_LOCAL_OBJECT(index, statement);
          } else if (f.expression.identifier === "global") {
            this.routine.LOAD_GLOBAL(f);
          } else {
            this.routine.LOAD_VARIABLE_OBJECT(f.expression.identifier, statement);
          }
        } else {
          this.compile(f.expression);
          this.routine.MAKE_OBJECT(statement);
        }
        for (i = j = 0, ref = f.chain.length - 2; j <= ref; i = j += 1) {
          this.compile(f.chain[i]);
          this.routine.LOAD_PROPERTY_OBJECT(f.chain[i]);
        }
        c = f.chain[f.chain.length - 1];
        this.compile(f.chain[f.chain.length - 1]);
        this.routine.LOAD_PROPERTY_ATOP(statement);
        this.compile(statement.expression);
        this.routine[op](statement, 1);
        return this.routine.STORE_PROPERTY(statement);
      }
    }

    compileOperation(op) {
      var jump, ref, ref1;
      if ((ref = op.operation) === "+" || ref === "-" || ref === "*" || ref === "/" || ref === "%" || ref === "&" || ref === "|" || ref === "<<" || ref === ">>") {
        this.compile(op.term1);
        this.compile(op.term2);
        switch (op.operation) {
          case "+":
            this.routine.ADD(op);
            break;
          case "-":
            this.routine.SUB(op);
            break;
          case "*":
            this.routine.MUL(op);
            break;
          case "/":
            this.routine.DIV(op);
            break;
          case "%":
            this.routine.MODULO(op);
            break;
          case "&":
            this.routine.BINARY_AND(op);
            break;
          case "|":
            this.routine.BINARY_OR(op);
            break;
          case "<<":
            this.routine.SHIFT_LEFT(op);
            break;
          case ">>":
            this.routine.SHIFT_RIGHT(op);
        }
      } else if ((ref1 = op.operation) === "==" || ref1 === "!=" || ref1 === "<" || ref1 === ">" || ref1 === "<=" || ref1 === ">=") {
        this.compile(op.term1);
        this.compile(op.term2);
        switch (op.operation) {
          case "==":
            this.routine.EQ(op);
            break;
          case "!=":
            this.routine.NEQ(op);
            break;
          case "<":
            this.routine.LT(op);
            break;
          case ">":
            this.routine.GT(op);
            break;
          case "<=":
            this.routine.LTE(op);
            break;
          case ">=":
            this.routine.GTE(op);
        }
      } else if (op.operation === "and") {
        jump = this.routine.createLabel("and");
        this.compile(op.term1);
        this.routine.JUMPN_NOPOP(jump, op);
        this.routine.POP(op);
        this.compile(op.term2);
        return this.routine.setLabel(jump);
      } else if (op.operation === "or") {
        jump = this.routine.createLabel("or");
        this.compile(op.term1);
        this.routine.JUMPY_NOPOP(jump, op);
        this.routine.POP(op);
        this.compile(op.term2);
        return this.routine.setLabel(jump);
      } else if (op.operation === "^") {
        this.compile(op.term1);
        this.compile(op.term2);
        return this.routine.BINARY_OP(Compiler.predefined_binary_functions.pow, op);
      } else {
        return "";
      }
    }

    compileBraced(expression) {
      this.compile(expression.expression);
    }

    compileNegate(expression) {
      if (expression.expression instanceof Program.Value && expression.expression.type === Program.Value.TYPE_NUMBER) {
        return this.routine.LOAD_VALUE(-expression.expression.value, expression);
      } else {
        this.compile(expression.expression);
        return this.routine.NEGATE(expression);
      }
    }

    compileNot(expression) {
      this.compile(expression.expression);
      return this.routine.NOT(expression);
    }

    compileValue(value) {
      var i, j, ref;
      switch (value.type) {
        case Program.Value.TYPE_NUMBER:
          this.routine.LOAD_VALUE(value.value, value);
          break;
        case Program.Value.TYPE_STRING:
          this.routine.LOAD_VALUE(value.value, value);
          break;
        case Program.Value.TYPE_ARRAY:
          this.routine.CREATE_ARRAY(value);
          for (i = j = 0, ref = value.value.length - 1; j <= ref; i = j += 1) {
            this.routine.LOAD_VALUE(i, value);
            this.compile(value.value[i]);
            this.routine.CREATE_PROPERTY(value);
          }
      }
    }

    compileVariable(variable) {
      var index, v;
      v = variable.identifier;
      if (v === "this") {
        return this.routine.LOAD_THIS(variable);
      } else if (v === "global") {
        return this.routine.LOAD_GLOBAL(variable);
      } else if (Compiler.predefined_values[v] != null) {
        return this.routine.LOAD_VALUE(Compiler.predefined_values[v], variable);
      } else if (this.locals.get(v) != null) {
        index = this.locals.get(v);
        return this.routine.LOAD_LOCAL(index, variable);
      } else {
        return this.routine.LOAD_VARIABLE(v, variable);
      }
    }

    compileField(field) {
      var c, i, id, index, j, k, len, ref, ref1;
      c = field.chain[field.chain.length - 1];
      if (c instanceof Program.Value && c.value === "type") {
        if (field.chain.length === 1) {
          if (field.expression instanceof Program.Variable) { // variable.type
            id = field.expression.identifier;
            if (this.locals.get(id) != null) {
              index = this.locals.get(id);
              this.routine.LOAD_LOCAL(index, field);
              this.routine.TYPE(field);
            } else if (Compiler.predefined_values[id] != null) {
              this.routine.LOAD_VALUE("number", field);
            } else if ((Compiler.predefined_unary_functions[id] != null) || Compiler.predefined_binary_functions[id]) {
              this.routine.LOAD_VALUE("function", field);
            } else {
              this.routine.VARIABLE_TYPE(id, field.expression);
            }
          } else {
            this.compile(field.expression);
            this.routine.TYPE(field);
          }
        } else {
          this.compile(field.expression);
          for (i = j = 0, ref = field.chain.length - 3; j <= ref; i = j += 1) {
            this.compile(field.chain[i]);
            this.routine.LOAD_PROPERTY(field);
          }
          this.compile(field.chain[field.chain.length - 2]);
          this.routine.PROPERTY_TYPE(field.expression);
        }
      } else {
        this.compile(field.expression);
        ref1 = field.chain;
        for (k = 0, len = ref1.length; k < len; k++) {
          c = ref1[k];
          this.compile(c);
          this.routine.LOAD_PROPERTY(field);
        }
      }
    }

    compileFieldParent(field) {
      var c, i, j, ref;
      this.compile(field.expression);
      for (i = j = 0, ref = field.chain.length - 2; j <= ref; i = j += 1) {
        c = field.chain[i];
        this.compile(c);
        this.routine.LOAD_PROPERTY(field);
      }
    }

    compileFunctionCall(call) {
      var a, funk, i, index, j, k, l, len, len1, len2, len3, len4, m, n, ref, ref1, ref2, ref3, ref4;
      if (call.expression instanceof Program.Field) {
        ref = call.args;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          a = ref[i];
          this.compile(a);
        }
        this.compileFieldParent(call.expression);
        this.compile(call.expression.chain[call.expression.chain.length - 1]);
        return this.routine.FUNCTION_APPLY_PROPERTY(call.args.length, call);
      } else if (call.expression instanceof Program.Variable) {
        if (Compiler.predefined_unary_functions[call.expression.identifier] != null) {
          funk = Compiler.predefined_unary_functions[call.expression.identifier];
          if (call.args.length > 0) {
            this.compile(call.args[0]);
          } else {
            this.routine.LOAD_VALUE(0, call);
          }
          return this.routine.UNARY_OP(funk, call);
        } else if (Compiler.predefined_binary_functions[call.expression.identifier] != null) {
          funk = Compiler.predefined_binary_functions[call.expression.identifier];
          if (call.args.length > 0) {
            this.compile(call.args[0]);
          } else {
            this.routine.LOAD_VALUE(0, call);
          }
          if (call.args.length > 1) {
            this.compile(call.args[1]);
          } else {
            this.routine.LOAD_VALUE(0, call);
          }
          return this.routine.BINARY_OP(funk, call);
        } else if (call.expression.identifier === "super") {
          ref1 = call.args;
          for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
            a = ref1[i];
            this.compile(a);
          }
          return this.routine.SUPER_CALL(call.args.length, call);
        } else if (this.locals.get(call.expression.identifier) != null) {
          ref2 = call.args;
          for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
            a = ref2[i];
            this.compile(a);
          }
          index = this.locals.get(call.expression.identifier);
          this.routine.LOAD_LOCAL(index, call);
          return this.routine.FUNCTION_CALL(call.args.length, call);
        } else {
          ref3 = call.args;
          for (i = m = 0, len3 = ref3.length; m < len3; i = ++m) {
            a = ref3[i];
            this.compile(a);
          }
          this.routine.LOAD_VALUE(call.expression.identifier, call);
          return this.routine.FUNCTION_APPLY_VARIABLE(call.args.length, call);
        }
      } else {
        ref4 = call.args;
        for (n = 0, len4 = ref4.length; n < len4; n++) {
          a = ref4[n];
          this.compile(a);
        }
        this.compile(call.expression);
        return this.routine.FUNCTION_CALL(call.args.length, call);
      }
    }

    compileFor(forloop) {
      var for_continue, for_end, for_start, iterator, save_break, save_continue;
      iterator = this.locals.register(forloop.iterator);
      this.locals.allocate(); // range_to
      this.locals.allocate(); // step
      this.compile(forloop.range_from);
      this.routine.STORE_LOCAL(iterator, forloop);
      this.routine.POP(forloop);
      this.compile(forloop.range_to);
      if (forloop.range_by !== 0) {
        this.compile(forloop.range_by);
      } else {
        this.routine.LOAD_VALUE(0, forloop);
      }
      for_start = this.routine.createLabel("for_start");
      for_continue = this.routine.createLabel("for_continue");
      for_end = this.routine.createLabel("for_end");
      this.routine.FORLOOP_INIT([iterator, for_end], forloop);
      this.routine.setLabel(for_start);
      this.locals.push();
      save_break = this.break_label;
      save_continue = this.continue_label;
      this.break_label = for_end;
      this.continue_label = for_continue;
      this.compileSequence(forloop.sequence);
      this.break_label = save_break;
      this.continue_label = save_continue;
      this.routine.setLabel(for_continue);
      this.routine.FORLOOP_CONTROL([iterator, for_start], forloop);
      this.routine.setLabel(for_end);
      return this.locals.pop();
    }

    compileForIn(forloop) {
      var for_continue, for_end, for_start, iterator, save_break, save_continue;
      iterator = this.locals.register(forloop.iterator);
      this.locals.allocate(); // array
      this.locals.allocate(); // index
      this.compile(forloop.list);
      for_start = this.routine.createLabel("for_start");
      for_continue = this.routine.createLabel("for_continue");
      for_end = this.routine.createLabel("for_end");
      this.routine.FORIN_INIT([iterator, for_end], forloop);
      this.routine.setLabel(for_start);
      this.locals.push();
      save_break = this.break_label;
      save_continue = this.continue_label;
      this.break_label = for_end;
      this.continue_label = for_continue;
      this.compileSequence(forloop.sequence);
      this.break_label = save_break;
      this.continue_label = save_continue;
      this.routine.setLabel(for_continue);
      this.routine.FORIN_CONTROL([iterator, for_start], forloop);
      this.routine.setLabel(for_end);
      return this.locals.pop();
    }

    compileSequence(sequence) {
      var i, j, ref;
      for (i = j = 0, ref = sequence.length - 1; j <= ref; i = j += 1) {
        if (!sequence[i].nopop) {
          this.routine.POP(sequence[i]);
        }
        this.compile(sequence[i]);
      }
    }

    compileWhile(whiloop) {
      var end, save_break, save_continue, start;
      this.locals.push();
      start = this.routine.createLabel("while_start");
      end = this.routine.createLabel("while_end");
      this.routine.LOAD_VALUE(0, whiloop);
      this.routine.setLabel(start);
      this.compile(whiloop.condition);
      this.routine.JUMPN(end);
      save_break = this.break_label;
      save_continue = this.continue_label;
      this.break_label = end;
      this.continue_label = start;
      this.compileSequence(whiloop.sequence);
      this.routine.JUMP(start, whiloop);
      this.break_label = save_break;
      this.continue_label = save_continue;
      this.routine.setLabel(end);
      return this.locals.pop();
    }

    compileBreak(statement) {
      if (this.break_label != null) {
        return this.routine.JUMP(this.break_label);
      }
    }

    compileContinue(statement) {
      if (this.continue_label != null) {
        return this.routine.JUMP(this.continue_label);
      }
    }

    compileFunction(func) {
      var r;
      r = this.compileFunctionBody(func);
      return this.routine.LOAD_ROUTINE(r, func);
    }

    compileFunctionBody(func) {
      var a, args, i, index, j, k, l, label, len, local_index, locals, m, numargs, r, ref, ref1, ref2, ref3, routine;
      routine = this.routine;
      locals = this.locals;
      this.routine = new Routine(func.args != null ? func.args.length : 0);
      this.locals = new Locals(this, locals);
      local_index = this.locals.index;
      this.routine.uses_arguments = true;
      if (func.args != null) {
        if (this.routine.uses_arguments) {
          args = this.locals.register("arguments");
          this.routine.STORE_LOCAL(args, func);
          this.routine.POP(func);
        }
        numargs = this.locals.register("+numargs");
        this.routine.STORE_LOCAL(numargs, func);
        this.routine.POP(func);
        for (i = j = ref = func.args.length - 1; j >= 0; i = j += -1) {
          a = func.args[i];
          index = this.locals.register(a.name);
          this.routine.STORE_LOCAL(index, func);
          this.routine.POP(func);
        }
        for (i = k = 0, ref1 = func.args.length - 1; k <= ref1; i = k += 1) {
          a = func.args[i];
          if (a.default != null) {
            index = this.locals.get(a.name);
            label = this.routine.createLabel("default_arg");
            this.routine.LOAD_VALUE(i, func);
            this.routine.LOAD_LOCAL(numargs, func);
            this.routine.LT(func);
            this.routine.JUMPY(label, func);
            this.compile(a.default);
            this.routine.STORE_LOCAL(index, func);
            this.routine.POP(func);
            this.routine.setLabel(label);
          }
        }
      }
      if (func.sequence.length > 0) {
        for (i = l = 0, ref2 = func.sequence.length - 1; l <= ref2; i = l += 1) {
          this.compile(func.sequence[i]);
          if (i < func.sequence.length - 1) {
            this.routine.POP(func.sequence[i]);
          } else {
            this.routine.RETURN(func.sequence[i]);
          }
        }
      } else {
        this.routine.LOAD_VALUE(0, func);
        this.routine.RETURN(func);
      }
      if ((func.args != null) && !this.locals.arguments_used) {
        this.routine.uses_arguments = false;
        this.routine.remove(0);
        this.routine.remove(0);
      }
      index = 0;
      ref3 = this.locals.imports;
      for (m = 0, len = ref3.length; m < len; m++) {
        i = ref3[m];
        this.routine.OP_INSERT(OPCODES.LOAD_IMPORT, func, index, index * 3);
        this.routine.OP_INSERT(OPCODES.STORE_LOCAL, func, i.index, index * 3 + 1);
        this.routine.OP_INSERT(OPCODES.POP, func, 0, index * 3 + 2);
        this.routine.import_refs.push(i.source);
        index += 1;
      }
      this.routine.optimize();
      this.routine.resolveLabels();
      this.count += this.routine.opcodes.length;
      r = this.routine;
      // console.info r.toString()
      this.routine.locals_size = this.locals.max_index;
      this.routine = routine;
      this.locals = locals;
      return r;
    }

    compileReturn(ret) {
      if (ret.expression != null) {
        this.compile(ret.expression);
        return this.routine.RETURN(ret);
      } else {
        this.routine.LOAD_VALUE(0, ret);
        return this.routine.RETURN(ret);
      }
    }

    compileCondition(condition) {
      var c, chain, condition_end, condition_next, i, j, ref;
      chain = condition.chain;
      this.routine.LOAD_VALUE(0, condition);
      condition_end = this.routine.createLabel("condition_end");
      for (i = j = 0, ref = chain.length - 1; j <= ref; i = j += 1) {
        condition_next = this.routine.createLabel("condition_next");
        c = chain[i];
        this.compile(c.condition);
        this.routine.JUMPN(condition_next);
        this.locals.push();
        this.compileSequence(c.sequence);
        this.locals.pop();
        this.routine.JUMP(condition_end, condition);
        this.routine.setLabel(condition_next);
        if (i === chain.length - 1 && (c.else != null)) {
          this.locals.push();
          this.compileSequence(c.else);
          this.locals.pop();
        }
      }
      this.routine.setLabel(condition_end);
    }

    formatField(field) {
      if (field === "constructor") {
        field = "_constructor";
      }
      return field.toString().replace(/"/g, "\\\"");
    }

    compileCreateObject(statement) {
      var f, j, len, ref;
      this.routine.CREATE_OBJECT(statement);
      ref = statement.fields;
      for (j = 0, len = ref.length; j < len; j++) {
        f = ref[j];
        this.routine.LOAD_VALUE(f.field, statement);
        this.compile(f.value);
        this.routine.CREATE_PROPERTY(statement);
      }
    }

    compileCreateClass(statement) {
      var f, j, len, ref, variable;
      if (statement.ext != null) {
        statement.ext.nowarning = true;
        this.compile(statement.ext);
      } else {
        this.routine.LOAD_VALUE(0, statement);
      }
      variable = (statement.ext != null) && statement.ext instanceof Program.Variable ? statement.ext.identifier : 0;
      this.routine.CREATE_CLASS(variable, statement);
      ref = statement.fields;
      for (j = 0, len = ref.length; j < len; j++) {
        f = ref[j];
        this.routine.LOAD_VALUE(f.field, statement);
        this.compile(f.value);
        this.routine.CREATE_PROPERTY(statement);
      }
    }

    compileUpdateClass(statement, variable) {
      this.compileCreateClass(statement);
      return this.routine.UPDATE_CLASS(variable, statement);
    }

    compileNewCall(statement) {
      var a, call, i, j, len, ref;
      call = statement.expression;
      this.routine.LOAD_VALUE(0, statement); // reserve spot on stack for the class instance
      ref = call.args;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        a = ref[i];
        this.compile(a);
      }
      this.compile(call.expression);
      this.routine.NEW_CALL(call.args.length, statement);
      return this.routine.POP(statement); // pop return value of class constructor
    }

    compileAfter(after) {
      var r;
      r = this.compileFunctionBody(after);
      this.routine.LOAD_ROUTINE(r, after);
      this.compile(after.delay);
      if ((after.multiplier != null) && after.multiplier !== 1) {
        this.routine.LOAD_VALUE(after.multiplier, after);
        this.routine.MUL(after);
      }
      return this.routine.AFTER(after);
    }

    compileEvery(every) {
      var r;
      r = this.compileFunctionBody(every);
      this.routine.LOAD_ROUTINE(r, every);
      this.compile(every.delay);
      if ((every.multiplier != null) && every.multiplier !== 1) {
        this.routine.LOAD_VALUE(every.multiplier, every);
        this.routine.MUL(every);
      }
      return this.routine.EVERY(every);
    }

    compileDo(dostuff) {
      var r;
      r = this.compileFunctionBody(dostuff);
      this.routine.LOAD_ROUTINE(r, dostuff);
      return this.routine.DO(dostuff);
    }

    compileSleep(sleep) {
      this.compile(sleep.delay);
      if ((sleep.multiplier != null) && sleep.multiplier !== 1) {
        this.routine.LOAD_VALUE(sleep.multiplier, sleep);
        this.routine.MUL(sleep);
      }
      return this.routine.SLEEP(sleep);
    }

    compileDelete(del) {
      var chain, i, j, ref;
      if (del.field instanceof Program.Variable) {
        this.routine.LOAD_THIS(del);
        this.routine.LOAD_VALUE(del.field.identifier, del);
        this.routine.DELETE(del);
      } else {
        this.compile(del.field.expression);
        chain = del.field.chain;
        for (i = j = 0, ref = chain.length - 1; j <= ref; i = j += 1) {
          this.compile(chain[i]);
          if (i < chain.length - 1) {
            this.routine.LOAD_PROPERTY(del);
          }
        }
        this.routine.DELETE(del);
      }
    }

    exec(context) {
      this.processor = new Processor();
      this.processor.load(this.routine);
      return this.processor.run(context);
    }

  };

  Compiler.predefined_unary_functions = {
    "round": Math.round,
    "floor": Math.floor,
    "ceil": Math.ceil,
    "abs": Math.abs,
    "sqrt": Math.sqrt,
    "sin": Math.sin,
    "cos": Math.cos,
    "tan": Math.tan,
    "acos": Math.acos,
    "asin": Math.asin,
    "atan": Math.atan,
    "sind": function(x) {
      return Math.sin(x * Math.PI / 180);
    },
    "cosd": function(x) {
      return Math.cos(x * Math.PI / 180);
    },
    "tand": function(x) {
      return Math.tan(x * Math.PI / 180);
    },
    "asind": function(x) {
      return Math.asin(x) / Math.PI * 180;
    },
    "acosd": function(x) {
      return Math.acos(x) / Math.PI * 180;
    },
    "atand": function(x) {
      return Math.atan(x) / Math.PI * 180;
    },
    "log": Math.log,
    "exp": Math.exp
  };

  Compiler.predefined_binary_functions = {
    "min": Math.min,
    "max": Math.max,
    "pow": Math.pow,
    "atan2": Math.atan2,
    "atan2d": function(y, x) {
      return Math.atan2(y, x) / Math.PI * 180;
    }
  };

  Compiler.predefined_values = {
    PI: Math.PI,
    true: 1,
    false: 0
  };

  return Compiler;

}).call(this);

this.Locals = class Locals {
  constructor(compiler, parent = null) {
    this.compiler = compiler;
    this.parent = parent;
    this.layers = [];
    this.index = 0;
    this.max_index = 0;
    this.push();
    this.imports = [];
  }

  increment() {
    var spot;
    spot = this.index++;
    this.max_index = Math.max(this.index, this.max_index);
    return spot;
  }

  push() {
    return this.layers.push(new LocalLayer(this));
  }

  pop() {
    // resetting the @index below was causing erasure of outer locals
    // when used after the block ; such reset is not needed
    //@index = @layers[@layers.length-1].start_index
    return this.layers.splice(this.layers.length - 1, 1);
  }

  register(name) {
    return this.layers[this.layers.length - 1].register(name);
  }

  allocate() {
    return this.layers[this.layers.length - 1].allocate();
  }

  get(name) {
    var i, index, j, ref, v;
    if (name === "arguments") {
      this.arguments_used = true;
    }
    for (i = j = ref = this.layers.length - 1; j >= 0; i = j += -1) {
      v = this.layers[i].get(name);
      if (v != null) {
        return v;
      }
    }
    if (this.parent != null) {
      v = this.parent.get(name);
      if (v != null) {
        index = this.register(name);
        this.imports.push({
          name: name,
          index: index,
          source: v
        });
        return index;
      }
    }
    return null;
  }

};

LocalLayer = class LocalLayer {
  constructor(locals1) {
    this.locals = locals1;
    this.start_index = this.locals.index;
    this.registered = {};
  }

  register(name) {
    return this.registered[name] = this.locals.increment();
  }

  allocate() {
    return this.locals.increment();
  }

  get(name) {
    if (this.registered[name] != null) {
      return this.registered[name];
    } else {
      return null;
    }
  }

};
