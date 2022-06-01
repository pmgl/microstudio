this.Tokenizer = (function() {
  function Tokenizer(input, filename) {
    this.input = input;
    this.filename = filename;
    this.index = 0;
    this.line = 1;
    this.column = 0;
    this.last_column = 0;
    this.buffer = [];
    this.chars = {};
    this.chars["("] = Token.TYPE_OPEN_BRACE;
    this.chars[")"] = Token.TYPE_CLOSED_BRACE;
    this.chars["["] = Token.TYPE_OPEN_BRACKET;
    this.chars["]"] = Token.TYPE_CLOSED_BRACKET;
    this.chars["{"] = Token.TYPE_OPEN_CURLY_BRACE;
    this.chars["}"] = Token.TYPE_CLOSED_CURLY_BRACE;
    this.chars["^"] = Token.TYPE_POWER;
    this.chars[","] = Token.TYPE_COMMA;
    this.chars["."] = Token.TYPE_DOT;
    this.doubles = {};
    this.doubles[">"] = [Token.TYPE_GREATER, Token.TYPE_GREATER_OR_EQUALS];
    this.doubles["<"] = [Token.TYPE_LOWER, Token.TYPE_LOWER_OR_EQUALS];
    this.doubles["="] = [Token.TYPE_EQUALS, Token.TYPE_DOUBLE_EQUALS];
    this.doubles["+"] = [Token.TYPE_PLUS, Token.TYPE_PLUS_EQUALS];
    this.doubles["-"] = [Token.TYPE_MINUS, Token.TYPE_MINUS_EQUALS];
    this.doubles["*"] = [Token.TYPE_MULTIPLY, Token.TYPE_MULTIPLY_EQUALS];
    this.doubles["/"] = [Token.TYPE_DIVIDE, Token.TYPE_DIVIDE_EQUALS];
    this.doubles["%"] = [Token.TYPE_MODULO, Token.TYPE_MODULO_EQUALS];
    this.doubles["&"] = [Token.TYPE_BINARY_AND, Token.TYPE_AND_EQUALS];
    this.doubles["|"] = [Token.TYPE_BINARY_OR, Token.TYPE_OR_EQUALS];
    this.shifts = {
      "<": Token.TYPE_SHIFT_LEFT,
      ">": Token.TYPE_SHIFT_RIGHT
    };
    this.letter_regex = RegExp(/^\p{L}/, 'u');
  }

  Tokenizer.prototype.pushBack = function(token) {
    return this.buffer.splice(0, 0, token);
  };

  Tokenizer.prototype.finished = function() {
    return this.index >= this.input.length && this.buffer.length === 0;
  };

  Tokenizer.prototype.nextChar = function(ignore_comments) {
    var c, endseq;
    if (ignore_comments == null) {
      ignore_comments = false;
    }
    c = this.input.charAt(this.index++);
    if (c === "\n") {
      this.line += 1;
      this.last_column = this.column;
      this.column = 0;
    } else if (c === "/" && !ignore_comments) {
      if (this.input.charAt(this.index) === "/") {
        while (true) {
          c = this.input.charAt(this.index++);
          if (c === "\n" || this.index >= this.input.length) {
            break;
          }
        }
        this.line += 1;
        this.last_column = this.column;
        this.column = 0;
        return this.nextChar();
      } else if (this.input.charAt(this.index) === "*") {
        endseq = 0;
        while (true) {
          c = this.input.charAt(this.index++);
          if (c === "\n") {
            this.line += 1;
            this.last_column = this.column;
            this.column = 0;
            endseq = 0;
          } else if (c === "*") {
            endseq = 1;
          } else if (c === "/" && endseq === 1) {
            break;
          } else {
            endseq = 0;
          }
          if (this.index >= this.input.length) {
            break;
          }
        }
        return this.nextChar();
      }
    } else {
      this.column += 1;
    }
    return c;
  };

  Tokenizer.prototype.rewind = function() {
    this.index -= 1;
    this.column -= 1;
    if (this.input.charAt(this.index) === "\n") {
      this.line -= 1;
      return this.column = this.last_column;
    }
  };

  Tokenizer.prototype.next = function() {
    var c, code;
    if (this.buffer.length > 0) {
      return this.buffer.splice(0, 1)[0];
    }
    while (true) {
      if (this.index >= this.input.length) {
        return null;
      }
      c = this.nextChar();
      code = c.charCodeAt(0);
      if (code > 32 && code !== 160) {
        break;
      }
    }
    this.token_start = this.index - 1;
    if (this.doubles[c] != null) {
      return this.parseDouble(c, this.doubles[c]);
    }
    if (this.chars[c] != null) {
      return new Token(this, this.chars[c], c);
    }
    if (c === "!") {
      return this.parseUnequals(c);
    } else if (code >= 48 && code <= 57) {
      return this.parseNumber(c);
    } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || this.letter_regex.test(c)) {
      return this.parseIdentifier(c);
    } else if (c === '"') {
      return this.parseString(c, '"');
    } else if (c === "'") {
      return this.parseString(c, "'");
    } else {
      return this.error("Syntax Error");
    }
  };

  Tokenizer.prototype.changeNumberToIdentifier = function() {
    var i, j, ref, results, token, v;
    token = this.next();
    if ((token != null) && token.type === Token.TYPE_NUMBER) {
      v = token.string_value.split(".");
      results = [];
      for (i = j = ref = v.length - 1; j >= 0; i = j += -1) {
        if (v[i].length > 0) {
          this.pushBack(new Token(this, Token.TYPE_IDENTIFIER, v[i]));
        }
        if (i > 0) {
          results.push(this.pushBack(new Token(this, Token.TYPE_DOT, ".")));
        } else {
          results.push(void 0);
        }
      }
      return results;
    } else if ((token != null) && token.type === Token.TYPE_STRING) {
      return this.pushBack(new Token(this, Token.TYPE_IDENTIFIER, token.value));
    } else {
      return this.pushBack(token);
    }
  };

  Tokenizer.prototype.parseDouble = function(c, d) {
    if ((this.shifts[c] != null) && this.index < this.input.length && this.input.charAt(this.index) === c) {
      this.nextChar();
      return new Token(this, this.shifts[c], c + c);
    } else if (this.index < this.input.length && this.input.charAt(this.index) === "=") {
      this.nextChar();
      return new Token(this, d[1], c + "=");
    } else {
      return new Token(this, d[0], c);
    }
  };

  Tokenizer.prototype.parseEquals = function(c) {
    if (this.index < this.input.length && this.input.charAt(this.index) === "=") {
      this.nextChar();
      return new Token(this, Token.TYPE_DOUBLE_EQUALS, "==");
    } else {
      return new Token(this, Token.TYPE_EQUALS, "=");
    }
  };

  Tokenizer.prototype.parseGreater = function(c) {
    if (this.index < this.input.length && this.input.charAt(this.index) === "=") {
      this.nextChar();
      return new Token(this, Token.TYPE_GREATER_OR_EQUALS, ">=");
    } else {
      return new Token(this, Token.TYPE_GREATER_OR_EQUALS, ">");
    }
  };

  Tokenizer.prototype.parseLower = function(c) {
    if (this.index < this.input.length && this.input.charAt(this.index) === "=") {
      this.nextChar();
      return new Token(this, Token.TYPE_LOWER_OR_EQUALS, "<=");
    } else {
      return new Token(this, Token.TYPE_LOWER, "<");
    }
  };

  Tokenizer.prototype.parseUnequals = function(c) {
    if (this.index < this.input.length && this.input.charAt(this.index) === "=") {
      this.nextChar();
      return new Token(this, Token.TYPE_UNEQUALS, "!=");
    } else {
      return this.error("Expected inequality !=");
    }
  };

  Tokenizer.prototype.parseIdentifier = function(s) {
    var c, code;
    while (true) {
      if (this.index >= this.input.length) {
        return new Token(this, Token.TYPE_IDENTIFIER, s);
      }
      c = this.nextChar();
      code = c.charCodeAt(0);
      if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || (code >= 48 && code <= 57) || this.letter_regex.test(c)) {
        s += c;
      } else {
        this.rewind();
        return new Token(this, Token.TYPE_IDENTIFIER, s);
      }
    }
  };

  Tokenizer.prototype.parseNumber = function(s) {
    var c, code, exp, pointed;
    pointed = false;
    exp = false;
    while (true) {
      if (this.index >= this.input.length) {
        return new Token(this, Token.TYPE_NUMBER, Number.parseFloat(s), s);
      }
      c = this.nextChar();
      code = c.charCodeAt(0);
      if (c === "." && !pointed && !exp) {
        pointed = true;
        s += c;
      } else if (code >= 48 && code <= 57) {
        s += c;
      } else if ((c === "e" || c === "E") && !exp && this.index < this.input.length) {
        exp = true;
        s += c;
        c = this.nextChar();
        if (c === "+" || c === "-") {
          s += c;
        } else {
          this.rewind();
        }
      } else if ((c === "x" || c === "X") && s === "0") {
        return this.parseHexNumber("0x");
      } else {
        this.rewind();
        return new Token(this, Token.TYPE_NUMBER, Number.parseFloat(s), s);
      }
    }
  };

  Tokenizer.prototype.parseHexNumber = function(s) {
    var c;
    while (true) {
      if (this.index >= this.input.length) {
        return new Token(this, Token.TYPE_NUMBER, Number.parseInt(s), s);
      }
      c = this.nextChar();
      if (/[a-fA-F0-9]/.test(c)) {
        s += c;
      } else {
        this.rewind();
        return new Token(this, Token.TYPE_NUMBER, Number.parseInt(s), s);
      }
    }
  };

  Tokenizer.prototype.parseString = function(s, close) {
    var c, code, count_close, n;
    if (close == null) {
      close = '"';
    }
    if (close === '"') {
      if (this.input.charAt(this.index) === '"' && this.input.charAt(this.index + 1) === '"' && this.input.charAt(this.index + 2) !== '"') {
        close = '"""';
        this.nextChar(true);
        this.nextChar(true);
      }
    }
    count_close = 0;
    while (true) {
      if (this.index >= this.input.length) {
        return this.error("Unclosed string value");
      }
      c = this.nextChar(true);
      code = c.charCodeAt(0);
      if (c === "\\") {
        n = this.nextChar(true);
        switch (n) {
          case "n":
            s += "\n";
            break;
          case "\\":
            s += "\\";
            break;
          case close:
            s += close;
            break;
          default:
            s += "\\" + n;
        }
      } else if (c === close) {
        n = this.nextChar(true);
        if (n === close) {
          s += c;
        } else {
          this.rewind();
          s += c;
          return new Token(this, Token.TYPE_STRING, s.substring(1, s.length - 1));
        }
      } else {
        if (close === '"""' && c === '"') {
          count_close += 1;
          if (count_close === 3) {
            return new Token(this, Token.TYPE_STRING, s.substring(1, s.length - 2));
          }
        } else {
          count_close = 0;
        }
        s += c;
      }
    }
  };

  Tokenizer.prototype.error = function(s) {
    throw s;
  };

  return Tokenizer;

})();
