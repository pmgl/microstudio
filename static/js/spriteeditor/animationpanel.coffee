class @AnimationPanel
  constructor:(@sprite_editor)->
    @panel_shown = false
    @animation_preview = new AnimationPreview(@sprite_editor)

    document.querySelector("#sprite-animation-title").addEventListener "click",()=>@togglePanel()
    document.querySelector("#add-frame-button").addEventListener "click",()=>
      @addFrame()
      document.querySelector("#add-frame-button").scrollIntoView()

  hidePanel:()->
    @panel_shown = false
    document.querySelector("#sprite-animation-title").classList.add "collapsed"
    document.querySelector("#sprite-animation-panel").classList.add "collapsed"
    document.querySelector("#sprite-animation-title i").classList.add "fa-caret-right"
    document.querySelector("#sprite-animation-title i").classList.remove "fa-caret-down"
    document.querySelector("#spriteeditorcontainer").classList.add "expanded"
    @sprite_editor.spriteview.windowResized()

  showPanel:()->
    return if @sprite_editor.selected_sprite == "icon"
    @panel_shown = true
    document.querySelector("#sprite-animation-title").classList.remove "collapsed"
    document.querySelector("#sprite-animation-panel").classList.remove "collapsed"
    document.querySelector("#sprite-animation-title i").classList.remove "fa-caret-right"
    document.querySelector("#sprite-animation-title i").classList.add "fa-caret-down"
    document.querySelector("#spriteeditorcontainer").classList.remove "expanded"
    @sprite_editor.spriteview.windowResized()

  togglePanel:()->
    if @panel_shown
      @hidePanel()
    else
      @showPanel()

  spriteChanged:()->
    if @sprite_editor.selected_sprite == "icon" or not @sprite_editor.selected_sprite?
      document.querySelector("#sprite-animation-title").style.display = "none"
      @hidePanel()
    else
      document.querySelector("#sprite-animation-title").style.display = "block"

      if @sprite_editor.spriteview.sprite.frames.length>1
        @showPanel()
      else
        @hidePanel()

      @animation_preview.fps = @sprite_editor.spriteview.sprite.fps
      @animation_preview.setSlider()

    @updateFrames()

  addFrame:()->
    sprite = @sprite_editor.spriteview.sprite
    sprite.undo = new Undo() if not sprite.undo?
    sprite.undo.pushState sprite.clone() if sprite.undo.empty()

    @sprite_editor.spriteview.sprite.addFrame()
    @updateFrames()
    @sprite_editor.spriteview.setCurrentFrame(@sprite_editor.spriteview.sprite.frames.length-1)
    @sprite_editor.spriteview.update()
    @updateSelection()
    sprite.undo.pushState sprite.clone()

  updateFrames:()->
    s = @sprite_editor.spriteview.sprite
    list = document.querySelector "#sprite-animation-list"
    list.innerHTML = ""
    @frames = []
    for frame,i in s.frames
      list.appendChild @createFrameView(frame,i)
    return

  updateSelection:()->
    for c,i in document.getElementById("sprite-animation-list").children
      if i == @sprite_editor.spriteview.sprite.current_frame
        c.classList.add "selected"
      else
        c.classList.remove "selected"

  createFrameView:(frame,index)->
    div = document.createElement "div"
    div.classList.add "sprite-animation-frame"
    if index == @sprite_editor.spriteview.sprite.current_frame
      div.classList.add "selected"
    canvas = document.createElement "canvas"
    canvas.width = 80
    canvas.height = 80
    context = canvas.getContext "2d"
    context.imageSmoothingEnabled = false
    r = Math.min(80/frame.width,80/frame.height)
    w = r*frame.width
    h = r*frame.height
    context.drawImage frame.getCanvas(),40-w/2,40-h/2,w,h
    div.appendChild canvas
    canvas.addEventListener "click",()=>
      @doFrameOption(index,"select")
    div.appendChild @createFrameOption "clone","clone","Duplicate Frame",index
    if @sprite_editor.spriteview.sprite.frames.length>1
      div.appendChild @createFrameOption "remove","times","Delete Frame",index

    div.appendChild @createFrameOption "moveleft","arrow-left","Move Left",index
    div.appendChild @createFrameOption "moveright","arrow-right","Move Right",index
    span = document.createElement "span"
    span.innerHTML = "#{index}"
    div.appendChild span
    @frames[index] = canvas
    div

  createFrameOption:(option,icon,text,index)->
    i = document.createElement "i"
    i.classList.add option
    i.classList.add "fa"
    i.classList.add "fa-#{icon}"
    i.title = @sprite_editor.app.translator.get(text)
    i.addEventListener "click",()=>
      @doFrameOption(index,option)
    i

  doFrameOption:(index,option)->
    switch option
      when "select"
        @sprite_editor.spriteview.setCurrentFrame(index)
        @sprite_editor.spriteview.update()
        @updateSelection()

      when "clone"
        sprite = @sprite_editor.spriteview.sprite
        sprite.undo = new Undo() if not sprite.undo?
        sprite.undo.pushState sprite.clone() if sprite.undo.empty()

        f = @sprite_editor.spriteview.sprite.frames[index]
        frame = f.clone()
        @sprite_editor.spriteview.sprite.frames.splice(index,0,frame)
        @updateFrames()
        @doFrameOption(index+1,"select")

        @sprite_editor.spriteChanged()
        sprite.undo.pushState sprite.clone()

      when "remove"
        if @sprite_editor.spriteview.sprite.frames.length>1
          sprite = @sprite_editor.spriteview.sprite
          sprite.undo = new Undo() if not sprite.undo?
          sprite.undo.pushState sprite.clone() if sprite.undo.empty()

          @sprite_editor.spriteview.sprite.frames.splice(index,1)
          @updateFrames()
          @doFrameOption(Math.max(0,index-1),"select")

          @sprite_editor.spriteChanged()
          sprite.undo.pushState sprite.clone()

      when "moveleft"
        if index>0
          sprite = @sprite_editor.spriteview.sprite
          sprite.undo = new Undo() if not sprite.undo?
          sprite.undo.pushState sprite.clone() if sprite.undo.empty()

          frame = @sprite_editor.spriteview.sprite.frames.splice(index,1)[0]
          @sprite_editor.spriteview.sprite.frames.splice(index-1,0,frame)
          @updateFrames()
          @doFrameOption(index-1,"select")

          @sprite_editor.spriteChanged()
          sprite.undo.pushState sprite.clone()

      when "moveright"
        if index<@sprite_editor.spriteview.sprite.frames.length-1
          sprite = @sprite_editor.spriteview.sprite
          sprite.undo = new Undo() if not sprite.undo?
          sprite.undo.pushState sprite.clone() if sprite.undo.empty()

          frame = @sprite_editor.spriteview.sprite.frames.splice(index,1)[0]
          @sprite_editor.spriteview.sprite.frames.splice(index+1,0,frame)
          @updateFrames()
          @doFrameOption(index+1,"select")

          @sprite_editor.spriteChanged()
          sprite.undo.pushState sprite.clone()

  frameUpdated:()->
    for index in [0..@frames.length-1] by 1
      context = @frames[index].getContext "2d"
      context.clearRect 0,0,80,80
      frame = @sprite_editor.spriteview.sprite.frames[index]
      if frame?
        r = Math.min(80/frame.width,80/frame.height)
        w = r*frame.width
        h = r*frame.height
        context.drawImage frame.getCanvas(),40-w/2,40-h/2,w,h

