`
const TWOPI = 2*Math.PI
const SIN_TABLE = new Float64Array(10001)
const WHITE_NOISE = new Float64Array(100000)
const COLORED_NOISE = new Float64Array(100000)
`
do ->
  for i in [0..10000] by 1
    SIN_TABLE[i] = Math.sin(i/10000*Math.PI*2)

`
const BLIP_SIZE = 512
const BLIP = new Float64Array(BLIP_SIZE+1)
`

do ->
  for p in [1..31] by 2
    for i in [0..BLIP_SIZE] by 1
      x = (i/BLIP_SIZE-.5)*.5
      BLIP[i] += Math.sin(x*2*Math.PI*p)/p

  norm = BLIP[BLIP_SIZE]

  for i in [0..BLIP_SIZE] by 1
    BLIP[i] /= norm

do ->
  n = 0
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0
  for i in [0..99999] by 1
    white = Math.random()*2-1

    n = .99*n+.01*white

    pink = n*6

    WHITE_NOISE[i] = white
    COLORED_NOISE[i] = pink

DBSCALE = (value,range)-> (Math.exp(value*range)/Math.exp(range)-1/Math.exp(range))/(1-1/Math.exp(range))

class SquareOscillator
  constructor:(@voice,osc)->
    @invSampleRate = 1/@voice.engine.sampleRate
    @tune = 1
    @buffer = new Float64Array(32)
    @init(osc) if osc?

  init:(osc,@sync)->
    @phase = if @sync then 0 else Math.random()
    @sig = -1
    @index = 0
    @update(osc)
    for i in [0..@buffer.length-1]
      @buffer[i] = 0
    return

  update:(osc,@sync)->
    c = Math.round(osc.coarse*48)/48
    fine = osc.tune*2-1
    fine = fine*(1+fine*fine)*.5
    @tune = 1*Math.pow(2,c*4)*.25*Math.pow(Math.pow(2,1/12),fine)
    @analog_tune = @tune

  process:(freq,mod)->
    dp = @analog_tune*freq*@invSampleRate
    @phase += dp

    m = .5-mod*.49
    avg = 1-2*m

    if @sig<0
      if @phase>=m
        @sig = 1

        dp = Math.max(0,Math.min(1,(@phase-m)/dp))
        dp *= 16
        dpi = Math.floor(dp)
        a = dp-dpi
        index = @index

        for i in [0..31] by 1
          break if dpi>=512
          @buffer[index] += -1+BLIP[dpi]*(1-a)+BLIP[dpi+1]*a
          dpi += 16
          index = (index+1)%@buffer.length
    else
      if @phase>=1
        dp = Math.max(0,Math.min(1,(@phase-1)/dp))
        dp *= 16
        dpi = Math.floor(dp)
        a = dp-dpi
        index = @index

        @sig = -1
        @phase -= 1
        @analog_tune = if @sync then @tune else @tune*(1+(Math.random()-.5)*.002)

        for i in [0..31] by 1
          break if dpi>=512
          @buffer[index] += 1-BLIP[dpi]*(1-a)-BLIP[dpi+1]*a
          dpi += 16
          index = (index+1)%@buffer.length

    sig = @sig+@buffer[@index]
    @buffer[@index] = 0
    @index = (@index+1)%@buffer.length
    sig-avg

class SawOscillator
  constructor:(@voice,osc)->
    @invSampleRate = 1/@voice.engine.sampleRate
    @tune = 1
    @buffer = new Float64Array(32)
    @init(osc) if osc?

  init:(osc,@sync)->
    @phase = if @sync then 0 else Math.random()
    @sig = -1
    @index = 0
    @jumped = false
    @update(osc)
    for i in [0..@buffer.length-1]
      @buffer[i] = 0
    return

  update:(osc,@sync)->
    c = Math.round(osc.coarse*48)/48
    fine = osc.tune*2-1
    fine = fine*(1+fine*fine)*.5
    @tune = 1*Math.pow(2,c*4)*.25*Math.pow(Math.pow(2,1/12),fine)
    @analog_tune = @tune

  process:(freq,mod)->
    dphase = @analog_tune*freq*@invSampleRate
    @phase += dphase

    #if @phase>=1
    #  @phase -= 1
    #return 1-2*@phase

    slope = 1+mod

    if not @jumped
      sig = 1-2*@phase*slope
      if @phase>=.5
        @jumped = true
        sig = mod-2*(@phase-.5)*slope

        dp = Math.max(0,Math.min(1,(@phase-.5)/dphase))
        dp *= 16
        dpi = Math.floor(dp)
        a = dp-dpi
        index = @index

        if mod>0
          for i in [0..31] by 1
            break if dpi>=512
            @buffer[index] += (-1+BLIP[dpi]*(1-a)+BLIP[dpi+1]*a)*mod
            dpi += 16
            index = (index+1)%@buffer.length
    else
      sig = mod-2*(@phase-.5)*slope
      if @phase>=1
        @jumped = false

        dp = Math.max(0,Math.min(1,(@phase-1)/dphase))
        dp *= 16
        dpi = Math.floor(dp)
        a = dp-dpi
        index = @index

        @phase -= 1
        sig = 1-2*@phase*slope
        @analog_tune = if @sync then @tune else @tune*(1+(Math.random()-.5)*.002)

        for i in [0..31] by 1
          break if dpi>=512
          @buffer[index] += -1+BLIP[dpi]*(1-a)+BLIP[dpi+1]*a
          dpi += 16
          index = (index+1)%@buffer.length

    sig += @buffer[@index]
    @buffer[@index] = 0
    @index = (@index+1)%@buffer.length
    offset = 16*2*dphase*slope
    sig+offset

