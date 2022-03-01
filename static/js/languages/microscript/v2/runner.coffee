class @Runner
  constructor:(@microvm)->

  init:()->
    @initialized = true
    @system = @microvm.context.global.system
    @system.preemptive = 1
    @main_thread = new Thread
    @threads = [@main_thread]
    @thread_index = 0

    @microvm.context.global.print = @microvm.context.meta.print
    @microvm.context.global.random = new Random(0)

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
    if @microvm.context.global[name]?
      src = "#{name}()"
      parser = new Parser(src,"")
      parser.parse()
      program = parser.program
      compiler = new Compiler(program)
      res = compiler.exec(@microvm.context)
    else
      return 0

  tick:()->
    time = Date.now()

    #if @microvm.context.global.system.preemptive
    #num =
    #for t in @threads
    # ...



class @Thread
  constructor:()->
    @status = 0
    @loop = false
    @processor = new Processor()
    @terminated = false

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

  getInterface:()->
    return
      stop: ()=>@stop()
      resume: ()=>@resume()
