class Transpiler
  @MIN_SEGMENT = 2   
  @debug = false     
  @stats =           
    segments: 0
    ops: 0

  constructor:()->

  transpile:(r)->
    i = 0
    while i < r.opcodes.length
      if @transpilable(r.opcodes[i],r.arg1[i])
        j = i+1
        while j < r.opcodes.length and r.removeable(j) and @transpilable(r.opcodes[j],r.arg1[j])
          j += 1
        j -= 1
        if j-i+1 >= Transpiler.MIN_SEGMENT
          @transpileSegment(r,i,j)
      i += 1
    return

  transpilable:(opcode,arg)->
    TranspilerSegment.emitters[OPCODES[opcode]]?

  transpileSegment:(r,i,j)->
    segment = new TranspilerSegment(r,i,j)
    try
      f = segment.build()
    catch err
      console.error "Transpiler: segment build failed"
      console.error err
      return

    console.info segment.source if Transpiler.debug

    Transpiler.stats.segments += 1
    Transpiler.stats.ops += j-i+1

    r.opcodes[i] = OPCODES.COMPILED
    r.arg1[i] = f
    for k in [i+1..j] by 1
      r.remove(i+1)
    return

class TranspilerSegment
  constructor:(@routine,@start,@end)->
    @code = []
    @vcount = 0
    @sym = []
    @floor = 0
    @origin = {}
    @local_cache = {}
    @consts = []
    @refs = []
    @numeric = {}

  build:()->
    for k in [@start..@end] by 1
      @k = k-@start
      @refs.push @routine.ref[k]
      name = OPCODES[@routine.opcodes[k]]
      @code.push "// #{name}"
      TranspilerSegment.emitters[name].call(@,@routine.arg1[k])

    for e,idx in @sym
      offset = idx-@floor+1
      continue if @origin[e]? and @origin[e] == offset
      @code.push "#{@slot(offset)} = #{e} ;"

    delta = @sym.length-@floor
    if delta != 0
      @code.push "return stack_index+(#{delta}) ;"
    else
      @code.push "return stack_index ;"

    @source = "return function compiled_segment(stack,stack_index,locals,locals_offset,object,global,context,processor,routine) {\n#{@code.join("\n")}\n} ;"
    factory = new Function("H","A","R",@source)
    factory(Transpiler.helpers,@consts,@refs)

  slot:(offset)->
    if offset == 0 then "stack[stack_index]"
    else if offset < 0 then "stack[stack_index-#{-offset}]"
    else "stack[stack_index+#{offset}]"

  temp:(expr)->
    v = "v#{@vcount++}"
    @code.push "let #{v} = #{expr} ;"
    v

  emit:(line)-> @code.push line

  push:(e)-> @sym.push e

  pop:()->
    if @sym.length > 0
      @sym.pop()
    else
      offset = -@floor
      @floor += 1
      v = @temp @slot(offset)
      @origin[v] = offset
      v

  drop:()->
    if @sym.length > 0
      @sym.pop()
    else
      @floor += 1
    return

  ref:()-> "R[#{@k}]"

  constant:(value)->
    if typeof value == "number"
      if Object.is(value,-0)
        "(-0)"
      else if Number.isFinite(value)
        e = if value < 0 then "(#{value})" else "#{value}"
        @numeric[e] = true
        e
      else
        @constRef value
    else if typeof value == "string"
      JSON.stringify value
    else
      @constRef value

  constRef:(value)->
    @consts.push value
    "A[#{@consts.length-1}]"

  localSlot:(index)-> "locals[locals_offset+#{index}]"

  isNum:(e)-> @numeric[e] == true

  pushNum:(e)->
    @numeric[e] = true
    @push e

  @emitters =
    LOAD_VALUE:(arg)-> @push @constant(arg)

    LOAD_THIS:()-> @push "object"

    LOAD_GLOBAL:()-> @push "global"

    LOAD_IMPORT:(arg)-> @push @temp("routine.import_values[#{arg}]")

    LOAD_LOCAL:(arg)->
      if @local_cache[arg]?
        @push @local_cache[arg]
      else
        v = @temp @localSlot(arg)
        @local_cache[arg] = v
        @push v

    STORE_LOCAL:(arg)->
      v = @pop()
      @emit "#{@localSlot(arg)} = #{v} ;"
      @local_cache[arg] = v
      @push v

    POP:()-> @drop()

