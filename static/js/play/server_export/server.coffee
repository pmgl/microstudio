class @Player
  constructor:(@listener)->
    #src = document.getElementById("code").innerText
    @source_count = 0
    @sources = {}
    @resources = resources
    @request_id = 1
    @pending_requests = {}
    @sources.main = server_code
    # player = new Player() must return before the server is started
    # to ensure global.player is defined
    setTimeout (()=>@start()),1

  start:()->
    @runtime = new Runtime( "",@sources,resources,@)

    @terminal = new Terminal @
    @terminal.start()

    @runtime.start()
    setInterval (()=>@runtime.clock()), 16

  runCommand:(cmd)->

  reportError:(err)->
    @terminal.error err

  log:(text)->
    @terminal.echo text

  exit:()->

  call:(name,args)->
    if @runtime? and @runtime.vm?
      @runtime.vm.call(name,args)

  setGlobal:(name,value)->
    if @runtime? and @runtime.vm?
      @runtime.vm.context.global[name] = value

  exec:(command,callback)->
    if @runtime?
      @runtime.runCommand command,callback

  postMessage:(message)->
    console.info JSON.stringify message


class @Terminal
  constructor:(@runwindow)->
  
  start:()->

  validateLine:(v)->

  setTrailingCaret:()->
 
  echo:(text,scroll=false,classname)->
    console.info text

  error:(text,scroll=false)->
    console.error text

  clear:()->