class SineOscillator
  constructor:(@voice,osc)->
    @sampleRate = @voice.engine.sampleRate
    @invSampleRate = 1/@voice.engine.sampleRate
    @maxRatio = @sampleRate/Math.PI/5/(2*Math.PI)
    @tune = 1
    @init(osc) if osc?

  init:(osc,@sync)->
    @phase = if @sync then .25 else Math.random()
    @update(osc)

  update:(osc,@sync)->
    c = Math.round(osc.coarse*48)/48
    fine = osc.tune*2-1
    fine = fine*(1+fine*fine)*.5
    @tune = 1*Math.pow(2,c*4)*.25*Math.pow(Math.pow(2,1/12),fine)
    @modnorm = 25/Math.sqrt(@tune*@voice.freq)
    @dphase = @tune*@invSampleRate

  sinWave:(x)->
    x = (x-Math.floor(x))*10000
    ix = Math.floor(x)
    ax = x-ix
    SIN_TABLE[ix]*(1-ax)+SIN_TABLE[ix+1]*ax

  sinWave2:(x)->
    x = 2*(x-Math.floor(x))
    if x>1
      x = 2-x
    x*x*(3-2*x)*2-1

  process:(freq,mod)->
    @phase = (@phase+freq*@dphase)

    if @phase>=1
      @phase -= 1
      @analog_tune = if @sync then @tune else @tune*(1+(Math.random()-.5)*.002)
      @dphase = @analog_tune*@invSampleRate

    m1 = mod*@modnorm
    m2 = mod*m1
    p = @phase
    return @sinWave2(p+m1*@sinWave2(p+m2*@sinWave2(p)))

class VoiceOscillator
  constructor:(@voice,osc)->
    @sampleRate = @voice.engine.sampleRate
    @invSampleRate = 1/@voice.engine.sampleRate
    @tune = 1
    @init(osc) if osc?

    @f1 = [320,500,700,1000,500,320,700,500,320,320]
    @f2 = [800,1000,1150,1400,1500,1650,1800,2300,3200,3200]

  init:(osc)->
    @phase = 0
    @grain1_p1 = .25
    @grain1_p2 = .25
    @grain2_p1 = .25
    @grain2_p2 = .25
    @update(osc)

  update:(osc)->
    c = Math.round(osc.coarse*48)/48
    fine = osc.tune*2-1
    fine = fine*(1+fine*fine)*.5
    @tune = 1*Math.pow(2,c*4)*.25*Math.pow(Math.pow(2,1/12),fine)
    @modnorm = 25/Math.sqrt(@tune*@voice.freq)
    @dphase = @tune*@invSampleRate

  sinWave2:(x)->
    x = 2*(x-Math.floor(x))
    if x>1
      x = 2-x
    x*x*(3-2*x)*2-1

  process:(freq,mod)->
    p1 = @phase<1
    @phase = (@phase+freq*@dphase)

    m = mod*(@f1.length-2)
    im = Math.floor(m)
    am = m-im

    f1 = @f1[im]*(1-am)+@f1[im+1]*am
    f2 = @f2[im]*(1-am)+@f2[im+1]*am

    if p1 and @phase>=1
      @grain2_p1 = .25
      @grain2_p2 = .25

    if @phase>=2
      @phase -= 2
      @grain1_p1 = .25
      @grain1_p2 = .25

    x = @phase-1
    x *= x*x
    vol = 1-Math.abs(1-@phase)
    #vol = (@sinWave2(x*.5+.5)+1)*.5

    sig = vol*(@sinWave2(@grain1_p1)*.25+.125*@sinWave2(@grain1_p2))

    @grain1_p1 += f1*@invSampleRate
    @grain1_p2 += f2*@invSampleRate

    x = ((@phase+1)%2)-1
    x *= x*x
    #vol = (@sinWave2(x*.5+.5)+1)*.5
    vol = if @phase<1 then 1-@phase else @phase-1

    sig += vol*(@sinWave2(@grain2_p1)*.25+.125*@sinWave2(@grain2_p2))

    sig += @sinWave2(@phase+.25)

    @grain2_p1 += f1*@invSampleRate
    @grain2_p2 += f2*@invSampleRate

    sig

class StringOscillator
  constructor:(@voice,osc)->
    @sampleRate = @voice.engine.sampleRate
    @invSampleRate = 1/@voice.engine.sampleRate
    @maxRatio = @sampleRate/Math.PI/5/(2*Math.PI)
    @tune = 1
    @init(osc) if osc?

  init:(osc)->
    @index = 0
    @buffer = new Float64Array(@sampleRate/10)
    @update(osc)
    @prev = 0
    @power = 1

  update:(osc)->
    c = Math.round(osc.coarse*48)/48
    fine = osc.tune*2-1
    fine = fine*(1+fine*fine)*.5
    @tune = 1*Math.pow(2,c*4)*.25*Math.pow(Math.pow(2,1/12),fine)

  process:(freq,mod)->
    period = @sampleRate/(freq*@tune)
    x = (@index-period+@buffer.length)%@buffer.length
    ix = Math.floor(x)
    a = x-ix
    reflection = @buffer[ix]*(1-a)+@buffer[(ix+1)%@buffer.length]*a

    m = Math.exp(Math.log(0.99)/freq)

    m = 1
    r = reflection*m+@prev*(1-m)
    @prev = r

    n = Math.random()*2-1


    m = mod*.5
    m = m*m*.999+.001
    sig = n*m+r

    @power = Math.max(Math.abs(sig)*.1+@power*.9,@power*.999)
    sig /= (@power+.0001)

    @buffer[@index] = sig
    @index += 1
    @index = 0 if @index>=@buffer.length
    sig

  processOld:(freq,mod)->
    period = @sampleRate/(freq*@tune)
    x = (@index-period+@buffer.length)%@buffer.length
    ix = Math.floor(x)
    a = x-ix
    reflection = @buffer[ix]*(1-a)+@buffer[(ix+1)%@buffer.length]*a

    #m = .1+Math.exp(-period*mod*.01)*.89
    m = mod
    r = reflection*m+@prev*(1-m)
    @prev = r

    sig = (Math.random()*2-1)*.01+r*.99
    @buffer[@index] = sig/@power
    @power = Math.abs(sig)*.001+@power*.999
    @index += 1
    @index = 0 if @index>=@buffer.length
    sig

