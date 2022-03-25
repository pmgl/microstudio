class @Music
  constructor:(@audio,@url)->
    @tag = new Audio(@url)
    @playing = false

  play:(volume=1,loopit=false)->
    @playing = true
    @tag.loop = if loopit then true else false
    @tag.volume = volume

    if @audio.isStarted()
      @tag.play()
    else
      @audio.addToWakeUpList @

    @audio.addPlaying @

    {
      play:()=> @tag.play()
      stop:()=>
        @playing = false
        @tag.pause()
        @audio.removePlaying @
      setVolume:(volume)=> @tag.volume = Math.max(0,Math.min(1,volume))
      getPosition: ()=> @tag.currentTime
      getDuration: ()=> @tag.duration
      setPosition: (pos)=>
        @tag.pause()
        @tag.currentTime = Math.max(0,Math.min(@tag.duration,pos))
        if @playing
          @tag.play()
    }

  wakeUp:()->
    if @playing
      @tag.play()

  stop:()->
    @playing = false
    @tag.pause()
