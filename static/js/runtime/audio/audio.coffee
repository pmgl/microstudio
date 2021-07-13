class @AudioCore
  constructor:(@runtime)->
    @buffer = []
    @getContext()
    @playing = []
    @wakeup_list = []

  isStarted:()->
    @context.state == "running"

  addToWakeUpList:(item)->
    @wakeup_list.push item

  getInterface:()->
    audio = @
    @interface =
      beep:(sequence)->audio.beep(sequence)
      cancelBeeps:()->audio.cancelBeeps()
      playSound:(sound,volume,pitch,pan,loopit)->audio.playSound(sound,volume,pitch,pan,loopit)
      playMusic:(music,volume,loopit)->audio.playMusic(music,volume,loopit)

  playSound:(sound,volume=1,pitch=1,pan=0,loopit=0)->
    if typeof sound == "string"
      s = @runtime.sounds[sound]
      if s?
        return s.play(volume,pitch,pan,loopit)

    return 0

  playMusic:(music,volume=1,loopit=0)->
    if typeof music == "string"
      m = @runtime.music[music]
      if m?
        return m.play(volume,loopit)

    return 0

  start:()->
    if false #@context.audioWorklet?
      blob = new Blob([ AudioCore.processor ] , { type: "text/javascript" })
      @context.audioWorklet.addModule(window.URL.createObjectURL(blob)).then ()=>
        @node = new AudioWorkletNode(@context,"my-worklet-processor")
        @node.connect(@context.destination)
        @flushBuffer()
    else
      @script_processor = @context.createScriptProcessor(4096,2,2)
      @processor_funk = (event) => @onAudioProcess(event)
      @script_processor.onaudioprocess = @processor_funk
      @script_processor.connect @context.destination
      #@context.destination.start()
      #@script_processor.start()

      src = """
      class AudioWorkletProcessor {
        constructor() {
          this.port = {} ;

          var _this = this ;

          this.port.postMessage = function(data) {
            var event = { data: data } ;
            _this.port.onmessage(event) ;
          }
        }

      } ;
      registerProcessor = function(a,b) {
        return new MyWorkletProcessor()
      } ;

      """
      src += AudioCore.processor
      @node = eval(src)
      @flushBuffer()
      @bufferizer = new AudioBufferizer(@node)

  flushBuffer:()->
    while @buffer.length>0
      @node.port.postMessage @buffer.splice(0,1)[0]

  onAudioProcess:(event)->
    left = event.outputBuffer.getChannelData(0)
    right = event.outputBuffer.getChannelData(1)
    outputs = [[left,right]]
    @bufferizer.flush(outputs)
    #@node.process(null,outputs,null)
    return

  getContext:()->
    if not @context?
      @context = new (window.AudioContext || window.webkitAudioContext)

      if @context.state != "running"
        activate = ()=>
          console.info "resuming context"
          @context.resume()
          @start() if @beeper?
          for item in @wakeup_list
            item.wakeUp()
          document.body.removeEventListener "touchend",activate
          document.body.removeEventListener "mouseup",activate

        document.body.addEventListener "touchend",activate
        document.body.addEventListener "mouseup",activate
      else if @beeper?
        @start()

    @context

  getBeeper:()->
    if not @beeper?
      @beeper = new Beeper @

      if @context.state == "running"
        @start()

    @beeper

  beep:(sequence)->
    @getBeeper().beep(sequence)

  addBeeps:(beeps)->
    for b in beeps
      b.duration *= @context.sampleRate
      b.increment = b.frequency/@context.sampleRate

    if @node?
      @node.port.postMessage JSON.stringify
        name: "beep"
        sequence: beeps
    else
      @buffer.push JSON.stringify
        name: "beep"
        sequence: beeps

  cancelBeeps:()->
    if @node?
      @node.port.postMessage JSON.stringify
        name: "cancel_beeps"
    else
      @buffer.push JSON.stringify
        name: "cancel_beeps"

    @stopAll()

  addPlaying:(item)->
    @playing.push item

  removePlaying:(item)->
    index = @playing.indexOf item
    if index>=0
      @playing.splice(index,1)

  stopAll:()->
    for p in @playing
      try
        p.stop()
      catch err
        console.error err
    @playing = []

  @processor: """
class MyWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.beeps = [] ;
    this.last = 0 ;
    this.port.onmessage = (event) => {
      let data = JSON.parse(event.data) ;
      if (data.name == "cancel_beeps")
      {
        this.beeps = [] ;
      }
      else if (data.name == "beep")
      {
        let seq = data.sequence ;
        for (let i=0;i<seq.length;i++)
        {
          let note = seq[i] ;
          if (i>0)
          {
            seq[i-1].next = note ;
          }

          if (note.loopto != null)
          {
            note.loopto = seq[note.loopto] ;
          }

          note.phase = 0 ;
          note.time = 0 ;
        }

        this.beeps.push(seq[0]) ;
      }
    } ;
  }

  process(inputs, outputs, parameters) {
    var output = outputs[0] ;
    var phase ;
    for (var i=0;i<output.length;i++)
    {
      var channel = output[i] ;
      if (i>0)
      {
        for (var j=0;j<channel.length;j++)
        {
          channel[j] = output[0][j]
        }
      }
      else
      {
        for (var j=0;j<channel.length;j++)
        {
          let sig = 0 ;
          for (var k=this.beeps.length-1;k>=0;k--)
          {
            let b = this.beeps[k];
            let volume = b.volume ;
            if (b.time/b.duration>b.span)
              {
                volume = 0 ;
              }
            if (b.waveform == "square")
            {
              sig += b.phase>.5? volume : -volume ;
            }
            else if (b.waveform == "saw")
            {
              sig += (b.phase*2-1)*volume ;
            }
            else if (b.waveform == "noise")
            {
              sig += (Math.random()*2-1)*volume ;
            }
            else
            {
              sig += Math.sin(b.phase*Math.PI*2)*volume ;
            }

            b.phase = (b.phase+b.increment)%1 ;
            b.time += 1 ;
            if (b.time>=b.duration)
            {
              b.time = 0 ;
              if (b.loopto != null)
              {
                if (b.repeats != null && b.repeats>0)
                {
                  if (b.loopcount == null)
                  {
                    b.loopcount = 0 ;
                  }
                  b.loopcount++ ;
                  if (b.loopcount>=b.repeats)
                  {
                    b.loopcount = 0 ;
                    if (b.next != null)
                    {
                      b.next.phase = b.phase ;
                      b = b.next ;
                      this.beeps[k] = b ;
                    }
                    else
                    {
                      this.beeps.splice(k,1) ;
                    }
                  }
                  else
                  {
                    b.loopto.phase = b.phase ;
                    b = b.loopto ;
                    this.beeps[k] = b ;
                  }
                }
                else
                {
                  b.loopto.phase = b.phase ;
                  b = b.loopto ;
                  this.beeps[k] = b ;
                }
              }
              else if (b.next != null)
              {
                b.next.phase = b.phase ;
                b = b.next ;
                this.beeps[k] = b ;
              }
              else
              {
                this.beeps.splice(k,1) ;
              }
            }
          }
          this.last = this.last*.9+sig*.1 ;
          channel[j] = this.last ;
        }
      }
    }
    return true ;
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor);
"""

class @AudioBufferizer
  constructor:(@node)->
    @buffer_size = 4096
    @chunk_size = 512
    @chunks = []
    @nb_chunks = @buffer_size/@chunk_size
    for i in [0..@nb_chunks-1] by 1
      left = (0 for k in [0..@chunk_size-1])
      right = (0 for k in [0..@chunk_size-1])
      @chunks[i] = [[left,right]]

    @current = 0
    setInterval (()=>@step()),@chunk_size/44100*1000

  step:()->
    return if @current>=@chunks.length
    @node.process(null,@chunks[@current],null)
    @current++
    return

  flush:(outputs)->
    while @current<@chunks.length
      @step()
    @current = 0

    left = outputs[0][0]
    right = outputs[0][1]
    index = 0
    chunk = 0
    for i in [0..@chunks.length-1]
      chunk = @chunks[i]
      l = chunk[0][0]
      r = chunk[0][1]
      for k in [0..l.length-1]
        left[index] = l[k]
        right[index] = r[k]
        index += 1
    return
