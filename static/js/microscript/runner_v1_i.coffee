class @Runner
  constructor:(@microvm)->

  run:(program)->
    res = 0
    context = @microvm.context
    for s,i in program.statements
      res = s.evaluate context,i == program.statements.length-1
    return res

  call:(name,args)->
    if name instanceof Program.Function
      f = name
    else
      f = @microvm.context.global[name]

    if f?
      if f instanceof Program.Function
        for i in [0..args.length-1]
          a = args[i]
          if typeof a == "number"
            args[i] = new Program.Value null,Program.Value.TYPE_NUMBER,a
          else if typeof a == "string"
            args[i] = new Program.Value null,Program.Value.TYPE_STRING,a
          else
            args[i] = new Program.Value null,Program.Value.TYPE_OBJECT,a

        return new Program.FunctionCall(f.token,f,args).evaluate(@microvm.context,true)
      else if typeof f == "function"
        return f.apply(null,args)
    else
      return 0
