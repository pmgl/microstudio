class @ValueTool
  constructor:(@editor,@x,@y,@value,@callback)->
    @tool = document.createElement "div"
    @tool.classList.add "value-tool"
    @tool.addEventListener 'contextmenu', (event) -> event.preventDefault()

    max = Math.max(100,Math.abs(@value*2))
    min = -max
    @slider = document.createElement "input"
    @slider.type = "range"
    @slider.min = min
    @slider.max = max
    @slider.value = @value
    @slider.addEventListener "input",(event)=>
      @callback(@slider.value)

    @tool.appendChild @slider

    @y = Math.max(0,@y-60)+document.querySelector("#editor-view .ace_content").getBoundingClientRect().y
    @x = Math.max(0,@x-150)+document.querySelector("#editor-view .ace_content").getBoundingClientRect().x
    @tool.style = "z-index: 20;top:#{@y}px;left:#{@x}px;"
    document.getElementById("editor-view").appendChild @tool

    @tool.addEventListener "mousedown",(event)->
      event.stopPropagation()

  dispose:()->
    document.getElementById("editor-view").removeChild @tool

class @ColorValueTool
  constructor:(@editor,@x,@y,@value,@callback)->
    @tool = document.createElement "div"
    @tool.classList.add "value-tool"
    @tool.addEventListener 'contextmenu', (event) -> event.preventDefault()

    try
      canvas = document.createElement "canvas"
      canvas.width = 1
      canvas.height = 1
      context = canvas.getContext "2d"
      context.fillStyle = @value
      context.fillRect(0,0,1,1)
      data = context.getImageData(0,0,1,1)
    catch err

    div = document.createElement "div"
    div.classList.add "colortext"

    @input = document.createElement "input"
    @input.spellcheck = false
    @input.addEventListener "input",(event)=>@colortextChanged()

    @copy = document.createElement "i"
    @copy.classList.add "fa"
    @copy.classList.add "fa-copy"
    @copy.addEventListener "click",(event)=>
      @copy.classList.remove "fa-copy"
      @copy.classList.add "fa-check"
      setTimeout (()=>
        @copy.classList.remove "fa-check"
        @copy.classList.add "fa-copy"),3000
      navigator.clipboard.writeText """\"#{@input.value}\""""


    @picker = new ColorPicker @
    @tool.appendChild @picker.canvas
    @tool.appendChild div
    div.appendChild @copy
    div.appendChild @input

    if data?
      @picker.colorPicked data.data

    @y = Math.max(0,@y-200)+document.querySelector("#editor-view .ace_content").getBoundingClientRect().y
    @x = Math.max(0,@x+75)+document.querySelector("#editor-view .ace_content").getBoundingClientRect().x
    @tool.style = "z-index: 20;top:#{@y}px;left:#{@x}px;"
    document.getElementById("editor-view").appendChild @tool

    @started = true
    @tool.addEventListener "mousedown",(event)->
      event.stopPropagation()

  colortextChanged:()->
    @picker.color = @input.value
    @picker.colorPicked(@input.value)

  setColor:(@color)->
    @callback @color if @started
    @input.value = @color

  dispose:()->
    document.getElementById("editor-view").removeChild @tool
