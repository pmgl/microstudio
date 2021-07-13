class @AutoPalette
  constructor:(@spriteeditor)->
    @locked = false
    @lock = document.getElementById("auto-palette-lock")
    @list = document.getElementById("auto-palette-list")
    setInterval (()=>@process()),16
    @palette = {}
    @lock.addEventListener "click",()=>
      if @locked
        @locked = false
        @lock.classList.remove "locked"
        @lock.classList.remove "fa-lock"
        @lock.classList.add "fa-lock-open"
        @lock.title = @spriteeditor.app.translator.get("Lock palette")
      else
        @locked = true
        @lock.classList.add "locked"
        @lock.classList.add "fa-lock"
        @lock.classList.remove "fa-lock-open"
        @lock.title = @spriteeditor.app.translator.get("Unlock palette")

  update:()->
    @current_sprite = @spriteeditor.spriteview.sprite
    @current_frame = 0
    @current_line = 0

    @colors = {}

  setColor:(col)->
    c = [col.color>>16,(col.color>>8)&0xFF,col.color&0xFF]
    @spriteeditor.colorpicker.colorPicked(c)

  colorPicked:(color)->
    for c in @list.childNodes
      if c == @palette[color]
        c.classList.add "selected"
      else
        c.classList.remove "selected"

    return

  process:()->
    return if @locked
    return if not @current_sprite

    if @current_frame>=@current_sprite.frames.length
      c = []
      for key,value of @colors
        c.push
          color: value.color
          count: value.count
          hsl: @rgbToHsl(value.color)

      if c.length>32
        c.sort (a,b)->b.count-a.count
        c.splice(32,c.length-31)

      @current_sprite = null

      score = (col)->
        Math.round(col.hsl[0]*16)/16*100+col.hsl[2]+if col.hsl[1] < .1 or col.hsl[2] >.9 then -1000 else 0

      c.sort (a,b)-> score(a)-score(b)

      @list.innerHTML = ""
      @palette = {}
      for col in c
        do (col)=>
          div = document.createElement "div"
          rgb = "rgb(#{col.color>>16},#{(col.color>>8)&0xFF},#{col.color&0xFF})"
          div.style.background = rgb
          div.addEventListener "click",()=>@setColor(col)
          @list.appendChild div
          @palette[rgb] = div
    else
      time = Date.now()

      while Date.now()<time+2 and @current_frame<@current_sprite.frames.length
        frame = @current_sprite.frames[@current_frame]
        return if not frame?
        if @current_line<frame.getCanvas().height
          data = frame.getContext().getImageData(0,@current_line,frame.width,1)
          for i in [0..frame.width-1] by 1
            continue if data.data[i*4+3]<128
            col = (Math.floor(data.data[i*4]/16)<<8)+(Math.floor(data.data[i*4+1]/16)<<4)+Math.floor(data.data[i*4+2]/16)
            if not @colors[col]?
              @colors[col] =
                color: (data.data[i*4]<<16)+(data.data[i*4+1]<<8)+data.data[i*4+2]
                count: 1
            else
              @colors[col].count += 1
          @current_line += 1
        else
          @current_line = 0
          @current_frame += 1

    return

  rgbToHsl:(c)->
    r = (c>>16)/255
    g = ((c>>8)&0xFF)/255
    b = (c&0xFF)/255
    max = Math.max(r, g, b)
    min = Math.min(r, g, b)

    l = (max + min) / 2
    if max == min
      h = s = 0
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
    [
      h
      s
      l
    ]
