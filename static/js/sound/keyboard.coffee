class @SynthKeyboard
  constructor:(@canvas,@octaves,@listener)->
    @white = 7*@octaves+1
    @white_width = @canvas.width/@white

    @black_pos = [0,1,3,4,5]

    @update()


  update:()->
    context = @canvas.getContext "2d"
    context.fillStyle = "#111"
    context.fillRect(0,0,@canvas.width,@canvas.height)

    context.fillStyle = "#FFF"

    for i in [0..@white-1] by 1
      context.fillRect @white_width*i+.5,.5,@white_width-1,@canvas.height-1

    context.fillStyle = "#000"
    for o in [0..@octaves-1] by 1
      for k in @black_pos
        p = o*7+k
        context.fillRect @white_width*(p+.7)+.5,.5,@white_width*.6,@canvas.height*.6

    grd = context.createLinearGradient(0,0,0,@canvas.height/8)
    grd.addColorStop(0,"rgba(0,0,0,1)")
    grd.addColorStop(1,"rgba(0,0,0,0)")
    context.fillStyle = grd
    context.fillRect 0,0,@canvas.width,@canvas.height/8
