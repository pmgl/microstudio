class AudioEngine
  constructor:(@sampleRate)->
    @voices = []
    @voice_index = 0
    @num_voices = 8

    for i in [0..@num_voices-1]
      @voices[i] = new Voice @

    @instruments = []
    @instruments.push new Instrument @

    @avg = 0
    @samples = 0
    @time = 0

    @layer =
      inputs: @inputs

    @start = Date.now()

  event:(data)->
    if data[0] == 144 and data[2]>0
      @instruments[0].noteOn(data[1],data[2])
    else if data[0] == 128 or (data[0] == 144 and data[2] == 0)
      @instruments[0].noteOff(data[1])
    else if data[0]>=176 and data[0]<192 and data[1] == 1 # modulation wheel
      @instruments[0].setModulation(data[2]/127)
    else if data[0]>=224 and data[0]<240 # pitch bend
      v = (data[1]+128*data[2])
      console.info "PB value=#{v}"
      if v>=8192
        v = (v-8192)/(16383-8192)
        v = .5+.5*v
      else
        v = .5*v/8192
      console.info("Pitch Bend = #{v}")
      @instruments[0].setPitchBend(v)

    return

  getTime:()->
    (Date.now()-@start)/1000

  getVoice:()->
    best = @voices[0]

    for i in [1..@voices.length-1]
      v = @voices[i]
      if best.on
        if v.on
          if v.noteon_time<best.noteon_time
            best = v
        else
          best = v
      else
        if not v.on and v.env1.sig<best.env1.sig
          best = v

    return best

  updateVoices:()->
    for v in @voices
      v.update()

    for l in @instruments[0].layers
      l.update()
    return

  process:(inputs,outputs,parameters)->
    output = outputs[0]
    time = Date.now()
    res = [0,0]

    for inst in @instruments
      inst.process(output[0].length)

    for channel,i in output
      if i<2
        for j in [0..channel.length-1] by 1
          sig = 0

          for inst in @instruments
            sig += inst.output[i][j]

          sig *= .125
          sig = if sig<0 then -(1-Math.exp(sig)) else 1-Math.exp(-sig)

          channel[j] = sig

    @time += Date.now()-time
    @samples += channel.length
    if @samples >= @sampleRate
      @samples -= @sampleRate
      console.info @time+" ms ; buffer size = "+channel.length
      @time = 0

    return

`
class MyWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.synth = new AudioEngine(sampleRate)
    this.port.onmessage = (e) => {
      console.info(e)
      var data = JSON.parse(e.data)
      if (data.name == "note")
        {
          this.synth.event(data.data)
        }
      else if (data.name == "param")
        {
          var value = data.value
          var s = data.id.split(".")
          data = this.synth.instruments[0].layers[0].inputs
          while (s.length>1)
            {
              data = data[s.splice(0,1)[0]]
            }
          data[s[0]] = value
          this.synth.updateVoices()
        }
    }
  }

  process(inputs, outputs, parameters) {
    this.synth.process(inputs,outputs,parameters)
    return true
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor)
`
