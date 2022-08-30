class Compiler
  constructor:(@program)->
    @code_saves = []

    @code = ""
    @code = [@code]

    @routine = new Routine()

    @locals = new Locals @

    @count = 0

    for s,i in @program.statements
      @compile s
      if i<@program.statements.length-1
        @routine.POP(s)

    @routine.optimize()
    @routine.resolveLabels()
    @count += @routine.opcodes.length
    @routine.locals_size = @locals.max_index
    # console.info(@routine.toString())
    # console.info("total length: "+@count)

  compile:(statement)->
    if statement instanceof Program.Value
      return @compileValue(statement)
    else if statement instanceof Program.Operation
      return @compileOperation(statement)
    else if statement instanceof Program.Assignment
      return @compileAssignment(statement)
    else if statement instanceof Program.Variable
      return @compileVariable(statement)
    else if statement instanceof Program.Function
      return @compileFunction(statement)
    else if statement instanceof Program.FunctionCall
      return @compileFunctionCall(statement)
    else if statement instanceof Program.While
      return @compileWhile(statement)
    if statement instanceof Program.SelfAssignment
      return @compileSelfAssignment(statement)
    else if statement instanceof Program.Braced
      return @compileBraced(statement)
    else if statement instanceof Program.CreateObject
      return @compileCreateObject(statement)
    else if statement instanceof Program.Field
      return @compileField(statement)
    else if statement instanceof Program.Negate
      return @compileNegate(statement)
    else if statement instanceof Program.For
      return @compileFor(statement)
    else if statement instanceof Program.ForIn
      return @compileForIn(statement)
    else if statement instanceof Program.Not
      return @compileNot(statement)
    else if statement instanceof Program.Return
      return @compileReturn(statement)
    else if statement instanceof Program.Condition
      return @compileCondition(statement)
    else if statement instanceof Program.Break
      return @compileBreak(statement)
    else if statement instanceof Program.Continue
      return @compileContinue(statement)
    else if statement instanceof Program.CreateClass
      return @compileCreateClass(statement)
    else if statement instanceof Program.NewCall
      return @compileNewCall(statement)
    else if statement instanceof Program.After
      return @compileAfter(statement)
    else if statement instanceof Program.Every
      return @compileEvery(statement)
    else if statement instanceof Program.Do
      return @compileDo(statement)
    else if statement instanceof Program.Sleep
      return @compileSleep(statement)
    else if true
      console.info statement
      throw "Not implemented"


  compileAssignment:(statement)->
    if statement.local
      if statement.field instanceof Program.Variable
        if statement.expression instanceof Program.Function
          index = @locals.register(statement.field.identifier) ## register function locally first
          @compile(statement.expression) ## then compile function which may refer to itself
          @routine.arg1[@routine.arg1.length-1].import_self = index
          @routine.STORE_LOCAL index,statement
        else if statement.expression instanceof Program.After or
                  statement.expression instanceof Program.Do or
                  statement.expression instanceof Program.Every
          index = @locals.register(statement.field.identifier) ## register thread locally first
          arg_index = @routine.arg1.length ## thread main routine will land here
          @compile(statement.expression) ## then compile function which may refer to itself
          @routine.arg1[arg_index].import_self = index
          @routine.STORE_LOCAL index,statement
        else
          @compile(statement.expression) ## first compile expression which may refer to another local with same name
          index = @locals.register(statement.field.identifier) ## then register a local for that name
          @routine.STORE_LOCAL index,statement
      else
        throw "illegal"
    else
      if statement.field instanceof Program.Variable
        if @locals.get(statement.field.identifier)?
          @compile(statement.expression)
          index = @locals.get(statement.field.identifier)
          @routine.STORE_LOCAL index,statement
          return
        else if statement.expression instanceof Program.CreateClass
          @compileUpdateClass(statement.expression,statement.field.identifier)
        else
          @compile(statement.expression)
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
          @compile f.expression
          @routine.MAKE_OBJECT statement

        for i in [0..f.chain.length-2] by 1
          @compile f.chain[i]
          @routine.LOAD_PROPERTY_OBJECT f.chain[i]

        @compile f.chain[f.chain.length-1]
        @compile statement.expression
        @routine.STORE_PROPERTY statement

  compileSelfAssignment:(statement)->
    switch statement.operation
      when Token.TYPE_PLUS_EQUALS then op = "ADD"
      when Token.TYPE_MINUS_EQUALS then op = "SUB"
      when Token.TYPE_MULTIPLY_EQUALS then op = "MUL"
      when Token.TYPE_DIVIDE_EQUALS then op = "DIV"
      when Token.TYPE_MODULO_EQUALS then op = "MODULO"
      when Token.TYPE_AND_EQUALS then op = "BINARY_AND"
      when Token.TYPE_OR_EQUALS then op = "BINARY_OR"

    if statement.field instanceof Program.Variable
      if @locals.get(statement.field.identifier)?
        index = @locals.get(statement.field.identifier)
        @routine.LOAD_LOCAL index,statement
        @compile(statement.expression)
        @routine[op] statement,1
        @routine.STORE_LOCAL index,statement
        return
      else
        @routine.LOAD_VARIABLE statement.field.identifier,statement
        @compile(statement.expression)
        @routine[op] statement,1
        @routine.STORE_VARIABLE statement.field.identifier,statement
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
        @compile f.expression
        @routine.MAKE_OBJECT statement

      for i in [0..f.chain.length-2] by 1
        @compile f.chain[i]
        @routine.LOAD_PROPERTY_OBJECT f.chain[i]

      c = f.chain[f.chain.length-1]
      @compile f.chain[f.chain.length-1]
      @routine.LOAD_PROPERTY_ATOP statement
      @compile statement.expression
      @routine[op] statement,1
      @routine.STORE_PROPERTY statement

  compileOperation:(op)->
    if op.operation in ["+","-","*","/","%","&","|","<<",">>"]
      @compile(op.term1)
      @compile(op.term2)
      switch op.operation
        when "+" then @routine.ADD(op)
        when "-" then @routine.SUB(op)
        when "*" then @routine.MUL(op)
        when "/" then @routine.DIV(op)
        when "%" then @routine.MODULO(op)
        when "&" then @routine.BINARY_AND(op)
        when "|" then @routine.BINARY_OR(op)
        when "<<" then @routine.SHIFT_LEFT(op)
        when ">>" then @routine.SHIFT_RIGHT(op)
      return
    else if op.operation in ["==","!=","<",">","<=",">="]
      @compile(op.term1)
      @compile(op.term2)
      switch op.operation
        when "==" then @routine.EQ(op)
        when "!=" then @routine.NEQ(op)
        when "<" then @routine.LT(op)
        when ">" then @routine.GT(op)
        when "<=" then @routine.LTE(op)
        when ">=" then @routine.GTE(op)

      return
    else if op.operation == "and"
      jump = @routine.createLabel "and"
      @compile op.term1
      @routine.JUMPN_NOPOP jump,op
      @routine.POP op
      @compile op.term2
      @routine.setLabel jump
    else if op.operation == "or"
      jump = @routine.createLabel "or"
      @compile op.term1
      @routine.JUMPY_NOPOP jump,op
      @routine.POP op
      @compile op.term2
      @routine.setLabel jump
    else if op.operation == "^"
      @compile op.term1
      @compile op.term2
      @routine.BINARY_OP Compiler.predefined_binary_functions.pow, op
    else
      return ""

  compileBraced:(expression)->
    @compile expression.expression
    return

  compileNegate:(expression)->
    if expression.expression instanceof Program.Value and expression.expression.type == Program.Value.TYPE_NUMBER
      @routine.LOAD_VALUE -expression.expression.value,expression
    else
      @compile expression.expression
      @routine.NEGATE expression

  compileNot:(expression)->
    @compile expression.expression
    @routine.NOT expression

  compileValue:(value)->
    switch value.type
      when Program.Value.TYPE_NUMBER
        @routine.LOAD_VALUE(value.value,value)
      when Program.Value.TYPE_STRING
        @routine.LOAD_VALUE(value.value,value)
      when Program.Value.TYPE_ARRAY
        @routine.CREATE_ARRAY value
        for i in [0..value.value.length-1] by 1
          @routine.LOAD_VALUE i,value
          @compile(value.value[i])
          @routine.CREATE_PROPERTY value

    return

  compileVariable:(variable)->
    v = variable.identifier
    if v == "this"
      @routine.LOAD_THIS variable
    else if v == "global"
      @routine.LOAD_GLOBAL variable
    else if Compiler.predefined_values[v]?
      @routine.LOAD_VALUE Compiler.predefined_values[v],variable
    else if @locals.get(v)?
      index = @locals.get(v)
      @routine.LOAD_LOCAL index,variable
    else
      @routine.LOAD_VARIABLE v,variable

  compileField:(field)->
    c = field.chain[field.chain.length-1]
    if c instanceof Program.Value and c.value == "type"
      if field.chain.length == 1
        if field.expression instanceof Program.Variable # variable.type
          id = field.expression.identifier
          if @locals.get(id)?
            index = @locals.get(id)
            @routine.LOAD_LOCAL index,field
            @routine.TYPE field
          else if Compiler.predefined_values[id]?
            @routine.LOAD_VALUE "number",field
          else if Compiler.predefined_unary_functions[id]? or Compiler.predefined_binary_functions[id]
            @routine.LOAD_VALUE "function",field
          else
            @routine.VARIABLE_TYPE id, field.expression
          return
        else
          @compile field.expression
          @routine.TYPE field
          return
      else
        @compile field.expression
        for i in [0..field.chain.length-3] by 1
          @compile field.chain[i]
          @routine.LOAD_PROPERTY field

        @compile field.chain[field.chain.length-2]
        @routine.PROPERTY_TYPE field.expression
        return
    else
      @compile field.expression

      for c in field.chain
        @compile c
        @routine.LOAD_PROPERTY field

      return

  compileFieldParent:(field)->
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

        @routine.UNARY_OP funk,call
      else if Compiler.predefined_binary_functions[call.expression.identifier]?
        funk = Compiler.predefined_binary_functions[call.expression.identifier]
        if call.args.length>0 then @compile call.args[0] else @routine.LOAD_VALUE 0,call
        if call.args.length>1 then @compile call.args[1] else @routine.LOAD_VALUE 0,call

        @routine.BINARY_OP funk,call
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

  compileFor:(forloop)->
    iterator = @locals.register(forloop.iterator)
    @locals.allocate() # range_to
    @locals.allocate() # step

    @compile(forloop.range_from)
    @routine.STORE_LOCAL iterator,forloop
    @routine.POP forloop
    @compile(forloop.range_to)
    if forloop.range_by != 0
      @compile(forloop.range_by)
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

    @compileSequence forloop.sequence

    @break_label = save_break
    @continue_label = save_continue

    @routine.setLabel for_continue
    @routine.FORLOOP_CONTROL [iterator,for_start],forloop
    @routine.setLabel for_end

    @locals.pop()

  compileForIn:(forloop)->
    iterator = @locals.register(forloop.iterator)
    @locals.allocate() # array
    @locals.allocate() # index

    @compile(forloop.list)

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

    @compileSequence forloop.sequence

    @break_label = save_break
    @continue_label = save_continue

    @routine.setLabel for_continue
    @routine.FORIN_CONTROL [iterator,for_start],forloop
    @routine.setLabel for_end

    @locals.pop()

  compileSequence:(sequence)->
    for i in [0..sequence.length-1] by 1
      if not sequence[i].nopop
        @routine.POP sequence[i]
      @compile(sequence[i])
    return

  compileWhile:(whiloop)->
    @locals.push()
    start = @routine.createLabel "while_start"
    end = @routine.createLabel "while_end"

    @routine.LOAD_VALUE 0,whiloop
    @routine.setLabel start
    @compile whiloop.condition
    @routine.JUMPN end

    save_break = @break_label
    save_continue = @continue_label

    @break_label = end
    @continue_label = start

    @compileSequence whiloop.sequence
    @routine.JUMP start,whiloop

    @break_label = save_break
    @continue_label = save_continue

    @routine.setLabel end
    @locals.pop()

  compileBreak:(statement)->
    if @break_label?
      @routine.JUMP @break_label

  compileContinue:(statement)->
    if @continue_label?
      @routine.JUMP @continue_label

  compileFunction:(func)->
    r = @compileFunctionBody(func)
    @routine.LOAD_ROUTINE r,func

  compileFunctionBody:(func)->
    routine = @routine
    locals = @locals

    @routine = new Routine(if func.args? then func.args.length else 0)
    @locals = new Locals @,locals

    local_index = @locals.index

    if func.args?
      for i in [func.args.length-1..0] by -1
        a = func.args[i]
        index = @locals.register(a.name)
        @routine.STORE_LOCAL index,func
        @routine.POP func

      for i in [0..func.args.length-1] by 1
        a = func.args[i]
        if a.default?
          index = @locals.get(a.name)
          label = @routine.createLabel "default_arg"
          @routine.LOAD_LOCAL index,func
          @routine.JUMPY label,func
          @compile a.default
          @routine.STORE_LOCAL index,func
          @routine.POP func
          @routine.setLabel label

    if func.sequence.length > 0
      for i in [0..func.sequence.length-1] by 1
        @compile(func.sequence[i])
        if i < func.sequence.length-1
          @routine.POP func.sequence[i]
        else
          @routine.RETURN func.sequence[i]
    else
      @routine.LOAD_VALUE 0,func
      @routine.RETURN func

    index = 0
    for i in @locals.imports
      @routine.OP_INSERT OPCODES.LOAD_IMPORT,func,index,index*3
      @routine.OP_INSERT OPCODES.STORE_LOCAL,func,i.index,index*3+1
      @routine.OP_INSERT OPCODES.POP,func,0,index*3+2
      @routine.import_refs.push i.source
      index += 1

    @routine.optimize()
    @routine.resolveLabels()
    @count += @routine.opcodes.length
    r = @routine
    # console.info r.toString()
    @routine.locals_size = @locals.max_index


    @routine = routine
    @locals = locals
    r

  compileReturn:(ret)->
    if ret.expression?
      @compile(ret.expression)
      @routine.RETURN ret
    else
      @routine.LOAD_VALUE 0,ret
      @routine.RETURN ret

  compileCondition:(condition)->
    chain = condition.chain
    @routine.LOAD_VALUE 0,condition
    condition_end = @routine.createLabel "condition_end"

    for i in [0..chain.length-1] by 1
      condition_next = @routine.createLabel "condition_next"
      c = chain[i]
      @compile c.condition
      @routine.JUMPN condition_next
      @locals.push()
      @compileSequence(c.sequence)
      @locals.pop()
      @routine.JUMP condition_end,condition
      @routine.setLabel condition_next
      if i==chain.length-1 and c.else?
        @locals.push()
        @compileSequence(c.else)
        @locals.pop()

    @routine.setLabel condition_end
    return

  formatField:(field)->
    if field == "constructor" then field = "_constructor"
    field.toString().replace(/"/g,"\\\"")

  compileCreateObject:(statement)->
    @routine.CREATE_OBJECT statement
    for f in statement.fields
      @routine.LOAD_VALUE f.field,statement
      @compile(f.value)
      @routine.CREATE_PROPERTY statement

    return

  compileCreateClass:(statement)->
    if statement.ext?
      statement.ext.nowarning = true
      @compile statement.ext
    else
      @routine.LOAD_VALUE 0,statement

    variable = if statement.ext? and statement.ext instanceof Program.Variable then statement.ext.identifier else 0
    @routine.CREATE_CLASS variable,statement
    for f in statement.fields
      @routine.LOAD_VALUE f.field,statement
      @compile(f.value)
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

  compileAfter:(after)->
    r = @compileFunctionBody(after)
    @routine.LOAD_ROUTINE r,after
    @compile after.delay
    if after.multiplier? and after.multiplier != 1
      @routine.LOAD_VALUE after.multiplier,after
      @routine.MUL after
    @routine.AFTER after

  compileEvery:(every)->
    r = @compileFunctionBody(every)
    @routine.LOAD_ROUTINE r,every
    @compile every.delay
    if every.multiplier? and every.multiplier != 1
      @routine.LOAD_VALUE every.multiplier,every
      @routine.MUL every
    @routine.EVERY every

  compileDo:(dostuff)->
    r = @compileFunctionBody(dostuff)
    @routine.LOAD_ROUTINE r,dostuff
    @routine.DO dostuff

  compileSleep:(sleep)->
    @compile sleep.delay
    if sleep.multiplier? and sleep.multiplier != 1
      @routine.LOAD_VALUE sleep.multiplier,sleep
      @routine.MUL sleep
    @routine.SLEEP sleep

  exec:(context)->
    @processor = new Processor()
    @processor.load @routine
    @processor.run(context)

  @predefined_unary_functions =
    "round": Math.round
    "floor": Math.floor
    "ceil": Math.ceil
    "abs": Math.abs

    "sqrt": Math.sqrt

    "sin": Math.sin
    "cos": Math.cos
    "tan": Math.tan
    "acos": Math.acos
    "asin": Math.asin
    "atan": Math.atan

    "sind": (x)->Math.sin(x*Math.PI/180)
    "cosd": (x)->Math.cos(x*Math.PI/180)
    "tand": (x)->Math.tan(x*Math.PI/180)
    "asind": (x)->Math.asin(x)/Math.PI*180
    "acosd": (x)->Math.acos(x)/Math.PI*180
    "atand": (x)->Math.atan(x)/Math.PI*180

    "log": Math.log
    "exp": Math.exp

  @predefined_binary_functions =
    "min": Math.min
    "max": Math.max
    "pow": Math.pow
    "atan2": Math.atan2
    "atan2d": (y,x)->Math.atan2(y,x)/Math.PI*180

  @predefined_values =
    PI: Math.PI
    true: 1
    false: 0

# meta.global
# meta.print

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
  constructor:(@compiler,@parent = null)->
    @layers = []
    @index = 0
    @max_index = 0
    @push()
    @imports = []

  increment:()->
    spot = @index++
    @max_index = Math.max(@index,@max_index)
    spot

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

    if @parent?
      v = @parent.get name
      if v?
        index = @register name
        @imports.push
          name: name
          index: index
          source: v
        return index

    return null

class LocalLayer
  constructor:(@locals)->
    @start_index = @locals.index
    @registered = {}

  register:(name)->
    @registered[name] = @locals.increment()

  allocate:()->
    @locals.increment()

  get:(name)->
    if @registered[name]?
      return @registered[name]
    else
      return null
