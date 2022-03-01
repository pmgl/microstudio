class @Program
  constructor:()->
    @statements = []

  add:(statement)->
    @statements.push statement

  isAssignment:()->
    return @statements.length>0 and @statements[@statements.length-1] instanceof Program.Assignment

class @Program.Expression
  constructor:()->

class @Program.Assignment
  constructor:(@token,@field,@expression,@local)->

class @Program.SelfAssignment
  constructor:(@token,@field,@operation,@expression)->

class @Program.Value
  constructor:(@token,@type,@value)->

  @TYPE_NUMBER = 1
  @TYPE_STRING = 2
  @TYPE_ARRAY = 3
  @TYPE_OBJECT = 4
  @TYPE_FUNCTION = 5
  @TYPE_CLASS = 6

@Program.CreateFieldAccess = (token,expression,field)->
  if expression instanceof Program.Field
    expression.appendField field
    return expression
  else
    return new Program.Field token,expression,[field]

class @Program.Variable
  constructor:(@token,@identifier)->

class @Program.Field
  constructor:(@token,@expression,@chain)->
    @token = @expression.token

  appendField:(field)->
    @chain.push(field)

Program.BuildOperations = (ops,terms)->
  while ops.length>1
    i = 0
    prec = 0
    while i<ops.length-1
      o1 = ops[i]
      o2 = ops[i+1]
      break if Program.Precedence[o2.operation]<=Program.Precedence[o1.operation]
      i++

    t1 = terms[i]
    t2 = terms[i+1]
    o = new Program.Operation(ops[i].token,ops[i].operation,t1,t2)
    terms.splice(i,2,o)
    ops.splice(i,1)

  return new Program.Operation ops[0].token,ops[0].operation,terms[0],terms[1]

class @Program.Operation
  constructor:(@token,@operation,@term1,@term2)->

class @Program.Negate
  constructor:(@token,@expression)->

class @Program.Not
  constructor:(@token,@expression)->

class @Program.Braced
  constructor:(@token,@expression)->

class @Program.Return
  constructor:(@token,@expression)->

class @Program.Condition
  constructor:(@token,@chain)->

class @Program.For
  constructor:(@token,@iterator,@range_from,@range_to,@range_by,@sequence)->

class @Program.ForIn
  constructor:(@token,@iterator,@list,@sequence)->

Program.toString = (value,nesting=0)->
  if value instanceof Program.Function
    if nesting == 0
      return value.source
    else
      return "[function]"
  else if typeof value == "function"
    return "[native function]"
  else if typeof value == "string"
    return "\"#{value}\""
  else if Array.isArray(value)
    return "[list]" if nesting>=1
    s = "["
    for v,i in value
      s += Program.toString(v,nesting+1)+if i<value.length-1 then "," else ""
    return s+"]"
  else if typeof value == "object"
    return "[object]" if nesting>=1
    s = "object\n"
    pref = ""
    for i in [1..nesting] by 1
      pref += "  "
    for key,v of value
      s += pref+"  #{key} = #{Program.toString(v,nesting+1)}\n"
    return s+pref+"end"

  value or 0

class @Program.While
  constructor:(@token,@condition,@sequence)->

class @Program.Break
  constructor:(@token)->
    @nopop = true

class @Program.Continue
  constructor:(@token)->
    @nopop = true

class @Program.Function
  constructor:(@token,@args,@sequence,end)->
    @source = "function"+@token.tokenizer.input.substring(@token.index,end.index+2)

class @Program.FunctionCall
  constructor:(@token,@expression,@args)->

class @Program.CreateObject
  constructor:(@token,@fields)->

class @Program.CreateClass
  constructor:(@token,@ext,@fields)->

class @Program.NewCall
  constructor:(@token,@expression)->
    if @expression not instanceof Program.FunctionCall
      @expression = new Program.FunctionCall @token,@expression,[]

class @Program.After
  constructor:(@token,@delay,@sequence,end)->
    @source = "after "+@token.tokenizer.input.substring(@token.index,end.index+2)

class @Program.Every
  constructor:(@token,@delay,@sequence,end)->
    @source = "every "+@token.tokenizer.input.substring(@token.index,end.index+2)

class @Program.Do
  constructor:(@token,@sequence,end)->
    @source = "do "+@token.tokenizer.input.substring(@token.index,end.index+2)

@Program.Precedence =
  "^":21
  "/":20
  "*":19
  "%":18
  "+":17
  "-":17
  "<":16
  "<=":15
  ">":14
  ">=":13
  "==":12
  "!=":11
  "and":10
  "or":9
