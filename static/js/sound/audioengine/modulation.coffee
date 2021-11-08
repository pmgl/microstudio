
class ModEnvelope
  constructor:(@voice)->
    @sampleRate = @voice.engine.sampleRate

  init:(@params)->
    @phase = 0
    @update()

  update:(a = @params.a)->
    @a = 1/(@sampleRate*20*Math.pow(a,3)+1)
    @d = 1/(@sampleRate*20*Math.pow(@params.d,3)+1)
    @s = @params.s
    @r = 1/(@sampleRate*20*Math.pow(@params.r,3)+1)

  process:(noteon)->
    if @phase<1
      sig = @sig = @phase = Math.min(1,@phase+@a)
    else if @phase<2
      @phase = Math.min(2,@phase+@d)
      sig = @sig = 1-(@phase-1)*(1-@s)
    else if @phase<3
      sig = @sig = @s
    else
      @phase = @phase+@r
      sig = Math.max(0,@sig*(1-(@phase-3)))

    if @phase<3 and not noteon
      @phase = 3

    sig

class AmpEnvelope
  constructor:(@voice)->
    @sampleRate = @voice.engine.sampleRate
    @sig = 0

  init:(@params)->
    @phase = 0
    @sig = 0
    @update()

  update:(a = @params.a)->
    #@a = Math.exp(Math.log(1/@epsilon)/(@sampleRate*10*Math.pow(@params.a,3)+1))
    @a2 = 1/(@sampleRate*(20*Math.pow(a,3)+.00025))
    @d = Math.exp(Math.log(0.5)/(@sampleRate*(10*Math.pow(@params.d,3)+0.001)))
    @s = DBSCALE(@params.s,2)
    console.info("sustain #{@s}")
    @r = Math.exp(Math.log(0.5)/(@sampleRate*(10*Math.pow(@params.r,3)+0.001)))

  process:(noteon)->
    if @phase<1
      @phase += @a2
      sig = @sig = (@phase*.75+.25)*@phase

      if @phase>=1
        sig = @sig = 1
        @phase = 1
    else if @phase==1
      sig = @sig = @sig*@d
      if sig <= @s
        sig = @sig = @s
        @phase = 2
    else if @phase<3
      sig = @sig = @s
    else
      sig = @sig = @sig*@r

    if @phase<3 and not noteon
      @phase = 3

    sig

class LFO
  constructor:(@voice)->
    @invSampleRate = 1/@voice.engine.sampleRate

  init:(@params,sync)->
    if sync
      rate = @params.rate
      rate = .1+rate*rate*rate*(100-.1)
      t = @voice.engine.getTime()*rate
      @phase = t%1
    else
      @phase = Math.random()
    @process = @processSine
    @update()
    @r1 = Math.random()*2-1
    @r2 = Math.random()*2-1
    @out = 0

  update:()->
    switch @params.type
      when 0 then @process = @processSaw
      when 1 then @process = @processSquare
      when 2 then @process = @processSine
      when 3 then @process = @processTriangle
      when 4 then @process = @processRandom
      when 5 then @process = @processRandomStep
      when 6 then @process = @processSawInv

    @audio_freq = 440*Math.pow(Math.pow(2,1/12),@voice.key-57)

  processSine:(rate)->
    if @params.audio
      r = 1+rate*25
      rate = @audio_freq*r
    else
      rate = .01+rate*rate*20

    @phase = (@phase+rate*@invSampleRate)
    @phase -= 1 if @phase>=1
    p = @phase*2
    if p<1
      p*p*(3-2*p)*2-1
    else
      p -= 1
      1-p*p*(3-2*p)*2

  processTriangle:(rate)->
    if @params.audio
      r = 1+rate*25
      rate = @audio_freq*r
    else
      rate = .01+rate*rate*20

    @phase = (@phase+rate*@invSampleRate)
    @phase -= 1 if @phase>=1
    return (1-4*Math.abs(@phase-.5))

  processSaw:(rate)->
    if @params.audio
      r = 1+rate*25
      rate = @audio_freq*r
    else
      rate = .01+rate*rate*20

    @phase = (@phase+rate*@invSampleRate)
    @phase -= 1 if @phase>=1
    out = (1-@phase*2)
    @out = @out*.97+out*.03

  processSawInv:(rate)->
    if @params.audio
      r = 1+rate*25
      rate = @audio_freq*r
    else
      rate = .01+rate*rate*20

    @phase = (@phase+rate*@invSampleRate)
    @phase -= 1 if @phase>=1
    out = (@phase*2-1)
    @out = @out*.97+out*.03

  processSquare:(rate)->
    if @params.audio
      r = 1+rate*25
      rate = @audio_freq*r
    else
      rate = .01+rate*rate*20

    @phase = (@phase+rate*@invSampleRate)
    @phase -= 1 if @phase>=1
    out = if @phase<.5 then 1 else -1
    @out = @out*.97+out*.03

  processRandom:(rate)->
    if @params.audio
      r = 1+rate*25
      rate = @audio_freq*r
    else
      rate = .01+rate*rate*20

    @phase = (@phase+rate*@invSampleRate)
    if @phase>=1
      @phase -= 1
      @r1 = @r2
      @r2 = Math.random()*2-1

    @r1*(1-@phase)+@r2*@phase

  processRandomStep:(rate)->
    if @params.audio
      r = 1+rate*25
      rate = @audio_freq*r
    else
      rate = .01+rate*rate*20

    @phase = (@phase+rate*@invSampleRate)
    if @phase>=1
      @phase -= 1
      @r1 = Math.random()*2-1
    @out = @out*.97+@r1*.03
