class @Routine
  constructor:(@num_args)->
    @ops = []
    @opcodes = []
    @arg1 = []
    @ref = []

    @table = {}
    @label_count = 0
    @labels = {}

    @transpile = false
    @import_refs = []
    @import_values = []

  clone:()->
    r = new Routine @num_args
    r.opcodes = @opcodes
    r.arg1 = @arg1
    r.ref = @ref
    r.locals_size = @locals_size
    r

  createLabel:(str="label")->
    name = ":"+str+"_"+@label_count++

  setLabel:(name)->
    @labels[name] = @opcodes.length

  optimize:()->
    if @transpile
      new Transpiler().transpile @
    return

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
    @ref.splice(index,1)
    true

  resolveLabels:()->
    for i in [0..@opcodes.length-1]
      if @opcodes[i] in [OPCODES.JUMP,OPCODES.JUMPY,OPCODES.JUMPN,OPCODES.JUMPY_NOPOP,OPCODES.JUMPN_NOPOP]
        if @labels[@arg1[i]]
          @arg1[i] = @labels[@arg1[i]]
      else if @opcodes[i] in [OPCODES.FORLOOP_CONTROL,OPCODES.FORLOOP_INIT,OPCODES.FORIN_CONTROL,OPCODES.FORIN_INIT]
        if @labels[@arg1[i][1]]
          @arg1[i][1] = @labels[@arg1[i][1]]

  OP:(code,ref,v1=0)->
    @opcodes.push code
    @arg1.push v1
    @ref.push ref

  OP_INSERT:(code,ref,v1=0,index)->
    @opcodes.splice index,0,code
    @arg1.splice index,0,v1
    @ref.splice index,0,ref

    for label,value of @labels
      if value >= index
        @labels[label] += 1
    return

  TYPE:(ref)-> @OP OPCODES.TYPE,ref
  VARIABLE_TYPE:(variable,ref)-> @OP OPCODES.VARIABLE_TYPE,ref,variable
  PROPERTY_TYPE:(ref)-> @OP OPCODES.PROPERTY_TYPE,ref

  LOAD_THIS:(ref)-> @OP OPCODES.LOAD_THIS,ref
  LOAD_GLOBAL:(ref)-> @OP OPCODES.LOAD_GLOBAL,ref

  LOAD_VALUE:(value,ref)-> @OP OPCODES.LOAD_VALUE,ref,value
  LOAD_LOCAL:(index,ref)-> @OP OPCODES.LOAD_LOCAL,ref,index
  LOAD_VARIABLE:(variable,ref)-> @OP OPCODES.LOAD_VARIABLE,ref,variable
  LOAD_LOCAL_OBJECT:(index,ref)-> @OP OPCODES.LOAD_LOCAL_OBJECT,ref,index
  LOAD_VARIABLE_OBJECT:(variable,ref)-> @OP OPCODES.LOAD_VARIABLE_OBJECT,ref,variable
  POP:(ref)-> @OP OPCODES.POP,ref
  LOAD_PROPERTY:(ref)-> @OP OPCODES.LOAD_PROPERTY,ref
  LOAD_PROPERTY_OBJECT:(ref)-> @OP OPCODES.LOAD_PROPERTY_OBJECT,ref
  CREATE_OBJECT:(ref)-> @OP OPCODES.CREATE_OBJECT,ref
  MAKE_OBJECT:(ref)-> @OP OPCODES.MAKE_OBJECT,ref
  CREATE_ARRAY:(ref)-> @OP OPCODES.CREATE_ARRAY,ref
  CREATE_CLASS:(parent_var,ref)-> @OP OPCODES.CREATE_CLASS,ref,parent_var
  UPDATE_CLASS:(variable,ref)-> @OP OPCODES.UPDATE_CLASS,ref,variable
  NEW_CALL:(args,ref)-> @OP OPCODES.NEW_CALL,ref,args

  ADD:(ref)-> @OP OPCODES.ADD,ref
  SUB:(ref)-> @OP OPCODES.SUB,ref
  MUL:(ref)-> @OP OPCODES.MUL,ref
  DIV:(ref)-> @OP OPCODES.DIV,ref
  MODULO:(ref)-> @OP OPCODES.MODULO,ref
  BINARY_AND:(ref)-> @OP OPCODES.BINARY_AND,ref
  BINARY_OR:(ref)-> @OP OPCODES.BINARY_OR,ref
  SHIFT_LEFT:(ref)-> @OP OPCODES.SHIFT_LEFT,ref
  SHIFT_RIGHT:(ref)-> @OP OPCODES.SHIFT_RIGHT,ref

  NEGATE:(ref)-> @OP OPCODES.NEGATE,ref

  LOAD_PROPERTY_ATOP:(ref)-> @OP OPCODES.LOAD_PROPERTY_ATOP,ref

  EQ:(ref)-> @OP OPCODES.EQ,ref
  NEQ:(ref)-> @OP OPCODES.NEQ,ref
  LT:(ref)-> @OP OPCODES.LT,ref
  GT:(ref)-> @OP OPCODES.GT,ref
  LTE:(ref)-> @OP OPCODES.LTE,ref
  GTE:(ref)-> @OP OPCODES.GTE,ref

  NOT:(ref)-> @OP OPCODES.NOT,ref

  FORLOOP_INIT:(iterator,ref)-> @OP OPCODES.FORLOOP_INIT,ref,iterator
  FORLOOP_CONTROL:(args,ref)-> @OP OPCODES.FORLOOP_CONTROL,ref,args
  FORIN_INIT:(args,ref)-> @OP OPCODES.FORIN_INIT,ref,args
  FORIN_CONTROL:(args,ref)-> @OP OPCODES.FORIN_CONTROL,ref,args

  JUMP:(index,ref)-> @OP OPCODES.JUMP,ref,index
  JUMPY:(index,ref)-> @OP OPCODES.JUMPY,ref,index
  JUMPN:(index,ref)-> @OP OPCODES.JUMPN,ref,index
  JUMPY_NOPOP:(index,ref)-> @OP OPCODES.JUMPY_NOPOP,ref,index
  JUMPN_NOPOP:(index,ref)-> @OP OPCODES.JUMPN_NOPOP,ref,index

  STORE_LOCAL:(index,ref)-> @OP OPCODES.STORE_LOCAL,ref,index
  STORE_VARIABLE:(field,ref)-> @OP OPCODES.STORE_VARIABLE,ref,field
  CREATE_PROPERTY:(ref)-> @OP OPCODES.CREATE_PROPERTY,ref
  STORE_PROPERTY:(ref)-> @OP OPCODES.STORE_PROPERTY,ref

  LOAD_ROUTINE:(value,ref)-> @OP OPCODES.LOAD_ROUTINE,ref,value
  FUNCTION_CALL:(args,ref)-> @OP OPCODES.FUNCTION_CALL,ref,args
  FUNCTION_APPLY_VARIABLE:(args,ref)-> @OP OPCODES.FUNCTION_APPLY_VARIABLE,ref,args
  FUNCTION_APPLY_PROPERTY:(args,ref)-> @OP OPCODES.FUNCTION_APPLY_PROPERTY,ref,args
  SUPER_CALL:(args,ref)-> @OP OPCODES.SUPER_CALL,ref,args
  RETURN:(ref)-> @OP OPCODES.RETURN,ref

  AFTER:(ref)-> @OP OPCODES.AFTER,ref
  EVERY:(ref)-> @OP OPCODES.EVERY,ref
  DO:(ref)-> @OP OPCODES.DO,ref
  SLEEP:(ref)-> @OP OPCODES.SLEEP,ref

  UNARY_OP:(f,ref)-> @OP OPCODES.UNARY_OP,ref,f
  BINARY_OP:(f,ref)-> @OP OPCODES.BINARY_OP,ref,f

  toString:()->
    s = ""
    for op,i in @opcodes
      s += OPCODES[op]
      if @arg1[i]
        #if typeof @arg1[i] != "function"
          s += " #{@arg1[i]}"
      s += "\n"

    s


