class @Runner
  constructor:(@microvm)->

  init:()->
    @initialized = true
    window.ctx = @microvm.context.global
    window.ctx.print = (text)=>@microvm.context.meta.print(text)
    src = ""
    for key of @microvm.context.global
      src += """#{key} =  window.ctx.#{key};\n"""

    @run(src)

  run:(program,name="")->
    @init() if not @initialized

    program += "\n//# sourceURL=#{name}.js"

    try
      eval(program)
    catch err
      if err.stack?
        line = err.stack.split(".js:")
        file = line[0]
        line = line[1]
        if file? and line?
          line = line.split(":")[0]
          if file.lastIndexOf("(")>=0
            file = file.substring(file.lastIndexOf("(")+1)

          if file.lastIndexOf("@")>=0
            file = file.substring(file.lastIndexOf("@")+1)

          @microvm.context.location =
            token:
              line: line
              column: 0
      throw err.message

  call:(name,args)->
    try
      if window[name]?
        window[name].apply @microvm.context.global,args
    catch err
      if err.stack?
        line = err.stack.split(".js:")
        file = line[0]
        line = line[1]
        if file? and line?
          line = line.split(":")[0]
          if file.lastIndexOf("(")>=0
            file = file.substring(file.lastIndexOf("(")+1)

          if file.lastIndexOf("@")>=0
            file = file.substring(file.lastIndexOf("@")+1)

          @microvm.context.location =
            token:
              line: line
              file: file
              column: 0
      throw err.message

  toString:(obj)->
    if obj?
      obj.toString()
    else
      "null"
