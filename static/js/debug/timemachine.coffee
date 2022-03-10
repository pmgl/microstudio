class @TimeMachine
  constructor:(@app)->
    document.getElementById("debug-timemachine-record").addEventListener "click",()=>
      @toggleRecording()

    document.getElementById("debug-timemachine-step-backward").addEventListener "click",()=>
      @stepBackward()

    document.getElementById("debug-timemachine-step-forward").addEventListener "click",()=>
      @stepForward()

    document.getElementById("debug-timemachine-backward").addEventListener "mousedown",()=>
      @startBackward()

    document.getElementById("debug-timemachine-forward").addEventListener "mousedown",()=>
      @startForward()

    document.getElementById("debug-timemachine-loop").addEventListener "click",()=>
      @toggleLoop()

    document.addEventListener "mouseup",()=>
      @stopAll()

    @backwarding = false
    @forwarding = false
    @looping = false
    @app.runwindow.addListener (event)=>@runtimeEvent(event)

    document.getElementById("debug-timemachine-recorder-trail").addEventListener "mousedown",(event)=>
      @dragging = true
      @cursorAction event

    document.addEventListener "mousemove",(event)=>
      if @dragging
        @cursorAction event

    document.addEventListener "mouseup",()=>
      @dragging = false

  cursorAction:(event)->
    if @record_status?
      b = document.getElementById("debug-timemachine-recorder-trail").getBoundingClientRect()
      x = event.clientX-b.x
      max_pos = @record_status.length/@record_status.max*160
      replay_pos = (max_pos-x)/160*@record_status.max
      console.log @record_status
      if not @app.runwindow.isPaused() then @app.runwindow.pause()
      @app.runwindow.postMessage
        name: "time_machine"
        command: "replay_position"
        position: replay_pos

  toggleRecording:()->
    if @recording
      @stopRecording()
    else
      @startRecording()

  startRecording:()->
    @stopLooping()
    @app.runwindow.play()
    @recording = true
    @app.runwindow.postMessage
      name: "time_machine"
      command: "start_recording"
    document.getElementById("debug-timemachine-record").classList.add "recording"

  stopRecording:()->
    @recording = false
    @app.runwindow.postMessage
      name: "time_machine"
      command: "stop_recording"
    document.getElementById("debug-timemachine-record").classList.remove "recording"

  toggleLoop:()->
    if not @looping
      @startLooping()
    else
      @stopLooping()

  startLooping:()->
    if not @app.runwindow.isPaused() then @app.runwindow.pause()
    @stopRecording()
    @looping = true
    @app.runwindow.postMessage
      name: "time_machine"
      command: "start_looping"
    document.getElementById("debug-timemachine-loop").classList.add "looping"

  stopLooping:()->
    if @looping
      @looping = false
      @app.runwindow.postMessage
        name: "time_machine"
        command: "stop_looping"
      document.getElementById("debug-timemachine-loop").classList.remove "looping"

  stepBackward:()->
    @stopLooping()
    if not @app.runwindow.isPaused() then @app.runwindow.pause()
    @app.runwindow.postMessage
      name: "time_machine"
      command: "step_backward"

  stepForward:()->
    @stopLooping()
    if not @app.runwindow.isPaused() then @app.runwindow.pause()
    @app.runwindow.postMessage
      name: "time_machine"
      command: "step_forward"

  startBackward:()->
    @stopLooping()
    if not @app.runwindow.isPaused() then @app.runwindow.pause()
    @backwarding = true
    requestAnimationFrame ()=>@backward()

  startForward:()->
    @stopLooping()
    if not @app.runwindow.isPaused() then @app.runwindow.pause()
    @forwarding = true
    requestAnimationFrame ()=>@forward()

  backward:()->
    return if not @backwarding
    requestAnimationFrame ()=>@backward()

    @app.runwindow.postMessage
      name: "time_machine"
      command: "step_backward"

  forward:()->
    return if not @forwarding
    requestAnimationFrame ()=>@forward()

    @app.runwindow.postMessage
      name: "time_machine"
      command: "step_forward"

  stopAll:()->
    @backwarding = false
    @forwarding = false

  messageReceived:(msg)->
    switch msg.command
      when "status"
        length = msg.length
        head = msg.head
        max = msg.max
        @setPosition length,head,max
        @record_status = msg


  setPosition:(length,head,max)->
    percent = 100*length/max
    document.getElementById("debug-timemachine-recorder-trail").style.background = """linear-gradient(90deg, hsl(180,100%,20%) 0%, hsl(180,100%,10%) #{percent}%,rgba(0,0,0,.1) #{percent}%,rgba(0,0,0,.1) 100%)"""
    document.getElementById("debug-timemachine-recorder-head").style.left = "#{head/max*160-5}px"


  reset:()->
    @stopLooping()
    #@stopRecording()
    setTimeout (()=>@setPosition(0,0,1000)),16

  closed:()->
    @reset()
    @stopRecording()
    @stopAll()

  runtimeEvent:(event)->
    switch event
      when "play","reload"
        @reset()

      when "resume"
        @stopLooping()

      when "started"
        if @recording
          @startRecording()

      #when "pause"
      #when "resume"
      when "exit"
        @reset()
