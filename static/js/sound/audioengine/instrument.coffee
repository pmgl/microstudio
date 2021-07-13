class Instrument
  constructor:(@engine)->
    @layers = []
    @layers.push new Layer @
    @modulation = 0
    @pitch_bend = .5

  noteOn:(key,velocity)->
    for l in @layers
      l.noteOn(key,velocity)
    return

  noteOff:(key)->
    for l in @layers
      l.noteOff(key)
    return

  setModulation:(@modulation)->

  setPitchBend:(@pitch_bend)->

  process:(length)->
    if false #@layers.length == 1
      @layers[0].process(length)
      @output = @layers[0].output
    else
      if not @output? or @output[0].length<length
        @output = [new Float64Array(length),new Float64Array(length)]

      for l in @layers
        l.process(length)

      for i in [0..length-1] by 1
        left = 0
        right = 0
        for l in @layers
          left += l.output[0][i]
          right += l.output[1][i]

        # res = @fx1.process(sig)
        @output[0][i] = left
        @output[1][i] = right

      return

FX1 = [
  Distortion
  BitCrusher
  Chorus
  Flanger
  Phaser
  Delay
]

FX2 = [
  Delay
  Reverb
  Chorus
  Flanger
  Phaser
]

class Layer
  constructor:(@instrument)->
    @engine = @instrument.engine
    @voices = []
    @eq = new EQ(@engine)
    @spatializer = new Spatializer(@engine)
    @inputs =
      osc1:
        type: 0
        tune: .5
        coarse: .5
        amp: .5
        mod: 0

      osc2:
        type: 0
        tune: .5
        coarse: .5
        amp: .5
        mod: 0

      combine: 0

      noise:
        amp: 0
        mod: 0

      filter:
        cutoff: 1
        resonance: 0
        type: 0
        slope: 1
        follow: 0

      disto:
        wet:0
        drive:0

      bitcrusher:
        wet: 0
        drive: 0
        crush: 0

      env1:
        a: 0
        d: 0
        s: 1
        r: 0

      env2:
        a: .1
        d: .1
        s: .5
        r: .1
        out: 0
        amount: .5

      lfo1:
        type: 0
        amount: 0
        rate: .5
        out: 0

      lfo2:
        type: 0
        amount: 0
        rate: .5
        out: 0

      fx1:
        type: -1
        amount: 0
        rate: 0

      fx2:
        type: -1
        amount: 0
        rate: 0

      eq:
        low: .5
        mid: .5
        high: .5

      spatialize: .5
      pan: .5
      polyphony: 1
      glide: .5
      sync: 1

      velocity:
        out: 0
        amount: .5
        amp: .5

      modulation:
        out: 0
        amount: .5

  noteOn:(key,velocity)->
    if @inputs.polyphony == 1 and @last_voice? and @last_voice.on
      voice = @last_voice
      voice.noteOn @,key,velocity,true
      @voices.push voice
    else
      voice = @engine.getVoice()
      voice.noteOn @,key,velocity
      @voices.push voice
      @last_voice = voice

    @last_key = key

  removeVoice:(voice)->
    index = @voices.indexOf(voice)
    if index>=0
      @voices.splice index,1

  noteOff:(key)->
    for v in @voices
      if v.key == key
        v.noteOff()
    return

  update:()->
    if @inputs.fx1.type>=0
      if not @fx1? or @fx1 not instanceof FX1[@inputs.fx1.type]
        @fx1 = new FX1[@inputs.fx1.type] @engine
    else
      @fx1 = null

    if @inputs.fx2.type>=0
      if not @fx2? or @fx2 not instanceof FX2[@inputs.fx2.type]
        @fx2 = new FX2[@inputs.fx2.type] @engine
    else
      @fx2 = null

    if @fx1?
      @fx1.update(@inputs.fx1)

    if @fx2?
      @fx2.update(@inputs.fx2)

    @eq.update(@inputs.eq)

  process:(length)->
    if not @output? or @output[0].length<length
      @output = [new Float64Array(length),new Float64Array(length)]

    for i in [@voices.length-1..0] by -1
      v = @voices[i]
      if not v.on and v.env1.sig<.00001
        v.env1.sig = 0
        @removeVoice v

    for i in [0..length-1] by 1
      sig = 0
      for v in @voices
        sig += v.process()

      @output[0][i] = sig
      @output[1][i] = sig

    @spatializer.process(@output,length,@inputs.spatialize,@inputs.pan)

    if @fx1?
      @fx1.process(@output,length)

    if @fx2?
      @fx2.process(@output,length)

    @eq.process(@output,length)

    return