Transpiler.helpers = {}

E = TranspilerSegment.emitters

TranspilerSegment::result = ()-> "v#{@vcount++}"

E.ADD = (arg)->
  b = @pop()
  a = @pop()
  r = @result()
  if @isNum(a)
    if @isNum(b)
      @emit "let #{r} = #{a} + #{b} ; if (!isFinite(#{r})) #{r} = 0 ;"
      return @pushNum r
    else
      @emit "let #{r} = #{a} + #{b} ; if (!(isFinite(#{r}) || typeof #{b} == \"string\")) #{r} = 0 ;"
      return @push r
  @emit "let #{r} ; if (typeof #{a} == \"number\") { #{r} = #{a} + #{b} ; if (!(isFinite(#{r}) || typeof #{b} == \"string\")) #{r} = 0 ; } else #{r} = processor.add(context,#{a},#{b},#{@constant(arg)}) ;"
  @push r

E.SUB = (arg)->
  b = @pop()
  a = @pop()
  r = @result()
  if @isNum(a)
    @emit "let #{r} = #{a} - #{b} ; if (!isFinite(#{r})) #{r} = 0 ;"
    return @pushNum r
  @emit "let #{r} ; if (typeof #{a} == \"number\") { #{r} = #{a} - #{b} ; if (!isFinite(#{r})) #{r} = 0 ; } else #{r} = processor.sub(context,#{a},#{b},#{@constant(arg)}) ;"
  @push r

numericOp = (op,slow)->
  (arg)->
    b = @pop()
    a = @pop()
    r = @result()
    if @isNum(a)
      @emit "let #{r} = #{a} #{op} #{b} ; if (!isFinite(#{r})) #{r} = 0 ;"
      return @pushNum r
    @emit "let #{r} ; if (typeof #{a} == \"number\") { #{r} = #{a} #{op} #{b} ; if (!isFinite(#{r})) #{r} = 0 ; } else #{r} = processor.#{slow}(context,#{a},#{b}) ;"
    @push r

E.MUL = numericOp("*","mul")
E.DIV = numericOp("/","div")
E.BINARY_AND = numericOp("&","band")
E.BINARY_OR = numericOp("|","bor")

E.MODULO = ()->
  b = @pop()
  a = @pop()
  r = @result()
  if @isNum(a) and @isNum(b)
    @emit "let #{r} = #{a} % #{b} ; if (!isFinite(#{r})) #{r} = 0 ;"
    return @pushNum r
  @emit "let #{r} ; if (typeof #{a} == \"number\" && typeof #{b} == \"number\") { #{r} = #{a} % #{b} ; if (!isFinite(#{r})) #{r} = 0 ; } else #{r} = processor.modulo(context,#{a},#{b}) ;"
  @push r

shiftOp = (op)->
  ()->
    b = @pop()
    a = @pop()
    @pushNum @temp("#{a} #{op} #{b}")

E.SHIFT_LEFT = shiftOp("<<")
E.SHIFT_RIGHT = shiftOp(">>")

E.NEGATE = ()->
  a = @pop()
  r = @result()
  if @isNum(a)
    @emit "let #{r} = -#{a} ;"
    return @pushNum r
  @emit "let #{r} ; if (typeof #{a} == \"number\") #{r} = -#{a} ; else #{r} = processor.negate(context,#{a}) ;"
  @push r

E.EQ = ()->
  b = @pop()
  a = @pop()
  @pushNum @temp("(#{b} === #{a}) ? 1 : 0")

E.NEQ = ()->
  b = @pop()
  a = @pop()
  @pushNum @temp("(#{b} !== #{a}) ? 1 : 0")

compareOp = (op)->
  ()->
    b = @pop()
    a = @pop()
    @pushNum @temp("(#{a} #{op} #{b}) ? 1 : 0")

