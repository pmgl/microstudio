this.Parser = (function() {
  class Parser {
    constructor(input, filename = "") {
      this.input = input;
      this.filename = filename;
      if (/^\s*\/\/\s*javascript\s*\n/.test(this.input)) {
        this.input = 'system.javascript("""\n\n' + this.input.replace(/\\/g, "\\\\") + '\n\n""")';
      }
      this.tokenizer = new Tokenizer(this.input, this.filename);
      this.program = new Program();
      this.current_block = [];
      this.current = {
        line: 1,
        column: 1
      };
      this.verbose = false;
      this.nesting = 0;
      this.object_nesting = 0;
      this.not_terminated = [];
      this.api_reserved = {
        screen: true,
        audio: true,
        keyboard: true,
        gamepad: true,
        sprites: true,
        sounds: true,
        music: true,
        assets: true,
        asset_manager: true,
        maps: true,
        touch: true,
        mouse: true,
        fonts: true,
        Sound: true,
        Image: true,
        Sprite: true,
        Map: true,
        system: true,
        storage: true,
        print: true,
        random: true,
        Function: true,
        List: true,
        Object: true,
        String: true,
        Number: true
      };
    }

    nextToken() {
      var token;
      token = this.tokenizer.next();
      if (token == null) {
        this.unexpected_eof = true;
        throw "Unexpected end of file";
      }
      return this.current = token;
    }

    nextTokenOptional() {
      var token;
      token = this.tokenizer.next();
      if (token != null) {
        this.current = token;
      }
      return token;
    }

    parse() {
      var err, expression, nt, token;
      try {
        this.warnings = [];
        while (true) {
          expression = this.parseLine();
          if ((expression == null) && !this.tokenizer.finished()) {
            token = this.tokenizer.next();
            if ((token != null) && token.reserved_keyword) {
              if (token.value === "end") {
                this.error("Too many 'end'");
              } else {
                this.error(`Misuse of reserved keyword: '${token.value}'`);
              }
            } else {
              this.error("Unexpected data");
            }
          }
          if (expression === null) {
            break;
          }
          this.current_block.push(expression);
          this.program.add(expression);
          if (this.verbose) {
            console.info(expression);
          }
        }
        return this;
      } catch (error1) {
        err = error1;
        //console.info "Error at line: #{@current.line} column: #{@current.column}"
        if (this.not_terminated.length > 0 && err === "Unexpected end of file") {
          nt = this.not_terminated[this.not_terminated.length - 1];
          return this.error_info = {
            error: `Unterminated '${nt.value}' ; no matching 'end' found`,
            line: nt.line,
            column: nt.column
          };
        } else {
          return this.error_info = {
            error: err,
            line: this.current.line,
            column: this.current.column
          };
        }
      }
    }

    //console.error err
    parseLine() {
      var token;
      token = this.nextTokenOptional();
      if (token == null) {
        return null;
      }
      switch (token.type) {
        case Token.TYPE_RETURN:
          return new Program.Return(token, this.parseExpression());
        case Token.TYPE_BREAK:
          return new Program.Break(token);
        case Token.TYPE_CONTINUE:
          return new Program.Continue(token);
        case Token.TYPE_LOCAL:
          return this.parseLocalAssignment(token);
        default:
          this.tokenizer.pushBack(token);
          return this.parseExpression();
      }
    }

    parseExpression(filter, first_function_call = false) {
      var access, expression;
      expression = this.parseExpressionStart();
      if (expression == null) {
        return null;
      }
      while (true) {
        access = this.parseExpressionSuffix(expression, filter);
        if (access == null) {
          return expression;
        }
        if (first_function_call && access instanceof Program.FunctionCall) {
          return access;
        }
        expression = access;
      }
    }

    assertExpression(filter, first_function_call = false) {
      var exp;
      exp = this.parseExpression(filter, first_function_call);
      if (exp == null) {
        throw "Expression expected";
      }
      return exp;
    }

    parseExpressionSuffix(expression, filter) {
      var field, identifier, token;
      token = this.nextTokenOptional();
      if (token == null) {
        return (filter === "self" ? expression : null);
      }
      switch (token.type) {
        case Token.TYPE_DOT:
          if (expression instanceof Program.Value && expression.type === Program.Value.TYPE_NUMBER) {
            this.tokenizer.pushBack(token);
            return null;
          } else {
            this.tokenizer.changeNumberToIdentifier();
            identifier = this.assertBroadIdentifier("Expected identifier");
            return Program.CreateFieldAccess(token, expression, new Program.Value(identifier, Program.Value.TYPE_STRING, identifier.value));
          }
          break;
        case Token.TYPE_OPEN_BRACKET:
          field = this.assertExpression();
          this.assert(Token.TYPE_CLOSED_BRACKET, "Expected ']'");
          return Program.CreateFieldAccess(token, expression, field);
        case Token.TYPE_OPEN_BRACE:
          return this.parseFunctionCall(token, expression);
        case Token.TYPE_EQUALS:
          return this.parseAssignment(token, expression);
        case Token.TYPE_PLUS_EQUALS:
          return this.parseSelfAssignment(token, expression, token.type);
        case Token.TYPE_MINUS_EQUALS:
          return this.parseSelfAssignment(token, expression, token.type);
        case Token.TYPE_MULTIPLY_EQUALS:
          return this.parseSelfAssignment(token, expression, token.type);
        case Token.TYPE_DIVIDE_EQUALS:
          return this.parseSelfAssignment(token, expression, token.type);
        case Token.TYPE_MODULO_EQUALS:
        case Token.TYPE_AND_EQUALS:
        case Token.TYPE_OR_EQUALS:
          return this.parseSelfAssignment(token, expression, token.type);
        default:
          if (filter === "self") {
            this.tokenizer.pushBack(token);
            return expression;
          } else if (token.is_binary_operator && filter !== "noop") {
            return this.parseBinaryOperation(token, expression);
          } else {
            this.tokenizer.pushBack(token);
            return null;
          }
      }
    }

    parseExpressionStart() {
      var next, token;
      token = this.nextTokenOptional();
      if (token == null) {
        return null;
      }
      switch (token.type) {
        case Token.TYPE_IDENTIFIER: // variable name
          return new Program.Variable(token, token.value);
        case Token.TYPE_NUMBER:
          return this.parseNumberExpression(token);
        case Token.TYPE_PLUS:
          return this.assertExpression();
        case Token.TYPE_MINUS:
          return this.parseExpressionSuffix(new Program.Negate(token, this.assertExpression("noop")), "self");
        case Token.TYPE_NOT:
          return this.parseExpressionSuffix(new Program.Not(token, this.assertExpression("noop")), "self");
        case Token.TYPE_STRING:
          return this.parseStringExpression(token);
        case Token.TYPE_IF:
          return this.parseIf(token);
        case Token.TYPE_FOR:
          return this.parseFor(token);
        case Token.TYPE_WHILE:
          return this.parseWhile(token);
        case Token.TYPE_OPEN_BRACE:
          return this.parseBracedExpression(token);
        case Token.TYPE_OPEN_BRACKET:
          return this.parseArray(token);
        case Token.TYPE_FUNCTION:
          return this.parseFunction(token);
        case Token.TYPE_OBJECT:
          return this.parseObject(token);
        case Token.TYPE_CLASS:
          return this.parseClass(token);
        case Token.TYPE_NEW:
          return this.parseNew(token);
        case Token.TYPE_DOT:
          next = this.assert(Token.TYPE_NUMBER, "malformed number");
          if (!Number.isInteger(next.value)) {
            throw "malformed number";
          }
          return new Program.Value(token, Program.Value.TYPE_NUMBER, Number.parseFloat(`.${next.string_value}`));
        case Token.TYPE_AFTER:
          return this.parseAfter(token);
        case Token.TYPE_EVERY:
          return this.parseEvery(token);
        case Token.TYPE_DO:
          return this.parseDo(token);
        case Token.TYPE_SLEEP:
          return this.parseSleep(token);
        case Token.TYPE_DELETE:
          return this.parseDelete(token);
        default:
          this.tokenizer.pushBack(token);
          return null;
      }
    }

    parseNumberExpression(number) {
      return new Program.Value(number, Program.Value.TYPE_NUMBER, number.value);
    }

    parseStringExpression(string) {
      var token;
      token = this.nextTokenOptional();
      if (token == null) {
        return new Program.Value(string, Program.Value.TYPE_STRING, string.value);
      } else {
        this.tokenizer.pushBack(token);
        return new Program.Value(string, Program.Value.TYPE_STRING, string.value);
      }
    }

    parseArray(bracket) {
      var res, token;
      res = [];
      while (true) {
        token = this.nextToken();
        if (token.type === Token.TYPE_CLOSED_BRACKET) {
          return new Program.Value(bracket, Program.Value.TYPE_ARRAY, res);
        } else if (token.type === Token.TYPE_COMMA) {
          continue;
        } else {
          this.tokenizer.pushBack(token);
          res.push(this.assertExpression());
        }
      }
    }

    parseBinaryOperation(operation, term1) {
      var ops, terms, token;
      ops = [new Program.Operation(operation, operation.value)];
      terms = [term1];
      terms.push(this.assertExpression("noop"));
      while (true) {
        token = this.nextTokenOptional();
        if (token == null) {
          break;
        }
        if (!token.is_binary_operator) {
          this.tokenizer.pushBack(token);
          break;
        }
        ops.push(new Program.Operation(token, token.value));
        terms.push(this.assertExpression("noop"));
      }
      return Program.BuildOperations(ops, terms);
    }

    parseAssignment(token, expression) {
      var res;
      if (!(expression instanceof Program.Variable) && !(expression instanceof Program.Field)) {
        throw "Expected variable identifier or property";
      }
      if (this.object_nesting === 0 && expression instanceof Program.Variable && this.api_reserved[expression.identifier]) {
        this.warnings.push({
          type: "assigning_api_variable",
          identifier: expression.identifier,
          line: token.line,
          column: token.column
        });
      }
      if (expression instanceof Program.Field) {
        this.object_nesting += 1;
        res = new Program.Assignment(token, expression, this.assertExpression());
        this.object_nesting -= 1;
      } else {
        res = new Program.Assignment(token, expression, this.assertExpression());
      }
      return res;
    }

    parseSelfAssignment(token, expression, operation) {
      if (!(expression instanceof Program.Variable) && !(expression instanceof Program.Field)) {
        throw "Expected variable identifier or property";
      }
      return new Program.SelfAssignment(token, expression, operation, this.assertExpression());
    }

    parseLocalAssignment(local) {
      var identifier;
      identifier = this.assert(Token.TYPE_IDENTIFIER, "Expected identifier");
      this.assert(Token.TYPE_EQUALS, "Expected '='");
      return new Program.Assignment(local, new Program.Variable(identifier, identifier.value), this.assertExpression(), true);
    }

    parseBracedExpression(open) {
      var expression, token;
      expression = this.assertExpression();
      token = this.nextToken();
      if (token.type === Token.TYPE_CLOSED_BRACE) {
        return new Program.Braced(open, expression);
      } else {
        return this.error("missing closing parenthese");
      }
    }

    parseFunctionCall(brace_token, expression) {
      var args, start, token;
      args = [];
      this.last_function_call = new Program.FunctionCall(brace_token, expression, args);
      this.last_function_call.argslimits = [];
      while (true) {
        token = this.nextTokenOptional();
        if (token == null) {
          return this.error("missing closing parenthese");
        } else if (token.type === Token.TYPE_CLOSED_BRACE) {
          return new Program.FunctionCall(token, expression, args);
        } else if (token.type === Token.TYPE_COMMA) {
          continue;
        } else {
          this.tokenizer.pushBack(token);
          start = token.start;
          args.push(this.assertExpression());
          this.last_function_call.argslimits.push({
            start: start,
            end: this.tokenizer.index - 1
          });
        }
      }
    }

    addTerminable(token) {
      return this.not_terminated.push(token);
    }

    endTerminable() {
      if (this.not_terminated.length > 0) {
        this.not_terminated.splice(this.not_terminated.length - 1, 1);
      }
    }

    parseFunction(funk) {
      var args, line, sequence, token;
      this.nesting += 1;
      this.addTerminable(funk);
      args = this.parseFunctionArgs();
      sequence = [];
      while (true) {
        token = this.nextToken();
        if (token.type === Token.TYPE_END) {
          this.nesting -= 1;
          this.endTerminable();
          return new Program.Function(funk, args, sequence, token);
        } else {
          this.tokenizer.pushBack(token);
          line = this.parseLine();
          if (line != null) {
            sequence.push(line);
          } else {
            this.error("Unexpected data while parsing function");
          }
        }
      }
    }

    parseFunctionArgs() {
      var args, exp, last, token;
      token = this.nextToken();
      args = [];
      last = null;
      if (token.type !== Token.TYPE_OPEN_BRACE) {
        return this.error("Expected opening parenthese");
      }
      while (true) {
        token = this.nextToken();
        if (token.type === Token.TYPE_CLOSED_BRACE) {
          return args;
        } else if (token.type === Token.TYPE_COMMA) {
          last = null;
          continue;
        } else if (token.type === Token.TYPE_EQUALS && last === "argument") {
          exp = this.assertExpression();
          args[args.length - 1].default = exp;
        } else if (token.type === Token.TYPE_IDENTIFIER) {
          last = "argument";
          args.push({
            name: token.value
          });
        } else {
          return this.error("Unexpected token");
        }
      }
    }

    warningAssignmentCondition(expression) {
      if (expression instanceof Program.Assignment) {
        return this.warnings.push({
          type: "assignment_as_condition",
          line: expression.token.line,
          column: expression.token.column
        });
      }
    }

    parseIf(iftoken) {
      var chain, current, line, token;
      this.addTerminable(iftoken);
      current = {
        condition: this.assertExpression(),
        sequence: []
      };
      this.warningAssignmentCondition(current.condition);
      chain = [];
      token = this.nextToken();
      if (token.type !== Token.TYPE_THEN) {
        return this.error("Expected 'then'");
      }
      while (true) {
        token = this.nextToken();
        if (token.type === Token.TYPE_ELSIF) {
          chain.push(current);
          current = {
            condition: this.assertExpression(),
            sequence: []
          };
          this.warningAssignmentCondition(current.condition);
          this.assert(Token.TYPE_THEN, "Expected 'then'");
        } else if (token.type === Token.TYPE_ELSE) {
          current.else = [];
        } else if (token.type === Token.TYPE_END) {
          chain.push(current);
          this.endTerminable();
          return new Program.Condition(iftoken, chain);
        } else {
          this.tokenizer.pushBack(token);
          line = this.parseLine();
          if (line == null) {
            throw Error("Unexpected data while parsing if");
          }
          if (current.else != null) {
            current.else.push(line);
          } else {
            current.sequence.push(line);
          }
        }
      }
    }

    assert(type, error) {
      var token;
      token = this.nextToken();
      if (token.type !== type) {
        throw error;
      }
      return token;
    }

    assertBroadIdentifier(error) {
      var token;
      token = this.nextToken();
      if (token.type !== Token.TYPE_IDENTIFIER && token.reserved_keyword) {
        token.type = Token.TYPE_IDENTIFIER;
      }
      if (token.type !== Token.TYPE_IDENTIFIER) {
        throw error;
      }
      return token;
    }

    error(text) {
      throw text;
    }

    parseFor(fortoken) {
      var iterator, list, range_by, range_from, range_to, token;
      iterator = this.assertExpression();
      if (iterator instanceof Program.Assignment) {
        range_from = iterator.expression;
        iterator = iterator.field;
        token = this.nextToken();
        if (token.type !== Token.TYPE_TO) {
          return this.error("Expected 'to'");
        }
        range_to = this.assertExpression();
        token = this.nextToken();
        if (token.type === Token.TYPE_BY) {
          range_by = this.assertExpression();
        } else {
          range_by = 0;
          this.tokenizer.pushBack(token);
        }
        return new Program.For(fortoken, iterator.identifier, range_from, range_to, range_by, this.parseSequence(fortoken));
      } else if (iterator instanceof Program.Variable) {
        this.assert(Token.TYPE_IN, "Error expected keyword 'in'");
        list = this.assertExpression();
        return new Program.ForIn(fortoken, iterator.identifier, list, this.parseSequence(fortoken));
      } else {
        return this.error("Malformed for loop");
      }
    }

    parseWhile(whiletoken) {
      var condition;
      condition = this.assertExpression();
      return new Program.While(whiletoken, condition, this.parseSequence(whiletoken));
    }

    parseSequence(start_token) {
      var line, sequence, token;
      if (start_token != null) {
        this.addTerminable(start_token);
      }
      this.nesting += 1;
      sequence = [];
      while (true) {
        token = this.nextToken();
        if (token.type === Token.TYPE_END) {
          if (start_token != null) {
            this.endTerminable();
          }
          this.nesting -= 1;
          return sequence;
        } else {
          this.tokenizer.pushBack(token);
          line = this.parseLine();
          if (line == null) {
            this.error("Unexpected data");
          }
          sequence.push(line);
        }
      }
      return sequence;
    }

    parseObject(object) {
      var exp, fields, token;
      this.nesting += 1;
      this.object_nesting += 1;
      this.addTerminable(object);
      fields = [];
      while (true) {
        token = this.nextToken();
        if (token.type === Token.TYPE_END) {
          this.nesting -= 1;
          this.object_nesting -= 1;
          this.endTerminable();
          return new Program.CreateObject(object, fields);
        } else {
          if (token.type !== Token.TYPE_IDENTIFIER && token.reserved_keyword) {
            token.type = Token.TYPE_IDENTIFIER;
          }
          if (token.type === Token.TYPE_STRING) {
            token.type = Token.TYPE_IDENTIFIER;
          }
          if (token.type === Token.TYPE_IDENTIFIER) {
            this.assert(Token.TYPE_EQUALS, "Expected '='");
            exp = this.assertExpression();
            fields.push({
              field: token.value,
              value: exp
            });
          } else {
            return this.error("Malformed object");
          }
        }
      }
    }

    parseClass(object) {
      var exp, ext, fields, token;
      this.nesting += 1;
      this.object_nesting += 1;
      this.addTerminable(object);
      fields = [];
      token = this.nextToken();
      if (token.type === Token.TYPE_EXTENDS) {
        ext = this.assertExpression();
        token = this.nextToken();
      }
      while (true) {
        if (token.type === Token.TYPE_END) {
          this.nesting -= 1;
          this.object_nesting -= 1;
          this.endTerminable();
          return new Program.CreateClass(object, ext, fields);
        } else {
          if (token.type !== Token.TYPE_IDENTIFIER && token.reserved_keyword) {
            token.type = Token.TYPE_IDENTIFIER;
          }
          if (token.type === Token.TYPE_STRING) {
            token.type = Token.TYPE_IDENTIFIER;
          }
          if (token.type === Token.TYPE_IDENTIFIER) {
            this.assert(Token.TYPE_EQUALS, "Expected '='");
            exp = this.assertExpression();
            fields.push({
              field: token.value,
              value: exp
            });
          } else {
            return this.error("Malformed object");
          }
        }
        token = this.nextToken();
      }
    }

    parseNew(token) {
      var exp;
      exp = this.assertExpression(null, true);
      return new Program.NewCall(token, exp);
    }

    parseAfter(after) {
      var delay, line, multiplier, sequence, token;
      this.nesting += 1;
      this.addTerminable(after);
      delay = this.assertExpression();
      token = this.nextToken();
      multiplier = null;
      if (token.type === Token.TYPE_IDENTIFIER && this.multipliers[token.value]) {
        multiplier = this.multipliers[token.value];
        token = this.nextToken();
      }
      if ((token == null) || token.type !== Token.TYPE_DO) {
        this.error("Expected keyword 'do'");
      }
      sequence = [];
      while (true) {
        token = this.nextToken();
        if (token.type === Token.TYPE_END) {
          this.nesting -= 1;
          this.endTerminable();
          return new Program.After(after, delay, sequence, token, multiplier);
        } else {
          this.tokenizer.pushBack(token);
          line = this.parseLine();
          if (line != null) {
            sequence.push(line);
          } else {
            this.error("Unexpected data while parsing after");
          }
        }
      }
    }

    parseEvery(every) {
      var delay, line, multiplier, sequence, token;
      this.nesting += 1;
      this.addTerminable(every);
      delay = this.assertExpression();
      token = this.nextToken();
      multiplier = null;
      if (token.type === Token.TYPE_IDENTIFIER && this.multipliers[token.value]) {
        multiplier = this.multipliers[token.value];
        token = this.nextToken();
      }
      if ((token == null) || token.type !== Token.TYPE_DO) {
        this.error("Expected keyword 'do'");
      }
      sequence = [];
      while (true) {
        token = this.nextToken();
        if (token.type === Token.TYPE_END) {
          this.nesting -= 1;
          this.endTerminable();
          return new Program.Every(every, delay, sequence, token, multiplier);
        } else {
          this.tokenizer.pushBack(token);
          line = this.parseLine();
          if (line != null) {
            sequence.push(line);
          } else {
            this.error("Unexpected data while parsing after");
          }
        }
      }
    }

    parseDo(do_token) {
      var line, sequence, token;
      this.nesting += 1;
      this.addTerminable(do_token);
      sequence = [];
      while (true) {
        token = this.nextToken();
        if (token.type === Token.TYPE_END) {
          this.nesting -= 1;
          this.endTerminable();
          return new Program.Do(do_token, sequence, token);
        } else {
          this.tokenizer.pushBack(token);
          line = this.parseLine();
          if (line != null) {
            sequence.push(line);
          } else {
            this.error("Unexpected data while parsing after");
          }
        }
      }
    }

    parseSleep(sleep) {
      var delay, multiplier, token;
      delay = this.assertExpression();
      token = this.nextToken();
      multiplier = null;
      if (token != null) {
        if (token.type === Token.TYPE_IDENTIFIER && this.multipliers[token.value]) {
          multiplier = this.multipliers[token.value];
        } else {
          this.tokenizer.pushBack(token);
        }
      }
      return new Program.Sleep(sleep, delay, multiplier);
    }

    parseDelete(del) {
      var v;
      v = this.parseExpression();
      if ((v == null) || (!(v instanceof Program.Variable) && !(v instanceof Program.Field))) {
        return this.error("expecting variable name or property access after keyword `delete`");
      } else {
        return new Program.Delete(del, v);
      }
    }

  };

  Parser.prototype.multipliers = {
    millisecond: 1,
    milliseconds: 1,
    second: 1000,
    seconds: 1000,
    minute: 60000,
    minutes: 60000,
    hour: 60000 * 60,
    hours: 60000 * 60,
    day: 60000 * 60 * 24,
    days: 60000 * 60 * 24
  };

  return Parser;

}).call(this);
