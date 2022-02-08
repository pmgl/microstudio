class Compiler
  constructor:(@program)->
    @code_saves = []

    @code = ""
    @code = [@code]

    context =
      local_variables: {}
      temp_variable_count: 0
      tmpcount: 0

    @routine = new Routine()

    @locals = new Locals()

    @count = 0

    for s,i in @program.statements
      @compile s,context
      if i<@program.statements.length-1
        @routine.POP(s)

    @routine.optimize()
    @routine.resolveLabels()
    @count += @routine.opcodes.length
    @routine.locals_size = @locals.index
    console.info(@routine.toString())
    console.info("total length: "+@count)

  compile:(statement,context,retain)->
    if statement instanceof Program.Value
      return @compileValue(statement,context)
    else if statement instanceof Program.Operation
      return @compileOperation(statement,context)
    else if statement instanceof Program.Assignment
      return @compileAssignment(statement,context,retain)
    else if statement instanceof Program.Variable
      return @compileVariable(statement,context)
    else if statement instanceof Program.Function
      return @compileFunction(statement,context)
    else if statement instanceof Program.FunctionCall
      return @compileFunctionCall(statement,context,retain)
    else if statement instanceof Program.While
      return @compileWhile(statement,context,retain)
    if statement instanceof Program.SelfAssignment
      return @compileSelfAssignment(statement,context,retain)
    else if statement instanceof Program.Braced
      return @compileBraced(statement,context,retain)
    else if statement instanceof Program.CreateObject
      return @compileCreateObject(statement,context)
    else if statement instanceof Program.Field
      return @compileField(statement,context)
    else if statement instanceof Program.Negate
      return @compileNegate(statement,context,retain)
    else if statement instanceof Program.For
      return @compileFor(statement,context,retain)
    else if statement instanceof Program.ForIn
      return @compileForIn(statement,context,retain)
    else if statement instanceof Program.Not
      return @compileNot(statement,context,retain)
    else if statement instanceof Program.Return
      return @compileReturn(statement,context)
    else if statement instanceof Program.Condition
      return @compileCondition(statement,context,retain)
    else if statement instanceof Program.Break
      return @compileBreak(statement,context)
    else if statement instanceof Program.Continue
      return @compileContinue(statement,context)
    else if statement instanceof Program.CreateClass
      return @compileCreateClass(statement,context)
    else if statement instanceof Program.NewCall
      return @compileNewCall(statement,context)
    else if true
      console.info statement
      throw "Not implemented"


  compileAssignment:(statement,context,retain)->
    if statement.local
      if statement.field instanceof Program.Variable
        index = @locals.register(statement.field.identifier)
        @compile(statement.expression,context,true)
        @routine.STORE_LOCAL index,statement
      else
        throw "illegal"
    else
      if statement.field instanceof Program.Variable
        if @locals.get(statement.field.identifier)?
          @compile(statement.expression,context,true)
          index = @locals.get(statement.field.identifier)
          @routine.STORE_LOCAL index,statement
          return
        else if statement.expression instanceof Program.CreateClass
          @compileUpdateClass(statement.expression,statement.field.identifier)
        else
          @compile(statement.expression,context,true)
          @routine.STORE_VARIABLE statement.field.identifier,statement
          return
      else
        f = statement.field
        if f.expression instanceof Program.Variable
          if f.expression.identifier == "this"
            @routine.LOAD_THIS f
          else if @locals.get(f.expression.identifier)?
            index = @locals.get(f.expression.identifier)
            @routine.LOAD_LOCAL_OBJECT index,f.expression
          else if f.expression.identifier == "global"
            @routine.LOAD_GLOBAL f
          else
            @routine.LOAD_VARIABLE_OBJECT f.expression.identifier,statement
        else
          @compile f.expression,context,true
          @routine.MAKE_OBJECT statement

        for i in [0..f.chain.length-2] by 1
          @compile f.chain[i],context,true
          @routine.LOAD_PROPERTY_OBJECT f.chain[i]

        @compile f.chain[f.chain.length-1],context,true
        @compile statement.expression,context,true
        @routine.STORE_PROPERTY statement

  compileSelfAssignment:(statement,context,retain)->
    switch statement.operation
      when Token.TYPE_PLUS_EQUALS then op = "+"
      when Token.TYPE_MINUS_EQUALS then op = "-"
      when Token.TYPE_MULTIPLY_EQUALS then op = "*"
      when Token.TYPE_DIVIDE_EQUALS then op = "/"

    if statement.field instanceof Program.Variable
      if @locals.get(statement.field.identifier)?
        @compile(statement.expression,context,true)
        index = @locals.get(statement.field.identifier)

        switch op
          when "+" then @routine.ADD_LOCAL index,statement
          when "-" then @routine.SUB_LOCAL index,statement

        return
      else
        @compile(statement.expression,context,true)

        switch op
          when "+" then @routine.ADD_VARIABLE statement.field.identifier,statement
          when "-" then @routine.SUB_VARIABLE statement.field.identifier,statement

        return
    else
      f = statement.field
      if f.expression instanceof Program.Variable
        if f.expression.identifier == "this"
          @routine.LOAD_THIS f
        else if @locals.get(f.expression.identifier)?
          index = @locals.get(f.expression.identifier)
          @routine.LOAD_LOCAL_OBJECT index,statement
        else if f.expression.identifier == "global"
          @routine.LOAD_GLOBAL f
        else
          @routine.LOAD_VARIABLE_OBJECT f.expression.identifier,statement
      else
        @compile f.expression,context,true
        @routine.MAKE_OBJECT statement

      for i in [0..f.chain.length-2] by 1
        @compile f.chain[i],context,true
        @routine.LOAD_PROPERTY_OBJECT f.chain[i]

      c = f.chain[f.chain.length-1]
      @compile f.chain[f.chain.length-1],context,true
      @compile statement.expression,context,true
      switch op
        when "+" then @routine.ADD_PROPERTY statement
        when "-" then @routine.SUB_PROPERTY statement

  compileOperation:(op,context)->
    if op.operation in ["+","-","*","/","%"]
      @compile(op.term1,context,true)
      @compile(op.term2,context,true)
      switch op.operation
        when "+" then @routine.ADD(op)
        when "-" then @routine.SUB(op)
        when "*" then @routine.MUL(op)
        when "/" then @routine.DIV(op)
        when "%" then @routine.MODULO(op)
      return
    else if op.operation in ["==","!=","<",">","<=",">="]
      @compile(op.term1,context,true)
      @compile(op.term2,context,true)
      switch op.operation
        when "==" then @routine.EQ(op)
        when "!=" then @routine.NEQ(op)
        when "<" then @routine.LT(op)
        when ">" then @routine.GT(op)
        when "<=" then @routine.LTE(op)
        when ">=" then @routine.GTE(op)

      return
    else if op.operation == "and"
      return """((#{@transpile(op.term1,context,true)} && #{@transpile(op.term2,context,true)})? 1 : 0)"""
    else if op.operation == "or"
      return """((#{@transpile(op.term1,context,true)} || #{@transpile(op.term2,context,true)})? 1 : 0)"""
    else if op.operation == "^"
      return """Math.pow(#{@transpile(op.term1,context,true)},#{@transpile(op.term2,context,true)})"""
    else
      return ""

  compileBraced:(expression,context,retain)->
    @compile expression.expression,context,retain
    return

  compileNegate:(expression,context,retain)->
    if expression.expression instanceof Program.Value and expression.expression.type == Program.Value.TYPE_NUMBER
      @routine.LOAD_VALUE -expression.expression.value,expression
    else
      @compile expression.expression,context,true
      @routine.NEGATE expression

  compileNot:(expression,context,retain)->
    @compile expression.expression,context,true
    @routine.NOT expression

  compileValue:(value,context)->
    switch value.type
      when Program.Value.TYPE_NUMBER
        @routine.LOAD_VALUE(value.value,value)
      when Program.Value.TYPE_STRING
        @routine.LOAD_VALUE(value.value,value)
      when Program.Value.TYPE_ARRAY
        @routine.CREATE_ARRAY value
        for i in [0..value.value.length-1] by 1
          @routine.LOAD_VALUE i,value
          @compile(value.value[i],context,true)
          @routine.CREATE_PROPERTY value

    return

  compileVariable:(variable)->
    v = variable.identifier
    if v == "this"
      @routine.LOAD_THIS variable
    else if Compiler.predefined_values[v]?
      @routine.LOAD_VALUE Compiler.predefined_values[v],variable
    else if @locals.get(v)?
      index = @locals.get(v)
      @routine.LOAD_LOCAL index,variable
    else
      @routine.LOAD_VARIABLE v,variable

  compileField:(field)->
    @compile field.expression

    for c in field.chain
      @compile c
      @routine.LOAD_PROPERTY field

    return

  compileFieldParent:(field,context)->
    @compile field.expression
    for i in [0..field.chain.length-2] by 1
      c = field.chain[i]
      @compile c
      @routine.LOAD_PROPERTY field
    return

  compileFunctionCall:(call)->
    if call.expression instanceof Program.Field
      for a,i in call.args
        @compile a

      @compileFieldParent(call.expression)
      @compile call.expression.chain[call.expression.chain.length-1]
      @routine.FUNCTION_APPLY_PROPERTY call.args.length,call
    else if call.expression instanceof Program.Variable
      if Compiler.predefined_unary_functions[call.expression.identifier]?
        funk = Compiler.predefined_unary_functions[call.expression.identifier]
        if call.args.length>0
          @compile call.args[0]
        else
          @routine.LOAD_VALUE 0,call

        @routine[funk] call
      else if Compiler.predefined_binary_functions[call.expression.identifier]?
        funk = Compiler.predefined_binary_functions[call.expression.identifier]
        if call.args.length>0 then @compile call.args[0] else @routine.LOAD_VALUE 0,call
        if call.args.length>1 then @compile call.args[1] else @routine.LOAD_VALUE 0,call

        @routine[funk] call
      else if call.expression.identifier == "super"
        for a,i in call.args
          @compile(a)
        @routine.SUPER_CALL call.args.length,call
      else if @locals.get(call.expression.identifier)?
        for a,i in call.args
          @compile(a)

        index = @locals.get(call.expression.identifier)
        @routine.LOAD_LOCAL index,call
        @routine.FUNCTION_CALL call.args.length,call
      else
        for a,i in call.args
          @compile(a)

        @routine.LOAD_VALUE call.expression.identifier,call
        @routine.FUNCTION_APPLY_VARIABLE call.args.length,call
    else
      for a in call.args
        @compile a

      @compile call.expression
      @routine.FUNCTION_CALL call.args.length,call

  compileFor:(forloop,context,retain)->
    iterator = @locals.register(forloop.iterator)
    @locals.allocate() # range_to
    @locals.allocate() # step

    @compile(forloop.range_from,context,true)
    @routine.STORE_LOCAL iterator,forloop
    @routine.POP forloop
    @compile(forloop.range_to,context,true)
    if forloop.range_by != 0
      @compile(forloop.range_by,context,true)
    else
      @routine.LOAD_VALUE 0,forloop

    for_start = @routine.createLabel "for_start"
    for_continue = @routine.createLabel "for_continue"
    for_end = @routine.createLabel "for_end"

    @routine.FORLOOP_INIT [iterator,for_end],forloop
    @routine.setLabel for_start

    @locals.push()

    save_break = @break_label
    save_continue = @continue_label

    @break_label = for_end
    @continue_label = for_continue

    @compileSequence forloop.sequence,context

    @break_label = save_break
    @continue_label = save_continue

    @routine.setLabel for_continue
    @routine.FORLOOP_CONTROL [iterator,for_start],forloop
    @routine.setLabel for_end

    @locals.pop()

  compileForIn:(forloop,context,retain)->
    iterator = @locals.register(forloop.iterator)
    @locals.allocate() # array
    @locals.allocate() # index

    @compile(forloop.list,context,true)

    for_start = @routine.createLabel "for_start"
    for_continue = @routine.createLabel "for_continue"
    for_end = @routine.createLabel "for_end"

    @routine.FORIN_INIT [iterator,for_end],forloop
    @routine.setLabel for_start

    @locals.push()

    save_break = @break_label
    save_continue = @continue_label

    @break_label = for_end
    @continue_label = for_continue

    @compileSequence forloop.sequence,context

    @break_label = save_break
    @continue_label = save_continue

    @routine.setLabel for_continue
    @routine.FORIN_CONTROL [iterator,for_start],forloop
    @routine.setLabel for_end

    @locals.pop()

  compileSequence:(sequence,context)->
    for i in [0..sequence.length-1] by 1
      if not sequence[i].nopop
        @routine.POP sequence[i]
      @compile(sequence[i],context,true)
    return

  compileWhile:(whiloop,context,retain)->
    @locals.push()
    start = @routine.createLabel "while_start"
    end = @routine.createLabel "while_end"

    @routine.LOAD_VALUE 0,whiloop
    @routine.setLabel start
    @compile whiloop.condition,context,true
    @routine.JUMPN end

    save_break = @break_label
    save_continue = @continue_label

    @break_label = end
    @continue_label = start

    @compileSequence whiloop.sequence,context
    @routine.JUMP start,whiloop

    @break_label = save_break
    @continue_label = save_continue

    @routine.setLabel end
    @locals.pop()

  compileBreak:(statement,context)->
    if @break_label?
      @routine.JUMP @break_label

  compileContinue:(statement,context)->
    if @continue_label?
      @routine.JUMP @continue_label

  compileFunction:(func,context)->
    routine = @routine
    locals = @locals

    @routine = new Routine(func.args.length)
    @locals = new Locals()

    ## TODO: DEFAULT ARG VALUES

    local_index = @locals.index

    for i in [func.args.length-1..0] by -1
      a = func.args[i]
      index = @locals.register(a.name)
      @routine.STORE_LOCAL index,func
      @routine.POP func

    for i in [0..func.sequence.length-1] by 1
      @compile(func.sequence[i],context,true)
      if i<func.sequence.length-1
        @routine.POP func.sequence[i]
      else
        @routine.RETURN func.sequence[i]

    @routine.optimize()
    @routine.resolveLabels()
    @count += @routine.opcodes.length
    r = @routine
    # console.info r.toString()
    @routine.locals_size = locals.index

    @routine = routine
    @locals = locals

    @routine.LOAD_VALUE r,func

  compileReturn:(ret,context)->
    if ret.expression?
      @compile(ret.expression,context,true)
      @routine.RETURN ret
    else
      @routine.LOAD_VALUE 0,ret
      @routine.RETURN ret

  compileCondition:(condition,context,retain)->
    chain = condition.chain
    @routine.LOAD_VALUE 0,condition
    condition_end = @routine.createLabel "condition_end"

    for i in [0..chain.length-1] by 1
      condition_next = @routine.createLabel "condition_next"
      c = chain[i]
      @compile c.condition,context,true
      @routine.JUMPN condition_next
      @compileSequence(c.sequence,context,true)
      @routine.JUMP condition_end,condition
      @routine.setLabel condition_next
      if i==chain.length-1 and c.else?
        @compileSequence(c.else,context,true)

    @routine.setLabel condition_end
    return

  formatField:(field)->
    if field == "constructor" then field = "_constructor"
    field.toString().replace(/"/g,"\\\"")

  compileCreateObject:(statement,context)->
    @routine.CREATE_OBJECT statement
    for f in statement.fields
      @routine.LOAD_VALUE f.field,statement
      @compile(f.value,context,true)
      @routine.CREATE_PROPERTY statement

    return

  compileCreateClass:(statement,context)->
    if statement.ext?
      @compile statement.ext,context,true
    else
      @routine.LOAD_VALUE 0,statement

    variable = if statement.ext? and statement.ext instanceof Program.Variable then statement.ext.identifier else 0
    @routine.CREATE_CLASS variable,statement
    for f in statement.fields
      @routine.LOAD_VALUE f.field,statement
      @compile(f.value,context,true)
      @routine.CREATE_PROPERTY statement

    return

  compileUpdateClass:(statement,variable)->
    @compileCreateClass(statement)
    @routine.UPDATE_CLASS variable,statement

  compileNewCall:(statement)->
    call = statement.expression
    @routine.LOAD_VALUE 0,statement # reserve spot on stack for the class instance
    for a,i in call.args
      @compile(a)

    @compile call.expression
    @routine.NEW_CALL call.args.length,statement
    @routine.POP statement # pop return value of class constructor

  exec:(context)->
    @processor = new Processor()
    @processor.load @routine
    @processor.run(context)

  @predefined_unary_functions =
    "round": "ROUND"
    "floor": "FLOOR"
    "ceil": "CEIL"
    "abs": "ABS"

    "sqrt": Math.sqrt

    "sin": "SIN"
    "cos": "COS"
    "tan": "TAN"
    "acos": "ACOS"
    "asin": "ASIN"
    "atan": "ATAN"

    "sind": "SIND"
    "cosd": "COSD"
    "tand": "TAND"
    "asind": "ASIND"
    "acosd": "ACOSD"
    "atand": "ATAND"

    "log": "LOG"
    "exp": "EXP"

  @predefined_binary_functions =
    "min": "MIN"
    "max": "MAX"
    "pow": "POW"
    "atan2": "ATAND"
    "atan2d": "ATAN2D"

  @predefined_values =
    PI: Math.PI
    true: 1
    false: 0

