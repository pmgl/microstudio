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

    f = ()->
      eval(program)

    f.call(@microvm.context.global)

  call:(name,args)->
    f = ()->
      eval("""if (typeof #{name} != "undefined") #{name}() ;""")

    f.call(@microvm.context.global)
