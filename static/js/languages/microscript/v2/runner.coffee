class @Runner
  constructor:(@microvm)->

  init:()->
    @initialized = true
    @system = @microvm.context.global.system
    @system.preemptive = 1
    @main_thread = new Thread
    @threads = [@main_thread]

    @microvm.context.global.print = @microvm.context.meta.print

  run:(src,filename)->
    @init() if not @initialized

    parser = new Parser(src,filename)
    parser.parse()
    if parser.error_info?
      err = parser.error_info
      err.type = "compile"
      throw err

    program = parser.program

    compiler = new Compiler(program)
    time = Date.now()
    res = compiler.exec(@microvm.context)
    time = Date.now()-time
    console.info "exec time: #{time} ms"
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

class @Thread
  constructor:()->
    @status = 0
    @loop = false
    @processor = new Processor()

  start:()->
    @status = "started"

  pause:()->
    if @status == "started"
      @status = "paused"

  resume:()->
    if @status == "paused"
      @status = "resume"

  stop:()->
    @status = "stopped"
