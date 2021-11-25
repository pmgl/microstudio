class @Runner
  constructor:(@microvm)->

  run:(program)->
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
