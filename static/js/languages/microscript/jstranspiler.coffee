# Strict mode only:
# * Cannot call any value as a function

class JSTranspiler
  constructor:(@program,@strict = false)->
    @code_saves = []

    @code = """
    var _msResolveVariable = function(v) {
      let res = context.meta[v] ;
      if (res == null) {
        res = context.object[v] ;
        if (res == null) {
          res = context.global[v] ;
        }
      }
      return res == null? 0 : res ;
    };

    var _msResolveField = function(v,f) {
      var res = v[f];
      while (res == null && v["class"] != null) {
        v = v["class"] ;
        res = v[f] ;
      }
      return res!=null? res: 0 ;
    } ;

    var _msResolveParentClass = function(obj) {
      if (obj.class != null && typeof obj.class == "string") {
        if (context.global[obj.class] != null) {
          obj.class = context.global[obj.class] ;
        }
        _msResolveParentClass(obj.class);
      }
      else if (obj.class != null) {
        _msResolveParentClass(obj.class);
      }
    } ;

    var _msApply = function(parent,field, ...args) {
      let save = context.object ;
      let currentClass = context.currentClass ;
      let childName = context.childName ;

      context.object = parent ;
      context.currentClass = parent ;
      context.childName = field ;

      let c = parent ;
      let f = c[field] ;
      while (f == null && c["class"] != null) {
        c = c["class"] ;
        f = c[field] ;
        context.currentClass = c ;
      }

      let res = 0 ;
      if (f != null) {
        if (typeof f == "function") {
          res = f.apply(parent,args) ;
        }
        else {
          res = f ;
        }
      }

      context.object = save ;
      context.currentClass = currentClass ;
      context.childName = childName ;

      if (res != null) {
        return res ;
      }
      else {
        return 0 ;
      }
    };

    var _msInvoke = function(field, ...args) {
      let f = null ;
      let res = 0 ;

      if (context.meta.hasOwnProperty(field)) {
        f = context.meta[field] ;
        res = f.apply(null,args) ;
      }
      else {
        let currentClass = context.currentClass ;
        let childName = context.childName ;

        if (field == "super") {
          let c = currentClass ;
          f = null ;
          while (f == null && c["class"] != null) {
            c = c["class"] ;
            f = c[childName] ;
            context.currentClass = c ;
          }
        }
        else {
          context.currentClass = context.object ;
          context.childName = field ;
          let c = context.object ;
          f = c[field] ;
          while (f == null && c["class"] != null) {
            c = c["class"] ;
            f = c[field] ;
            context.currentClass = c ;
          }
        }

        if (f != null) {
          if (typeof f == "function") {
            res = f.apply(context.object,args) ;
          }
          else {
            res = f ;
          }
        }
        else if (context.global[field] != null) {
          f = context.global[field] ;
          let save = context.object ;
          context.object = context.global ;
          if (typeof f == "function") {
            res = f.apply(context.object,args) ;
          }
          else {
            res = f ;
          }
          context.object = save ;
        }

        context.currentClass = currentClass ;
        context.childName = childName ;
      }

      if (res != null) {
        return res ;
      }
      else {
        return 0 ;
      }
    };

    """
    @code = [@code]

    context =
      local_variables: {}
      temp_variable_count: 0
      tmpcount: 0

    for s,i in @program.statements
      if i==@program.statements.length-1
        @code.push "return #{@transpile(s,context,true)} ;"
      else
        @code.push @transpile(s,context,false)+" ;"

    @code = @code.join("\n")
    @code = @code.split("\n")
    indent = 0
    for line,l in @code
      indent -= (line.match(/}/g) || []).length
      for i in [0..indent-1] by 1
        @code[l] = "  "+@code[l]
      indent += (line.match(/{/g) || []).length;

    @code = @code.join("\n")
    console.info(@code)

  transpile:(statement,context,retain)->
    if statement instanceof Program.Assignment
      return @transpileAssignment(statement,context,retain)
    if statement instanceof Program.SelfAssignment
      return @transpileSelfAssignment(statement,context,retain)
    else if statement instanceof Program.Operation
      return @transpileOperation(statement,context)
    else if statement instanceof Program.Braced
      return @transpileBraced(statement,context,retain)
    else if statement instanceof Program.Negate
      return @transpileNegate(statement,context,retain)
    else if statement instanceof Program.Not
      return @transpileNot(statement,context,retain)
    else if statement instanceof Program.Value
      return @transpileValue(statement,context)
    else if statement instanceof Program.Variable
      return @transpileVariable(statement,context)
    else if statement instanceof Program.Field
      return @transpileField(statement,context)
    else if statement instanceof Program.FunctionCall # Not OK ; calling non-function not supported
      return @transpileFunctionCall(statement,context,retain)
    else if statement instanceof Program.For
      return @transpileFor(statement,context,retain)
    else if statement instanceof Program.ForIn
      return @transpileForIn(statement,context,retain)
    else if statement instanceof Program.While
      return @transpileWhile(statement,context,retain)
    else if statement instanceof Program.Break
      return @transpileBreak(statement,context)
    else if statement instanceof Program.Continue
      return @transpileContinue(statement,context)
    else if statement instanceof Program.Function
      return @transpileFunction(statement,context)
    else if statement instanceof Program.Return
      return @transpileReturn(statement,context)
    else if statement instanceof Program.Condition
      return @transpileCondition(statement,context,retain)
    else if statement instanceof Program.CreateObject
      return @transpileCreateObject(statement,context)
    else if statement instanceof Program.CreateClass
      return @transpileCreateClass(statement,context)
    else if statement instanceof Program.NewCall
      return @transpileNewCall(statement,context)

  transpileAssignment:(statement,context,retain)->
    if statement.local
      if statement.field instanceof Program.Variable
        context.local_variables[statement.field.identifier] = true
        if retain
          @prepend "var #{statement.field.identifier} = #{@transpile(statement.expression,context,true)} ;\n"
          return statement.field.identifier
        else
          return "var #{statement.field.identifier} = #{@transpile(statement.expression,context,true)} ;\n"
      else
        throw "illegal"
    else
      if statement.field instanceof Program.Variable
        if context.local_variables[statement.field.identifier]
          return """#{statement.field.identifier} = #{@transpile(statement.expression,context,true)}#{if retain then "" else ";"}"""
        else if statement.expression instanceof Program.CreateClass
          return """context.object["#{statement.field.identifier}"] = #{@transpileUpdateClass(statement.expression,context,statement.field.identifier)}"""
        else
          return """context.object["#{statement.field.identifier}"] = #{@transpile(statement.expression,context,true)}"""
      else
        f = statement.field
        if f.expression instanceof Program.Variable
          if f.expression.identifier == "this"
            recipient = "context.object"
          else if context.local_variables[f.expression.identifier]
            @code.push """if (#{f.expression.identifier} == null) {#{f.expression.identifier} = {};}"""
            recipient = f.expression.identifier
          else if f.expression.identifier == "global"
            recipient = "context.global"
          else
            recipient = @createTempVariable context
            @prepend """var #{recipient} = context.object["#{f.expression.identifier}"] ;"""
            @prepend """if (#{recipient} == null) #{recipient} = context.global["#{f.expression.identifier}"] ;"""
            @prepend """if (#{recipient} == null) #{recipient} = context.object["#{f.expression.identifier}"] = {} ;"""
        else
          recipient = @createTempVariable context
          @prepend """var #{recipient} = #{@transpile(f.expression,context,true)} ;"""

        chain = recipient
        for i in [0..f.chain.length-2] by 1
          v = @evaluated f.chain[i],context
          chain += "[#{v}]"
          @code.push """if (#{chain} == null) {#{chain} = {} ;}"""

        return """#{chain}[#{@transpile(f.chain[f.chain.length-1],context,true)}] = #{@transpile(statement.expression,context,true)}"""


  transpileSelfAssignment:(statement,context,retain)->
    switch statement.operation
      when Token.TYPE_PLUS_EQUALS then op = "+"
      when Token.TYPE_MINUS_EQUALS then op = "-"
      when Token.TYPE_MULTIPLY_EQUALS then op = "*"
      when Token.TYPE_DIVIDE_EQUALS then op = "/"

    if statement.field instanceof Program.Variable
      if context.local_variables[statement.field.identifier]
        return """#{statement.field.identifier} #{op}= #{@transpile(statement.expression,context,true)}"""
      else
        v = @createTempVariable context
        @prepend """var #{v} = context.object["#{statement.field.identifier}"] ;"""
        return """context.object["#{statement.field.identifier}"] = (#{v} != null ? #{v} : 0) #{op} #{@transpile(statement.expression,context,true)}"""
    else
      f = statement.field

      if f.expression instanceof Program.Variable
        if f.expression.identifier == "this"
          recipient = "context.object"
        else if context.local_variables[f.expression.identifier]
          @code.push """if (#{f.expression.identifier} == null) {#{f.expression.identifier} = {};}"""
          recipient = f.expression.identifier
        else
          @code.push """if (context.object["#{f.expression.identifier}"] == null) {context.object["#{f.expression.identifier}"] = {};}"""
          recipient = """context.object["#{f.expression.identifier}"]"""
      else
        recipient = @evaluated f.expression,context

      chain = recipient
      if f.chain.length>1
        for i in [0..f.chain.length-2] by 1
          v = @evaluated f.chain[i],context
          chain += "[#{v}]"
          @code.push """if (#{chain} == null) {#{chain} = {} ;}"""
      v = @evaluated f.chain[f.chain.length-1],context
      """#{chain}[#{v}] = (#{chain}[#{v}] != null ? #{chain}[#{v}] : 0) #{op} #{@transpile(statement.expression,context,true)}"""

  transpileOperation:(op,context)->
    if op.operation in ["+"]
      return @transpile(op.term1,context,true) + op.operation + @transpile(op.term2,context,true)
    else if op.operation in ["-","*","/","%"]
      return "((#{@transpile(op.term1,context,true)} #{op.operation} #{@transpile(op.term2,context,true)})||0)"
    else if op.operation in ["==","!=","<",">","<=",">="]
      return """((#{@transpile(op.term1,context,true)} #{op.operation} #{@transpile(op.term2,context,true)})? 1 : 0)"""
    else if op.operation == "and"
      return """((#{@transpile(op.term1,context,true)} && #{@transpile(op.term2,context,true)})? 1 : 0)"""
    else if op.operation == "or"
      return """((#{@transpile(op.term1,context,true)} || #{@transpile(op.term2,context,true)})? 1 : 0)"""
    else if op.operation == "^"
      return """Math.pow(#{@transpile(op.term1,context,true)},#{@transpile(op.term2,context,true)})"""
    else
      return ""

  transpileBraced:(expression,context,retain)->
    return "(#{@transpile(expression.expression,context,retain)})"

  transpileNegate:(expression,context,retain)->
    return "- #{@transpile(expression.expression,context,retain)}"

  transpileNot:(expression,context,retain)->
    return "((#{@transpile(expression.expression,context,retain)})? 0 : 1)"

  evaluated:(expression,context)->
    if expression instanceof Program.Value
      if expression.type == Program.Value.TYPE_NUMBER
        return ""+expression.value
      else if expression.type == Program.Value.TYPE_STRING
        return "\"#{expression.value.replace(/"/g,'\\\"')}\""
    else if expression instanceof Program.Variable
      if context.local_variables[expression.identifier]
        return expression.identifier

    v = @createTempVariable context
    @prepend """var #{v} = #{@transpile(expression,context,true)} ;"""
    return v

  transpileValue:(value,context)->
    switch value.type
      when Program.Value.TYPE_NUMBER
        return ""+value.value
      when Program.Value.TYPE_STRING
        return "\"#{value.value.replace(/"/g,'\\\"')}\""
      when Program.Value.TYPE_ARRAY
        res = "["
        for e,i in value.value
          res += ", " if i!=0
          res += @transpile(e,context,true)
        res += "]"
        return res

  transpileVariable:(variable,context)->
    v = variable.identifier
    if v == "this"
      return "context.object"
    else if context.local_variables[v]
      return "#{v}"
    else
      return """_msResolveVariable("#{v}")"""

  transpileField:(field,context)->
    if field.expression instanceof Program.Variable and field.expression.identifier == "this"
      res = "context.object"
    else
      res = @transpile(field.expression,context,true)

    for c in field.chain
      res = """_msResolveField(#{res},#{@transpile(c,context,true)})"""

    return res

  transpileFieldParent:(field,context)->
    res = @transpile(field.expression,context,true)
    for i in [0..field.chain.length-2] by 1
      c = field.chain[i]
      res = """_msResolveField(#{res},#{@transpile(c,context,true)})"""

    return res


  transpileFunctionCall:(call,context)->
    if call.expression instanceof Program.Field
      parent = @transpileFieldParent(call.expression,context)
      field = @transpile(call.expression.chain[call.expression.chain.length-1],context,true)

      res = "_msApply(#{parent},#{field}"
      for a,i in call.args
        res += ", "
        res += @transpile(a,context,true)
      res += ")"
      res
    else if call.expression instanceof Program.Variable
      if JSTranspiler.predefined_functions[call.expression.identifier]?
        res = JSTranspiler.predefined_functions[call.expression.identifier]
        res += "("
        for a,i in call.args
          res += ", " if i>0
          res += @transpile(a,context,true)

        res += ")"
        res
      else if context.local_variables[call.expression.identifier]?
        v = call.expression.identifier
        args = ""
        for a,i in call.args
          if i>0 then args += ", "
          args += @transpile(a,context,true)

        res = """((typeof #{v} == "function")? (#{v}(#{args})) : #{v})"""
      else
        res = """_msInvoke("#{call.expression.identifier}" """
        for a,i in call.args
          res += ", "
          res += @transpile(a,context,true)

        res += ")"
        res
    else
      res = @transpile(call.expression,context,true)
      res += "("
      for a,i in call.args
        res += ", " if i>0
        res += @transpile(a,context,true)

      res += ")"
      res


  transpileSequence:(sequence,context,retain)->
    for s,i in sequence
      res = @transpile(s,context,(i == sequence.length-1) and retain)
      if i<sequence.length-1
        @prepend(res+" ;")
      else if s.no_expression
        @prepend(res+" ;")
        res = "0"

    res

  transpileFor:(forloop,context,retain)->
    range_from = @createTempVariable context
    range_to = @createTempVariable context
    range_by = @createTempVariable context
    timeout_count = @createTempVariable context

    @code.push """var #{range_from} = #{@transpile(forloop.range_from,context,true)} ;"""
    @code.push """var #{range_to} = #{@transpile(forloop.range_to,context,true)} ;"""
    @code.push """var #{timeout_count} = 0 ;"""

    if forloop.range_by != 0
      @code.push """var #{range_by} = #{@transpile(forloop.range_by,context,true)} ;"""
    else
      @code.push """var #{range_by} = #{range_from}<#{range_to} ? 1 : -1 ;"""

    context.local_variables[forloop.iterator] = true
    @prepend "for (var #{forloop.iterator}=#{range_from} ; #{range_by}>0?#{forloop.iterator}<=#{range_to}:#{forloop.iterator}>=#{range_to} ; #{forloop.iterator}+=#{range_by}) {\n"

    save_breakable = context.breakable
    save_continuable = context.continuable

    context.breakable = true
    context.continuable = true

    @openBlock()
    @prepend """\nif (#{timeout_count}++>1000) {
      #{timeout_count} = 0 ;
      if (Date.now()>context.timeout) {
        context.location = {
          token: {
            line: #{forloop.token.line},
            column: #{forloop.token.column}
          }
        }
        throw('Timeout');
      }
    }
    """
    res = @transpileSequence(forloop.sequence,context)
    res += "\n}"
    @code.push res
    @closeBlock()
    context.breakable = save_breakable
    context.continuable = save_continuable
    return "0"

  transpileForIn:(forloop,context,retain)->
    source = @createTempVariable context
    list = @createTempVariable context
    length = @createTempVariable context
    timeout_count = @createTempVariable context
    iter = @createTempVariable context

    @prepend """var #{source} = #{@transpile(forloop.list,context,true)} ; """
    @prepend """var #{list} = Array.isArray(#{source}) ? #{source} : Object.keys(#{source}) ;"""
    @prepend """var #{length} = #{list}.length ;"""
    @prepend """var #{timeout_count} = 0 ;"""

    @prepend """var #{forloop.iterator} ;"""
    context.local_variables[forloop.iterator] = true
    @prepend "for (var #{iter} = 0 ; #{iter}<#{length} ; #{iter}++ ) {\n"
    @prepend "#{forloop.iterator} = #{list}[#{iter}] ;"

    save_breakable = context.breakable
    save_continuable = context.continuable

    context.breakable = true
    context.continuable = true

    @openBlock()
    @prepend """\nif (#{timeout_count}++>1000) {
      #{timeout_count} = 0 ;
      if (Date.now()>context.timeout) {
        context.location = {
          token: {
            line: #{forloop.token.line},
            column: #{forloop.token.column}
          }
        }
        throw('Timeout');
      }
    }
    """
    @prepend """if (#{forloop.iterator} == null) { continue ; }"""

    res = @transpileSequence(forloop.sequence,context)
    res += "\n}"
    @code.push res
    @closeBlock()
    context.breakable = save_breakable
    context.continuable = save_continuable
    return "0"

  transpileWhile:(whiloop,context,retain)->
    timeout_count = @createTempVariable context

    @code.push """var #{timeout_count} = 0 ;"""

    @prepend "while (true) {\n"
    @prepend "  if (! (#{@transpile(whiloop.condition,context,true)})) { break ; }\n"

    save_breakable = context.breakable
    save_continuable = context.continuable

    context.breakable = true
    context.continuable = true

    @openBlock()
    @prepend """\nif (#{timeout_count}++>1000) {
      #{timeout_count} = 0 ;
      if (Date.now()>context.timeout) {
        context.location = {
          token: {
            line: #{whiloop.token.line},
            column: #{whiloop.token.column}
          }
        }
        throw('Timeout');
      }
    }
    """
    res = @transpileSequence(whiloop.sequence,context)
    res += "\n}"
    @code.push res
    @closeBlock()
    context.breakable = save_breakable
    context.continuable = save_continuable
    return "0"

  transpileBreak:(statement,context)->
    if context.breakable
      "break"
    else
      ""

  transpileContinue:(statement,context)->
    if context.continuable
      "continue"
    else
      ""

  transpileFunction:(func,context)->
    save = context.local_variables
    context.local_variables = {}

    @openBlock()

    res = "function("
    for a,i in func.args
      res += ", " if i>0
      res += a.name
      context.local_variables[a.name] = true

    res += ") {"

    @prepend res

    for a,i in func.args
      if a.default?
        @prepend """if (#{a.name} == null) #{a.name} = #{@transpile(a.default)} ;"""
      else
        @prepend """if (#{a.name} == null) #{a.name} = 0 ;"""

    seq = func.sequence
    if seq.length>0
      res = @transpileSequence(seq,context,true)
      if seq[func.sequence.length-1] not instanceof Program.Return
        @prepend "return #{res} ;"
      else
        @prepend res ;
    @prepend "}"

    context.local_variables = save
    return @closeBlockNoPush()

  transpileReturn:(ret,context)->
    if ret.expression?
      "return #{@transpile(ret.expression,context,true)} ;"
    else
      "return ;"

  prepend:(line)->
    @code.push(line)

  openBlock:()->
    @code_saves.push @code
    @code = []

  closeBlock:()->
    append = @code.join("\n")
    @code = @code_saves.splice(@code_saves.length-1,1)[0]
    @code.push append

  closeBlockNoPush:()->
    append = @code.join("\n")
    @code = @code_saves.splice(@code_saves.length-1,1)[0]
    append

  createTempVariable:(context)->
    "__temp_"+context.temp_variable_count++


  transpileConditionCase:(chain,index,context,temp)->
    c = chain[index]
    @prepend "if (#{@transpile(c.condition,context,true)}) {"
    @openBlock()
    res = @transpileSequence(c.sequence,context,temp?)
    @closeBlock()
    if temp?
      @prepend "#{temp} = #{res} ;"
    else
      @prepend "#{res} ;"
    @prepend "}"

    if index < chain.length-1
      @prepend "else {"
      @openBlock()
      @transpileConditionCase(chain,index+1,context,temp)
      @closeBlock()
      @prepend "}"
    else if c.else
      @prepend "else {"
      @openBlock()
      res = @transpileSequence(c.else,context,temp?)
      @closeBlock()
      if temp?
        @prepend "#{temp} = #{res} ;"
      else
        @prepend "#{res} ;"
      @prepend "}"


  transpileCondition:(condition,context,retain)->
    temp = null
    if retain
      temp = @createTempVariable(context)
      @prepend "  var #{temp} = 0 ;"

    @transpileConditionCase condition.chain,0,context,temp
    return if retain then temp else ""

  formatField:(field)->
    if field == "constructor" then field = "_constructor"
    field.toString().replace(/"/g,"\\\"")

  transpileCreateObject:(statement,context)->
    res = "{\n"
    for f in statement.fields
      res += """  "#{@formatField(f.field)}": #{@transpile(f.value,context,true)},\n"""

    res += "}"
    res

  transpileCreateClass:(statement,context)->
    if statement.ext?
      classvar = @createTempVariable context
      @prepend "var #{classvar} = #{@transpile(statement.ext,context,true)} ;"
      if statement.ext instanceof Program.Variable
        @prepend """if (!#{classvar}) { #{classvar} = "#{statement.ext.identifier}" }"""

    res = "{\n"
    for f in statement.fields
      res += """  "#{@formatField(f.field)}": #{@transpile(f.value,context,true)},\n"""

    if statement.ext?
      res += """  "class": #{classvar} , """

    res += "}"
    res

  transpileUpdateClass:(statement,context,variable)->
    if statement.ext?
      classvar = @createTempVariable context
      @prepend "var #{classvar} = #{@transpile(statement.ext,context,true)} ;"
      if statement.ext instanceof Program.Variable
        @prepend """if (!#{classvar}) { #{classvar} = "#{statement.ext.identifier}" }"""

    res = "{\n"
    for f in statement.fields
      res += """  "#{@formatField(f.field)}": #{@transpile(f.value,context,true)},\n"""

    if statement.ext?
      res += """  "class": #{classvar} , """

    res += """  "classname": "#{variable}" , """
    res += "}"

    cls = @createTempVariable context
    key = @createTempVariable context
    @prepend """if (context.object["#{variable}"] != null) {
      for (#{key} in #{res}) {
        context.object["#{variable}"][#{key}] = #{res}[#{key}] ;
      }
      #{cls} = context.object["#{variable}"] ;
    }
    else {
      #{cls} = #{res} ;
    }"""

    cls

  transpileNewCall:(statement,context)->
    funcall = statement.expression

    classvar = @createTempVariable context
    objvar = @createTempVariable context

    constructor = """_msApply(#{objvar},"_constructor" """
    fconstructor = """new #{classvar}("""
    for a,i in funcall.args
      a = @transpile(a,context,true)
      constructor += ", "
      constructor += a
      fconstructor += ", " if i>0
      fconstructor += a
    constructor += ") ;"
    fconstructor += ") ;"

    @prepend "var #{classvar} = #{@transpile(funcall.expression,context,true)} ;"
    @prepend """if (typeof #{classvar} == "function") {
      var #{objvar} = #{fconstructor} ;
    } else {
      var #{objvar} = { "class": #{classvar}} ;
      _msResolveParentClass(#{objvar}) ;
      #{constructor}
    } """

    objvar

  exec:(context)->
    eval "var f = function(context) {#{@code} }"
    f(context)

  @predefined_functions =
    "abs": "Math.abs"
    "max": "Math.max"
    "cos": "Math.cos"
    "sin": "Math.sin"