class Noise
  constructor:(@voice)->

  init:()->
    @phase = 0
    @seed = 1382
    @n = 0

  process:(mod)->
    @seed = (@seed*13907+12345)&0x7FFFFFFF
    white = (@seed/0x80000000)*2-1
    @n = @n*.99+white*.01
    pink = @n*6
    white*(1-mod)+pink*mod

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

    @audio_freq = 440*Math.pow(Math.pow(2,1/12),@voice.key-57)

  processSine:(rate)->
    if @params.audio
      r = if rate<.5 then .25+rate*rate/.25*.75 else rate*rate*4
      #r = Math.pow(2,(Math.round(rate*48))/12)*.25
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
    rate *= rate
    rate *= rate
    rate = .05+rate*rate*10000
    @phase = (@phase+rate*@invSampleRate)
    @phase -= 1 if @phase>=1
    return (1-4*Math.abs(@phase-.5))

  processSaw:(rate)->
    rate *= rate
    rate *= rate
    rate = .05+rate*rate*10000
    @phase = (@phase+rate*@invSampleRate)
    @phase -= 1 if @phase>=1
    out = (1-@phase*2)
    @out = @out*.97+out*.03

  processSquare:(rate)->
    rate *= rate
    rate *= rate
    rate = .05+rate*rate*10000
    @phase = (@phase+rate*@invSampleRate)
    @phase -= 1 if @phase>=1
    out = if @phase<.5 then 1 else -1
    @out = @out*.97+out*.03

  processRandom:(rate)->
    rate *= rate
    rate *= rate
    rate = .05+rate*rate*10000
    @phase = (@phase+rate*@invSampleRate)
    if @phase>=1
      @phase -= 1
      @r1 = @r2
      @r2 = Math.random()*2-1

    @r1*(1-@phase)+@r2*@phase

  processRandomStep:(rate)->
    rate *= rate
    rate *= rate
    rate = .05+rate*rate*10000
    @phase = (@phase+rate*@invSampleRate)
    if @phase>=1
      @phase -= 1
      @r1 = Math.random()*2-1
    @out = @out*.97+@r1*.03

  processDiscreteRandom:()->

  processSmoothRandom:()->

class Filter
  constructor:(@voice)->
    @sampleRate = @voice.engine.sampleRate
    @invSampleRate = 1/@voice.engine.sampleRate
    @halfSampleRate = @sampleRate*.5

  init:(@layer)->
    @fm00 = 0
    @fm01 = 0
    @fm10 = 0
    @fm11 = 0

    @update()

  update:()->
    switch @layer.inputs.filter.type
      when 0
        @process = @processLowPass
      when 1
        @process = @processBandPass
      when 2
        @process = @processHighPass

  processHighPass:(sig,cutoff,q)->
    w0 = Math.max(0,Math.min(@halfSampleRate,cutoff))*@invSampleRate
    w0 *= 10000
    iw0 = Math.floor(w0)
    aw0 = w0-iw0
    cosw0 = (1-aw0)*SIN_TABLE[iw0+2500]+aw0*SIN_TABLE[iw0+2501]
    sinw0 = (1-aw0)*SIN_TABLE[iw0]+aw0*SIN_TABLE[iw0+1]

    alpha = sinw0 / (2 * q)
    invOnePlusAlpha = 1/(1 + alpha)

    a0 = (-2 * cosw0) * invOnePlusAlpha
    a1 =  (1 - alpha) * invOnePlusAlpha

    onePlusCosw0 = 1 + cosw0
    b0 = onePlusCosw0*.5* invOnePlusAlpha
    b1 = -onePlusCosw0* invOnePlusAlpha
    b2 = b0

    w = sig - a0*@fm00 - a1*@fm01
    sig = b0*w + b1*@fm00 + b2*@fm01

    @fm01 = @fm00
    @fm00 = w

    if @layer.inputs.filter.slope
      w = sig - a0*@fm10 - a1*@fm11
      sig = b0*w + b1*@fm10 + b2*@fm11

      @fm11 = @fm10
      @fm10 = w

    sig

  processBandPass:(sig,cutoff,q)->
    w0 = Math.max(0,Math.min(@halfSampleRate,cutoff))*@invSampleRate
    w0 *= 10000
    iw0 = Math.floor(w0)
    aw0 = w0-iw0
    cosw0 = (1-aw0)*SIN_TABLE[iw0+2500]+aw0*SIN_TABLE[iw0+2501]
    sinw0 = (1-aw0)*SIN_TABLE[iw0]+aw0*SIN_TABLE[iw0+1]

    alpha = sinw0 / (2 * q)
    invOnePlusAlpha = 1/(1 + alpha)

    oneLessCosw0 = 1 - cosw0

    a0 = (-2 * cosw0) * invOnePlusAlpha
    a1 =  (1 - alpha) * invOnePlusAlpha

    b0 = q * alpha * invOnePlusAlpha
    b1 = 0
    b2 = -b0

    w = sig - a0*@fm00 - a1*@fm01
    sig = b0*w + b1*@fm00 + b2*@fm01

    @fm01 = @fm00
    @fm00 = w

    if @layer.inputs.filter.slope
      w = sig - a0*@fm10 - a1*@fm11
      sig = b0*w + b1*@fm10 + b2*@fm11

      @fm11 = @fm10
      @fm10 = w

    sig

  processLowPass:(sig,cutoff,q)->
    w0 = Math.max(0,Math.min(@halfSampleRate,cutoff))*@invSampleRate
    w0 *= 10000
    iw0 = Math.floor(w0)
    aw0 = w0-iw0
    cosw0 = (1-aw0)*SIN_TABLE[iw0+2500]+aw0*SIN_TABLE[iw0+2501]
    sinw0 = (1-aw0)*SIN_TABLE[iw0]+aw0*SIN_TABLE[iw0+1]

    alpha = sinw0 / (2 * q)
    invOnePlusAlpha = 1/(1 + alpha)

    oneLessCosw0 = 1 - cosw0
    b1 = oneLessCosw0 * invOnePlusAlpha
    b0 = b1*.5
    b2 = b0
    a0 = (-2 * cosw0) * invOnePlusAlpha
    a1 =  (1 - alpha) * invOnePlusAlpha

    w = sig - a0*@fm00 - a1*@fm01
    sig = b0*w + b1*@fm00 + b2*@fm01

    @fm01 = @fm00
    @fm00 = w

    if @layer.inputs.filter.slope
      w = sig - a0*@fm10 - a1*@fm11
      sig = b0*w + b1*@fm10 + b2*@fm11

      @fm11 = @fm10
      @fm10 = w

    sig

class Distortion
  constructor:()->
    @amount = .5
    @rate = .5

  update:(data)->
    @amount = data.amount
    @rate = data.rate

  process:(buffer,length)->
    for i in [0..length-1] by 1
      sig = buffer[0][i]
      s = sig*(1+@rate*@rate*99)
      disto = if s<0 then -1+Math.exp(s) else 1-Math.exp(-s)
      buffer[0][i] = (1-@amount)*sig+@amount*disto

      sig = buffer[1][i]
      s = sig*(1+@rate*@rate*99)
      disto = if s<0 then -1+Math.exp(s) else 1-Math.exp(-s)
      buffer[1][i] = (1-@amount)*sig+@amount*disto
    return

