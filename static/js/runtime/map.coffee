class @MicroMap
  constructor:(@width,@height,@block_width,@block_height,@sprites)->
    @name = ""
    @map = []
    if @width? and typeof @width == "string"
      @ready = false
      req = new XMLHttpRequest()
      req.onreadystatechange = (event) =>
        if req.readyState == XMLHttpRequest.DONE
          @ready = true
          if req.status == 200
            @load req.responseText,@sprites
            @update()

          if @loaded?
            @loaded()

      req.open "GET",@width
      req.send()

      @width = 10
      @height = 10
      @block_width = 10
      @block_height = 10
    else
      @ready = true

    @clear()
    @update()

  clear:()->
    for j in [0..@height-1] by 1
      for i in [0..@width-1] by 1
        @map[i+j*@width] = null
    return

  set:(x,y,ref)->
    if x>=0 and x<@width and y>=0 and y<@height
      @map[x+y*@width] = ref
      @needs_update = true

  get:(x,y)->
    return "" if x<0 or y<0 or x>=@width or y>=@height
    @map[x+y*@width] or ""

  getCanvas:()->
    if not @canvas? or @needs_update
      @update()
    @canvas

  update:()->
    @needs_update = false
    if not @canvas?
      @canvas = document.createElement "canvas"

    if @canvas.width != @width*@block_width or @canvas.height != @height*@block_height
      @canvas.width = @width*@block_width
      @canvas.height = @height*@block_height

    context = @canvas.getContext "2d"
    context.clearRect 0,0,@canvas.width,@canvas.height

    for j in [0..@height-1] by 1
      for i in [0..@width-1] by 1
        index = i+(@height-1-j)*@width
        s = @map[index]
        if s? and s.length>0
          s = s.split(":")
          sprite = @sprites[s[0]]
          if sprite? and sprite.frames[0]?
            if s[1]?
              xy = s[1].split(",")
              tx = xy[0]*@block_width
              ty = xy[1]*@block_height
              c = sprite.frames[0].canvas
              if c? and c.width>0 and c.height>0
                context.drawImage(c,tx,ty,@block_width,@block_height,@block_width*i,@block_height*j,@block_width,@block_height)
            else
              c = sprite.frames[0].canvas
              if c? and c.width>0 and c.height>0
                context.drawImage(c,@block_width*i,@block_height*j)

    return

  resize:(w,h,@block_width=@block_width,@block_height=@block_height)->
    map = []
    for j in [0..h-1] by 1
      for i in [0..w-1] by 1
        if j<@height and i<@width
          map[i+j*w] = @map[i+j*@width]
        else
          map[i+j*w] = null

    @map = map
    @width = w
    @height = h

  save:()->
    index = 1
    list = [0]
    table = {}
    for j in [0..@height-1] by 1
      for i in [0..@width-1] by 1
        s = @map[i+j*@width]
        if s? and s.length>0 and not table[s]?
          list.push s
          table[s] = index++

    map = []
    for j in [0..@height-1] by 1
      for i in [0..@width-1] by 1
        s = @map[i+j*@width]
        map[i+j*@width] = if s? and s.length>0 then table[s] else 0

    data =
      width: @width
      height: @height
      block_width: @block_width
      block_height: @block_height
      sprites: list
      data: map

    JSON.stringify data

  loadFile:(url)->
    req = new XMLHttpRequest()
    req.onreadystatechange = (event) =>
      if req.readyState == XMLHttpRequest.DONE
        if req.status == 200
          @load req.responseText,@sprites
          @update()

    req.open "GET",url
    req.send()

  load:(data,sprites)->
    data = JSON.parse data
    @width = data.width
    @height = data.height
    @block_width = data.block_width
    @block_height = data.block_height

    for j in [0..data.height-1] by 1
      for i in [0..data.width-1] by 1
        s = data.data[i+j*data.width]
        if s>0
          @map[i+j*data.width] = data.sprites[s]
        else
          @map[i+j*data.width] = null

    return

  @loadMap:(data,sprites)->
    data = JSON.parse data
    map = new MicroMap(data.width,data.height,data.block_width,data.block_height,sprites)
    for j in [0..data.height-1] by 1
      for i in [0..data.width-1] by 1
        s = data.data[i+j*data.width]
        if s>0
          map.map[i+j*data.width] = data.sprites[s]

    map

  clone:()->
    map = new MicroMap(@width,@height,@block_width,@block_height,@sprites)
    for j in [0..@height-1] by 1
      for i in [0..@width-1] by 1
        map.map[i+j*@width] = @map[i+j*@width]

    map.needs_update = true
    map

  copyFrom:(map)->
    @width = map.width
    @height = map.height
    @block_width = map.block_width
    @block_height = map.block_height
    for j in [0..@height-1] by 1
      for i in [0..@width-1] by 1
        @map[i+j*@width] = map.map[i+j*@width]
    @update()
    @
