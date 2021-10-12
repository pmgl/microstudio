class @Program
  constructor:()->
    @statements = []

  add:(statement)->
    @statements.push statement

  isAssignment:()->
    return @statements.length>0 and @statements[@statements.length-1] instanceof Program.Assignment

class @Statement
  constructor:()->

class @Program.Expression
  constructor:()->

class @Program.Assignment
  constructor:(@token,@field,@expression,@local)->

  evaluate:(context,hold)->
    context.location = @
    if @local
      @field.assign(context,context.local,@expression.evaluate(context,true))
    else
      @field.assign(context,null,@expression.evaluate(context,true))

class @Program.SelfAssignment
  constructor:(@token,@field,@operation,@expression)->

  evaluate:(context,hold)->
    context.location = @
    exp = @expression.evaluate(context,true)
    switch @operation
      when Token.TYPE_PLUS_EQUALS then @field.add(context,exp)
      when Token.TYPE_MINUS_EQUALS then @field.sub(context,exp)
      when Token.TYPE_MULTIPLY_EQUALS then @field.mul(context,exp)
      when Token.TYPE_DIVIDE_EQUALS then @field.div(context,exp)

class @Program.Value
  constructor:(@token,@type,@value)->
    if @type == Program.Value.TYPE_ARRAY
      @evaluate = @evaluateArray

  optimize:()->
    if @type != Program.Value.TYPE_ARRAY
      @constant = @value

  evaluate:(context)->
    @value

  evaluateArray:(context)->
    res = []
    for v in @value
      res.push v.evaluate(context,true)
    return res

  @TYPE_NUMBER = 1
  @TYPE_STRING = 2
  @TYPE_ARRAY = 3
  @TYPE_OBJECT = 4
  @TYPE_FUNCTION = 5
  @TYPE_CLASS = 6

# class @Program.FieldAccess
#   constructor:(@token,@expression,@field)->
#
#   evaluate:(context)->
#     context.location = @
#     exp = @expression.evaluate(context,true)
#     @parentObject = exp
#     if exp
#       f = @field.evaluate(context,true)
#       if Array.isArray exp
#         fu = Program.ListFunction(exp,f)
#         return fu or exp[f] or 0
#       else
#         return exp[f] or 0
#     else
#       0

@Program.CreateFieldAccess = (token,expression,field)->
  if expression instanceof Program.Field
    expression.appendField field
    return expression
  else
    return new Program.Field token,expression,[field]

class @Program.Variable
  constructor:(@token,@identifier)->

  assign:(context,scope,value)->
    if not scope?
      if context.local[@identifier]?
        scope = context.local
      else
        scope = context.object

    scope[@identifier] = value

  ensureCreated:(context)->
    return context.object if @identifier == "this"

    if context.meta[@identifier]?
      scope = context.meta
    else if context.local[@identifier]?
      scope = context.local
    else if context.object[@identifier]? or not context.global[@identifier]?
      scope = context.object
    else
      scope = context.global

    v = scope[@identifier]
    if v? and (Array.isArray(v) or typeof v == "object")
      return v
    else
      id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}"
      if not context.warnings.assigning_field_to_undefined[id]
        context.warnings.assigning_field_to_undefined[id] =
          file: @token.tokenizer.filename
          line: @token.line
          column: @token.column
          expression: @identifier

      return scope[@identifier] = {}

  evaluate:(context,hold,warn=true)->
    if @identifier == "this"
      return context.object

    if @identifier == "super"
      if context.superClass? and context.childName?
        c = context.superClass
        n = context.childName
        while not c[n]? and c.class?
          c = c.class
        @childName = context.childName
        @superClass = c.class
        @parentObject = context.object
        return if c[n]? then c[n] else 0

    context.location = @
    @scope = null
    v = context.meta[@identifier]
    if not v?
      v = context.local[@identifier]

      if not v?
        obj = context.object
        v = obj[@identifier]
        while not v? and obj.class?
          obj = obj.class
          v = obj[@identifier]

        if v?
          @childName = @identifier
          @superClass = obj.class
          @parentObject = context.object

        @scope = context.object if v?

        if not v?
          v = context.global[@identifier]

    if v?
      v
    else
      if warn
        id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}"
        if not context.warnings.using_undefined_variable[id]
          context.warnings.using_undefined_variable[id] =
            file: @token.tokenizer.filename
            line: @token.line
            column: @token.column
            expression: @identifier

      0

  getScope:(context)->
    if context.local[@identifier]?
      return context.local
    else if context.object[@identifier]?
      return context.object
    else if context.global[@identifier]?
      return context.global
    else
      return null

  add:(context,value)->
    scope = @getScope(context)
    if not scope?
      id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}"
      if not context.warnings.using_undefined_variable[id]
        context.warnings.using_undefined_variable[id] =
          file: @token.tokenizer.filename
          line: @token.line
          column: @token.column
          expression: @identifier

      return context.global[@identifier] = 0+value
    else
      return scope[@identifier] += value

  sub:(context,value)->
    scope = @getScope(context)
    if not scope?
      id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}"
      if not context.warnings.using_undefined_variable[id]
        context.warnings.using_undefined_variable[id] =
          file: @token.tokenizer.filename
          line: @token.line
          column: @token.column
          expression: @identifier

      return context.global[@identifier] = 0-value
    else
      return scope[@identifier] -= value

  mul:(context,value)->
    scope = @getScope(context)
    if not scope?
      id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}"
      if not context.warnings.using_undefined_variable[id]
        context.warnings.using_undefined_variable[id] =
          file: @token.tokenizer.filename
          line: @token.line
          column: @token.column
          expression: @identifier

      return context.global[@identifier] = 0
    else
      return scope[@identifier] *= value

  div:(context,value)->
    scope = @getScope(context)
    if not scope?
      id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}"
      if not context.warnings.using_undefined_variable[id]
        context.warnings.using_undefined_variable[id] =
          file: @token.tokenizer.filename
          line: @token.line
          column: @token.column
          expression: @identifier

      return context.global[@identifier] = 0
    else
      return scope[@identifier] /= value

  toString:()->
    @identifier