class BitCrusher
  constructor:()->
    @phase = 0
    @left = 0
    @right = 0

  update:(data)->
    @amount = Math.pow(2,data.amount*8)
    @rate = Math.pow(2,(1-data.rate)*16)*2

  process:(buffer,length)->
    r = 1-@rate
    crush = 1+15*r*r

    for i in [0..length-1] by 1
      left = buffer[0][i]
      right = buffer[1][i]

      @phase += 1
      if @phase>@amount
        @phase -= @amount
        @left = if left>0 then Math.ceil(left*@rate)/@rate else Math.floor(left*@rate)/@rate
        @right = if right>0 then Math.ceil(right*@rate)/@rate else Math.floor(right*@rate)/@rate

      buffer[0][i] = @left
      buffer[1][i] = @right
    return

class Chorus
  constructor:(@engine)->
    @sampleRate = @engine.sampleRate
    @left_buffer = new Float64Array(@sampleRate)
    @right_buffer = new Float64Array(@sampleRate)
    @phase1 = Math.random()
    @phase2 = Math.random()
    @phase3 = Math.random()
    @f1 = 1.031/@sampleRate
    @f2 = 1.2713/@sampleRate
    @f3 = 0.9317/@sampleRate
    @index = 0

  update:(data)->
    @amount = Math.pow(data.amount,.5)
    @rate = data.rate

  read:(buffer,pos)->
    pos += buffer.length if pos<0
    i = Math.floor(pos)
    a = pos-i
    buffer[i]*(1-a)+buffer[(i+1)%buffer.length]*a

  process:(buffer,length)->
    for i in [0..length-1] by 1
      left = @left_buffer[@index] = buffer[0][i]
      right = @right_buffer[@index] = buffer[1][i]

      @phase1 += @f1*(.5+.5*@rate)
      @phase2 += @f2*(.5+.5*@rate)
      @phase3 += @f3*(.5+.5*@rate)

      p1 = (1+Math.sin(@phase1*Math.PI*2))*@left_buffer.length*.002
      p2 = (1+Math.sin(@phase2*Math.PI*2))*@left_buffer.length*.002
      p3 = (1+Math.sin(@phase3*Math.PI*2))*@left_buffer.length*.002

      @phase1 -= 1 if @phase1>=1
      @phase2 -= 1 if @phase2>=1
      @phase3 -= 1 if @phase3>=1

      s1 = @read(@left_buffer,@index-p1)
      s2 = @read(@right_buffer,@index-p2)
      s3 = @read(@right_buffer,@index-p3)

      pleft = @amount*(s1*.2+s2*.7+s3*.1)
      pright = @amount*(s1*.6+s2*.2+s3*.2)

      left += pleft
      right += pright

      @left_buffer[@index] += pleft*.5*@amount
      @right_buffer[@index] += pleft*.5*@amount
      @index += 1
      @index = 0 if @index>=@left_buffer.length

      buffer[0][i] = left
      buffer[1][i] = right
    return

class Phaser
  constructor:(@engine)->
    @sampleRate = @engine.sampleRate
    @left_buffer = new Float64Array(@sampleRate)
    @right_buffer = new Float64Array(@sampleRate)
    @phase1 = Math.random()
    @phase2 = Math.random()
    @f1 = .0573/@sampleRate
    @f2 = .0497/@sampleRate
    @index = 0

  update:(data)->
    @amount = data.amount
    @rate = data.rate

  read:(buffer,pos)->
    pos += buffer.length if pos<0
    i = Math.floor(pos)
    a = pos-i
    buffer[i]*(1-a)+buffer[(i+1)%buffer.length]*a

  process:(buffer,length)->
    for i in [0..length-1] by 1
      left = buffer[0][i]
      right = buffer[1][i]

      @phase1 += @f1*(.5+.5*@rate)
      @phase2 += @f2*(.5+.5*@rate)

      o1 = (1+Math.sin(@phase1*Math.PI*2))/2
      p1 = @sampleRate*(.0001+.05*o1)

      o2 = (1+Math.sin(@phase2*Math.PI*2))/2
      p2 = @sampleRate*(.0001+.05*o2)

      @phase1 -= 1 if @phase1>=1
      @phase2 -= 1 if @phase2>=1

      @left_buffer[@index] = left
      @right_buffer[@index] = right

      s1 = @read(@left_buffer,@index-p1)
      s2 = @read(@right_buffer,@index-p2)

      @left_buffer[@index] += s1*@rate*.9
      @right_buffer[@index] += s2*@rate*.9

      buffer[0][i] = s1*@amount-left
      buffer[1][i] = s2*@amount-right

      @index += 1
      @index = 0 if @index>=@left_buffer.length
    return

class Flanger
  constructor:(@engine)->
    @sampleRate = @engine.sampleRate
    @left_buffer = new Float64Array(@sampleRate)
    @right_buffer = new Float64Array(@sampleRate)
    @phase1 = 0 #Math.random()
    @phase2 = 0 #Math.random()
    @f1 = .0573/@sampleRate
    @f2 = .0497/@sampleRate
    @index = 0

  update:(data)->
    @amount = data.amount
    @rate = data.rate

  read:(buffer,pos)->
    pos += buffer.length if pos<0
    i = Math.floor(pos)
    a = pos-i
    buffer[i]*(1-a)+buffer[(i+1)%buffer.length]*a

  process:(buffer,length)->
    for i in [0..length-1] by 1
      left = buffer[0][i]
      right = buffer[1][i]

      @phase1 += @f1
      @phase2 += @f2

      o1 = (1+Math.sin(@phase1*Math.PI*2))/2
      p1 = @sampleRate*(.0001+.05*o1)

      o2 = (1+Math.sin(@phase2*Math.PI*2))/2
      p2 = @sampleRate*(.0001+.05*o2)

      @phase1 -= 1 if @phase1>=1
      @phase2 -= 1 if @phase2>=1

      @left_buffer[@index] = left #+s1*.3
      @right_buffer[@index] = right #+s2*.3

      s1 = @read(@left_buffer,@index-p1)
      s2 = @read(@right_buffer,@index-p2)

      @left_buffer[@index] += s1*@rate*.9
      @right_buffer[@index] += s2*@rate*.9

      buffer[0][i] = s1*@amount+left
      buffer[1][i] = s2*@amount+right

      @index += 1
      @index = 0 if @index>=@left_buffer.length
    return

