class @Sound
  constructor:(@audio,@url)->
    @class = MicroSound if MicroSound?

    if @url instanceof AudioBuffer
      @buffer = @url
      @ready = 1
    else
      @ready = 0
      request = new XMLHttpRequest()
      request.open('GET', @url, true)
      request.responseType = 'arraybuffer'

      request.onload = ()=>
        @audio.context.decodeAudioData request.response, (@buffer)=>
          @ready = 1

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
      stop:()=>
        source.stop()
        if playing then @audio.removePlaying playing
        1

      setVolume:(volume)-> gain.gain.value = Math.max(0,Math.min(1,volume))
      setPitch:(pitch)-> source.playbackRate.value = Math.max(.001,Math.min(1000,pitch))
      setPan:(pan)-> panner.setPan Math.max(-1,Math.min(1,pan))
      finished: false

    source.onended = ()-> res.finished = true
    res

  @createSoundClass = (audiocore)->
    window.MicroSound = class
      @classname = "Sound"

      constructor:(channels,length,sampleRate=44100)->
        @class = MicroSound
        channels = if channels == 1 then 1 else 2
        if not (length>1) or not (length < 44100*1000)
          length = 44100
        if not (sampleRate>=8000) or not (sampleRate <= 96000)
          sampleRate = 44100

        buffer = audiocore.context.createBuffer(channels,length,sampleRate)
        snd = new Sound(audiocore,buffer)

        @channels = channels
        @length = length
        @sampleRate = sampleRate

        ch1 = buffer.getChannelData(0)
        if channels == 2
          ch2 = buffer.getChannelData(1)

        @play = (volume,pitch,pan,loopit)-> snd.play(volume,pitch,pan,loopit)
        @write = (channel,position,value)->
          if channel == 0
            ch1[position] = value
          else if channels == 2
            ch2[position] = value

        @read = (channel,position)->
          if channel == 0
            ch1[position]
          else if channels == 2
            ch2[position]
          else
            0