class @Program.Field
  constructor:(@token,@expression,@chain)->
    @token = @expression.token

  appendField:(field)->
    @chain.push(field)

  assign:(context,scope,value)->
    if @expression.ensureCreated?
      v = @expression.ensureCreated(context)
    else
      v = @expression.evaluate(context,true)

    for c,i in @chain
      c = c.evaluate(context,true) or 0
      if not v[c]? and i<@chain.length-1
        id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}-#{i}"
        if not context.warnings.assigning_field_to_undefined[id]
          context.warnings.assigning_field_to_undefined[id] =
            file: @token.tokenizer.filename
            line: @token.line
            column: @token.column
            expression: @token.tokenizer.input.substring(@token.start,@chain[i].token.start+@chain[i].token.length)

        v[c] = {}
      if i==@chain.length-1
        v[c] = value
      else
        v = v[c]
    value

  add:(context,value)->
    if @expression.ensureCreated?
      v = @expression.ensureCreated(context)
    else
      v = @expression.evaluate(context,true)

    for c,i in @chain
      c = c.evaluate(context,true) or 0
      if i<@chain.length-1
        v2 = v[c]
        if not v2
          @reportAssignWarning(context,i)
          v2 = v[c] = {}
        v = v2
      else
        val = v[c]
        @reportUndefinedWarning(context,i) if not val?
        return v[c] = (if val? then val else 0)+value
    v[c]

  sub:(context,value)->
    if @expression.ensureCreated?
      v = @expression.ensureCreated(context)
    else
      v = @expression.evaluate(context,true)

    for c,i in @chain
      c = c.evaluate(context,true) or 0
      if i<@chain.length-1
        v2 = v[c]
        if not v2
          @reportAssignWarning(context,i)
          v2 = v[c] = {}
        v = v2
      else
        @reportUndefinedWarning(context,i) if not v[c]?
        return v[c] = (v[c] or 0)-value
    v[c]

  mul:(context,value)->
    if @expression.ensureCreated?
      v = @expression.ensureCreated(context)
    else
      v = @expression.evaluate(context,true)

    for c,i in @chain
      c = c.evaluate(context,true) or 0
      if i<@chain.length-1
        v2 = v[c]
        if not v2
          @reportAssignWarning(context,i)
          v2 = v[c] = {}
        v = v2
      else
        @reportUndefinedWarning(context,i) if not v[c]?
        return v[c] = (v[c] or 0)*value
    v[c]

  div:(context,value)->
    if @expression.ensureCreated?
      v = @expression.ensureCreated(context)
    else
      v = @expression.evaluate(context,true)

    for c,i in @chain
      c = c.evaluate(context,true) or 0
      if i<@chain.length-1
        v2 = v[c]
        if not v2
          @reportAssignWarning(context,i)
          v2 = v[c] = {}
        v = v2
      else
        @reportUndefinedWarning(context,i) if not v[c]?
        return v[c] = (v[c] or 0)/value
    v[c]

  reportAssignWarning:(context,i)->
    id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}-#{i}"
    if not context.warnings.assigning_field_to_undefined[id]
      context.warnings.assigning_field_to_undefined[id] =
        file: @token.tokenizer.filename
        line: @token.line
        column: @token.column
        expression: @token.tokenizer.input.substring(@token.start,@chain[i].token.start+@chain[i].token.length)

  reportUndefinedWarning:(context,i)->
    id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}-#{i}"
    if not context.warnings.using_undefined_variable[id]
      context.warnings.using_undefined_variable[id] =
        file: @token.tokenizer.filename
        line: @token.line
        column: @token.column
        expression: @token.tokenizer.input.substring(@token.start,@chain[i].token.start+@chain[i].token.length)

  evaluate:(context)->
    context.location = @
    v = @expression.evaluate(context)

    if not v?
      0
    else
      for c,i in @chain
        p = @parentObject = v
        c = c.evaluate(context,true) or 0
        v = v[c]
        while not v? and p.class?
          p = p.class
          v = p[c]

        if not v?
          id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}"
          if not context.warnings.using_undefined_variable[id]
            context.warnings.using_undefined_variable[id] =
              file: @token.tokenizer.filename
              line: @token.line
              column: @token.column
              expression: @token.tokenizer.input.substring(@token.start,@chain[i].token.start+@chain[i].token.length)

          return 0

      @childName = c
      @superClass = p.class
      v

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
    @f = Program.BinaryOps[@operation]

  evaluate:(context,hold)->
    context.location = @
    @f(context,@term1,@term2)