class Delay
  constructor:(@engine)->
    @sampleRate = @engine.sampleRate
    @left_buffer = new Float64Array(@sampleRate*3)
    @right_buffer = new Float64Array(@sampleRate*3)
    @index = 0

  update:(data)->
    @amount = data.amount
    @rate = data.rate
    tempo = (30+Math.pow(@rate,2)*170*4)*4
    tick = @sampleRate/(tempo/60)
    @L = Math.round(tick*4)
    @R = Math.round(tick*4+@sampleRate*0.00075)
    @fb = @amount*.95

  process:(buffer,length)->
    for i in [0..length-1] by 1
      left = buffer[0][i]
      right = buffer[1][i]

      left += @right_buffer[(@index+@left_buffer.length-@L)%@left_buffer.length]*@fb
      right += @left_buffer[(@index+@right_buffer.length-@R)%@right_buffer.length]*@fb

      buffer[0][i] = @left_buffer[@index] = left
      buffer[1][i] = @right_buffer[@index] = right

      @index += 1
      @index = 0 if @index>=@left_buffer.length
    return

class Spatializer
  constructor:(@engine)->
    @sampleRate = @engine.sampleRate
    @left_buffer = new Float64Array(@sampleRate/10)
    @right_buffer = new Float64Array(@sampleRate/10)
    @index = 0
    @left_delay1 = 0
    @left_delay2 = 0
    @right_delay1 = 0
    @right_delay2 = 0

    @left = 0
    @right = 0

    @left_delay1 = Math.round(@sampleRate*9.7913/340)
    @right_delay1 = Math.round(@sampleRate*11.1379/340)
    @left_delay2 = Math.round(@sampleRate*11.3179/340)
    @right_delay2 = Math.round(@sampleRate*12.7913/340)

  process:(buffer,length,spatialize,pan)->
    mnt = spatialize
    mnt2 = mnt*mnt

    left_pan = Math.cos(pan*Math.PI/2)/(1+spatialize)
    right_pan = Math.sin(pan*Math.PI/2)/(1+spatialize)

    left_buffer = buffer[0]
    right_buffer = buffer[1]

    for i in [0..length-1] by 1
      left = left_buffer[i]
      right = right_buffer[i]

      @left = left*.5+@left*.5
      @right = right*.5+@right*.5

      @left_buffer[@index] = @left
      @right_buffer[@index] = @right

      left_buffer[i] = (left-mnt*@right_buffer[(@index+@right_buffer.length-@left_delay1)%@right_buffer.length])*left_pan
      right_buffer[i] = (right-mnt*@left_buffer[(@index+@right_buffer.length-@right_delay1)%@right_buffer.length])*right_pan

      @index += 1
      @index = 0 if @index>=@left_buffer.length
    return

class EQ
  constructor:(@engine)->
    @sampleRate = @engine.sampleRate


    # band pass for medium freqs
    @mid = 900
    q = .5
    w0 = 2*Math.PI*@mid/@sampleRate
    cosw0 = Math.cos(w0)
    sinw0 = Math.sin(w0)
    alpha = sinw0 / (2 * q)
    invOnePlusAlpha = 1/(1 + alpha)
    oneLessCosw0 = 1 - cosw0

    @a0 = (-2 * cosw0) * invOnePlusAlpha
    @a1 =  (1 - alpha) * invOnePlusAlpha

    @b0 = q * alpha * invOnePlusAlpha
    @b1 = 0
    @b2 = -@b0

    @llow = 0
    @rlow = 0

    @lfm0 = 0
    @lfm1 = 0
    @rfm0 = 0
    @rfm1 = 0

    @low = 1
    @mid = 1
    @high = 1

  update:(data)->
    @low = data.low*2
    @mid = data.mid*2
    @high = data.high*2

  processBandPass:(sig,cutoff,q)->
    w = sig - a0*@fm0 - a1*@fm1
    sig = b0*w + b1*@fm0 + b2*@fm1

    @fm1 = @fm0
    @fm0 = w

    sig

  process:(buffer,length)->
    for i in [0..length-1] by 1
      left = buffer[0][i]
      right = buffer[1][i]

      lw = left - @a0*@lfm0 - @a1*@lfm1
      lmid = @b0*lw + @b1*@lfm0 + @b2*@lfm1

      @lfm1 = @lfm0
      @lfm0 = lw

      left -= lmid

      @llow = left*.1+@llow*.9

      lhigh = left-@llow

      buffer[0][i] = @llow*@low+lmid*@mid+lhigh*@high

      rw = right - @a0*@rfm0 - @a1*@rfm1
      rmid = @b0*rw + @b1*@rfm0 + @b2*@rfm1

      @rfm1 = @rfm0
      @rfm0 = rw

      right -= rmid

      @rlow = right*.1+@rlow*.9

      rhigh = right-@rlow

      buffer[1][i] = @rlow*@low+rmid*@mid+rhigh*@high

    return

class CombFilter
  constructor:(@length,@feedback = .5)->
    @buffer = new Float64Array(@length)
    @index = 0
    @store = 0
    @damp = .2

  process:(input)->
    output = @buffer[@index]
    @store = output*(1-@damp)+@store*@damp
    @buffer[@index++] = input+@store*@feedback
    if @index>=@length
      @index = 0

    output

class AllpassFilter
  constructor:(@length,@feedback = .5)->
    @buffer = new Float64Array(@length)
    @index = 0

  process:(input)->
    bufout = @buffer[@index]
    output = -input+bufout
    @buffer[@index++] = input+bufout*@feedback
    if @index>=@length
      @index = 0

    output