class @AnimationPreview
  constructor:(@sprite_editor)->
    @canvas = document.querySelector("#sprite-animation-preview canvas")
    @context = @canvas.getContext "2d"
    @context.imageSmoothingEnabled = false
    @frame = 0
    @last = Date.now()
    @fps = 5
    @timer()
    @input = document.querySelector("#sprite-animation-preview input")
    @input.addEventListener "input",()=>
      @fps = 1+Math.round(Math.pow(@input.value/100,2)*59)
      @sprite_editor.spriteview.sprite.fps = @fps
      @sprite_editor.spriteChanged()
      @last = 0

    @input.addEventListener "mouseenter",()=>
      @fps_change = true
      @last = 0

    @input.addEventListener "mouseout",()=>
      @fps_change = false
      @last = 0

    @setSlider()

  setSlider:()->
    @input.value = Math.pow((@fps-1)/59,1/2)*100

  timer:()->
    requestAnimationFrame ()=>@timer()
    @update()
    
  update:()->
    if @sprite_editor.spriteview.sprite?
      time = Date.now()
      if time>@last+1000/@fps
        @last += 1000/@fps
        @last = time if @last<time-1000

        @frame = (@frame+1)%@sprite_editor.spriteview.sprite.frames.length
        frame = @sprite_editor.spriteview.sprite.frames[@frame]
        r = Math.min(80/frame.width,80/frame.height)
        w = r*frame.width
        h = r*frame.height
        @context.clearRect 0,0,80,80
        @context.drawImage frame.getCanvas(),40-w/2,40-h/2,w,h

        if @fps_change
          @context.font = "12pt Ubuntu Mono"
          @context.shadowBlur = 2
          @context.shadowOpacity = 1
          @context.shadowColor = "#000"
          @context.fillStyle = "#FFF"
          @context.textAlign = "center"
          @context.textBaseline = "middle"
          @context.fillText "#{@fps} FPS",40,70
          @context.shadowBlur = 0
          @context.shadowOpacity = 0