E.LT = compareOp("<")
E.GT = compareOp(">")
E.LTE = compareOp("<=")
E.GTE = compareOp(">=")

E.NOT = ()->
  a = @pop()
  @pushNum @temp("#{a} ? 0 : 1")

H = Transpiler.helpers

H.loadVariable = (object,global,name,ref,context)->
  v = object[name]
  if not v? and object.class?
    obj = object
    while not v? and obj.class?
      obj = obj.class
      v = obj[name]

  if not v? then v = global[name]

  if not v? and not ref.nowarning
    token = ref.token
    id = token.tokenizer.filename+"-"+token.line+"-"+token.column
    if not context.warnings.using_undefined_variable[id]
      context.warnings.using_undefined_variable[id] =
        file: token.tokenizer.filename
        line: token.line
        column: token.column
        expression: name

  if v? then v else 0

H.loadLocalObject = (locals,index,ref,context)->
  o = locals[index] = {}

  token = ref.token
  id = token.tokenizer.filename+"-"+token.line+"-"+token.column
  if not context.warnings.assigning_field_to_undefined[id]
    context.warnings.assigning_field_to_undefined[id] =
      file: token.tokenizer.filename
      line: token.line
      column: token.column
      expression: token.value
  o

H.loadVariableObject = (object,global,name,ref,context)->
  obj = object
  v = obj[name]
  while not v? and obj.class?
    obj = obj.class
    v = obj[name]

  if not v? and global[name]?
    obj = global
    v = global[name]

  if not v? or typeof v != "object"
    v = obj[name] = {}
    token = ref.token
    id = token.tokenizer.filename+"-"+token.line+"-"+token.column
    if not context.warnings.assigning_field_to_undefined[id]
      context.warnings.assigning_field_to_undefined[id] =
        file: token.tokenizer.filename
        line: token.line
        column: token.column
        expression: name
  v

H.loadProperty = (obj,name,ref,context)->
  v = obj[name]
  while not v? and obj.class?
    obj = obj.class
    v = obj[name]

  if not v?
    v = 0
    if not ref.nowarning
      ref.nowarning = true
      if not Array.isArray(obj)
        token = ref.token
        id = token.tokenizer.filename+"-"+token.line+"-"+token.column
        context.warnings.using_undefined_variable[id] =
          file: token.tokenizer.filename
          line: token.line
          column: token.column
          expression: name
  v

H.loadPropertyObject = (obj,name,ref,context)->
  v = obj[name] = {}

  token = ref.token
  id = token.tokenizer.filename+"-"+token.line+"-"+token.column
  if not context.warnings.assigning_field_to_undefined[id]
    context.warnings.assigning_field_to_undefined[id] =
      file: token.tokenizer.filename
      line: token.line
      column: token.column
      expression: name
  v

E.LOAD_VARIABLE = (arg)->
  name = @constant(arg)
  v = @temp "object[#{name}]"
  @emit "if (#{v} == null) #{v} = H.loadVariable(object,global,#{name},#{@ref()},context) ;"
  @push v

E.STORE_VARIABLE = (arg)->
  v = @pop()
  @emit "object[#{@constant(arg)}] = #{v} ;"
  @push v

E.LOAD_VARIABLE_OBJECT = (arg)->
  name = @constant(arg)
  v = @temp "object[#{name}]"
  @emit "if (#{v} == null || typeof #{v} != \"object\") #{v} = H.loadVariableObject(object,global,#{name},#{@ref()},context) ;"
  @push v

E.LOAD_LOCAL_OBJECT = (arg)->
  source = if @local_cache[arg]? then @local_cache[arg] else @localSlot(arg)
  v = @temp source
  @emit "if (typeof #{v} != \"object\") #{v} = H.loadLocalObject(locals,locals_offset+#{arg},#{@ref()},context) ;"
  @local_cache[arg] = v
  @push v

E.LOAD_PROPERTY = ()->
  name = @pop()
  obj = @pop()
  v = @temp "#{obj}[#{name}]"
  @emit "if (#{v} == null) #{v} = H.loadProperty(#{obj},#{name},#{@ref()},context) ;"
  @push v

