class @ModelViewer
  constructor:(@manager)->
    @element = document.getElementById "model-asset-viewer"

  updateSnippet:()->
    @manager.code_snippet.set [{
      name: "Load Model"
      value: """loader = asset_manager.loadModel("#{@asset.name.replace(/-/g,"/")}", callback)"""
    }]

  view:(asset)->
    @asset = asset
    @element.style.display = "block"
    @updateSnippet()

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

    light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
    light.groundColor = new BABYLON.Color3(0,0,0)
    light.diffuse = new BABYLON.Color3(.4,.5,.6)
    light.intensity = .5

    light2 = new BABYLON.DirectionalLight("light2",new BABYLON.Vector3(1,-1,1), scene)
    light2.specular = light2.diffuse = new BABYLON.Color3(1,.9,.7)
    light2.intensity = .5

    # box = BABYLON.MeshBuilder.CreateBox("box", {}, scene)
    @createEnvironment(scene)

    url = asset.getURL()

    if url.startsWith("data:")
      url = "data:;base64,"+url.split(",")[1]

    try
      # BABYLON.OBJFileLoader.COMPUTE_NORMALS = true
      BABYLON.SceneLoader.LoadAssetContainer "",url , scene,((container)=>
        console.info "model loaded"
        console.info container
        container.addAllToScene()
        for m in container.meshes
          bs = m.getBoundingInfo().boundingBox

          if not min?
            min = new BABYLON.Vector3()
            min.copyFrom(bs.minimum)

          if not max?
            max = new BABYLON.Vector3()
            max.copyFrom(bs.maximum)

          min = BABYLON.Vector3.Minimize(min, bs.minimum)
          max = BABYLON.Vector3.Maximize(max, bs.maximum)

        size = max.subtract(min);

        boundingInfo = new BABYLON.BoundingInfo(min,max)
        center = boundingInfo.boundingBox.centerWorld

        # m = BABYLON.MeshBuilder.CreateBox("bounds", {size:1}, scene)
        # m.scaling.copyFrom(size)
        # m.position.copyFrom(center)
        # m.visibility = 0.1

        console.log("Width: ", size.x);
        console.log("Height: ", size.y);
        console.log("Depth: ", size.z);
        console.log("Position: ", center)

        radius = max.subtract(min).length()

        console.info "RADIUS = "+radius

        @camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, radius, new BABYLON.Vector3(0, 0, 0), scene)
        @camera.attachControl(@canvas, true)
        @camera.lowerRadiusLimit = radius/10
        @camera.upperRadiusLimit = radius*10
        @camera.maxZ = radius*100
        @camera.minZ = radius/100
        @camera.wheelDeltaPercentage = .01
        window.camera = @camera

        @camera.setTarget( center )
        window.container = container

        if asset.ext == "obj"
          for mesh in container.meshes
            mesh.material = new BABYLON.StandardMaterial "pbrmat",scene
            mesh.material.diffuseColor = new BABYLON.Color3(1, 1, 1)
            mesh.material.specularColor = new BABYLON.Color3(0,0,0)
            mesh.material.emissiveColor = new BABYLON.Color3(0,0,0)
            mesh.material.ambientColor = new BABYLON.Color3(.1,.1,.1)

        @engine.runRenderLoop ()=>
          scene.render()

        ),((progress)=>console.info(progress)),((error)=>console.info(error)),".#{asset.ext}"
    catch err

    @resize()
    @asset = asset
    setTimeout (()=>@manager.checkThumbnail asset,()=> @updateThumbnail()),2000

  updateThumbnail:()->
    canvas = document.createElement "canvas"
    canvas.width = 128
    canvas.height = 96
    context = canvas.getContext "2d"
    context.save()
    context.translate 64,48

    m = Math.min @canvas.width/128*96,@canvas.height
    w = @canvas.width/m*128
    h = @canvas.height/m*96

    BABYLON.Tools.CreateScreenshot @engine, @camera, {width: w,height: h},(data)=>
      image = new Image
      image.src = data
      image.onload = ()=>
        context.drawImage image,-image.width/2,-image.height/2
        context.restore()
        @manager.updateAssetIcon @asset,canvas

  resize:()->
    if @canvas
      w = @canvas.parentNode.getBoundingClientRect().width
      h = @canvas.parentNode.getBoundingClientRect().height
      @canvas.width = w
      @canvas.height = h
    @engine.resize() if @engine?

  createEnvironment:(scene)->
    createFace = (c1,c2)->
      canvas = document.createElement "canvas"
      canvas.width = canvas.height = 256
      c = canvas.getContext "2d"
      if c2?
        # c.fillStyle = c1
        # c.fillRect 0,0,canvas.width,canvas.height/2
        # c.fillStyle = c2
        # c.fillRect 0,canvas.height/2,canvas.width,canvas.height/2
        c.fillStyle = grd = c.createLinearGradient 0,0,0,canvas.height
        grd.addColorStop 0,c1
        grd.addColorStop .48,c1
        grd.addColorStop .52,c2
        grd.addColorStop 1,c2
        c.fillRect 0,0,canvas.width,canvas.height
      else
        c.fillStyle = c1
        c.fillRect 0,0,canvas.width,canvas.height

      canvas.toDataURL()

    files = [
      createFace("#ACE","#864"),
      createFace("#BDF"),
      createFace("#ACE","#864"),
      createFace("#ACE","#864"),
      createFace("#201818"),
      createFace("#ACE","#864"),
    ]
    texture = BABYLON.CubeTexture.CreateFromImages(files,scene)
    scene.environmentTexture = texture
    #console.info scene.createDefaultSkybox(texture, true, 1000)