# meta.global
# meta.print
    # meta.round = (x)->Math.round(x)
    # meta.floor = (x)->Math.floor(x)
    # meta.ceil = (x)->Math.ceil(x)
    # meta.abs = (x)->Math.abs(x)
    #
    # meta.min = (x,y)->Math.min(x,y)
    # meta.max = (x,y)->Math.max(x,y)
    #
    # meta.sqrt = (x)->Math.sqrt(x)
    # meta.pow = (x,y)->Math.pow(x,y)
    #
    # meta.sin = (x)->Math.sin(x)
    # meta.cos = (x)->Math.cos(x)
    # meta.tan = (x)->Math.tan(x)
    # meta.acos = (x)->Math.acos(x)
    # meta.asin = (x)->Math.asin(x)
    # meta.atan = (x)->Math.atan(x)
    # meta.atan2 = (y,x)->Math.atan2(y,x)
    #
    # meta.sind = (x)->Math.sin(x/180*Math.PI)
    # meta.cosd = (x)->Math.cos(x/180*Math.PI)
    # meta.tand = (x)->Math.tan(x/180*Math.PI)
    # meta.acosd = (x)->Math.acos(x)*180/Math.PI
    # meta.asind = (x)->Math.asin(x)*180/Math.PI
    # meta.atand = (x)->Math.atan(x)*180/Math.PI
    # meta.atan2d = (y,x)->Math.atan2(y,x)*180/Math.PI
    #
    # meta.log = (x)->Math.log(x)
    # meta.exp = (x)->Math.exp(x)
    #
    # meta.random = new Random(0)
    #
    # meta.PI = Math.PI
    # meta.true = 1
    # meta.false = 0


class @Locals
  constructor:()->
    @layers = []
    @index = 0
    @push()

  push:()->
    @layers.push new LocalLayer @

  pop:()->
    @index = @layers[@layers.length-1].start_index
    @layers.splice(@layers.length-1,1)

  register:(name)->
    @layers[@layers.length-1].register(name)

  allocate:()->
    @layers[@layers.length-1].allocate()

  get:(name)->
    for i in [@layers.length-1..0] by -1
      v = @layers[i].get(name)
      if v?
        return v

    return null

class LocalLayer
  constructor:(@locals)->
    @start_index = @locals.index
    @registered = {}

  register:(name)->
    @registered[name] = @locals.index++

  allocate:()->
    @locals.index++

  get:(name)->
    if @registered[name]?
      return @registered[name]
    else
      return null