E.LOAD_PROPERTY_ATOP = ()->
  name = @pop()
  obj = @pop()
  v = @temp "#{obj}[#{name}]"
  @emit "if (#{v} == null) #{v} = H.loadProperty(#{obj},#{name},#{@ref()},context) ;"
  @push obj
  @push name
  @push v

E.LOAD_PROPERTY_OBJECT = ()->
  name = @pop()
  obj = @pop()
  v = @temp "#{obj}[#{name}]"
  @emit "if (typeof #{v} != \"object\") #{v} = H.loadPropertyObject(#{obj},#{name},#{@ref()},context) ;"
  @push v

E.STORE_PROPERTY = ()->
  v = @pop()
  name = @pop()
  obj = @pop()
  @emit "#{obj}[#{name}] = #{v} ;"
  @push v



H.type = (v)->
  switch typeof v
    when "number" then "number"
    when "string" then "string"
    when "function" then "function"
    when "object"
      if Array.isArray v
        "list"
      else if v instanceof Routine
        "function"
      else
        "object"
    else
      v

typeName = (v)->
  switch typeof v
    when "number" then "number"
    when "string" then "string"
    when "function" then "function"
    else
      if Array.isArray v
        "list"
      else if v instanceof Routine
        "function"
      else
        "object"

H.variableType = (object,global,name)->
  v = object[name]
  if not v?
    v = global[name]
  if not v? then 0 else typeName(v)

H.propertyType = (obj,name)->
  v = obj[name]
  if not v? then 0 else typeName(v)

H.updateClass = (object,name,src)->
  if object[name]? and typeof object[name] == "object"
    obj = object[name]
    for key,value of src
      obj[key] = value
  else
    object[name] = src
  return

E.CREATE_OBJECT = ()-> @push @temp("{}")

E.CREATE_ARRAY = ()-> @push @temp("[]")

E.MAKE_OBJECT = ()->
  a = @pop()
  v = @temp a
  @emit "if (typeof #{v} != \"object\") #{v} = {} ;"
  @push v

E.CREATE_PROPERTY = ()->
  v = @pop()
  name = @pop()
  obj = @pop()
  @emit "#{obj}[#{name}] = #{v} ;"
  @push obj

E.DELETE = ()->
  name = @pop()
  obj = @pop()
  @emit "delete #{obj}[#{name}] ;"
  @push "0"

E.TYPE = ()->
  a = @pop()
  @push @temp("H.type(#{a})")

E.VARIABLE_TYPE = (arg)->
  @push @temp("H.variableType(object,global,#{@constant(arg)})")

E.PROPERTY_TYPE = ()->
  name = @pop()
  obj = @pop()
  @push @temp("H.propertyType(#{obj},#{name})")

E.UNARY_OP = (arg)->
  a = @pop()
  f = @constRef(arg)
  v = @temp "#{f}(#{a})"
  @emit "if (!isFinite(#{v})) #{v} = 0 ;"
  @pushNum v   

E.BINARY_OP = (arg)->
  b = @pop()
  a = @pop()
  f = @constRef(arg)
  v = @temp "#{f}(#{a},#{b})"
  @emit "if (!isFinite(#{v})) #{v} = 0 ;"
  @pushNum v   

E.CREATE_CLASS = (arg)->
  parent = @pop()
  v = @temp "{}"
  if arg
    @emit "if (#{parent}) #{v}.class = #{parent} ; else #{v}.class = #{@constant(arg)} ;"
  else
    @emit "if (#{parent}) #{v}.class = #{parent} ;"
  @push v

E.UPDATE_CLASS = (arg)->
  v = @pop()
  @emit "H.updateClass(object,#{@constant(arg)},#{v}) ;"
  @push v

H.loadRoutine = (r,locals,locals_offset,object)->
  rc = r.clone()
  for ir in r.import_refs
    if ir == r.import_self
      rc.import_values.push rc
    else
      rc.import_values.push locals[locals_offset+ir]

  rc.object = object
  rc

E.LOAD_ROUTINE = (arg)->
  @push @temp("H.loadRoutine(#{@constRef(arg)},locals,locals_offset,object)")
