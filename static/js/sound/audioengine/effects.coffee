
class Distortion
  constructor:()->
    @amount = .5
    @rate = .5
    @left = @right = 0

  update:(data)->
    @amount = data.amount
    @rate = data.rate

  process:(buffer,length)->
    for i in [0..length-1] by 1
      sig = buffer[0][i]
      sig = @left = @left*.5+sig*.5
      s = sig*(1+@rate*@rate*99)
      disto = if s<0 then -1+Math.exp(s) else 1-Math.exp(-s)
      buffer[0][i] = (1-@amount)*sig+@amount*disto

      sig = buffer[1][i]
      sig = @right = @right*.5+sig*.5
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
    @rate = Math.pow(2,(1-data.rate)*8)

  process:(buffer,length)->
    for i in [0..length-1] by 1
      @phase += 1
      if @phase>@amount
        @phase -= @amount
        left = buffer[0][i]
        right = buffer[1][i]
        @left = Math.round(left*@rate)/@rate
        @right = Math.round(right*@rate)/@rate

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
    @ml = 0
    @mr = 0

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

      buffer[0][i] = left
      buffer[1][i] = right

      @left_buffer[@index] = @ml = @ml*.5+left*.5
      @right_buffer[@index] = @mr = @mr*.5+right*.5

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

    @left_delay = 577
    @right_delay = 733

  process:(buffer,length,spatialize,pan)->
    mnt = spatialize

    left_pan = Math.cos(pan*Math.PI/2)/(1+spatialize)
    right_pan = Math.sin(pan*Math.PI/2)/(1+spatialize)

    left_buffer = buffer[0]
    right_buffer = buffer[1]

    for i in [0..length-1] by 1
      left = left_buffer[i]
      right = right_buffer[i]

      @left = left*.1+@left*.9
      @right = right*.1+@right*.9

      @left_buffer[@index] = @left
      @right_buffer[@index] = @right

      left_buffer[i] = (left+mnt*@right_buffer[(@index+@right_buffer.length-@left_delay)%@right_buffer.length])*left_pan
      right_buffer[i] = (right+mnt*@left_buffer[(@index+@right_buffer.length-@right_delay)%@right_buffer.length])*right_pan

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
