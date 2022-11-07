class @Token
  constructor:(@tokenizer,@type,@value,@string_value)->
    @line = @tokenizer.line
    @column = @tokenizer.column
    @start = @tokenizer.token_start
    @length = @tokenizer.index-@start
    @index = @tokenizer.index
    if @type == Token.TYPE_IDENTIFIER and Token.predefined.hasOwnProperty(@value)
      @type = Token.predefined[@value]
      @reserved_keyword = true

    @is_binary_operator = (@type>=30 and @type<=39) or (@type>=200 and @type<=201) or (@type>=2 and @type<=7)

  toString:()->
    return @value+ " : "+@type

@Token.TYPE_EQUALS = 1
@Token.TYPE_DOUBLE_EQUALS = 2
@Token.TYPE_GREATER = 3
@Token.TYPE_GREATER_OR_EQUALS = 4
@Token.TYPE_LOWER = 5
@Token.TYPE_LOWER_OR_EQUALS = 6
@Token.TYPE_UNEQUALS = 7

@Token.TYPE_IDENTIFIER = 10
@Token.TYPE_NUMBER = 11
@Token.TYPE_STRING = 12

@Token.TYPE_OPEN_BRACE = 20
@Token.TYPE_CLOSED_BRACE = 21
# @Token.TYPE_OPEN_CURLY_BRACE = 22
# @Token.TYPE_CLOSED_CURLY_BRACE = 23
@Token.TYPE_OPEN_BRACKET = 24
@Token.TYPE_CLOSED_BRACKET = 25
@Token.TYPE_COMMA = 26
@Token.TYPE_DOT = 27

@Token.TYPE_PLUS = 30
@Token.TYPE_MINUS = 31
@Token.TYPE_MULTIPLY = 32
@Token.TYPE_DIVIDE = 33
@Token.TYPE_POWER = 34
@Token.TYPE_MODULO = 35
@Token.TYPE_BINARY_AND = 36
@Token.TYPE_BINARY_OR = 37
@Token.TYPE_SHIFT_LEFT = 38
@Token.TYPE_SHIFT_RIGHT = 39

@Token.TYPE_PLUS_EQUALS = 40
@Token.TYPE_MINUS_EQUALS = 41
@Token.TYPE_MULTIPLY_EQUALS = 42
@Token.TYPE_DIVIDE_EQUALS = 43
@Token.TYPE_MODULO_EQUALS = 44
@Token.TYPE_AND_EQUALS = 45
@Token.TYPE_OR_EQUALS = 46

@Token.TYPE_RETURN = 50
@Token.TYPE_BREAK = 51
@Token.TYPE_CONTINUE = 52

@Token.TYPE_FUNCTION = 60
@Token.TYPE_AFTER = 61
@Token.TYPE_EVERY = 62
@Token.TYPE_DO = 63
@Token.TYPE_SLEEP = 64

@Token.TYPE_LOCAL = 70
@Token.TYPE_OBJECT = 80

@Token.TYPE_CLASS = 90
@Token.TYPE_EXTENDS = 91
@Token.TYPE_NEW = 92

@Token.TYPE_FOR = 100
@Token.TYPE_TO = 101
@Token.TYPE_BY = 102
@Token.TYPE_IN = 103
@Token.TYPE_WHILE = 104
@Token.TYPE_IF = 105
@Token.TYPE_THEN = 106
@Token.TYPE_ELSE = 107
@Token.TYPE_ELSIF = 108
@Token.TYPE_END = 120

@Token.TYPE_AND = 200
@Token.TYPE_OR = 201
@Token.TYPE_NOT = 202

@Token.TYPE_ERROR = 404

@Token.predefined = {}
@Token.predefined["return"] = @Token.TYPE_RETURN
@Token.predefined["break"] = @Token.TYPE_BREAK
@Token.predefined["continue"] = @Token.TYPE_CONTINUE
@Token.predefined["function"] = @Token.TYPE_FUNCTION
@Token.predefined["for"] = @Token.TYPE_FOR
@Token.predefined["to"] = @Token.TYPE_TO
@Token.predefined["by"] = @Token.TYPE_BY
@Token.predefined["in"] = @Token.TYPE_IN
@Token.predefined["while"] = @Token.TYPE_WHILE
@Token.predefined["if"] = @Token.TYPE_IF
@Token.predefined["then"] = @Token.TYPE_THEN
@Token.predefined["else"] = @Token.TYPE_ELSE
@Token.predefined["elsif"] = @Token.TYPE_ELSIF
@Token.predefined["end"] = @Token.TYPE_END
@Token.predefined["object"] = @Token.TYPE_OBJECT
@Token.predefined["class"] = @Token.TYPE_CLASS
@Token.predefined["extends"] = @Token.TYPE_EXTENDS
@Token.predefined["new"] = @Token.TYPE_NEW

@Token.predefined["and"] = @Token.TYPE_AND
@Token.predefined["or"] = @Token.TYPE_OR
@Token.predefined["not"] = @Token.TYPE_NOT

@Token.predefined["after"] = @Token.TYPE_AFTER
@Token.predefined["every"] = @Token.TYPE_EVERY
@Token.predefined["do"] = @Token.TYPE_DO
@Token.predefined["sleep"] = @Token.TYPE_SLEEP
@Token.predefined["delete"] = @Token.TYPE_DELETE

@Token.predefined["local"] = @Token.TYPE_LOCAL
