class @Tokenizer
  constructor:(@input,@filename)->
    @index = 0
    @line = 1
    @column = 0
    @last_column = 0

    @buffer = []

    @chars = {}
    @chars["("] = Token.TYPE_OPEN_BRACE
    @chars[")"] = Token.TYPE_CLOSED_BRACE
    @chars["["] = Token.TYPE_OPEN_BRACKET
    @chars["]"] = Token.TYPE_CLOSED_BRACKET
    @chars["{"] = Token.TYPE_OPEN_CURLY_BRACE
    @chars["}"] = Token.TYPE_CLOSED_CURLY_BRACE
    @chars["^"] = Token.TYPE_POWER
    @chars[","] = Token.TYPE_COMMA
    @chars["."] = Token.TYPE_DOT
    @chars["%"] = Token.TYPE_MODULO

    @doubles = {}
    @doubles[">"] = [Token.TYPE_GREATER,Token.TYPE_GREATER_OR_EQUALS]
    @doubles["<"] = [Token.TYPE_LOWER,Token.TYPE_LOWER_OR_EQUALS]
    @doubles["="] = [Token.TYPE_EQUALS,Token.TYPE_DOUBLE_EQUALS]
    @doubles["+"] = [Token.TYPE_PLUS,Token.TYPE_PLUS_EQUALS]
    @doubles["-"] = [Token.TYPE_MINUS,Token.TYPE_MINUS_EQUALS]
    @doubles["*"] = [Token.TYPE_MULTIPLY,Token.TYPE_MULTIPLY_EQUALS]
    @doubles["/"] = [Token.TYPE_DIVIDE,Token.TYPE_DIVIDE_EQUALS]

    @letter_regex = RegExp(/^\p{L}/,'u')

  pushBack:(token)->
    @buffer.splice(0,0,token)

  finished:()->
    @index>=@input.length

  nextChar:(ignore_comments=false)->
    c = @input.charAt(@index++)
    if c == "\n"
      @line += 1
      @last_column = @column
      @column = 0
    else if c == "/" and not ignore_comments
      if @input.charAt(@index) == "/"
        loop
          c = @input.charAt(@index++)
          break if c == "\n" or @index>=@input.length
        @line += 1
        @last_column = @column
        @column = 0
        return @nextChar()
      else if @input.charAt(@index) == "*"
        endseq = 0
        loop
          c = @input.charAt(@index++)
          if c == "\n"
            @line += 1
            @last_column = @column
            @column = 0
            endseq = 0
          else if c == "*"
            endseq = 1
          else if c == "/" and endseq == 1
            break
          else
            endseq = 0
          break if @index>=@input.length

        return @nextChar()

    else
      @column += 1
    c

  rewind:()->
    @index -= 1
    @column -= 1
    if @input.charAt(@index) == "\n"
      @line -=1
      @column = @last_column

  next:()->
    if @buffer.length>0
      return @buffer.splice(0,1)[0]

    loop
      return null if @index>=@input.length
      c = @nextChar()
      code = c.charCodeAt(0)
      break if code > 32

    @token_start = @index-1

    if @doubles[c]?
      return @parseDouble(c,@doubles[c])

    if @chars[c]?
      return new Token @,@chars[c],c

    if c == "!"
      return @parseUnequals(c)
    else if (code>=48 and code<=57)
      return @parseNumber(c)
    else if (code>=65 and code<=90) or (code>=97 and code<=122) or code == 95 or @letter_regex.test(c)
      return @parseIdentifier(c)
    else if c == '"'
      return @parseString(c,'"')
    else if c == "'"
      return @parseString(c,"'")
    else
      return @error "Syntax Error"

  changeNumberToIdentifier:()->
    token = @next()
    if token? and token.type == Token.TYPE_NUMBER
      v = token.string_value.split(".")
      for i in [v.length-1..0] by -1
        if v[i].length>0
          @pushBack new Token @,Token.TYPE_IDENTIFIER,v[i]
        if i>0
          @pushBack new Token @,Token.TYPE_DOT,"."
    else if token? and token.type == Token.TYPE_STRING
      @pushBack new Token @,Token.TYPE_IDENTIFIER,token.value
    else
      @pushBack token

  parseDouble:(c,d)->
    if @index<@input.length and @input.charAt(@index) == "="
      @nextChar()
      return new Token @,d[1],c+"="
    else
      return new Token @,d[0],c

  parseEquals:(c)->
    if @index<@input.length and @input.charAt(@index) == "="
      @nextChar()
      return new Token @,Token.TYPE_DOUBLE_EQUALS,"=="
    else
      return new Token @,Token.TYPE_EQUALS,"="

  parseGreater:(c)->
    if @index<@input.length and @input.charAt(@index) == "="
      @nextChar()
      return new Token @,Token.TYPE_GREATER_OR_EQUALS,">="
    else
      return new Token @,Token.TYPE_GREATER_OR_EQUALS,">"

  parseLower:(c)->
    if @index<@input.length and @input.charAt(@index) == "="
      @nextChar()
      return new Token @,Token.TYPE_LOWER_OR_EQUALS,"<="
    else
      return new Token @,Token.TYPE_LOWER,"<"

  parseUnequals:(c)->
    if @index<@input.length and @input.charAt(@index) == "="
      @nextChar()
      return new Token @,Token.TYPE_UNEQUALS,"!="
    else
      return @error "Expected inequality !="

  parseIdentifier:(s)->
    loop
      return new Token(@,Token.TYPE_IDENTIFIER,s) if @index>=@input.length
      c = @nextChar()
      code = c.charCodeAt(0)
      if (code>=65 and code<=90) or (code>=97 and code<=122) or code == 95 or (code>=48 and code<=57) or @letter_regex.test(c)
        s += c
      else
        @rewind()
        return new Token(@,Token.TYPE_IDENTIFIER,s)

  parseNumber:(s)->
    pointed = false
    exp = false

    loop
      return new Token(@,Token.TYPE_NUMBER,Number.parseFloat(s),s) if @index>=@input.length
      c = @nextChar()
      code = c.charCodeAt(0)
      if c == "." and not pointed and not exp
        pointed = true
        s += c
      else if code>=48 and code<=57
        s += c
      else if (c == "e" or c == "E") and not exp and @index<@input.length
        exp = true
        s += c
        c = @nextChar()
        if c == "+" or c == "-"
          s += c
        else
          @rewind()
      else if c in ["x","X"] and s == "0"
        return @parseHexNumber "0x"
      else
        @rewind()
        return new Token(@,Token.TYPE_NUMBER,Number.parseFloat(s),s)

  parseHexNumber:(s)->
    loop
      return new Token(@,Token.TYPE_NUMBER,Number.parseInt(s),s) if @index>=@input.length
      c = @nextChar()
      if /[a-fA-F0-9]/.test(c)
        s += c
      else
        @rewind()
        return new Token(@,Token.TYPE_NUMBER,Number.parseInt(s),s)


  parseString:(s,close='"')->
    loop
      return @error("Unclosed string value") if @index>=@input.length
      c = @nextChar(true)
      code = c.charCodeAt(0)
      if c == "\\"
        n = @nextChar(true)
        switch n
          when "n" then s += "\n"
          when "\\" then s += "\\"
          when close then s += close
          else
            s += "\\"+n
      else if c == close
        n = @nextChar(true)
        if n == close
          s += c
        else
          @rewind()
          s += c
          return new Token @,Token.TYPE_STRING,s.substring(1,s.length-1)
      else
        s += c

  error:(s)->
    throw s