class @OPCODES_CLASS
  constructor:()->
    @table = {}

    @set "TYPE", 1
    @set "VARIABLE_TYPE", 2
    @set "PROPERTY_TYPE", 3

    @set "LOAD_IMPORT", 4
    @set "LOAD_THIS", 5
    @set "LOAD_GLOBAL", 6

    @set "LOAD_VALUE", 10
    @set "LOAD_LOCAL", 11
    @set "LOAD_VARIABLE", 12
    @set "LOAD_LOCAL_OBJECT", 13
    @set "LOAD_VARIABLE_OBJECT", 14
    @set "POP", 15
    @set "LOAD_PROPERTY", 16
    @set "LOAD_PROPERTY_OBJECT", 17

    @set "CREATE_OBJECT", 18
    @set "MAKE_OBJECT", 19
    @set "CREATE_ARRAY",20

    @set "STORE_LOCAL", 21
    @set "STORE_VARIABLE",23
    @set "CREATE_PROPERTY",24
    @set "STORE_PROPERTY",25

    @set "UPDATE_CLASS", 27
    @set "CREATE_CLASS", 28
    @set "NEW_CALL", 29

    @set "ADD", 30
    @set "SUB", 31
    @set "MUL", 32
    @set "DIV", 33
    @set "MODULO", 34
    @set "BINARY_AND", 35
    @set "BINARY_OR", 36
    @set "SHIFT_LEFT", 37
    @set "SHIFT_RIGHT", 38

    @set "NEGATE", 39

    @set "EQ", 40
    @set "NEQ", 41
    @set "LT", 42
    @set "GT", 43
    @set "LTE", 44
    @set "GTE", 45

    @set "NOT", 50

    @set "LOAD_PROPERTY_ATOP",68

    @set "JUMP",80
    @set "JUMPY",81
    @set "JUMPN",82
    @set "JUMPY_NOPOP",83
    @set "JUMPN_NOPOP",84

    @set "LOAD_ROUTINE", 89
    @set "FUNCTION_CALL", 90
    @set "FUNCTION_APPLY_VARIABLE", 91
    @set "FUNCTION_APPLY_PROPERTY", 92
    @set "SUPER_CALL", 93
    @set "RETURN", 94

    @set "FORLOOP_INIT",95
    @set "FORLOOP_CONTROL",96
    @set "FORIN_INIT",97
    @set "FORIN_CONTROL",98

    @set "UNARY_OP",100
    @set "BINARY_OP",101

    @set "COMPILED",200

    @set "AFTER", 110
    @set "EVERY", 111
    @set "DO", 112
    @set "SLEEP", 113

  set:(op,code)->
    @[op] = code
    @[code] = op

@OPCODES = new @OPCODES_CLASS
