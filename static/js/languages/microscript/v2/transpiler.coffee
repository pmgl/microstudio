class Transpiler
  constructor:()->

  transpile:(r)->
    for i in [0..r.opcodes.length-1] by 1
      op = r.table[r.opcodes[i]]
      if @transpilable(op,r.arg1[i])
        j = i+1
        while j < r.opcodes.length and r.removeable(j) and @transpilable(r.table[r.opcodes[j]],r.arg1[j])
          j += 1

        j -= 1

        if j-i>=2
          #console.info "transpilable segment: "+(j-i)
          @transpileSegment(r,i,j)

  transpileSegment:(r,i,j)->
    @vcount = 0
    @stack = new Stack()
    @locals = {}
    @variables = {}

    s = "f = function(stack,stack_index,locals,locals_offset,object) {\n"
    for k in [i..j] by 1
      comp = @[r.table[r.opcodes[k]]](r.arg1[k])
      if comp
        s += comp+"\n" ;


    if @stack.index>0
      if @stack.touched[0]
        s += "stack[stack_index] = #{@stack.get(-@stack.index)} ;\n"

      for k in [1..@stack.index] by 1
        s += "stack[++stack_index] = #{@stack.get(-@stack.index+k)} ;\n"
    else if @stack.index<0
      s += "stack_index -= #{-@stack.index} ;\n"
      if @stack.touched[@stack.index]
        s += "stack[stack_index] = #{@stack.stack[@stack.index]} ;\n"
    else
      if @stack.touched[0]
        s += "stack[stack_index] = #{@stack.get()} ;\n"
    s += """return stack_index ;\n}"""

    console.info s

    try
      eval(s)
    catch err
      console.error err

    r.opcodes[i] = 200
    r.arg1[i] = f
    for k in [i+1..j] by 1
      r.remove(i+1)
    return

  createVariable:()->
    "v#{@vcount++}"

  transpilable:(op,arg)->
    if op == "LOAD_VALUE"
      return typeof arg in ["string","number"]
    else
      return @[op]?

  LOAD_VALUE:(arg)->
    if typeof arg == "string"
      @stack.push(""" "#{arg}" """)
    else if typeof arg == "number"
      @stack.push(arg+"")
    ""

  LOAD_LOCAL:(arg)->
    if @locals[arg]?
      @stack.push @locals[arg]
      ""
    else
      v = @createVariable()
      @locals[arg] = v
      @stack.push v
      """ let #{v} = locals[locals_offset+#{arg}] """

  LOAD_LOCAL_OBJECT:(arg)->
    if @locals[arg]?
      v = @locals[arg]
      @stack.push v
      """
      if (typeof #{v} != "object") { #{v} = locals[locals_offset+#{arg}] = {} } ;
      """
    else
      v = @createVariable()
      res = """
      let #{v} = locals[locals_offset+#{arg}] ;
      if (typeof #{v} != "object") { #{v} = locals[locals_offset+#{arg}] = {} } ;
      """
      @stack.push v
      @locals[arg] = v
      res

  STORE_LOCAL:(arg)->
    if @locals[arg]?
      """
      #{@locals[arg]} = locals[locals_offset+#{arg}] = #{@stack.get()} ;
      """
    else
      """
      locals[locals_offset+#{arg}] = #{@stack.get()} ;
      """

  POP:()->
    @stack.pop()
    ""

  STORE_LOCAL_POP:(arg)-> """
    locals[locals_offset+#{arg}] = #{@stack.pop()} ;
  """

  DIV:()->
    v = @createVariable()

    res = """
    let #{v} = #{@stack.get(-1)} / #{@stack.get()} ;
    """
    @stack.pop()
    @stack.pop()
    @stack.push(v)
    res

  MUL:()->
    v = @createVariable()

    res = """
    let #{v} = #{@stack.get(-1)} * #{@stack.get()} ;
    """
    @stack.pop()
    @stack.pop()
    @stack.push(v)
    res

  ADD:()->
    v = @createVariable()

    res = """
    let #{v} = #{@stack.get(-1)} + #{@stack.get()} ;
    """
    @stack.pop()
    @stack.pop()
    @stack.push(v)
    res


  SUB:()->
    v = @createVariable()

    res = """
    let #{v} = #{@stack.get(-1)}-#{@stack.get()} ;
    """
    @stack.pop()
    @stack.pop()
    @stack.push(v)
    res

  CREATE_PROPERTY:(arg)->
    res = """
    #{@stack.get(-2)}[#{@stack.get(-1)}] = #{@stack.get()} ;
    """
    @stack.pop()
    @stack.pop()
    res

  LOAD_PROPERTY:(arg)->
    v = @createVariable()
    res = """
      let #{v} = #{@stack.get(-1)}[#{@stack.get()}] ; // LOAD_PROPERTY
      if (#{v} == null) { #{v} = 0 ; }
  """
    @stack.pop()
    @stack.pop()
    @stack.push(v)
    res

  ADD_PROPERTY:(arg)->
    v1 = @createVariable()
    v2 = @createVariable()
    res = """
      let #{v1} = #{@stack.get(-2)}[#{@stack.get(-1)}] ; // ADD_PROPERTY
      let #{v2} = #{@stack.get()} ;
      if (typeof #{v1} == "number" && typeof #{v2} == "number") {
        #{v1} += #{v2} ;
        #{v1} = isFinite(#{v1}) ? #{v1} : 0 ;
        #{@stack.get(-2)}[#{@stack.get(-1)}] = #{v1} ;
      }
  """
    @stack.pop()
    @stack.pop()
    @stack.pop()
    @stack.push(v1)
    res

  SUB_PROPERTY:(arg)->
    v1 = @createVariable()
    v2 = @createVariable()
    res = """
      let #{v1} = #{@stack.get(-2)}[#{@stack.get(-1)}] ; // SUB_PROPERTY
      let #{v2} = #{@stack.get()} ;
      if (typeof #{v1} == "number" && typeof #{v2} == "number") {
        #{v1} -= #{v2} ;
        #{v1} = isFinite(#{v1}) ? #{v1} : 0 ;
        #{@stack.get(-2)}[#{@stack.get(-1)}] = #{v1} ;
      }
  """
    @stack.pop()
    @stack.pop()
    @stack.pop()
    @stack.push(v1)
    res

  ADD_LOCAL:(arg)->
    v = @createVariable()
    res = """
    let #{v} = locals[locals_offset+#{arg}] += #{@stack.get()} ; // ADD_LOCAL
    """
    @stack.pop()
    @stack.push v
    res

  NEW_OBJECT:()->
    v = @createVariable()
    @stack.push(v)
    "let #{v} = {} ;"

  NEW_ARRAY:()->
    v = @createVariable()
    @stack.push(v)
    "let #{v} = [] ;"

  MAKE_OBJECT:()->
    v = @createVariable()
    @stack.pop()
    @stack.push v
    """
let #{v} = #{@stack.get()} ;
#{v} = typeof v == "object" ? #{v} : {}"""


  NEGATE:()->
    v = @createVariable()
    res = """
    let #{v} = - #{@stack.get()} ; // NEGATE
    if (#{v} == null) { #{v} = 0 ;};
    """
    @stack.pop()
    @stack.push v
    res

  SQRT:()->
    v = @createVariable()
    res = """
    let #{v} = Math.sqrt(#{@stack.get()}) ;
  """
    @stack.pop()
    @stack.push v
    res

  LOAD_VARIABLE:(arg)->
    if @variables[arg]?
      @stack.push @variables[arg]
      ""
    else
      v = @createVariable()
      res = """
      let #{v} = object["#{arg}"] ; // LOAD_VARIABLE
      if (#{v} == null) {
        let obj = object ;
        while ((#{v} == null) && (obj["class"] != null)) { obj = obj["class"] ; #{v} = obj["#{arg}"] }
        if (#{v} == null) v = global["#{arg}"] ;
        if (#{v} == null) { #{v} = 0 ; }
      }
    """
      @stack.push v
      @variables[arg] = v

      res

  STORE_VARIABLE:(arg)->
    if @variables[arg]?
      """
      #{@variables[arg]} = object["#{arg}"] = #{@stack.get()} ; // STORE_VARIABLE
      """
    else
      """
      object["#{arg}"] = #{@stack.get()} ; // STORE_VARIABLE
      """

class @Stack
  constructor:()->
    @stack = ["stack[stack_index]"]
    @index = 0
    @touched = {}

  push:(value)->
    @stack[++@index] = value
    @touched[@index] = true
    # console.info "push: "+value

  pop:()->
    if @index>=0
      res = @stack.splice(@index,1)[0]
    else if @stack[@index]?
      res = @stack[@index]
    else
      res = "stack[stack_index-#{@index}]"

    @index -= 1
    # console.info "pop: "+res
    res

  get:(index=0)->
    i = @index+index
    if i>=0
      @stack[i]
    else if @stack[i]?
      @stack[i]
    else
      "stack[stack_index-#{-i}]"
