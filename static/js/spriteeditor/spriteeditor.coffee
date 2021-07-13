class @SpriteEditor
  constructor:(@app)->
    @spriteview = new SpriteView @

    @auto_palette = new AutoPalette @
    @colorpicker = new ColorPicker @
    document.getElementById("colorpicker").appendChild @colorpicker.canvas

    @animation_panel = new AnimationPanel @

    @save_delay = 1000
    @save_time = 0
    setInterval (()=>@checkSave()),@save_delay/2

    @app.appui.setAction "create-sprite-button",()=>@createSprite()
    #document.getElementById("sprite-name").addEventListener "input",(event)=>@spriteNameChanged()

    @sprite_name_validator = new InputValidator document.getElementById("sprite-name"),
      document.getElementById("sprite-name-button"),
      null,
      (value)=>
        return if @app.project.isLocked("sprites/#{@selected_sprite}.png")
        @app.project.lockFile("sprites/#{@selected_sprite}.png")
        name = value[0].toLowerCase()
        name = RegexLib.fixFilename(name)
        document.getElementById("sprite-name").value = name
        @sprite_name_validator.update()
        if @selected_sprite != "icon" and name != @selected_sprite and RegexLib.filename.test(name) and not @app.project.getSprite(name)?
          old = @selected_sprite
          @selected_sprite = name
          @spriteview.sprite.rename name
          @app.project.changeSpriteName(old,name)
          @app.project.lockFile("sprites/#{@selected_sprite}.png")
          @saveSprite ()=>
            @app.client.sendRequest {
              name: "delete_project_file"
              project: @app.project.id
              file: "sprites/#{old}.png"
            },(msg)=>
              @app.project.updateSpriteList()

    @sprite_name_validator.regex = RegexLib.filename

    document.getElementById("sprite-width").addEventListener "input",(event)=>@spriteDimensionChanged("width")
    document.getElementById("sprite-height").addEventListener "input",(event)=>@spriteDimensionChanged("height")

    @sprite_size_validator = new InputValidator [document.getElementById("sprite-width"),document.getElementById("sprite-height")],
      document.getElementById("sprite-size-button"),
      null,
      (value)=>
        @saveDimensionChange(value)

    @selected_sprite = null

    @app.appui.setAction "undo-sprite",()=>@undo()
    @app.appui.setAction "redo-sprite",()=>@redo()
    @app.appui.setAction "copy-sprite",()=>@copy()
    @app.appui.setAction "cut-sprite",()=>@cut()
    @app.appui.setAction "paste-sprite",()=>@paste()
    @app.appui.setAction "delete-sprite",()=>@deleteSprite()

    @app.appui.setAction "sprite-helper-tile",()=>@toggleTile()
    @app.appui.setAction "sprite-helper-vsymmetry",()=>@toggleVSymmetry()
    @app.appui.setAction "sprite-helper-hsymmetry",()=>@toggleHSymmetry()

    @app.appui.setAction "selection-operation-film",()=>@stripToAnimation()

    document.addEventListener "keydown",(event)=>
      return if not document.getElementById("spriteeditor").offsetParent?
      #console.info event
      if event.key == "Alt" and not @tool.selectiontool
        @setColorPicker(true)
        @alt_pressed = true

      if event.metaKey or event.ctrlKey
        switch event.key
          when "z" then @undo()
          when "Z" then @redo()
          when "c" then @copy()
          when "x" then @cut()
          when "v" then @paste()

      #console.info event

    document.addEventListener "keyup",(event)=>
      if event.key == "Alt" and not @tool.selectiontool
        @setColorPicker(false)
        @alt_pressed = false

    document.getElementById("eyedropper").addEventListener "click",()=>
      @setColorPicker not @spriteview.colorpicker

    for tool,i in DrawTool.tools
      @createToolButton tool
      @createToolOptions tool
    @setSelectedTool DrawTool.tools[0].icon

    document.getElementById("spritelist").addEventListener "dragover",(event)=>
      event.preventDefault()
      #console.info event

    document.getElementById("spritelist").addEventListener "drop",(event)=>
      event.preventDefault()
      try
        list = []
        for i in event.dataTransfer.items
          list.push i.getAsFile()

        funk = ()=>
          if list.length>0
            file = list.splice(0,1)[0]
            console.info "processing #{file.name}"
            img = new Image
            reader = new FileReader()
            reader.addEventListener "load",()=>
              img.src = reader.result

            reader.readAsDataURL(file)
            #url = "data:application/javascript;base64,"+btoa(Audio.processor)

            img.onload = ()=>
              if img.complete and img.width>0 and img.height>0 and img.width<=2048 and img.height<=2048
                @createSprite RegexLib.fixFilename(file.name.split(".")[0]),img,()=>funk()
        funk()

      catch err
        console.error err

  createToolButton:(tool)->
    parent = document.getElementById("spritetools")

    div = document.createElement "div"
    div.classList.add "spritetoolbutton"
    div.title = tool.name

    div.innerHTML = "<i class='fa #{tool.icon}'></i><br />#{@app.translator.get(tool.name)}"
    div.addEventListener "click",()=>
      @setSelectedTool(tool.icon)

    div.id = "spritetoolbutton-#{tool.icon}"

    parent.appendChild div

  createToolOptions:(tool)->
    parent = document.getElementById("spritetooloptionslist")

    div = document.createElement "div"

    for key,p of tool.parameters
      if p.type == "range"
        do (p,key)=>
          label = document.createElement "label"
          label.innerText = key
          div.appendChild label
          input = document.createElement "input"
          input.type = "range"
          input.min = "0"
          input.max = "100"
          input.value = p.value
          input.addEventListener "input",(event)=>
            p.value = input.value
            if key == "Size"
              @spriteview.showBrushSize()
          div.appendChild input
      else if p.type == "tool"
        toolbox = document.createElement "div"
        toolbox.classList.add "toolbox"
        div.appendChild toolbox

        for t,k in p.set
          button = document.createElement "div"
          button.classList.add "spritetoolbutton"
          if k==0
            button.classList.add "selected"
          button.title = t.name
          button.id = "spritetoolbutton-#{t.icon}"
          i = document.createElement "i"
          i.classList.add "fa"
          i.classList.add t.icon
          button.appendChild i
          button.appendChild document.createElement "br"
          button.appendChild document.createTextNode t.name
          toolbox.appendChild button
          t.button = button

          do (p,k)=>
            button.addEventListener "click",()=>
              p.value = k
              for t,i in p.set
                if i == k
                  t.button.classList.add "selected"
                else
                  t.button.classList.remove "selected"

    div.id = "spritetooloptions-#{tool.icon}"
    parent.appendChild div

  setSelectedTool:(id)->
    for tool in DrawTool.tools
      e = document.getElementById "spritetoolbutton-#{tool.icon}"
      if tool.icon == id
        @tool = tool
        e.classList.add "selected"
      else
        e.classList.remove "selected"

      e = document.getElementById "spritetooloptions-#{tool.icon}"
      if tool.icon == id
        e.style.display = "block"
      else
        e.style.display = "none"

    document.getElementById("colorpicker-group").style.display = if @tool.parameters["Color"]? then "block" else "none"
    @spriteview.update()
    @updateSelectionHints()

  toggleTile:()->
    @spriteview.tile = not @spriteview.tile
    @spriteview.update()
    if @spriteview.tile
      document.getElementById("sprite-helper-tile").classList.add "selected"
    else
      document.getElementById("sprite-helper-tile").classList.remove "selected"

  toggleVSymmetry:()->
    @spriteview.vsymmetry = not @spriteview.vsymmetry
    @spriteview.update()
    if @spriteview.vsymmetry
      document.getElementById("sprite-helper-vsymmetry").classList.add "selected"
    else
      document.getElementById("sprite-helper-vsymmetry").classList.remove "selected"

  toggleHSymmetry:()->
    @spriteview.hsymmetry = not @spriteview.hsymmetry
    @spriteview.update()
    if @spriteview.hsymmetry
      document.getElementById("sprite-helper-hsymmetry").classList.add "selected"
    else
      document.getElementById("sprite-helper-hsymmetry").classList.remove "selected"

  spriteChanged:()->
    return if @ignore_changes
    @app.project.lockFile("sprites/#{@selected_sprite}.png")
    @save_time = Date.now()
    s = @app.project.getSprite @selected_sprite
    s.updated(@spriteview.sprite.saveData()) if s?
    # s.loaded() # triggers update of all maps
    @app.project.addPendingChange @
    @animation_panel.frameUpdated()
    @auto_palette.update()
    @app.project.notifyListeners s
    @app.runwindow.updateSprite @selected_sprite
    #@updateLocalSprites()

  checkSave:(immediate=false,callback)->
    if @save_time>0 and (immediate or Date.now()>@save_time+@save_delay)
      @saveSprite(callback)
      @save_time = 0
    else
      callback() if callback?

  forceSave:(callback)->
    @checkSave(true,callback)

  projectOpened:()->
    @app.project.addListener @
    @setSelectedSprite null

  projectUpdate:(change)->
    if change == "spritelist"
      @rebuildSpriteList()
    else if change == "locks"
      @updateCurrentFileLock()
      @updateActiveUsers()
    else if change instanceof ProjectSprite
      name = change.name
      c = document.querySelector "#sprite-image-#{name}"
      sprite = change
      if c? and c.updateSprite?
        c.updateSprite()

  updateCurrentFileLock:()->
    if @selected_sprite?
      @spriteview.editable = not @app.project.isLocked("sprites/#{@selected_sprite}.png")

    lock = document.getElementById("sprite-editor-locked")
    if @selected_sprite? and @app.project.isLocked("sprites/#{@selected_sprite}.png")
      user = @app.project.isLocked("sprites/#{@selected_sprite}.png").user
      lock.style = "display: block; background: #{@app.appui.createFriendColor(user)}"
      lock.innerHTML = "<i class='fa fa-user'></i> Locked by #{user}"
    else
      lock.style = "display: none"

  saveSprite:(callback)->
    return if not @selected_sprite? or not @spriteview.sprite
    data = @spriteview.sprite.saveData().split(",")[1]
    sprite = @spriteview.sprite
    saved = false
    @app.client.sendRequest {
      name: "write_project_file"
      project: @app.project.id
      file: "sprites/#{@selected_sprite}.png"
      properties:
        frames: @spriteview.sprite.frames.length
        fps: @spriteview.sprite.fps
      content: data
    },(msg)=>
      saved = true
      @app.project.removePendingChange(@) if @save_time == 0
      sprite.size = msg.size
      callback() if callback?

    setTimeout (()=>
      if not saved
       @save_time = Date.now()
       console.info("retrying sprite save...")
      ),10000

  createSprite:(name,img,callback)->
    @checkSave true,()=>
      if img?
        width = img.width
        height = img.height
      else if @spriteview.selection?
        width = Math.max(8,@spriteview.selection.w)
        height = Math.max(8,@spriteview.selection.h)
      else
        width = Math.max(8,@spriteview.sprite.width)
        height = Math.max(8,@spriteview.sprite.height)

      sprite = @app.project.createSprite(width,height,name)
      @spriteview.setSprite sprite
      @animation_panel.spriteChanged()
      if img?
        @spriteview.getFrame().getContext().drawImage img,0,0

      @spriteview.update()
      @setSelectedSprite(sprite.name)
      @spriteview.editable = true
      @saveSprite ()=>
        @rebuildSpriteList()
        callback() if callback?

  setSelectedSprite:(sprite)->
    @selected_sprite = sprite
    @animation_panel.spriteChanged()
    list = document.getElementById("sprite-list").childNodes

    if @selected_sprite?
      for e in list
        if e.getAttribute("id") == "project-sprite-#{sprite}"
          e.classList.add("selected")
        else
          e.classList.remove("selected")

      document.getElementById("sprite-name").value = sprite
      @sprite_name_validator.update()
      document.getElementById("sprite-name").disabled = @selected_sprite == "icon"
      if @spriteview.sprite?
        document.getElementById("sprite-width").value = @spriteview.sprite.width
        document.getElementById("sprite-height").value = @spriteview.sprite.height
        @sprite_size_validator.update()

      document.getElementById("sprite-width").disabled = false
      document.getElementById("sprite-height").disabled = false

      e = document.getElementById("spriteeditor")
      if e.firstChild?
        e.firstChild.style.display = "inline-block"
      @spriteview.windowResized()
    else
      for e in list
        e.classList.remove("selected")
      document.getElementById("sprite-name").value = ""
      document.getElementById("sprite-name").disabled = true
      document.getElementById("sprite-width").disabled = true
      document.getElementById("sprite-height").disabled = true
      e = document.getElementById("spriteeditor")
      if e.firstChild?
        e.firstChild.style.display = "none"

    @updateCurrentFileLock()
    @updateSelectionHints()
    @auto_palette.update()

  setSprite:(data)->
    data = "data:image/png;base64,"+data
    @ignore_changes = true
    img = new Image
    img.src = data
    img.crossOrigin = "Anonymous"
    img.onload = ()=>
      @spriteview.sprite.load(img)
      @spriteview.windowResized()
      @spriteview.update()
      @spriteview.editable = true
      @ignore_changes = false
      @spriteview.windowResized()
      document.getElementById("sprite-width").value = @spriteview.sprite.width
      document.getElementById("sprite-height").value = @spriteview.sprite.height
      @sprite_size_validator.update()

  setColor:(@color)->
    @spriteview.setColor @color
    @auto_palette.colorPicked @color

  rebuildSpriteList:()->
    list = document.getElementById "sprite-list"
    list.innerHTML = ""

    for s in @app.project.sprite_list
      element = @createSpriteBox s
      list.appendChild element

    @updateActiveUsers()
    if @selected_sprite? and not @app.project.getSprite(@selected_sprite)?
      @setSelectedSprite null
    return

  openSprite:(s)->
    @checkSave(true)
    @spriteview.setSprite @app.project.getSprite s
    @spriteview.windowResized()
    @spriteview.update()
    @spriteview.editable = true
    @setSelectedSprite(s)

  updateActiveUsers:()->
    list = document.getElementById("sprite-list").childNodes
    for e in list
      file = e.id.split("-")[2]
      lock = @app.project.isLocked("sprites/#{file}.png")
      if lock? and Date.now()<lock.time
        e.querySelector(".active-user").style = "display: block; background: #{@app.appui.createFriendColor(lock.user)};"
      else
        e.querySelector(".active-user").style = "display: none;"
    return

  createSpriteBox:(sprite)->
    element = document.createElement "div"
    element.classList.add "sprite-box"
    element.setAttribute "id","project-sprite-#{sprite.name}"
    element.setAttribute "title",sprite.name
    if sprite.name == @selected_sprite
      element.classList.add "selected"

    iconbox = document.createElement "div"
    iconbox.classList.add("icon-box")

    icon = @createSpriteThumb(sprite)
    icon.setAttribute "id","sprite-image-#{sprite.name}"
    iconbox.appendChild icon
    element.appendChild iconbox

    sprite.addImage icon,64

    element.appendChild document.createElement "br"

    text = document.createElement "span"
    text.innerHTML = sprite.name

    element.appendChild text

    element.addEventListener "click",()=>
      @openSprite sprite.name

    activeuser = document.createElement "i"
    activeuser.classList.add "active-user"
    activeuser.classList.add "fa"
    activeuser.classList.add "fa-user"
    element.appendChild activeuser
    element

  createSpriteThumb:(sprite)->
    canvas = document.createElement "canvas"
    canvas.width = 64
    canvas.height = 64
    sprite.addLoadListener ()=>
      context = canvas.getContext "2d"
      frame = sprite.frames[0].getCanvas()
      r = Math.min(64/frame.width,64/frame.height)
      context.imageSmoothingEnabled = false
      w = r*frame.width
      h = r*frame.height
      context.drawImage frame,32-w/2,32-h/2,w,h

    mouseover = false
    update = ()=>
      if mouseover and sprite.frames.length>1
        requestAnimationFrame ()=>update()

      dt = 1000/sprite.fps
      t = Date.now()
      frame = if mouseover then Math.floor(t/dt)%sprite.frames.length else 0
      context = canvas.getContext "2d"
      context.imageSmoothingEnabled = false
      context.clearRect 0,0,64,64
      frame = sprite.frames[frame].getCanvas()
      r = Math.min(64/frame.width,64/frame.height)
      w = r*frame.width
      h = r*frame.height
      context.drawImage frame,32-w/2,32-h/2,w,h

    canvas.addEventListener "mouseenter",()=>
      mouseover = true
      update()

    canvas.addEventListener "mouseout",()=>
      mouseover = false

    canvas.updateSprite = update

    canvas

  spriteDimensionChanged:(dim)->
    if @selected_sprite == "icon"
      if dim == "width"
        document.getElementById("sprite-height").value = document.getElementById("sprite-width").value
      else
        document.getElementById("sprite-width").value = document.getElementById("sprite-height").value

  saveDimensionChange:(value)->
    return if @app.project.isLocked("sprites/#{@selected_sprite}.png")
    @app.project.lockFile("sprites/#{@selected_sprite}.png")
    w = value[0]
    h = value[1]

    try
      w = Number.parseFloat(w)
      h = Number.parseFloat(h)
    catch err

    if (@selected_sprite != "icon" or w == h) and Number.isInteger(w) and Number.isInteger(h) and w>0 and h>0 and w<257 and h<257 and @selected_sprite? and (w != @spriteview.sprite.width or h != @spriteview.sprite.height)
      @spriteview.sprite.undo = new Undo() if not @spriteview.sprite.undo?
      @spriteview.sprite.undo.pushState @spriteview.sprite.clone() if @spriteview.sprite.undo.empty()
      @spriteview.sprite.resize(w,h)
      @spriteview.sprite.undo.pushState @spriteview.sprite.clone()
      @spriteview.windowResized()
      @spriteview.update()
      @spriteChanged()
      @checkSave(true)
      document.getElementById("sprite-width").value = @spriteview.sprite.width
      document.getElementById("sprite-height").value = @spriteview.sprite.height
      @sprite_size_validator.update()
    else
      document.getElementById("sprite-width").value = @spriteview.sprite.width
      document.getElementById("sprite-height").value = @spriteview.sprite.height
      @sprite_size_validator.update()

  deleteSprite:()->
    return if @app.project.isLocked("sprites/#{@selected_sprite}.png")
    @app.project.lockFile("sprites/#{@selected_sprite}.png")
    if @selected_sprite? and @selected_sprite != "icon"
      if confirm "Really delete #{@selected_sprite}?"
        @app.client.sendRequest {
          name: "delete_project_file"
          project: @app.project.id
          file: "sprites/#{@selected_sprite}.png"
        },(msg)=>
          @app.project.updateSpriteList()
          @spriteview.sprite = new Sprite(16,16)
          @spriteview.update()
          @spriteview.editable = false
          @setSelectedSprite null

  undo:()->
    return if @app.project.isLocked("sprites/#{@selected_sprite}.png")
    @app.project.lockFile("sprites/#{@selected_sprite}.png")
    if @spriteview.sprite and @spriteview.sprite.undo?
      s = @spriteview.sprite.undo.undo ()=>@spriteview.sprite.clone()
      @spriteview.selection = null
      if s?
        @spriteview.sprite.copyFrom s
        @spriteview.update()
        document.getElementById("sprite-width").value = @spriteview.sprite.width
        document.getElementById("sprite-height").value = @spriteview.sprite.height
        @sprite_size_validator.update()
        @spriteview.windowResized()
        @spriteChanged()
        @animation_panel.updateFrames()

  redo:()->
    return if @app.project.isLocked("sprites/#{@selected_sprite}.png")
    @app.project.lockFile("sprites/#{@selected_sprite}.png")
    if @spriteview.sprite and @spriteview.sprite.undo?
      s = @spriteview.sprite.undo.redo()
      @spriteview.selection = null
      if s?
        @spriteview.sprite.copyFrom s
        @spriteview.update()
        document.getElementById("sprite-width").value = @spriteview.sprite.width
        document.getElementById("sprite-height").value = @spriteview.sprite.height
        @sprite_size_validator.update()
        @spriteview.windowResized()
        @spriteChanged()
        @animation_panel.updateFrames()

  copy:()->
    if @tool.selectiontool and @spriteview.selection?
      @clipboard = new Sprite(@spriteview.selection.w,@spriteview.selection.h)
      @clipboard.frames[0].getContext().drawImage @spriteview.getFrame().canvas,-@spriteview.selection.x,-@spriteview.selection.y
      @clipboard.partial = true
    else
      @clipboard = @spriteview.sprite.clone()

  cut:()->
    return if @app.project.isLocked("sprites/#{@selected_sprite}.png")
    @app.project.lockFile("sprites/#{@selected_sprite}.png")

    @spriteview.sprite.undo = new Undo() if not @spriteview.sprite.undo?
    @spriteview.sprite.undo.pushState @spriteview.sprite.clone() if @spriteview.sprite.undo.empty()

    if @tool.selectiontool and @spriteview.selection?
      @clipboard = new Sprite(@spriteview.selection.w,@spriteview.selection.h)
      @clipboard.frames[0].getContext().drawImage @spriteview.getFrame().canvas,-@spriteview.selection.x,-@spriteview.selection.y
      @clipboard.partial = true
      sel = @spriteview.selection
      @spriteview.getFrame().getContext().clearRect sel.x,sel.y,sel.w,sel.h
    else
      @clipboard = @spriteview.sprite.clone()
      @spriteview.sprite.clear()

    @spriteview.sprite.undo.pushState @spriteview.sprite.clone()
    @currentSpriteUpdated()
    @spriteChanged()

  paste:()->
    return if @app.project.isLocked("sprites/#{@selected_sprite}.png")
    @app.project.lockFile("sprites/#{@selected_sprite}.png")
    if @clipboard?
      @spriteview.sprite.undo = new Undo() if not @spriteview.sprite.undo?
      @spriteview.sprite.undo.pushState @spriteview.sprite.clone() if @spriteview.sprite.undo.empty()

      if @clipboard.partial
        x = 0
        y = 0

        x = Math.max(0,Math.min(@spriteview.sprite.width-@clipboard.width,@spriteview.mouse_x))
        y = Math.max(0,Math.min(@spriteview.sprite.height-@clipboard.height,@spriteview.mouse_y))

        @spriteview.floating_selection =
          bg: @spriteview.getFrame().clone().getCanvas()
          fg: @clipboard.frames[0].getCanvas()
        @spriteview.selection =
          x: x
          y: y
          w: @clipboard.frames[0].canvas.width
          h: @clipboard.frames[0].canvas.height

        @spriteview.getFrame().getContext().drawImage @clipboard.frames[0].getCanvas(),x,y
        @setSelectedTool("fa-vector-square")
      else
        @spriteview.sprite.copyFrom(@clipboard)

      @spriteview.sprite.undo.pushState @spriteview.sprite.clone()
      @currentSpriteUpdated()
      @spriteChanged()

  currentSpriteUpdated:()->
    @spriteview.update()
    document.getElementById("sprite-width").value = @spriteview.sprite.width
    document.getElementById("sprite-height").value = @spriteview.sprite.height
    @sprite_size_validator.update()
    @spriteview.windowResized()

  setColorPicker:(picker)->
    @spriteview.colorpicker = picker

    if picker
      #@spriteview.canvas.classList.add "colorpicker"
      @spriteview.canvas.style.cursor = "url( '/img/eyedropper.svg' ) 0 24, pointer"
      document.getElementById("eyedropper").classList.add "selected"
    else
      #@spriteview.canvas.classList.remove "colorpicker"
      @spriteview.canvas.style.cursor = "crosshair"
      document.getElementById("eyedropper").classList.remove "selected"

  updateSelectionHints:()->
    if @spriteview.selection? and @tool.selectiontool
      document.getElementById("selection-group").style.display = "block"
      w = @spriteview.selection.w
      h = @spriteview.selection.h
      if @spriteview.sprite.frames.length == 1 and (@spriteview.sprite.width/w)%1 == 0 and (@spriteview.sprite.height/h)%1 == 0 and (@spriteview.sprite.width/w >=2 or @spriteview.sprite.height/h >= 2)
        document.getElementById("selection-operation-film").style.display = "block"
      else
        document.getElementById("selection-operation-film").style.display = "none"
    else
      document.getElementById("selection-group").style.display = "none"

  stripToAnimation:()->
    w = @spriteview.selection.w
    h = @spriteview.selection.h
    if @spriteview.sprite.frames.length == 1 and (@spriteview.sprite.width/w)%1 == 0 and (@spriteview.sprite.height/h)%1 == 0 and (@spriteview.sprite.width/w >=2 or @spriteview.sprite.height/h >= 2)
      @spriteview.sprite.undo = new Undo() if not @spriteview.sprite.undo?
      @spriteview.sprite.undo.pushState @spriteview.sprite.clone() if @spriteview.sprite.undo.empty()

      n = @spriteview.sprite.width/w
      m = @spriteview.sprite.height/h
      sprite = new Sprite(w,h)
      index = 0
      for j in [0..m-1] by 1
        for i in [0..n-1] by 1
           sprite.frames[index] = new SpriteFrame(sprite,w,h)
           sprite.frames[index].getContext().drawImage(@spriteview.sprite.frames[0].getCanvas(),-i*w,-j*h)
           index++

      @spriteview.sprite.copyFrom sprite
      @spriteview.sprite.undo.pushState @spriteview.sprite.clone()
      @currentSpriteUpdated()
      @spriteChanged()
      @animation_panel.spriteChanged()
