class @Runner
  constructor:(@microvm)->

  run:(src)->
    parser = new Parser(src)
    parser.parse()
    if parser.error_info?
      err = parser.error_info
      err.type = "compile"
      throw err

    program = parser.program

    res = new JSTranspiler(program).exec(@microvm.context)
    return res

  call:(name,args)->
    if name instanceof Program.Function
      f = name
    else
      f = @microvm.context.global[name]

    if f? and typeof f == "function"
      return f.apply(null,args)
    else
      return 0
