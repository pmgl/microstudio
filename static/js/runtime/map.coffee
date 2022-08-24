class @MicroMap
  constructor:(@width,@height,@block_width,@block_height)->
    @sprites = window.player.runtime.sprites

    @map = []
    @ready = true

    @clear()

  clear:()->
    for j in [0..@height-1] by 1
      for i in [0..@width-1] by 1
        @map[i+j*@width] = null
    return

  set:(x,y,ref)->
    if x>=0 and x<@width and y>=0 and y<@height
      if typeof ref == "string"
        ref = ref.replace /\//g,"-"
      @map[x+y*@width] = ref
      @needs_update = true

  get:(x,y)->
    return 0 if x<0 or y<0 or x>=@width or y>=@height
    c = @map[x+y*@width]
    if typeof c == "string"
      c = c.replace /-/g,"/"
    c or 0

  getCanvas:()->
    if not @canvas? or @needs_update
      @update()
    @canvas

  draw:(context,x,y,w,h)->
    if @animated? and @animated.length>0
      time = Date.now()
      if not @buffer? or @buffer.width != @block_width*@width or @buffer.height != @block_height*@height
        console.info "creating buffer"
        @buffer = document.createElement "canvas"
        @buffer.width = @block_width*@width
        @buffer.height = @block_height*@height
      ctx = @buffer.getContext "2d"
      ctx.clearRect 0,0,@buffer.width,@buffer.height
      ctx.drawImage @getCanvas(),0,0

      for a in @animated
        len = a.sprite.frames.length
        c = a.sprite.frames[Math.floor(time/1000*a.sprite.fps)%len].canvas
        if a.tx?
          ctx.drawImage c,a.tx,a.ty,@block_width,@block_height,a.x,a.y,@block_width,@block_height
        else
          ctx.drawImage c,a.x,a.y,@block_width,@block_height
      context.drawImage @buffer,x,y,w,h
    else
      context.drawImage @getCanvas(),x,y,w,h

    return

  update:()->
    @needs_update = false
    if not @canvas?
      @canvas = document.createElement "canvas"

    if @canvas.width != @width*@block_width or @canvas.height != @height*@block_height
      @canvas.width = @width*@block_width
      @canvas.height = @height*@block_height

    context = @canvas.getContext "2d"
    context.clearRect 0,0,@canvas.width,@canvas.height

    @animated = []

    for j in [0..@height-1] by 1
      for i in [0..@width-1] by 1
        index = i+(@height-1-j)*@width
        s = @map[index]
        if s? and s.length>0
          s = s.split(":")
          sprite = @sprites[s[0]]
          if not sprite?
            sprite = @sprites[s[0].replace(/-/g,"/")]
          if sprite? and sprite.frames[0]?
            if sprite.frames.length>1
              a =
                x: @block_width*i
                y: @block_height*j
                w: @block_width
                h: @block_height
                sprite: sprite

              if s[1]?
                xy = s[1].split(",")
                a.tx = xy[0]*@block_width
                a.ty = xy[1]*@block_height

              @animated.push a
              continue

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


@LoadMap = (url,loaded)->
  map = new MicroMap(1,1,1,1)
  map.ready = false

  req = new XMLHttpRequest()
  req.onreadystatechange = (event) =>
    if req.readyState == XMLHttpRequest.DONE
      map.ready = true
      if req.status == 200
        UpdateMap map,req.responseText

      map.needs_update = true

      if loaded?
        loaded()

  req.open "GET",url
  req.send()
  map

@UpdateMap = (map,data)->
  data = JSON.parse data

  map.width = data.width
  map.height = data.height
  map.block_width = data.block_width
  map.block_height = data.block_height

  for j in [0..data.height-1] by 1
    for i in [0..data.width-1] by 1
      s = data.data[i+j*data.width]
      if s>0
        map.map[i+j*data.width] = data.sprites[s]
      else
        map.map[i+j*data.width] = null

  map.needs_update = true
  map

@SaveMap = (map)->
  index = 1
  list = [0]
  table = {}
  for j in [0..map.height-1] by 1
    for i in [0..map.width-1] by 1
      s = map.map[i+j*map.width]
      if s? and s.length>0 and not table[s]?
        list.push s
        table[s] = index++

  m = []
  for j in [0..map.height-1] by 1
    for i in [0..map.width-1] by 1
      s = map.map[i+j*map.width]
      m[i+j*map.width] = if s? and s.length>0 then table[s] else 0

  data =
    width: map.width
    height: map.height
    block_width: map.block_width
    block_height: map.block_height
    sprites: list
    data: m

  JSON.stringify data