class @Program.Negate
  constructor:(@token,@expression)->
    @optimize()

  optimize:()->
    @expression.optimize() if @expression.optimize?
    if @expression.constant?
      value = @expression.constant||0
      @evaluate = ()-> -value

  evaluate:(context)->
    context.location = @
    -(@expression.evaluate(context,true)||0)

class @Program.Not
  constructor:(@token,@expression)->

  evaluate:(context)->
    context.location = @
    if @expression.evaluate(context,true) then 0 else 1

class @Program.Braced
  constructor:(@token,@expression)->

  evaluate:(context,hold)->
    context.location = @
    @expression.evaluate(context,hold)

@Program.SequenceEvaluator = (context,sequence,local,hold)->
  if local?
    local_save = context.local
    context.local = local

  res = 0
  if Date.now()>context.timeout
    throw "Timeout"
  for s,i in sequence
    res = s.evaluate(context,hold and i==sequence.length-1)
    break if context.return
    break if (context.break and context.breakable>0) or (context.continue and context.continuable>0)
    if Date.now()>context.timeout
      throw "Timeout"

  if local?
    context.local = local_save
  res

class @Program.Return
  constructor:(@token,@expression)->
    @no_expression = true

  evaluate:(context)->
    if @expression?
      v = @expression.evaluate(context,true)
    else
      v = 0
    context.return = true
    v

class @Program.Condition
  constructor:(@token,@chain)->

  evaluate:(context,hold)->
    context.location = @
    for c in @chain
      if c.condition.evaluate(context,hold)
        return Program.SequenceEvaluator(context,c.sequence,null,hold)
      else if c.else?
        return Program.SequenceEvaluator(context,c.else,null,hold)
    0

class @Program.For
  constructor:(@token,@iterator,@range_from,@range_to,@range_by,@sequence)->

  evaluate:(context,hold)->
    context.location = @
    context.breakable += 1
    context.continuable += 1
    res = 0
    context.iterations = 0
    if hold
      list = []
    range_from = @range_from.evaluate(context,true)
    range_to = @range_to.evaluate(context,true)

    if @range_by == 0
      range_by = if range_to>range_from then 1 else -1
    else
      range_by = @range_by.evaluate(context,true)
    local = context.local
    for i in [range_from..range_to] by range_by
      local[@iterator] = i
      res = Program.SequenceEvaluator(context,@sequence,null,hold)
      if hold
        list.push res
      if context.return
        list = res
        break
      if context.break
        context.break = false
        break
      else if context.continue
        context.continue = false
      context.iterations++

    context.breakable -= 1
    context.continuable -= 1
    if hold
      list
    else
      res

