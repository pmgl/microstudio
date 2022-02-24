class @ColorPicker
  constructor:(@editor)->
    @canvas = document.createElement "canvas"
    @canvas.width = 146

    @num_blocks = 9
    @block = @canvas.width/@num_blocks
    @canvas.height = @block*(2+1+1+1+1+1+@num_blocks)

    @hue = 0
    @type = "color"
    @saturation = @num_blocks-1
    @lightness = @num_blocks-1
    @updateColor()
    @update()
    @canvas.addEventListener "mousedown", (event) => @mouseDown(event)
    @canvas.addEventListener "mousemove", (event) => @mouseMove(event)
    document.addEventListener "mouseup", (event) => @mouseUp(event)

  colorPicked:(c)->
    if typeof c == "string"
      match = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/.exec(c.replace(/ /g,""))
      if match? and match.length>=4
        c = [match[1]|0,match[2]|0,match[3]|0]
      else
        return

    for i in [0..2]
      c[i] = Math.max(0,Math.min(255,c[i]))

    @color = "rgb(#{c[0]},#{c[1]},#{c[2]})"
    @editor.setColor(@color)
    col = @RGBtoHSV(c[0],c[1],c[2])
    @hue = Math.round(col.h*@num_blocks*2)%(@num_blocks*2)
    @saturation = Math.round(col.s*@num_blocks)
    @lightness = Math.round(col.v*@num_blocks)
    if @saturation == 0 or @lightness == 0
      @type = "gray"
      @lightness = Math.round(col.v*(2*@num_blocks-1))/2
    else
      @type = "color"
      @saturation -= 1
      @lightness -= 1
    @update()

  updateColor:()->
    if @type == "gray"
      v = Math.floor(255*@lightness*2/(@num_blocks*2-1))
      @color = "rgb(#{v},#{v},#{v})"
    else
      h = @hue/(@num_blocks*2)
      s = (@saturation+1)/@num_blocks
      v = (@lightness+1)/@num_blocks
      col = @HSVtoRGB(h,s,v)
      @color = "rgb(#{col.r},#{col.g},#{col.b})"
    @editor.setColor @color

  update:()->
    context = @canvas.getContext "2d"
    context.clearRect(0,0,@canvas.width,@canvas.height)

    context.fillStyle = "#888"
    context.fillRoundRect 0,0,@canvas.width,@block*2,5
    context.fillStyle = @color
    context.fillRoundRect 1,1,@canvas.width-2,@block*2-2,5

    grd = context.createLinearGradient 0,@canvas.height-@block*2,0,@canvas.height,0
    grd.addColorStop 0,'rgba(255,255,255,0)'
    grd.addColorStop 1,"rgba(255,255,255,.5)"
    context.fillStyle = grd
    #context.fillRect 0,@canvas.height-@block*2,@canvas.width,@block*2
    #context.fillRect 0,@block*7,@canvas.width,@block*@num_blocks

    for light in [0..@num_blocks*2-1] by 1
      if @type == "gray" and @lightness*2 == light
        context.fillStyle = "#FFF"
        context.fillRoundRect light*@block*.5-1,3*@block-1,@block*.5+2,@block+2,1
      context.fillStyle = "hsl(0,0%,#{light/(@num_blocks*2-1)*100}%)"
      context.fillRoundRect light*@block*.5+1,3*@block+1,@block*.5-2,@block-2,1

    for hue in [0..@num_blocks*2-1] by 1
      if @type == "color" and hue == @hue
        context.fillStyle = "#FFF"
        context.fillRoundRect hue*@block*.5-1,5*@block-1,@block*.5+2,@block+2,1
      context.fillStyle = "hsl(#{hue/@num_blocks*180},100%,50%)"
      context.fillRoundRect hue*@block*.5+1,5*@block+1,@block*.5-2,@block-2,1

    for y in [0..@num_blocks-1] by 1
      for x in [0..@num_blocks-1] by 1
        ay = @num_blocks-1-y
        if @type == "color" and ay == @lightness and x == @saturation and @hue>=0
          context.fillStyle = "#FFF"
          context.fillRoundRect x*@block-1,(y+7)*@block-1,@block+2,@block+2,2

        h = @hue/(@num_blocks*2)
        s = (x+1)/@num_blocks
        v = (ay+1)/@num_blocks

        col = @HSVtoRGB(h,s,v)
        context.fillStyle = "rgb(#{col.r},#{col.g},#{col.b})"
        l = @num_blocks-1-light
        context.fillRoundRect x*@block+1,(y+7)*@block+1,@block-2,@block-2,2

    return

  mouseDown:(event)->
    @mousepressed = true
    @mouseMove(event)

  mouseMove:(event)->
    if @mousepressed
      b = @canvas.getBoundingClientRect()
      min = Math.min @canvas.clientWidth,@canvas.clientHeight
      x = (event.clientX-b.left)/b.width*@canvas.width
      y = (event.clientY-b.top)/b.height*@canvas.height

      y = Math.floor(y/@block)
      if y == 3
        lightness = Math.floor(x/@canvas.width*@num_blocks*2)/2
        if lightness != @lightness or @type != "gray"
          @type = "gray"
          @lightness = lightness
          @updateColor()
          @update()
      else if y == 5
        hue = Math.max(0,Math.floor(x/@canvas.width*@num_blocks*2))
        if hue != @hue or @type != @color
          @type = "color"
          @lightness = Math.floor(@lightness)
          @hue = hue
          @updateColor()
          @update()
      else if y >= 7
        x = Math.floor(x/@canvas.width*@num_blocks)
        saturation = x
        lightness = @num_blocks-1-(y-7)
        if lightness != @lightness or saturation != @saturation or @type != "color"
          @type = "color"
          @lightness = lightness
          @saturation = saturation
          @updateColor()
          @update()
    false

  mouseUp:(event)->
    @mousepressed = false

  rgbToHsl:(r, g, b)->
    r /= 255
    g /= 255
    b /= 255
    max = Math.max(r, g, b)
    min = Math.min(r, g, b)
    h = undefined
    s = undefined
    l = (max + min) / 2
    if max == min
      h = s = 0
      # achromatic
    else
      d = max - min
      s = if l > 0.5 then d / (2 - max - min) else d / (max + min)
      switch max
        when r
          h = (g - b) / d + (if g < b then 6 else 0)
        when g
          h = (b - r) / d + 2
        when b
          h = (r - g) / d + 4
      h /= 6
    [h,s,l]

  HSVtoRGB: (h, s, v) ->
    i = Math.floor(h * 6)
    f = h * 6 - i
    p = v * (1 - s)
    q = v * (1 - (f * s))
    t = v * (1 - ((1 - f) * s))
    switch i % 6
      when 0
        r = v
        g = t
        b = p
      when 1
        r = q
        g = v
        b = p
      when 2
        r = p
        g = v
        b = t
      when 3
        r = p
        g = q
        b = v
      when 4
        r = t
        g = p
        b = v
      when 5
        r = v
        g = p
        b = q
    {
      r: Math.round(r * 255)
      g: Math.round(g * 255)
      b: Math.round(b * 255)
    }

  RGBtoHSV: (r, g, b) ->
    max = Math.max(r, g, b)
    min = Math.min(r, g, b)
    d = max - min
    h = undefined
    s = if max == 0 then 0 else d / max
    v = max / 255
    switch max
      when min
        h = 0
      when r
        h = g - b + d * (if g < b then 6 else 0)
        h /= 6 * d
      when g
        h = b - r + d * 2
        h /= 6 * d
      when b
        h = r - g + d * 4
        h /= 6 * d
    {
      h: h
      s: s
      v: v
    }
