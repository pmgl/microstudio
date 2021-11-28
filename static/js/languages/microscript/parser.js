this.Parser = (function() {
  function Parser(input, filename) {
    this.input = input;
    this.filename = filename != null ? filename : "";
    this.tokenizer = new Tokenizer(this.input, this.filename);
    this.program = new Program();
    this.current_block = [];
    this.current = {
      line: 1,
      column: 1
    };
    this.verbose = false;
    this.nesting = 0;
    this.not_terminated = [];
  }

  Parser.prototype.nextToken = function() {
    var token;
    token = this.tokenizer.next();
    if (token == null) {
      this.unexpected_eof = true;
      throw "Unexpected end of file";
    }
    return this.current = token;
  };

  Parser.prototype.nextTokenOptional = function() {
    var token;
    token = this.tokenizer.next();
    if (token != null) {
      this.current = token;
    }
    return token;
  };

  Parser.prototype.parse = function() {
    var err, expression, nt, token;
    try {
      while (true) {
        expression = this.parseLine();
        if ((expression == null) && !this.tokenizer.finished()) {
          token = this.tokenizer.next();
          if ((token != null) && token.reserved_keyword) {
            this.error("Misuse of reserved keyword: '" + token.value + "'");
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
      if (this.not_terminated.length > 0 && err === "Unexpected end of file") {
        nt = this.not_terminated[this.not_terminated.length - 1];
        return this.error_info = {
          error: "Unterminated '" + nt.value + "' ; no matching 'end' found",
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
  };

  Parser.prototype.parseLine = function() {
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
  };

  Parser.prototype.parseExpression = function(filter) {
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
      expression = access;
    }
  };

  Parser.prototype.assertExpression = function(filter) {
    var exp;
    exp = this.parseExpression(filter);
    if (exp == null) {
      throw "Expression expected";
    }
    return exp;
  };

  Parser.prototype.parseExpressionSuffix = function(expression, filter) {
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
  };

  Parser.prototype.parseExpressionStart = function() {
    var next, token;
    token = this.nextTokenOptional();
    if (token == null) {
      return null;
    }
    switch (token.type) {
      case Token.TYPE_IDENTIFIER:
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
        return new Program.Value(token, Program.Value.TYPE_NUMBER, Number.parseFloat("." + next.string_value));
      default:
        this.tokenizer.pushBack(token);
        return null;
    }
  };

  Parser.prototype.parseNumberExpression = function(number) {
    return new Program.Value(number, Program.Value.TYPE_NUMBER, number.value);
  };

  Parser.prototype.parseStringExpression = function(string) {
    var token;
    token = this.nextTokenOptional();
    if (token == null) {
      return new Program.Value(string, Program.Value.TYPE_STRING, string.value);
    } else {
      this.tokenizer.pushBack(token);
      return new Program.Value(string, Program.Value.TYPE_STRING, string.value);
    }
  };

  Parser.prototype.parseArray = function(bracket) {
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
  };

  Parser.prototype.parseBinaryOperation = function(operation, term1) {
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
  };

  Parser.prototype.parseAssignment = function(token, expression) {
    return new Program.Assignment(token, expression, this.assertExpression());
  };

  Parser.prototype.parseSelfAssignment = function(token, expression, operation) {
    return new Program.SelfAssignment(token, expression, operation, this.assertExpression());
  };

  Parser.prototype.parseLocalAssignment = function(local) {
    var identifier;
    identifier = this.assert(Token.TYPE_IDENTIFIER, "Expected identifier");
    this.assert(Token.TYPE_EQUALS, "Expected '='");
    return new Program.Assignment(local, new Program.Variable(identifier, identifier.value), this.assertExpression(), true);
  };

  Parser.prototype.parseBracedExpression = function(open) {
    var expression, token;
    expression = this.assertExpression();
    token = this.nextToken();
    if (token.type === Token.TYPE_CLOSED_BRACE) {
      return new Program.Braced(open, expression);
    } else {
      return this.error("missing closing parenthese");
    }
  };

  Parser.prototype.parseFunctionCall = function(brace_token, expression) {
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
  };

  Parser.prototype.addTerminable = function(token) {
    return this.not_terminated.push(token);
  };

  Parser.prototype.endTerminable = function() {
    if (this.not_terminated.length > 0) {
      this.not_terminated.splice(this.not_terminated.length - 1, 1);
    }
  };

  Parser.prototype.parseFunction = function(funk) {
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
  };

  Parser.prototype.parseFunctionArgs = function() {
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
        args[args.length - 1]["default"] = exp;
      } else if (token.type === Token.TYPE_IDENTIFIER) {
        last = "argument";
        args.push({
          name: token.value
        });
      } else {
        return this.error("Unexpected token");
      }
    }
  };

  Parser.prototype.parseIf = function(iftoken) {
    var chain, current, line, token;
    this.addTerminable(iftoken);
    current = {
      condition: this.assertExpression(),
      sequence: []
    };
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
        this.assert(Token.TYPE_THEN, "Expected 'then'");
      } else if (token.type === Token.TYPE_ELSE) {
        current["else"] = [];
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
        if (current["else"] != null) {
          current["else"].push(line);
        } else {
          current.sequence.push(line);
        }
      }
    }
  };

  Parser.prototype.assert = function(type, error) {
    var token;
    token = this.nextToken();
    if (token.type !== type) {
      throw error;
    }
    return token;
  };

  Parser.prototype.assertBroadIdentifier = function(error) {
    var token;
    token = this.nextToken();
    if (token.type !== Token.TYPE_IDENTIFIER && token.reserved_keyword) {
      token.type = Token.TYPE_IDENTIFIER;
    }
    if (token.type !== Token.TYPE_IDENTIFIER) {
      throw error;
    }
    return token;
  };

  Parser.prototype.error = function(text) {
    throw text;
  };

  Parser.prototype.parseFor = function(fortoken) {
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
  };

  Parser.prototype.parseWhile = function(whiletoken) {
    var condition;
    condition = this.assertExpression();
    return new Program.While(whiletoken, condition, this.parseSequence(whiletoken));
  };

  Parser.prototype.parseSequence = function(start_token) {
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
  };

  Parser.prototype.parseObject = function(object) {
    var exp, fields, token;
    this.nesting += 1;
    this.addTerminable(object);
    fields = [];
    while (true) {
      token = this.nextToken();
      if (token.type === Token.TYPE_END) {
        this.nesting -= 1;
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
  };

  Parser.prototype.parseClass = function(object) {
    var exp, ext, fields, token;
    this.nesting += 1;
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
  };

  Parser.prototype.parseNew = function(token) {
    var exp;
    exp = this.assertExpression();
    return new Program.NewCall(token, exp);
  };

  return Parser;

})();