class @Program.ForIn
  constructor:(@token,@iterator,@list,@sequence)->

  evaluate:(context,hold)->
    context.location = @
    context.breakable += 1
    context.continuable += 1
    res = 0
    context.iterations = 0
    if hold
      list = []

    source = @list.evaluate(context,true)
    local = context.local
    if Array.isArray(source)
      len = source.length
      for i in [0..len-1] by 1
        local[@iterator] = source[i]
        res = Program.SequenceEvaluator(context,@sequence,null,hold)
        if hold
          list.push res
        if context.return
          list = res
          break
        if context.break
          context.break = false
          break
        else if context.continue
          context.continue = false
        context.iterations++
    else if typeof source == "object"
      for i of source
        local[@iterator] = i
        res = Program.SequenceEvaluator(context,@sequence,null,hold)
        if hold
          list.push res
        if context.return
          list = res
          break
        if context.break
          context.break = false
          break
        else if context.continue
          context.continue = false
        context.iterations++
    else
      res = list = 0

    context.breakable -= 1
    context.continuable -= 1
    if hold
      list
    else
      res

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

  evaluate:(context,hold)->
    context.location = @
    context.breakable += 1
    context.continuable += 1
    res = 0
    context.iterations = 0
    if hold
      list = []
    while @condition.evaluate(context,true)
      res = Program.SequenceEvaluator(context,@sequence,null,hold)
      if hold
        list.push res
      if context.return
        list = res
        break
      if context.break
        context.break = false
        break
      else if context.continue
        context.continue = false
      context.iterations++

    context.breakable -= 1
    context.continuable -= 1
    if hold
      list
    else
      res

class @Program.Break
  constructor:(@token)->
    @no_expression = true

  evaluate:(context)->
    context.location = @
    context.break = true
    0

class @Program.Continue
  constructor:(@token)->
    @no_expression = true

  evaluate:(context)->
    context.location = @
    context.continue = true
    0

class @Program.Function
  constructor:(@token,@args,@sequence,end)->
    @source = "function"+@token.tokenizer.input.substring(@token.index,end.index+2)

  evaluate:(context)->
    context.location = @
    #@scope = context.local
    @

  call:(context,argv,hold)->
    local = {}
    for a,i in @args
      local[a.name] = if argv[i]? then argv[i] else (if a.default? then a.default.evaluate(context,true) else 0)

    #local_save = context.local
    #context.local = @scope
    context.stack_size += 1
    if context.stack_size > 100
      throw "Stack overflow"
    res = Program.SequenceEvaluator(context,@sequence,local,hold)
    context.stack_size -= 1
    context.return = false
    #context.local = local_save
    res

class @Program.FunctionCall
  constructor:(@token,@expression,@args)->

  evaluate:(context,hold)->
    context.location = @
    f = @expression.evaluate(context,true)
    if f?
      if typeof f == "function"
        switch @args.length
          when 0
            res = f.call(@expression.parentObject)
          when 1
            res = f.call(@expression.parentObject,@args[0].evaluate(context,true))
          else
            argv = []
            for a in @args
              argv.push a.evaluate(context,true)
            res = f.apply(@expression.parentObject,argv)

        return if res != null then res else 0

      else if f instanceof Program.Function
        argv = []
        for a in @args
          argv.push a.evaluate(context,true)
        object = context.object
        child = context.childName
        superClass = context.superClass
        if @expression.parentObject?
          context.object = @expression.parentObject
          context.childName = @expression.childName
          context.superClass = @expression.superClass
        else if @expression.scope == object
          context.object = object
        else
          context.object = context.global
        res = f.call(context,argv,hold) or 0
        context.object = object
        context.childName = child
        context.superClass = superClass
        return res
      else
        id = "#{@token.tokenizer.filename}-#{@token.line}-#{@token.column}"
        if not context.warnings.invoking_non_function[id]
          context.warnings.invoking_non_function[id] =
            file: @token.tokenizer.filename
            line: @token.line
            column: @token.column
            expression: @token.tokenizer.input.substring(@expression.token.start,@token.start-1)
        return f #non function is a self-returning function
        #throw "Attempt to invoke a non-function"

