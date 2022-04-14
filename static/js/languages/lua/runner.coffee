class @Runner
  constructor:(@microvm)->

  init:()->
    @initialized = true

    window.ctx = @microvm.context.global
    window.ctx.print = (text)=> @microvm.context.meta.print text
    src = "js = require 'js'"
    for key of @microvm.context.global
      kd = key
      src += """#{kd} =  js.global.ctx.#{key}\n"""

    src += """print = function(text) js.global.ctx:print(text) end\n"""
    src += "new = js.new\n"
    @run(src)

  run:(program,name="")->
    if not @initialized
      @init()

    #console.info program
    try
      res = fengari.load(program,name)()
    catch err

      line = err.toString().split("]:")[1]
      if line?
        line = line.split(":")[0] or 1
      else
        line = 0

      @microvm.context.location =
        token:
          line: line
          column: 0
      throw err.toString()

    return res

  call:(name,args)->
    try
      res = fengari.load("if #{name} then #{name}() end")()
      res
    catch err
      line = err.toString().split("]:")[1]
      if line?
        line = line.split(":")[0] or 1
      else
        line = 0

      file = err.toString().split('"')[1] or ""
      @microvm.context.location =
        token:
          line: line
          column: 0
          file: file
      throw err.toString()

  toString:(obj)->
    if obj?
      obj.toString()
    else
      "nil"