class Reverb
  constructor:(@engine)->
    @sampleRate = @engine.sampleRate
    combtuning = [1116,1188,1277,1356,1422,1491,1557,1617]
    allpasstuning = [556,441,341,225]
    stereospread = 23
    @left_combs = []
    @right_combs = []
    @left_allpass = []
    @right_allpass = []
    @res = [0,0]
    @spread = .25
    @wet = .025

    for c in combtuning
      @left_combs.push new CombFilter c,.9
      @right_combs.push new CombFilter c+stereospread,.9

    for a in allpasstuning
      @left_allpass.push new AllpassFilter a,.5
      @right_allpass.push new AllpassFilter a+stereospread,.5

    #@reflections = []
    #@reflections.push new Reflection 7830,.1,.5,1
    #@reflections.push new Reflection 10670,-.2,.6,.9
    #@reflections.push new Reflection 13630,.7,.7,.8
    #@reflections.push new Reflection 21870,-.6,.8,.7
    #@reflections.push new Reflection 35810,-.1,.9,.6

  update:(data)->
    @wet = data.amount*.05
    feedback = .7+Math.pow(data.rate,.25)*.29
    damp = .2 #.4-.4*data.rate
    for i in [0..@left_combs.length-1] by 1
      @left_combs[i].feedback = feedback
      @right_combs[i].feedback = feedback
      @left_combs[i].damp = damp
      @right_combs[i].damp = damp

    @spread = .5-data.rate*.5

  process:(buffer,length)->
    for s in [0..length-1] by 1
      outL = 0
      outR = 0
      left = buffer[0][s]
      right = buffer[1][s]
      input = (left+right)*.5
      for i in [0..@left_combs.length-1]
        outL += @left_combs[i].process(input)
        outR += @right_combs[i].process(input)

      for i in [0..@left_allpass.length-1]
        outL = @left_allpass[i].process(outL)
        outR = @right_allpass[i].process(outR)

      #for i in [0..@reflections.length-1]
      #  r = @reflections[i].process(input)
      #  outL += r[0]
      #  outR += r[1]

      buffer[0][s] = (outL*(1-@spread)+outR*@spread)*@wet+left*(1-@wet)
      buffer[1][s] = (outR*(1-@spread)+outL*@spread)*@wet+right*(1-@wet)
    return

