
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

    while @phase<0
      @phase += 1

    while @phase>=1
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
    @n = @n*.9+white*.1
    low = @n
    high = white-low
    2*(low*(1-mod)+high*mod)
