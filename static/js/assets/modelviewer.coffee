class @ModelViewer
  constructor:(@manager)->
    @element = document.getElementById "model-asset-viewer"

  view:(asset)->
    @element.style.display = "block"

    if not @initialized
      @initialized = true
      s = document.createElement "script"
      s.src = location.origin+"/lib/babylonjs/babylon.js"
      document.head.appendChild s
      s.onload = ()=>
        s = document.createElement "script"
        s.src = location.origin+"/lib/babylonjs/babylonjs.loaders.min.js"
        document.head.appendChild s
        s.onload = ()=>
          @view(asset)

      return

    if not @engine?
      @canvas = document.createElement "canvas"
      @canvas.width = 1000
      @canvas.height = 800
      @engine = new BABYLON.Engine @canvas,true,{preserveDrawingBuffer: true}
      @element.appendChild @canvas
      window.addEventListener "resize",()=>
        @resize()


    scene = new BABYLON.Scene(@engine)
    scene.clearColor = new BABYLON.Color3(.1,.2,.3)
    @camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), scene)
    @camera.attachControl(@canvas, true)
    @camera.lowerRadiusLimit = 2
    @camera.upperRadiusLimit = 100
    @camera.wheelDeltaPercentage = .01
    light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
    # box = BABYLON.MeshBuilder.CreateBox("box", {}, scene)
    url = asset.getURL()

    if url.startsWith("data:")
      url = "data:;base64,"+url.split(",")[1]

    try
      BABYLON.SceneLoader.LoadAssetContainer "",url , scene,((container)=>
        console.info "model loaded"
        console.info container
        container.addAllToScene()
        ),((progress)=>console.info(progress)),((error)=>console.info(error)),".#{asset.ext}"
    catch err


    @engine.runRenderLoop ()=>
      scene.render()

    @resize()
    @asset = asset
    setTimeout (()=>@manager.checkThumbnail asset,()=> @updateThumbnail()),2000

  updateThumbnail:()->
    canvas = document.createElement "canvas"
    canvas.width = canvas.height = 64
    context = canvas.getContext "2d"
    context.translate 32,32

    m = Math.min @canvas.width,@canvas.height
    w = @canvas.width/m*64
    h = @canvas.height/m*64

    BABYLON.Tools.CreateScreenshot @engine, @camera, {width: w,height: h},(data)=>
      image = new Image
      image.src = data
      image.onload = ()=>
        context.drawImage image,-image.width/2,-image.height/2

        if @asset.element?
          @asset.element.querySelector("img").src = canvas.toDataURL()

        @manager.updateAssetIcon @asset,canvas

  resize:()->
    if @canvas
      w = @canvas.parentNode.getBoundingClientRect().width
      h = @canvas.parentNode.getBoundingClientRect().height
      @canvas.width = w
      @canvas.height = h
    @engine.resize() if @engine?
