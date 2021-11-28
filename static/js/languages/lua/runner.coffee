class @Runner
  constructor:(@microvm)->

  init:()->
    @initialized = true

    window.ctx = @microvm.context.global
    window.ctx.print = @microvm.context.meta.print
    src = "js = require 'js'"
    for key of @microvm.context.global
      src += """#{key} =  js.global.ctx.#{key}\n"""

    @run(src)

  run:(program)->
    if not @initialized
      @init()

    #console.info program

    res = fengari.load(program)()

    return res

  call:(name,args)->
    res = fengari.load("if #{name} then #{name}() end")()
    res