class Voice
  @oscillators = [SawOscillator,SquareOscillator,SineOscillator,VoiceOscillator,StringOscillator]

  constructor:(@engine)->
    @osc1 = new SineOscillator @
    @osc2 = new SineOscillator @
    @noise = new Noise @
    @lfo1 = new LFO @
    @lfo2 = new LFO @
    @filter = new Filter @
    @env1 = new AmpEnvelope @
    @env2 = new ModEnvelope @
    @filter_increment = 0.0005*44100/@engine.sampleRate
    @modulation = 0
    @noteon_time = 0

  init:(layer)->
    if @osc1 not instanceof Voice.oscillators[layer.inputs.osc1.type]
      @osc1 = new Voice.oscillators[layer.inputs.osc1.type] @

    if @osc2 not instanceof Voice.oscillators[layer.inputs.osc2.type]
      @osc2 = new Voice.oscillators[layer.inputs.osc2.type] @

    @osc1.init(layer.inputs.osc1,layer.inputs.sync)
    @osc2.init(layer.inputs.osc2,layer.inputs.sync)
    @noise.init(layer,layer.inputs.sync)
    @lfo1.init(layer.inputs.lfo1,layer.inputs.sync)
    @lfo2.init(layer.inputs.lfo2,layer.inputs.sync)
    @filter.init(layer)
    @env1.init(layer.inputs.env1)
    @env2.init(layer.inputs.env2)

    @updateConstantMods()

  update:()->
    return if not @layer?

    if @osc1 not instanceof Voice.oscillators[@layer.inputs.osc1.type]
      @osc1 = new Voice.oscillators[@layer.inputs.osc1.type] @,@layer.inputs.osc1

    if @osc2 not instanceof Voice.oscillators[@layer.inputs.osc2.type]
      @osc2 = new Voice.oscillators[@layer.inputs.osc2.type] @,@layer.inputs.osc2

    @osc1.update(@layer.inputs.osc1,@layer.inputs.sync)
    @osc2.update(@layer.inputs.osc2,@layer.inputs.sync)

    @env1.update()
    @env2.update()

    @lfo1.update()
    @lfo2.update()
    @filter.update()

    @updateConstantMods()

  updateConstantMods:()->
    @osc1_amp = DBSCALE(@inputs.osc1.amp,3)
    @osc2_amp = DBSCALE(@inputs.osc2.amp,3)
    @osc1_mod = @inputs.osc1.mod
    @osc2_mod = @inputs.osc2.mod
    @noise_amp = DBSCALE(@inputs.noise.amp,3)
    @noise_mod = @inputs.noise.mod

    if @inputs.velocity.amp>0
      p = @inputs.velocity.amp
      p *= p
      p *= 4
      #amp = Math.pow(@velocity,p) #Math.exp((-1+@velocity)*5)
      norm = @inputs.velocity.amp*4
      amp = Math.exp(@velocity*norm)/Math.exp(norm)
      #amp = @inputs.velocity.amp*amp+(1-@inputs.velocity.amp)
    else
      amp = 1

    @osc1_amp *= amp
    @osc2_amp *= amp
    @noise_amp *= amp


    c = Math.log(1024*@freq/22000)/(10*Math.log(2))
    @cutoff_keymod = (c-.5)*@inputs.filter.follow
    @cutoff_base = @inputs.filter.cutoff+@cutoff_keymod

    @env2_amount = @inputs.env2.amount

    @lfo1_rate = @inputs.lfo1.rate
    @lfo1_amount = @inputs.lfo1.amount
    @lfo2_rate = @inputs.lfo2.rate
    @lfo2_amount = @inputs.lfo2.amount


    #   "Mod"
    #
    #   "Filter Cutoff"
    #   "Filter Resonance"
    #
    #   "Osc1 Mod"
    #   "Osc1 Amp"
    #
    #   "Osc2 Mod"
    #   "Osc2 Amp"
    #
    #   "Noise Amp"
    #   "Noise Color"
    #
    #   "Env1 Attack"
    #   "Env2 Attack"
    #   "Env2 Amount"
    #
    #   "LFO1 Amount"
    #   "LFO1 Rate"
    #
    #   "LFO2 Amount"
    #   "LFO2 Rate"
    # ]

    switch @inputs.velocity.out
      when 0 # Oscs Mod
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc1_mod = Math.min(1,Math.max(0,@osc1_mod+mod))
        @osc2_mod = Math.min(1,Math.max(0,@osc2_mod+mod))

      when 1 # Filter Cutoff
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @cutoff_base += mod

      when 3 # Osc1 Mod
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc1_mod = Math.min(1,Math.max(0,@osc1_mod+mod))

      when 4 # Osc1 Amp
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc1_amp = Math.max(0,@osc1_amp+mod)

      when 5 # Osc2 Mod
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc2_mod = Math.min(1,Math.max(0,@osc2_mod+mod))

      when 6 # Osc2 Amp
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc2_amp = Math.max(0,@osc2_amp+mod)

      when 7 # Noise Amp
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @noise_amp = Math.max(0,@noise_amp+mod)

      when 8 # Noise Color
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @noise_mod = Math.min(1,Math.max(0,@noise_mod+mod))

      when 9 # Env1 Attack
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        a = Math.max(0,Math.min(@inputs.env1.a+mod,1))
        @env1.update(a)

      when 10 # Env2 Attack
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        a = Math.max(0,Math.min(@inputs.env2.a+mod,1))
        @env2.update(a)

      when 11 # Env2 Amount
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @env2_amount = Math.max(0,Math.min(1,@env2_amount+mod))

      when 12 # LFO1 Amount
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @lfo1_amount = Math.max(0,@lfo1_amount+mod)

      when 13 # LFO1 Rate
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @lfo1_rate = Math.min(1,Math.max(0,@lfo1_rate+mod))

      when 14 # LFO2 Amount
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @lfo2_amount = Math.max(0,@lfo2_amount+mod)

      when 15 # LFO2 Rate
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @lfo2_rate = Math.min(1,Math.max(0,@lfo2_rate+mod))


    if @freq?
      c = Math.log(1024*@freq/22000)/(10*Math.log(2))
      @cutoff_keymod = (c-.5)*@inputs.filter.follow

  noteOn:(layer,@key,velocity,legato=false)->
    @velocity = velocity/127

    if @layer?
      @layer.removeVoice @

    @layer = layer
    @inputs = @layer.inputs
    if legato and @on
      @freq = 440*Math.pow(Math.pow(2,1/12),@key-57)

      if layer.last_key?
        @glide_from = layer.last_key
        @glide = true
        @glide_phase = 0
        glide_time = (@inputs.glide*.025+Math.pow(@inputs.glide,16)*.975)*10
        @glide_inc = 1/(glide_time*@engine.sampleRate+1)
    else
      @freq = 440*Math.pow(Math.pow(2,1/12),@key-57)
      @init @layer
      @on = true
      @cutoff = 0
      @modulation = @layer.instrument.modulation
      @pitch_bend = @layer.instrument.pitch_bend
      @modulation_v = 0
      @pitch_bend_v = 0

    @noteon_time = Date.now()

  noteOff:()->
    @on = false

  process:()->
    osc1_mod = @osc1_mod
    osc2_mod = @osc2_mod
    osc1_amp = @osc1_amp
    osc2_amp = @osc2_amp

    if @glide
      k = @glide_from*(1-@glide_phase)+@key*@glide_phase
      osc1_freq = osc2_freq = 440*Math.pow(Math.pow(2,1/12),k-57)
      @glide_phase += @glide_inc
      if @glide_phase>=1
        @glide = false
    else
      osc1_freq = osc2_freq = @freq

    if Math.abs(@pitch_bend-@layer.instrument.pitch_bend)>.0001
      @pitch_bend_v += .001*(@layer.instrument.pitch_bend-@pitch_bend)
      @pitch_bend_v *= .5
      @pitch_bend += @pitch_bend_v

    if Math.abs(@pitch_bend-.5)>.0001
      p = @pitch_bend*2-1
      p *= 2
      f = Math.pow(Math.pow(2,1/12),p)
      osc1_freq *= f
      osc2_freq *= f

    noise_amp = @noise_amp
    noise_mod = @noise_mod
    lfo1_rate = @lfo1_rate
    lfo1_amount = @lfo1_amount
    lfo2_rate = @lfo2_rate
    lfo2_amount = @lfo2_amount

    cutoff = @cutoff_base
    q = @inputs.filter.resonance

    if Math.abs(@modulation-@layer.instrument.modulation)>.0001
      @modulation_v += .001*(@layer.instrument.modulation-@modulation)
      @modulation_v *= .5
      @modulation += @modulation_v

    switch @inputs.modulation.out
      when 0 # Amp
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc1_amp = Math.max(0,osc1_amp+mod)
        osc2_amp = Math.max(0,osc2_amp+mod)
        noise_amp = Math.max(0,noise_amp*(1+mod))

      when 1 # Mod
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 2 # Osc1 Amp
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc1_amp = Math.max(0,osc1_amp+mod)

      when 3 # Osc1 Mod
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))

      when 4 # Osc2 Amp
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc2_amp = Math.max(0,osc2_amp+mod)

      when 5 # Osc2 Mod
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 6 # Noise Amp
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        noise_amp = Math.max(0,noise_amp+mod)

      when 7 # Noise Color
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        noise_mod = Math.min(1,Math.max(0,noise_mod+mod))

      when 8 # Filter Cutoff
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        cutoff += mod

      when 9 # Filter Resonance
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        q = Math.max(0,Math.min(1,q+mod))

      when 10 # LFO1 Amount
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        lfo1_amount = Math.max(0,Math.min(1,lfo1_amount+mod))

      when 11 # LFO1 Rate
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        lfo1_rate = Math.max(0,Math.min(1,lfo1_rate+mod))

      when 12 # LFO2 Amount
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        lfo2_amount = Math.max(0,Math.min(1,lfo2_amount+mod))

      when 13 # LFO2 Rate
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        lfo2_rate = Math.max(0,Math.min(1,lfo2_rate+mod))


    switch @inputs.env2.out
      when 0 # Filter Cutoff
        cutoff += @env2.process(@on)*(@env2_amount*2-1)

      when 1 # Filter Resonance
        q = Math.max(0,Math.min(1,@env2.process(@on)*(@env2_amount*2-1)))

      when 2 # Pitch
        mod = @env2_amount*2-1
        mod *= @env2.process(@on)
        mod = 1+mod
        osc1_freq *= mod
        osc2_freq *= mod

      when 3 # Mod
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 4 # Amp
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc1_amp = Math.max(0,osc1_amp+mod)
        osc2_amp = Math.max(0,osc2_amp+mod)
        noise_amp = Math.max(0,noise_amp*(1+mod))

      when 5 #Osc1 Pitch
        mod = @env2_amount*2-1
        mod *= @env2.process(@on)
        osc1_freq *= 1+mod

      when 6 #Osc1 Mod
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))

      when 7 #Osc1 Amp
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc1_amp = Math.max(0,osc1_amp+mod)

      when 8 #Osc2 Pitch
        mod = @env2_amount*2-1
        mod *= @env2.process(@on)
        osc1_freq *= 1+mod

      when 9 #Osc2 Mod
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 10 #Osc2 Amp
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc2_amp = Math.max(0,osc2_amp+mod)

      when 11 # Noise amp
        mod = @env2.process(@on)*(@env2_amount*2-1)
        noise_amp = Math.max(0,noise_amp+mod)

      when 12 # Noise color
        mod = @env2.process(@on)*(@env2_amount*2-1)
        noise_mod = Math.min(1,Math.max(0,noise_mod+mod))

      when 13 # LFO1 Amount
        mod = @env2.process(@on)*(@env2_amount*2-1)
        lfo1_amount = Math.min(1,Math.max(0,lfo1_amount+mod))

      when 14 # LFO1 rate
        mod = @env2.process(@on)*(@env2_amount*2-1)
        lfo1_rate = Math.min(1,Math.max(0,lfo1_rate+mod))

      when 15 # LFO2 Amount
        mod = @env2.process(@on)*(@env2_amount*2-1)
        lfo2_amount = Math.min(1,Math.max(0,lfo2_amount+mod))

      when 16 # LFO2 rate
        mod = @env2.process(@on)*(@env2_amount*2-1)
        lfo2_rate = Math.min(1,Math.max(0,lfo2_rate+mod))

    switch @inputs.lfo1.out
      when 0 # Pitch
        mod = lfo1_amount
        if @inputs.lfo1.audio
          mod = 1+mod*mod*@lfo1.process(lfo1_rate)*16
        else
          mod = 1+mod*mod*@lfo1.process(lfo1_rate)
        osc1_freq *= mod
        osc2_freq *= mod

      when 1 # Mod
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 2 # Amp
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc1_amp = Math.max(0,osc1_amp+mod)
        osc2_amp = Math.max(0,osc2_amp+mod)
        noise_amp = Math.max(0,noise_amp*(1+mod))

      when 3 #Osc1 Pitch
        mod = lfo1_amount
        mod = 1+mod*mod*@lfo1.process(lfo1_rate)
        osc1_freq *= mod

      when 4 #Osc1 Mod
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))

      when 5 #Osc1 Amp
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc1_amp = Math.max(0,osc1_amp+mod)

      when 6 #Osc2 Pitch
        mod = lfo1_amount
        mod = 1+mod*mod*@lfo1.process(lfo1_rate)
        osc2_freq *= mod

      when 7 #Osc2 Mod
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 8 #Osc2 Amp
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc2_amp = Math.max(0,osc2_amp+mod)

      when 9 # Noise amp
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        noise_amp = Math.max(0,noise_amp+mod)

      when 10 # Noise color
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        noise_mod = Math.min(1,Math.max(0,noise_mod+mod))

      when 11
        cutoff += @lfo1.process(lfo1_rate)*lfo1_amount

      when 12
        q = Math.max(0,Math.min(1,@lfo1.process(lfo1_rate)*lfo1_amount))

      when 13 # LFO2 Amount
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        lfo2_amount = Math.min(1,Math.max(0,lfo2_amount+mod))

      when 14 # LFO2 rate
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        lfo2_rate = Math.min(1,Math.max(0,lfo2_rate+mod))


    switch @inputs.lfo2.out
      when 0 # Pitch
        mod = lfo2_amount
        if @inputs.lfo2.audio
          mod = 1+mod*mod*@lfo2.process(lfo2_rate)*16
        else
          mod = 1+mod*mod*@lfo2.process(lfo2_rate)
        osc1_freq *= mod
        osc2_freq *= mod

      when 1 # Mod
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 2 # Amp
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc1_amp = Math.max(0,osc1_amp+mod)
        osc2_amp = Math.max(0,osc2_amp+mod)
        noise_amp = Math.max(0,noise_amp*(1+mod))

      when 3 #Osc1 Pitch
        mod = lfo2_amount
        mod = 1+mod*mod*@lfo2.process(lfo2_rate)
        osc1_freq *= mod

      when 4 #Osc1 Mod
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))

      when 5 #Osc1 Amp
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc1_amp = Math.max(0,osc1_amp+mod)

      when 6 #Osc2 Pitch
        mod = lfo2_amount
        mod = 1+mod*mod*@lfo2.process(lfo2_rate)
        osc2_freq *= mod

      when 7 #Osc2 Mod
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 8 #Osc2 Amp
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc2_amp = Math.max(0,osc2_amp+mod)

      when 9 # Noise amp
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        noise_amp = Math.max(0,noise_amp+mod)

      when 10 # Noise color
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        noise_mod = Math.min(1,Math.max(0,noise_mod+mod))

      when 11
        cutoff += @lfo2.process(lfo2_rate)*lfo2_amount

      when 12
        q = Math.max(0,Math.min(1,@lfo2.process(lfo2_rate)*lfo2_amount))

    switch @inputs.combine
      when 1
        s1 = @osc1.process(osc1_freq,osc1_mod)*osc1_amp
        s2 = @osc2.process(osc2_freq,osc2_mod)*osc2_amp
        sig = (s1+s2)*(s1+s2)
        #sig = @osc1.process(osc1_freq,osc1_mod)*@osc2.process(osc2_freq,osc2_mod)*Math.max(osc1_amp,osc2_amp)*4
      when 2
        sig = @osc2.process(osc2_freq*Math.max(0,1-@osc1.process(osc1_freq,osc1_mod)*osc1_amp),osc2_mod)*osc2_amp
      else
        sig = @osc1.process(osc1_freq,osc1_mod)*osc1_amp+@osc2.process(osc2_freq,osc2_mod)*osc2_amp

    if noise_amp>0
      sig += @noise.process(noise_mod)*noise_amp

    mod = @env2.process(@on)

    if not @cutoff
      @cutoff = cutoff
    else
      if @cutoff<cutoff
        @cutoff += Math.min(cutoff-@cutoff,@filter_increment)
      else if @cutoff>cutoff
        @cutoff += Math.max(cutoff-@cutoff,-@filter_increment)

      cutoff = @cutoff

    # VCF
    cutoff = Math.pow(2,Math.max(0,Math.min(cutoff,1))*10)*22000/1024

    sig *= @env1.process(@on)

      #@cutoff += 0.001*(cutoff-@cutoff)

    sig = @filter.process(sig,cutoff,q*q*9.5+.5)

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

class Blip
  constructor:()->
    @size = 512

    @samples = new Float64Array(@size+1)

    for p in [1..31] by 2
      for i in [0..@size] by 1
        x = (i/@size-.5)*.5
        @samples[i] += Math.sin(x*2*Math.PI*p)/p

    norm = @samples[@size]

    for i in [0..@size] by 1
      @samples[i] /= norm


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
