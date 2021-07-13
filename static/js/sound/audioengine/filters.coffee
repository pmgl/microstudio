
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

    @slope = @layer.inputs.filter.slope

  processHighPass:(sig,cutoff,q)->
    w0 = Math.max(0,Math.min(@halfSampleRate,cutoff))*@invSampleRate
    w0 *= 10000
    iw0 = Math.floor(w0)
    aw0 = w0-iw0
    cosw0 = (1-aw0)*SIN_TABLE[iw0+2500]+aw0*SIN_TABLE[iw0+2501]
    sinw0 = (1-aw0)*SIN_TABLE[iw0]+aw0*SIN_TABLE[iw0+1]

    if not @slope
      q *= q

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

    if @slope
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

    if not @slope
      q *= q

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

    if @slope
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

    if not @slope
      q *= q
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

    if @slope
      w = sig - a0*@fm10 - a1*@fm11
      sig = b0*w + b1*@fm10 + b2*@fm11

      @fm11 = @fm10
      @fm10 = w

    sig
