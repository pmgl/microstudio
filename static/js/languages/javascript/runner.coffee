class @Runner
  constructor:(@microvm)->

  init:()->
    @initialized = true
    window.ctx = @microvm.context.global
    src = ""
    for key of @microvm.context.global
      src += """#{key} =  window.ctx.#{key};\n"""

    @run(src)

  run:(program)->
    @init() if not @initialized

    console.info program

    try
      f = ()->
        eval(program)

      res = f.call(@microvm.context.global)
    catch err
      throw err.toString()

  call:(name,args)->
    try
      f = ()->
        eval("""if (typeof #{name} != "undefined") #{name}() ;""")

      f.call(@microvm.context.global)
    catch err
      throw err.toString()
