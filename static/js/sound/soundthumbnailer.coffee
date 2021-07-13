class @SoundThumbnailer
  constructor:(@buffer,@width=128,@height=64,@color="hsl(20,80%,60%)")->
    @canvas = document.createElement "canvas"
    @canvas.width = @width
    @canvas.height = @height

    @channels = Math.min(2,@buffer.numberOfChannels)
    @context = @canvas.getContext "2d"
    @context.fillStyle = "#222"
    @context.fillRect 0,0,@width,@height
    @context.fillStyle = @color

    switch @channels
      when 1
        @context.translate 0,@height/2
        @drawChannel @buffer.getChannelData(0)

      when 2
        @context.translate 0,@height/4
        @context.scale 1,.5
        @drawChannel @buffer.getChannelData(0)
        @context.translate 0,@height
        @drawChannel @buffer.getChannelData(1)

  drawChannel:(data)->
    max = 0
    for i in [0..@width-1] by .5
      d = Math.abs(data[Math.floor(data.length*i/@width)])
      max = Math.max(d,max)
      @context.fillRect i,-@height/2*d,1,@height*d
    console.info "max signal: #{max}"
