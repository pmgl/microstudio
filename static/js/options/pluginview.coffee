class @PluginView
  constructor:(@app,@data)->
    @access = new ProjectAccess @app,@data.folder,@

  createElement:()->
    @element = document.createElement "div"
    @element.classList.add "plugin-view"
    @element.style.display = "none"

    document.getElementById("section-container").appendChild @element

    @element.innerHTML = """<div class="plugin-view-container"><iframe allow='autoplay;gamepad' src='#{@data.url}?debug'></iframe></div>"""

    @message_listener = (msg)=>
      if msg.source == @element.querySelector("iframe").contentWindow
        @messageReceived JSON.parse msg.data

    window.addEventListener "message",@message_listener

  show:()->
    @createElement() if not @element?
    @element.style.display = "block"

  hide:()->
    if @element?
      @element.style.display = "none"

  setFolder:(folder)->
    @access.setFolder folder

  messageReceived:(msg)->
    @access.messageReceived msg

  postMessage:(data)->
    if @element?
      @element.querySelector("iframe").contentWindow.postMessage JSON.stringify(data),"*"

  close:()->
    if @message_listener?
      window.removeEventListener "message",@message_listener
    if @element?
      document.getElementById("section-container").removeChild @element
