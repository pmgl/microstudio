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

    @picker = new ColorPicker @
    @tool.appendChild @picker.canvas

    if data?
      @picker.colorPicked data.data

    @y = Math.max(0,@y-200)+document.querySelector("#editor-view .ace_content").getBoundingClientRect().y
    @x = Math.max(0,@x+75)+document.querySelector("#editor-view .ace_content").getBoundingClientRect().x
    @tool.style = "z-index: 20;top:#{@y}px;left:#{@x}px;"
    document.getElementById("editor-view").appendChild @tool

    @started = true
    @tool.addEventListener "mousedown",(event)->
      event.stopPropagation()

  setColor:(@color)->
    @callback @color if @started

  dispose:()->
    document.getElementById("editor-view").removeChild @tool