class @Program.CreateObject
  constructor:(@token,@fields)->

  evaluate:(context)->
    res = {}
    for f in @fields
      res[f.field] = f.value.evaluate(context,true)
    res

class @Program.CreateClass
  constructor:(@token,@ext,@fields)->

  evaluate:(context)->
    res = {}
    for f in @fields
      res[f.field] = f.value.evaluate(context,true)

    if @ext?
      if @ext instanceof Program.Variable
        e = @ext.evaluate(context,true,false)
        res.class = if e then e else @ext.identifier
      else
        res.class = @ext.evaluate(context,true)

    res

@Program.resolveParentClass = (obj,context,token)->
  if obj.class? and typeof obj.class == "string"
    if context.global[obj.class]?
      obj.class = context.global[obj.class]
    else
      id = "classname-#{obj.class}"
      if not context.warnings.using_undefined_variable[id]
        context.warnings.using_undefined_variable[id] =
          file: token.tokenizer.filename
          line: token.line
          column: token.column
          expression: obj.class

  if obj.class?
    Program.resolveParentClass obj.class,context,token

class @Program.NewCall
  constructor:(@token,@expression)->
    if @expression not instanceof Program.FunctionCall
      @expression = new Program.FunctionCall @token,@expression,[]

  evaluate:(context)->
    res = {}
    if @expression instanceof Program.FunctionCall
      context.location = @
      fc = @expression
      f = fc.expression.evaluate(context,true)
      if f?
        if typeof f == "function"
          ## https://stackoverflow.com/a/32548260
          switch @args.length
           when 0
             return new f()
           when 1
             v = @args[0].evaluate(context,true)
             return new f(if v? then v else 0)
           else
             argv = []
             for a in @args
               v = a.evaluate(context,true)
               argv.push if v? then v else 0
             return new f(argv...)

        else
          res.class = f
          Program.resolveParentClass res,context,@token
          argv = []
          for a in fc.args
            argv.push a.evaluate(context,true)
          object = context.object
          child = context.childName
          superClass = context.superClass

          context.object = res
          context.childName = "constructor"

          c = f.constructor
          while not c? and f.data?
            f = f.data
            c = f.constructor
          context.superClass = f.class
          if c? and c instanceof Program.Function
            c.call(context,argv,false)

          context.object = object
          context.childName = child
          context.superClass = superClass
    else
      c = @expression.evaluate(context,true)
      res.class = c

    return res

@Program.BinaryOps =
  "+":(context,a,b)->
    a = a.evaluate(context,true)
    b = b.evaluate(context,true)

    if Array.isArray(a) and Array.isArray(b)
      return a.concat(b)
    else if typeof a == "object" and typeof b == "object"
      res = {}
      for key,value of b
        res[key] = value
      for key,value of a
        res[key] = value
      return res

    (a+b)||0

  "*":(context,a,b)->
    (a.evaluate(context,true)*b.evaluate(context,true))||0

  "-":(context,a,b)->
    (a.evaluate(context,true)-b.evaluate(context,true))||0

  "/":(context,a,b)->
    (a.evaluate(context,true)/b.evaluate(context,true))||0

  "%":(context,a,b)->
    (a.evaluate(context,true)%b.evaluate(context,true))||0

  "^":(context,a,b)->
    (Math.pow(a.evaluate(context,true),b.evaluate(context,true)))||0

  "and":(context,a,b)->
    if a.evaluate(context,true)
      if b.evaluate(context,true) then 1 else 0
    else
      0

  "or":(context,a,b)->
    if a.evaluate(context,true)
      1
    else
      if b.evaluate(context,true) then 1 else 0

  "==":(context,a,b)->
    if `a.evaluate(context,true) == b.evaluate(context,true)` then 1 else 0

  "!=":(context,a,b)->
    if `a.evaluate(context,true) != b.evaluate(context,true)` then 1 else 0

  "<":(context,a,b)->
    if a.evaluate(context,true) < b.evaluate(context,true) then 1 else 0

  ">":(context,a,b)->
    if a.evaluate(context,true) > b.evaluate(context,true) then 1 else 0

  "<=":(context,a,b)->
    if a.evaluate(context,true) <= b.evaluate(context,true) then 1 else 0

  ">=":(context,a,b)->
    if a.evaluate(context,true) >= b.evaluate(context,true) then 1 else 0

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
