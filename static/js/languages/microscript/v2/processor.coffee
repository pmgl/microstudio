class @Processor
  constructor:(@runner)->
    @locals = []
    @stack = []

    @call_stack = []

    @log = false
    @time_limit = Infinity
    @done = true

  load:(@routine)->
    @resetState()

  resetState:()->
    @local_index = 0
    @stack_index = -1
    @op_index = 0
    @call_stack_index = 0
    @global = null
    @object = null
    @locals_offset = 0
    @call_super = null
    @call_supername = ""
    @done = false

  resolveParentClass:(obj,global)->
    if obj.class? && typeof obj.class == "string"
      if global[obj.class]?
        obj.class = global[obj.class]
        @resolveParentClass obj.class,global
    else if obj.class?
      @resolveParentClass obj.class,global

  applyFunction:(args)->

  routineAsFunction:(routine,context)->
    proc = new Processor(@runner)

    f = ()->
      count = Math.min(routine.num_args,arguments.length)
      proc.load routine

      for i in [0..count-1] by 1
        proc.stack[++proc.stack_index] = arguments[i] or 0

      proc.run context
      res = proc.stack[0]

    f

  argToNative:(arg,context)->
    if arg instanceof Routine
      @routineAsFunction arg,context
    else
      if arg? then arg else 0

  run:(context)->
    routine = @routine
    opcodes = @routine.opcodes
    arg1 = @routine.arg1
    length = opcodes.length

    op_index = @op_index

    stack = @stack
    stack_index = @stack_index

    locals = @locals
    local_index = @local_index

    global = @global or context.global
    object = @object or global

    call_stack = @call_stack

    call_stack_index = @call_stack_index

    call_super = @call_super or global
    call_supername = @call_supername or ""

    locals_offset = @locals_offset

    op_count = 0
    restore_op_index = -1

    while op_index < length
      switch opcodes[op_index]

        when 1 # OPCODE_TYPE
          v = stack[stack_index]
          switch typeof v
            when "number" then stack[stack_index] = "number"
            when "string" then stack[stack_index] = "string"
            when "function" then stack[stack_index] = "function"
            when "object"
              if Array.isArray v
                stack[stack_index] = "list"
              else if v instanceof Routine
                stack[stack_index] = "function"
              else
                stack[stack_index] = "object"

          op_index++

        when 2 # OPCODE_TYPE_VARIABLE
          v = object[arg1[op_index]]
          if not v?
            v = global[arg1[op_index]]
          if not v?
            stack[++stack_index] = 0
          else
            switch typeof v
              when "number" then stack[++stack_index] = "number"
              when "string" then stack[++stack_index] = "string"
              when "function" then stack[++stack_index] = "function"
              else
                if Array.isArray v
                  stack[++stack_index] = "list"
                else if v instanceof Routine
                  stack[++stack_index] = "function"
                else
                  stack[++stack_index] = "object"

          op_index++

        when 3 # OPCODE_TYPE_PROPERTY
          v = stack[stack_index-1][stack[stack_index]]
          if not v?
            stack[--stack_index] = 0
          else
            switch typeof v
              when "number" then stack[--stack_index] = "number"
              when "string" then stack[--stack_index] = "string"
              when "function" then stack[--stack_index] = "function"
              else
                if Array.isArray v
                  stack[--stack_index] = "list"
                else if v instanceof Routine
                  stack[--stack_index] = "function"
                else
                  stack[--stack_index] = "object"

          op_index++

        when 5 # OPCODE_LOAD_THIS
          stack[++stack_index] = object
          op_index++

        when 6 # OPCODE_LOAD_GLOBAL
          stack[++stack_index] = global
          op_index++

        when 8 # OPCODE_LOAD_CONTEXT_VARIABLE
          name = arg1[op_index]
          v = object[name]
          obj = object
          while not v? and obj.class?
            obj = obj.class
            v = obj[name]
          if v?
            stack[++stack_index] = object
            stack[++stack_index] = v
          else
            v = global[name]
            if not v? then v = 0
            stack[++stack_index] = global
            stack[++stack_index] = v
          op_index++

        when 9 # OPCODE_LOAD_CONTEXT_PROPERTY
          obj = stack[stack_index-1]
          v = obj[stack[stack_index]]
          stack[stack_index] = if v? then v else 0
          op_index++

        when 10 # CODE_LOAD_VALUE
          stack[++stack_index] = arg1[op_index++]

        when 11 # OPCODE_LOAD_LOCAL
          stack[++stack_index] = locals[locals_offset+arg1[op_index++]]

        when 12 # OPCODE_LOAD_VARIABLE
          name = arg1[op_index]
          v = object[name]
          if not v? and object.class?
            obj = object
            while not v? and obj.class?
              obj = obj.class
              v = obj[name]

          if not v? then v = global[name]

          if not v?
            token = routine.ref[op_index].token
            id = token.tokenizer.filename+"-"+token.line+"-"+token.column
            if not context.warnings.using_undefined_variable[id]
              context.warnings.using_undefined_variable[id] =
                file: token.tokenizer.filename
                line: token.line
                column: token.column
                expression: name

          stack[++stack_index] = if v? then v else 0
          op_index++

        when 13 # OPCODE_LOAD_LOCAL_OBJECT
          o = locals[locals_offset+arg1[op_index]]
          if typeof o != "object"
            o = locals[locals_offset+arg1[op_index]] = {}

            token = routine.ref[op_index].token
            id = token.tokenizer.filename+"-"+token.line+"-"+token.column
            if not context.warnings.assigning_field_to_undefined[id]
              context.warnings.assigning_field_to_undefined[id] =
                file: token.tokenizer.filename
                line: token.line
                column: token.column
                expression: token.value

          stack[++stack_index] = o
          op_index++

        when 14 # OPCODE_LOAD_VARIABLE_OBJECT
          name = arg1[op_index]
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
            token = routine.ref[op_index].token
            id = token.tokenizer.filename+"-"+token.line+"-"+token.column
            if not context.warnings.assigning_field_to_undefined[id]
              context.warnings.assigning_field_to_undefined[id] =
                file: token.tokenizer.filename
                line: token.line
                column: token.column
                expression: arg1[op_index]

          stack[++stack_index] = v
          op_index++

        when 15 # OPCODE_POP
          stack_index--
          op_index++

        when 16 # OPCODE_LOAD_PROPERTY
          obj = stack[stack_index-1]
          name = stack[stack_index]

          v = obj[name]
          while not v? and obj.class?
            obj = obj.class
            v = obj[name]

          stack[--stack_index] = if v? then v else 0
          op_index++

        when 17 # OPCODE_LOAD_PROPERTY_OBJECT
          v = stack[stack_index-1][stack[stack_index]]
          if typeof v != "object"
            v = stack[stack_index-1][stack[stack_index]] = {}

            token = routine.ref[op_index].token
            id = token.tokenizer.filename+"-"+token.line+"-"+token.column
            if not context.warnings.assigning_field_to_undefined[id]
              context.warnings.assigning_field_to_undefined[id] =
                file: token.tokenizer.filename
                line: token.line
                column: token.column
                expression: stack[stack_index]

          stack[--stack_index] = v
          op_index++

        when 18 # OPCODE_CREATE_OBJECT
          stack[++stack_index] = {}
          op_index++

        when 19 # OPCODE_MAKE_OBJECT
          if typeof stack[stack_index] != "object"
            stack[stack_index] = {}
          op_index++

        when 20 # OPCODE_CREATE_ARRAY
          stack[++stack_index] = []
          op_index++

        when 21 # OPCODE_STORE_LOCAL
          locals[locals_offset+arg1[op_index]] = stack[stack_index]
          op_index++

        when 22 # OPCODE_STORE_LOCAL_POP
          locals[locals_offset+arg1[op_index]] = stack[stack_index--]
          op_index++

        when 23 # OPCODE_STORE_VARIABLE
          object[arg1[op_index++]] = stack[stack_index]

        when 24 # OPCODE_CREATE_PROPERTY
          obj = stack[stack_index-2]
          field = stack[stack_index-1]
          obj[field] = stack[stack_index]
          stack_index -= 2
          op_index++

        when 25 # OPCODE_STORE_PROPERTY
          obj = stack[stack_index-2]
          field = stack[stack_index-1]
          stack[stack_index-2] = obj[field] = stack[stack_index]
          stack_index -= 2
          op_index++

        when 27 # OPCODE_UPDATE_CLASS
          name = arg1[op_index]
          # TODO: set classname to variable name
          if object[name]?
            obj = object[name]
            src = stack[stack_index]
            for key,value of src
              obj[key] = value
          else
            object[name] = stack[stack_index]

          op_index++

        when 28 # OPCODE_CREATE_CLASS
          res = {}
          parent = stack[stack_index]
          if parent
            res.class = parent
          else if arg1[op_index]
            res.class = arg1[op_index]

          stack[stack_index] = res
          op_index++

        when 29 # OPCODE_NEW_CALL
          c = stack[stack_index]
          args = arg1[op_index]

          if typeof c == "function"
            a = []
            for i in [0..args-1] by 1
              a.push stack[stack_index-args+i]

            stack_index -= args
            stack[stack_index-1] = `new c(...a)`
          else
            @resolveParentClass c,global
            res = { class: c }
            con = c.constructor
            while not con and c.class?
              c = c.class
              con = c.constructor

            if con? and con instanceof Routine
              stack[stack_index-args-1] = res
              stack_index--
              cs = call_stack[call_stack_index] or call_stack[call_stack_index] = {}
              call_stack_index++

              cs.routine = routine
              cs.object = object
              cs.super = call_super
              cs.supername = call_supername
              cs.op_index = op_index+1

              locals_offset += routine.locals_size

              routine = con
              opcodes = con.opcodes
              arg1 = con.arg1
              op_index = 0
              length = opcodes.length
              object = res
              call_super = c
              call_supername = "constructor"

              if args<con.num_args
                for i in [args+1..con.num_args] by 1
                  stack[++stack_index] = 0
              else if args>con.num_args
                stack_index -= args-con.num_args
            else
              stack_index -= args
              stack[stack_index] = res
              op_index++

        when 30 # OPCODE_ADD
          b = stack[stack_index--]
          a = stack[stack_index]
          if typeof a == "number" and typeof b == "number"
            if isFinite(a+b)
              stack[stack_index] = a+b
            else
              stack[stack_index] = 0
          else if Array.isArray(a)
            if Array.isArray(b)
              stack[stack_index] = a.concat(b)
            else
              a.push(b)
              stack[stack_index] = a
          else if typeof a == "string" or typeof b == "string"
            stack[stack_index] = a+b
          else
            stack[++stack_index] = a
            stack[++stack_index] = "+"
            @applyFunction 2

          op_index++

        when 31 # OPCODE_SUB
          stack[stack_index-1] -= stack[stack_index--]
          op_index++

        when 32 # OPCODE_MUL
          stack[stack_index-1] *= stack[stack_index--]
          op_index++

        when 33 # OPCODE_DIV
          v = stack[stack_index-1] / stack[stack_index]
          stack[--stack_index] = if isFinite(v) then v else 0
          op_index++

        when 34 # OPCODE_MODULO
          stack[stack_index-1] %= stack[stack_index--]
          op_index++

        when 39 # OPCODE_NEGATE
          stack[stack_index] = -stack[stack_index]
          op_index++

        when 50 # OPCODE_NOT
          stack[stack_index] = if stack[stack_index] == 0 then 1 else 0
          op_index++

        when 60 # OPCODE_ADD_LOCAL
          stack[stack_index] = locals[locals_offset+arg1[op_index]] += stack[stack_index]
          op_index++

        when 61 # OPCODE_SUB_LOCAL
          stack[stack_index] = locals[locals_offset+arg1[op_index]] -= stack[stack_index]
          op_index++

        # when 62 # OPCODE_MUL_LOCAL
        #   stack[stack_index] *= locals[locals_offset+arg1[op_index]] *= stack[stack_index]
        #   op_index++
        #
        # when 63 # OPCODE_DIV_LOCAL
        #   stack[stack_index] = locals[locals_offset+arg1[op_index]] /= stack[stack_index]
        #   op_index++

        when 64 # OPCODE_ADD_VARIABLE
          v1 = object[arg1[op_index]]
          if not v1? then v1 = 0
          v2 = stack[stack_index]

          if typeof v1 == "number" and typeof v2 == "number"
            v1 += v2
            stack[stack_index] = object[arg1[op_index]] = if isFinite(v1) then v1 else 0

          op_index++

        when 65 # OPCODE_SUB_VARIABLE
          v1 = object[arg1[op_index]]
          if not v1? then v1 = 0
          v2 = stack[stack_index]

          if typeof v1 == "number" and typeof v2 == "number"
            v1 -= v2
            stack[stack_index] = object[arg1[op_index]] = if isFinite(v1) then v1 else 0

          op_index++

        when 68 # OPCODE_ADD_PROPERTY
          obj = stack[stack_index-2]
          field = stack[stack_index-1]
          v1 = obj[field]
          v2 = stack[stack_index]
          v1 = 0 if not v1?
          if typeof v1 == "number" and typeof v2 == "number"
            v1 += v2
            stack[stack_index-2] = obj[field] = if isFinite(v1) then v1 else 0

          stack_index -= 2
          op_index++

        when 69 # OPCODE_SUB_PROPERTY
          obj = stack[stack_index-2]
          field = stack[stack_index-1]
          v1 = obj[field]
          v2 = stack[stack_index]
          v1 = 0 if not v1?
          if typeof v1 == "number" and typeof v2 == "number"
            v1 -= v2
            stack[stack_index-2] = obj[field] = if isFinite(v1) then v1 else 0

          stack_index -= 2
          op_index++

        when 70 # OPCODE_MUL_PROPERTY
          obj = stack[stack_index-2]
          field = stack[stack_index-1]
          v1 = obj[field]
          v2 = stack[stack_index]
          v1 = 0 if not v1?
          if typeof v1 == "number" and typeof v2 == "number"
            v1 *= v2
            stack[stack_index-2] = obj[field] = if isFinite(v1) then v1 else 0

          stack_index -= 2
          op_index++

        when 71 # OPCODE_DIV_PROPERTY
          obj = stack[stack_index-2]
          field = stack[stack_index-1]
          v1 = obj[field]
          v2 = stack[stack_index]
          v1 = 0 if not v1?
          if typeof v1 == "number" and typeof v2 == "number"
            v1 /= v2
            stack[stack_index-2] = obj[field] = if isFinite(v1) then v1 else 0

          stack_index -= 2
          op_index++

        when 40 # OPCODE_EQ
          stack[stack_index-1] = if stack[stack_index] == stack[stack_index-1] then 1 else 0
          stack_index--
          op_index++

        when 41 # OPCODE_NEQ
          stack[stack_index-1] = if stack[stack_index] != stack[stack_index-1] then 1 else 0
          stack_index--
          op_index++

        when 42 # OPCODE_LT
          stack[stack_index-1] = if stack[stack_index-1] < stack[stack_index] then 1 else 0
          stack_index--
          op_index++

        when 43 # OPCODE_GT
          stack[stack_index-1] = if stack[stack_index-1] > stack[stack_index] then 1 else 0
          stack_index--
          op_index++

        when 44 # OPCODE_LTE
          stack[stack_index-1] = if stack[stack_index-1] <= stack[stack_index] then 1 else 0
          stack_index--
          op_index++

        when 45 # OPCODE_GTE
          stack[stack_index-1] = if stack[stack_index-1] >= stack[stack_index] then 1 else 0
          stack_index--
          op_index++

        when 95 # FORLOOP_INIT
          # fix loop_by if not set
          iter = arg1[op_index][0]
          loop_to = locals[locals_offset+iter+1] = stack[stack_index-1]
          loop_by = stack[stack_index]
          iterator = locals[locals_offset+iter]

          stack[--stack_index] = 0 # unload 2 values and load default value

          if loop_by == 0
            locals[locals_offset+iter+2] = if loop_to>iterator then 1 else -1
            op_index++
          else
            locals[locals_offset+iter+2] = loop_by
            if (loop_by>0 and iterator>loop_to) or (loop_by<0 and iterator<loop_to)
              op_index = arg1[op_index][1]
            else
              op_index++

        when 96 # FORLOOP_CONTROL
          iter = arg1[op_index][0]
          loop_by = locals[locals_offset+iter+2]
          loop_to = locals[locals_offset+iter+1]
          iterator = locals[locals_offset+iter]
          iterator += loop_by
          if (loop_by>0 and iterator>loop_to) or (loop_by<0 and iterator<loop_to)
            op_index++
          else
            locals[locals_offset+iter] = iterator
            op_index = arg1[op_index][1]

          if op_count++>100
            op_count = 0
            if Date.now() > @time_limit
              restore_op_index = op_index
              op_index = length # stop the loop without adding a condition statement

        when 97 # FORIN_INIT
          v = stack[stack_index]
          stack[stack_index] = 0 # default result
          iterator = arg1[op_index][0]

          if typeof v == "object"
            if Array.isArray(v)
              locals[locals_offset+iterator+1] = v
            else
              v = locals[locals_offset+iterator+1] = Object.keys(v)
          else if typeof v == "string"
            v = locals[locals_offset+iterator+1] = v.split("")
          else
            v = locals[locals_offset+iterator+1] = [v]

          if v.length == 0
            op_index = arg1[op_index][1]
          else
            locals[locals_offset+arg1[op_index][0]] = v[0]
            locals[locals_offset+iterator+2] = 0
            op_index++

        when 98 # FORIN_CONTROL
          iterator = arg1[op_index][0]
          index = locals[locals_offset+iterator+2] += 1
          v = locals[locals_offset+iterator+1]
          if index < v.length
            locals[locals_offset+iterator] = v[index]
            op_index = arg1[op_index][1]
          else
            op_index++

          if op_count++>100
            op_count = 0
            if Date.now() > @time_limit
              restore_op_index = op_index
              op_index = length # stop the loop without adding a condition statement

        when 80 # OPCODE_JUMP
          op_index = arg1[op_index]
          if op_count++>100
            op_count = 0
            if Date.now() > @time_limit
              restore_op_index = op_index
              op_index = length # stop the loop without adding a condition statement

        when 81 # OPCODE_JUMPY
          if stack[stack_index--]
            op_index = arg1[op_index]
          else
            op_index++

        when 82 # OPCODE_JUMPN
          if not stack[stack_index--]
            op_index = arg1[op_index]
          else
            op_index++

        when 83 # OPCODE_JUMPY_NOPOP
          if stack[stack_index]
            op_index = arg1[op_index]
          else
            op_index++

        when 84 # OPCODE_JUMPN_NOPOP
          if not stack[stack_index]
            op_index = arg1[op_index]
          else
            op_index++

        when 90 # OPCODE_FUNCTION_CALL
          args = arg1[op_index]
          f = stack[stack_index]
          if f instanceof Routine
            stack_index--

            cs = call_stack[call_stack_index] or call_stack[call_stack_index] = {}
            call_stack_index++

            cs.routine = routine
            cs.object = object
            cs.super = call_super
            cs.supername = call_supername
            cs.op_index = op_index+1

            locals_offset += routine.locals_size

            routine = f
            opcodes = f.opcodes
            arg1 = f.arg1
            op_index = 0
            length = opcodes.length
            object = global
            call_super = global
            call_supername = ""

            if args<f.num_args
              for i in [args+1..f.num_args] by 1
                stack[++stack_index] = 0
            else if args>f.num_args
              stack_index -= args-f.num_args
          else if typeof f == "function"
              switch args
                when 0
                  v = f()
                  stack[stack_index] = if v? then v else 0
                when 1
                  v = f(@argToNative(stack[stack_index-1],context))
                  stack[stack_index-1] = if v? then v else 0
                  stack_index -= 1
                else
                  argv = []
                  stack_index -= args
                  for i in [0..args-1] by 1
                    argv[i] = @argToNative stack[stack_index+i],context
                  v = f.apply(null, argv)
                  stack[stack_index] = if v? then v else 0
              op_index++
          else
            stack_index -= args
            stack[stack_index] = if f? then f else 0

            token = routine.ref[op_index].token
            id = token.tokenizer.filename+"-"+token.line+"-"+token.column
            if not context.warnings.invoking_non_function[id]
              fc = routine.ref[op_index]
              i1 = fc.expression.token.start
              i2 = fc.token.start+fc.token.length
              context.warnings.invoking_non_function[id] =
                file: token.tokenizer.filename
                line: token.line
                column: token.column
                expression: fc.token.tokenizer.input.substring i1,i2

            op_index++



        when 91 # OPCODE_FUNCTION_APPLY_VARIABLE
          name = stack[stack_index]
          sup = obj = object
          f = obj[name]
          if not f?
            while not f? and sup.class?
              sup = sup.class
              f = sup[name]

            if not f?
              f = global[name]
              sup = global
              obj = global

          args = arg1[op_index]

          if f instanceof Routine
            stack_index -= 1

            cs = call_stack[call_stack_index] or call_stack[call_stack_index] = {}
            call_stack_index++

            cs.routine = routine
            cs.object = object
            cs.super = call_super
            cs.supername = call_supername
            cs.op_index = op_index+1

            locals_offset += routine.locals_size

            routine = f
            opcodes = f.opcodes
            arg1 = f.arg1
            op_index = 0
            length = opcodes.length
            object = obj
            call_super = sup
            call_supername = name


            if args<f.num_args
              for i in [args+1..f.num_args] by 1
                stack[++stack_index] = 0
            else if args>f.num_args
              stack_index -= args-f.num_args
          else if typeof f == "function"
            switch args
              when 0
                v = f.call(obj)
                stack[stack_index] = if v? then v else 0
              when 1
                v = f.call(obj,@argToNative(stack[stack_index-1],context))
                stack[--stack_index] = if v? then v else 0
              else
                argv = []
                stack_index -= args
                for i in [0..args-1] by 1
                  argv[i] = @argToNative stack[stack_index+i],context
                v = f.apply(obj, argv)
                stack[stack_index] = if v? then v else 0
            op_index++
          else
            stack_index -= args
            stack[stack_index] = if f? then f else 0

            token = routine.ref[op_index].token
            id = token.tokenizer.filename+"-"+token.line+"-"+token.column

            if not context.warnings.invoking_non_function[id]
              fc = routine.ref[op_index]
              i1 = fc.expression.token.start
              i2 = fc.token.start+fc.token.length
              context.warnings.invoking_non_function[id] =
                file: token.tokenizer.filename
                line: token.line
                column: token.column
                expression: fc.token.tokenizer.input.substring i1,i2

            op_index++

        when 92 # OPCODE_FUNCTION_APPLY_PROPERTY
          obj = stack[stack_index-1]
          sup = obj
          name = stack[stack_index]
          f = obj[name]
          while not f? and sup.class?
            sup = sup.class
            f = sup[name]

          args = arg1[op_index]

          if f instanceof Routine
            stack_index -= 2

            cs = call_stack[call_stack_index] or call_stack[call_stack_index] = {}
            call_stack_index++

            cs.object = object
            cs.super = call_super
            cs.supername = call_supername
            cs.routine = routine
            cs.op_index = op_index+1

            locals_offset += routine.locals_size

            routine = f
            opcodes = f.opcodes
            arg1 = f.arg1
            op_index = 0
            length = opcodes.length
            object = obj
            call_super = sup
            call_supername = name

            if args<f.num_args
              for i in [args+1..f.num_args] by 1
                stack[++stack_index] = 0
            else if args>f.num_args
              stack_index -= args-f.num_args
          else if typeof f == "function"
            switch args
              when 0
                v = f.call(obj)
                stack[--stack_index] = if v? then v else 0
              when 1
                v = f.call(obj,@argToNative(stack[stack_index-2],context))
                stack[stack_index-2] = if v? then v else 0
                stack_index -= 2
              else
                argv = []
                stack_index -= args+1
                for i in [0..args-1] by 1
                  argv[i] = @argToNative stack[stack_index+i],context
                v = f.apply(obj, argv)
                stack[stack_index] = if v? then v else 0
            op_index++
          else
            stack_index -= args+1
            stack[stack_index] = if f? then f else 0

            token = routine.ref[op_index].token
            id = token.tokenizer.filename+"-"+token.line+"-"+token.column
            if not context.warnings.invoking_non_function[id]
              fc = routine.ref[op_index]
              i1 = fc.expression.token.start
              i2 = fc.token.start+fc.token.length
              context.warnings.invoking_non_function[id] =
                file: token.tokenizer.filename
                line: token.line
                column: token.column
                expression: fc.token.tokenizer.input.substring i1,i2

            op_index++


        when 93 # OPCODE_SUPER_CALL
          if call_super? and call_supername?
            sup = call_super
            f = null
            while not f? and sup.class?
              sup = sup.class
              f = sup[call_supername]

            if f? and f instanceof Routine
              args = arg1[op_index]

              cs = call_stack[call_stack_index] or call_stack[call_stack_index] = {}
              call_stack_index++

              cs.object = object
              cs.super = call_super
              cs.supername = call_supername
              cs.routine = routine
              cs.op_index = op_index+1

              locals_offset += routine.locals_size

              routine = f
              opcodes = f.opcodes
              arg1 = f.arg1
              op_index = 0
              length = opcodes.length
              call_super = sup

              if args<f.num_args
                for i in [args+1..f.num_args] by 1
                  stack[++stack_index] = 0
              else if args>f.num_args
                stack_index -= args-f.num_args

        when 94 # OPCODE_RETURN
          local_index -= arg1[op_index]

          if call_stack_index <= 0
            op_index = length
          else
            cs = call_stack[--call_stack_index]

            object = cs.object
            call_super = cs.super
            call_supername = cs.supername
            routine = cs.routine
            op_index = cs.op_index

            opcodes = routine.opcodes
            arg1 = routine.arg1
            locals_offset -= routine.locals_size
            length = opcodes.length

        when 100 # OPCODE_UNARY_FUNC
          v = arg1[op_index](stack[stack_index])
          stack[stack_index] = if isFinite(v) then v else 0
          op_index++

        when 101 # OPCODE_BINARY_FUNC
          v = arg1[op_index](stack[stack_index-1],stack[stack_index])
          stack[--stack_index] = if isFinite(v) then v else 0
          op_index++

        when 110 # OPCODE_AFTER
          t = @runner.createThread stack[stack_index-1], stack[stack_index], false
          stack[--stack_index] = t
          op_index += 1
          # add thread to the runner thread list

        when 111 # OPCODE_EVERY
          t = @runner.createThread stack[stack_index-1], stack[stack_index], true
          stack[--stack_index] = t
          op_index += 1
          # add thread to the runner thread list

        when 112 # OPCODE_DO
          t = @runner.createThread stack[stack_index], 0, false
          stack[stack_index] = t
          op_index += 1
          # add thread to the runner thread list

        when 113 # OPCODE_SLEEP
          sleep_time = if isFinite(stack[stack_index]) then stack[stack_index] else 0
          @runner.sleep(sleep_time)
          op_index += 1
          restore_op_index = op_index
          op_index = length # stop the thread

        when 200 # COMPILED
          stack_index = arg1[op_index](stack,stack_index,locals,locals_offset,object)
          op_index++

        else
          throw "Unsupported operation: #{opcodes[op_index]}"


    if restore_op_index>=0
      @op_index = restore_op_index

      @routine = routine
      @stack_index = stack_index
      @local_index = local_index

      @object = object

      @call_stack_index = call_stack_index
      @call_super = call_super
      @call_supername = call_supername

      @locals_offset = locals_offset
      @done = false
    else
      @op_index = 0
      @done = true
      if @routine.callback?
        @routine.callback stack[stack_index]
        @routine.callback = null

      # console.info """stack_index: #{stack_index}"""
      # console.info stack

    if @log
      console.info("total operations: "+op_count)
      console.info("stack_index: #{stack_index}")
      console.info("result: #{stack[stack_index]}")
    return stack[stack_index]
