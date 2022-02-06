class @Routine
  constructor:(@num_args)->
    @ops = []
    @opcodes = []
    @arg1 = []
    @arg2 = []
    @ref = []

    @table = {}
    @label_count = 0
    @labels = {}


    @set "OPCODE_TYPE", 1
    @set "OPCODE_VARIABLE_TYPE", 2
    @set "OPCODE_PROPERTY_TYPE", 3

    @set "OPCODE_LOAD_THIS", 5
    @set "OPCODE_LOAD_GLOBAL", 6

    @set "OPCODE_LOAD_CONTEXT_VARIABLE", 8
    @set "OPCODE_LOAD_CONTEXT_PROPERTY", 9

    @set "OPCODE_LOAD_VALUE", 10
    @set "OPCODE_LOAD_LOCAL", 11
    @set "OPCODE_LOAD_VARIABLE", 12
    @set "OPCODE_LOAD_LOCAL_OBJECT", 13
    @set "OPCODE_LOAD_VARIABLE_OBJECT", 14
    @set "OPCODE_POP", 15
    @set "OPCODE_LOAD_PROPERTY", 16
    @set "OPCODE_LOAD_PROPERTY_OBJECT", 17

    @set "OPCODE_CREATE_OBJECT", 18
    @set "OPCODE_MAKE_OBJECT", 19
    @set "OPCODE_CREATE_ARRAY",20

    @set "OPCODE_STORE_LOCAL", 21
    @set "OPCODE_STORE_VARIABLE",23
    @set "OPCODE_CREATE_PROPERTY",24
    @set "OPCODE_STORE_PROPERTY",25

    @set "OPCODE_UPDATE_CLASS", 27
    @set "OPCODE_CREATE_CLASS", 28
    @set "OPCODE_NEW_CALL", 29

    @set "OPCODE_ADD", 30
    @set "OPCODE_SUB", 31
    @set "OPCODE_MUL", 32
    @set "OPCODE_DIV", 33

    @set "OPCODE_NEGATE", 39

    @set "OPCODE_EQ", 40
    @set "OPCODE_NEQ", 41
    @set "OPCODE_LT", 42
    @set "OPCODE_GT", 43
    @set "OPCODE_LTE", 44
    @set "OPCODE_GTE", 45

    @set "OPCODE_NOT", 50

    @set "OPCODE_ADD_LOCAL",60
    @set "OPCODE_SUB_LOCAL",61
    @set "OPCODE_MUL_LOCAL",62
    @set "OPCODE_DIV_LOCAL",63

    @set "OPCODE_ADD_VARIABLE",64
    @set "OPCODE_SUB_VARIABLE",65
    @set "OPCODE_MUL_VARIABLE",66
    @set "OPCODE_DIV_VARIABLE",67

    @set "OPCODE_ADD_PROPERTY",68
    @set "OPCODE_SUB_PROPERTY",69
    @set "OPCODE_MUL_PROPERTY",70
    @set "OPCODE_DIV_PROPERTY",71

    @set "OPCODE_FORLOOP_INIT",95
    @set "OPCODE_FORLOOP_CONTROL",96
    @set "OPCODE_FORIN_INIT",97
    @set "OPCODE_FORIN_CONTROL",98

    @set "OPCODE_JUMP",80
    @set "OPCODE_JUMPY",81
    @set "OPCODE_JUMPN",82

    @set "OPCODE_FUNCTION_CALL", 90
    @set "OPCODE_FUNCTION_APPLY_VARIABLE", 91
    @set "OPCODE_FUNCTION_APPLY_PROPERTY", 92
    @set "OPCODE_SUPER_CALL", 93
    @set "OPCODE_RETURN", 94

    @set "OPCODE_SQRT",100

    @set "OPCODE_COMPILED",200

  set:(op,code)->
    @[op] = code
    @table[code] = op.substring(7)

  createLabel:(str="label")->
    name = ":"+str+"_"+@label_count++

  setLabel:(name)->
    @labels[name] = @opcodes.length

  optimize:()->
    # new Transpiler().transpile @
    return

  transpile:()->
    for i in [0..@opcodes.length-1] by 1
      op = @table[@opcodes[i]]
      if transpile[op]? and transpile[op](@arg1[i])?
        j = i+1
        while j<@opcodes.length and transpile[@table[@opcodes[j]]]? and @removeable(j) and transpile[@table[@opcodes[j]]](@arg1[j])?
          j += 1

        j -= 1

        if j-i>=3
          #console.info "transpilable segment: "+(j-i)
          s = "f = function(stack,stack_index,locals,locals_offset,object,meta) {\n"
          for k in [i..j] by 1
            s += transpile[@table[@opcodes[k]]](@arg1[k])+"\n" ;
          s += """return stack_index ;\n}"""

          #console.info s
          try
            eval(s)
          catch err
            console.error err

          @opcodes[i] = 200
          @arg1[i] = f
          for k in [i+1..j] by 1
            @remove(i+1)

  removeable:(index)->
    for label,value of @labels
      if value == index
        return false

    true

  remove:(index)->
    for label,value of @labels
      if value == index
        return false
      else if value>index
        @labels[label] -= 1

    @opcodes.splice(index,1)
    @arg1.splice(index,1)
    @arg2.splice(index,1)
    @ref.splice(index,1)
    true

  resolveLabels:()->
    for i in [0..@opcodes.length-1]
      if @opcodes[i] in [@OPCODE_JUMP,@OPCODE_JUMPY,@OPCODE_JUMPN]
        if @labels[@arg1[i]]
          @arg1[i] = @labels[@arg1[i]]
      else if @opcodes[i] in [@OPCODE_FORLOOP_CONTROL,@OPCODE_FORLOOP_INIT,@OPCODE_FORIN_CONTROL,@OPCODE_FORIN_INIT]
        if @labels[@arg1[i][1]]
          @arg1[i][1] = @labels[@arg1[i][1]]

  OP:(code,ref,v1=0,v2=0)->
    @opcodes.push code
    @arg1.push v1
    @arg2.push v2
    @ref.push ref

  LOAD_THIS:(ref)-> @OP @OPCODE_LOAD_THIS,ref
  LOAD_GLOBAL:(ref)-> @OP @OPCODE_LOAD_GLOBAL,ref

  LOAD_CONTEXT_VARIABLE:(variable,ref)-> @OP @OPCODE_LOAD_CONTEXT_VARIABLE,ref,variable
  LOAD_CONTEXT_PROPERTY:(variable,ref)-> @OP @OPCODE_LOAD_CONTEXT_PROPERTY,ref,variable

  LOAD_VALUE:(value,ref)-> @OP @OPCODE_LOAD_VALUE,ref,value
  LOAD_LOCAL:(index,ref)-> @OP @OPCODE_LOAD_LOCAL,ref,index
  LOAD_VARIABLE:(variable,ref)-> @OP @OPCODE_LOAD_VARIABLE,ref,variable
  LOAD_LOCAL_OBJECT:(index,ref)-> @OP @OPCODE_LOAD_LOCAL_OBJECT,ref,index
  LOAD_VARIABLE_OBJECT:(variable,ref)-> @OP @OPCODE_LOAD_VARIABLE_OBJECT,ref,variable
  POP:(ref)-> @OP @OPCODE_POP,ref
  LOAD_PROPERTY:(ref)-> @OP @OPCODE_LOAD_PROPERTY,ref
  LOAD_PROPERTY_OBJECT:(ref)-> @OP @OPCODE_LOAD_PROPERTY_OBJECT,ref
  CREATE_OBJECT:(ref)-> @OP @OPCODE_CREATE_OBJECT,ref
  MAKE_OBJECT:(ref)-> @OP @OPCODE_MAKE_OBJECT,ref
  CREATE_ARRAY:(ref)-> @OP @OPCODE_CREATE_ARRAY,ref
  CREATE_CLASS:(parent_var,ref)-> @OP @OPCODE_CREATE_CLASS,ref,parent_var
  UPDATE_CLASS:(variable,ref)-> @OP @OPCODE_UPDATE_CLASS,ref,variable
  NEW_CALL:(args,ref)-> @OP @OPCODE_NEW_CALL,ref,args

  ADD:(ref)-> @OP @OPCODE_ADD,ref
  SUB:(ref)-> @OP @OPCODE_SUB,ref
  MUL:(ref)-> @OP @OPCODE_MUL,ref
  DIV:(ref)-> @OP @OPCODE_DIV,ref

  NEGATE:(ref)-> @OP @OPCODE_NEGATE,ref

  ADD_LOCAL:(index,ref)-> @OP @OPCODE_ADD_LOCAL,ref,index
  SUB_LOCAL:(index,ref)-> @OP @OPCODE_SUB_LOCAL,ref,index
  MUL_LOCAL:(index,ref)-> @OP @OPCODE_MUL_LOCAL,ref,index
  DIV_LOCAL:(index,ref)-> @OP @OPCODE_DIV_LOCAL,ref,index

  ADD_VARIABLE:(variable,ref)-> @OP @OPCODE_ADD_VARIABLE,ref,variable
  SUB_VARIABLE:(variable,ref)-> @OP @OPCODE_SUB_VARIABLE,ref,variable
  MUL_VARIABLE:(variable,ref)-> @OP @OPCODE_MUL_VARIABLE,ref,variable
  DIV_VARIABLE:(variable,ref)-> @OP @OPCODE_DIV_VARIABLE,ref,variable

  ADD_PROPERTY:(ref)-> @OP @OPCODE_ADD_PROPERTY,ref
  SUB_PROPERTY:(ref)-> @OP @OPCODE_SUB_PROPERTY,ref
  MUL_PROPERTY:(ref)-> @OP @OPCODE_MUL_PROPERTY,ref
  DIV_PROPERTY:(ref)-> @OP @OPCODE_DIV_PROPERTY,ref

  EQ:(ref)-> @OP @OPCODE_EQ,ref
  NEQ:(ref)-> @OP @OPCODE_NEQ,ref
  LT:(ref)-> @OP @OPCODE_LT,ref
  GT:(ref)-> @OP @OPCODE_GT,ref
  LTE:(ref)-> @OP @OPCODE_LTE,ref
  GTE:(ref)-> @OP @OPCODE_GTE,ref

  NOT:(ref)-> @OP @OPCODE_NOT,ref

  FORLOOP_INIT:(iterator,ref)-> @OP @OPCODE_FORLOOP_INIT,ref,iterator
  FORLOOP_CONTROL:(args,ref)-> @OP @OPCODE_FORLOOP_CONTROL,ref,args
  FORIN_INIT:(args,ref)-> @OP @OPCODE_FORIN_INIT,ref,args
  FORIN_CONTROL:(args,ref)-> @OP @OPCODE_FORIN_CONTROL,ref,args

  JUMP:(index,ref)-> @OP @OPCODE_JUMP,ref,index
  JUMPY:(index,ref)-> @OP @OPCODE_JUMPY,ref,index
  JUMPN:(index,ref)-> @OP @OPCODE_JUMPN,ref,index

  STORE_LOCAL:(index,ref)-> @OP @OPCODE_STORE_LOCAL,ref,index
  STORE_VARIABLE:(field,ref)-> @OP @OPCODE_STORE_VARIABLE,ref,field
  CREATE_PROPERTY:(ref)-> @OP @OPCODE_CREATE_PROPERTY,ref
  STORE_PROPERTY:(ref)-> @OP @OPCODE_STORE_PROPERTY,ref

  FUNCTION_CALL:(args,ref)-> @OP @OPCODE_FUNCTION_CALL,ref,args
  FUNCTION_APPLY_VARIABLE:(args,ref)-> @OP @OPCODE_FUNCTION_APPLY_VARIABLE,ref,args
  FUNCTION_APPLY_PROPERTY:(args,ref)-> @OP @OPCODE_FUNCTION_APPLY_PROPERTY,ref,args
  SUPER_CALL:(args,ref)-> @OP @OPCODE_SUPER_CALL,ref,args
  RETURN:(local_offset,ref)-> @OP @OPCODE_RETURN,ref,local_offset

  SQRT:(ref)-> @OP @OPCODE_SQRT,ref

  TEST:(ref)-> @OP @OPCODE_TEST,ref

  toString:()->
    s = ""
    for op,i in @opcodes
      s += @table[op]
      if @arg1[i] or @arg2[i]
        #if typeof @arg1[i] != "function"
          s += " #{@arg1[i]}"
          if @arg2[i]
            s += ", #{@arg2[i]}"
      s += "\n"

    s
