class @Runner
  constructor:(@microvm)->

  init:()->
    @initialized = true
    window.ctx = @microvm.context.global
    src = ""
    for key of @microvm.context.global
      src += """#{key} =  window.ctx.#{key}\n"""

    window.stdout =
      write:(text)=>
        @microvm.context.meta.print(text)

    window.stderr =
      write:(text)=>
        console.error text

    src += """
import sys

sys.stdout = window.stdout\n
sys.stderr = window.stderr\n
    """

    @run(src)

  run:(program)->
    if not @initialized
      @init()

    #console.info program

    res = python(program)

    program = """
if "draw" in globals():
  window.draw = draw

if "update" in globals():
  window.update = update

if "init" in globals():
  window.init = init
    """

    python(program)

    return res

  call:(name,args)->
    if name in ["draw","update","init"] and typeof window[name] == "function"
      return window[name]()
    else
      return

    time = Date.now()

    prg = """
try:
  #{name}(#{args.join(",")})
except NameError:
  0
    """
    res = python(prg)
    console.info("calling #{name} took: #{Date.now()-time} ms")
    res
