class @Sound
  constructor:(@audio,@url)->
    request = new XMLHttpRequest()
    request.open('GET', @url, true)
    request.responseType = 'arraybuffer'

    request.onload = ()=>
      @audio.context.decodeAudioData request.response, (@buffer)=>

    request.send()

  play:(volume=1,pitch=1,pan=0,loopit=false)->
    return if not @buffer?

    source = @audio.context.createBufferSource()
    source.playbackRate.value = pitch
    source.buffer = @buffer
    if loopit then source.loop = true

    gain = @audio.context.createGain()
    gain.gain.value = volume

    if false and @audio.context.createStereoPanner?
      panner = @audio.context.createStereoPanner()
      panner.setPan = (pan)-> panner.pan.value = pan
    else
      panner = @audio.context.createPanner()
      panner.panningModel = "equalpower"
      panner.setPan = (pan)->panner.setPosition(pan, 0, 1 - Math.abs(pan))

    panner.setPan pan

    source.connect gain
    gain.connect panner
    panner.connect @audio.context.destination

    source.start()

    playing = null

    if loopit
      playing = {
        stop: ()=>
          source.stop()
      }
      @audio.addPlaying playing

    res =
      stop:()->
        source.stop()
        if playing then @audio.removePlaying playing

      setVolume:(volume)-> gain.gain.value = Math.max(0,Math.min(1,volume))
      setPitch:(pitch)-> source.playbackRate.value = Math.max(.001,Math.min(1000,pitch))
      setPan:(pan)-> panner.setPan Math.max(-1,Math.min(1,pan))
      finished: false

    source.onended = ()-> res.finished = true
    res
