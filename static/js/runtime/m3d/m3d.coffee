M3D = {}

M3D.BABYLON = BABYLON

M3D.Vector3 = BABYLON.Vector3

M3D.convertColor = (color)->
  if typeof color == "string"
    try
      s = color.split("(")[1].split(")")[0]
      s = s.split(",")
      if s.length == 3
        return new BABYLON.Color3(s[0]/255,s[1]/255,s[2]/255)
    catch err
  return new BABYLON.Color3 1,1,1

M3D.Scene = class extends BABYLON.Scene
  constructor:()->
    super()

  add:(object)->
    if object.mesh?
      @addMesh object.mesh
    else if object.light?
      @addLight object.light

  setFog:(color="rgb(255,255,255)",density=.01)->
    @fogMode = BABYLON.Scene.FOGMODE_EXP
    @fogColor = M3D.convertColor color
    @fogDensity = density

  setBackground:(color)->
    @clearColor = M3D.convertColor color

M3D.Camera = class extends BABYLON.FreeCamera
  constructor:()->
    super("camera", new BABYLON.Vector3(0,0,20))

M3D.Mesh = class
  constructor:(@mesh = new BABYLON.Mesh("mesh"))->
    @position = @mesh.position
    @rotation = @mesh.rotation
    @scale = @mesh.scaling
    @mesh.receiveShadows = true

  setScale:(x,y,z)->

  setColor:(r,mode="diffuse")->
    if typeof r == "string"
      match = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/.exec(r.replace(/ /g,""))
      if match? and match.length>=4
        c = [match[1]|0,match[2]|0,match[3]|0]
        if not @mesh.material?
          @mesh.material = new BABYLON.StandardMaterial
        if mode == "specular"
          @mesh.material.specularColor.set(c[0]/255,c[1]/255,c[2]/255)
        else
          @mesh.material.diffuseColor.set(c[0]/255,c[1]/255,c[2]/255)

  setTexture:(name,channel="diffuse",mode="default")->
    if M3D.runtime.sprites[name]?
      if not @mesh.material?
        @mesh.material = new BABYLON.StandardMaterial
      canvas = M3D.runtime.sprites[name].frames[0].canvas
      tex = new BABYLON.DynamicTexture "",{width:canvas.width,height:canvas.height}
      tex.getContext().drawImage(canvas,0,0,canvas.width,canvas.height)
      tex.updateSamplingMode BABYLON.Texture.NEAREST_NEAREST
      tex.update()
      @mesh.material.diffuseTexture = tex

    if not M3D.spriteUpdated?
      M3D.sprite_callbacks = {}
      M3D.spriteUpdated = (sprite)->
        cb = M3D.sprite_callbacks[sprite]
        if cb?
          for c in cb
            c()

      M3D.runtime.updateSprite2 = M3D.runtime.updateSprite
      M3D.runtime.updateSprite = (name,version,data,properties)->
        @updateSprite2(name,version,data,properties)
        M3D.spriteUpdated(name)

    cb = M3D.sprite_callbacks[name]
    if not cb?
      cb = []
      M3D.sprite_callbacks[name] = cb
    if not @["callback_added_"+name]
      @["callback_added_"+name] = true
      cb.push ()=>
        @setTexture name,channel,mode

    if @ instanceof M3D.Box and mode == "6faces"
      uvs = @mesh.getVerticesData(BABYLON.VertexBuffer.UVKind)
      columns = 3
      rows = 2
      w = 1/3
      h = 1/2
      for i in [0..5] by 1
        pi = if i==1 then 4 else if i==4 then 1 else i
        x = (pi%3)*w
        y = Math.floor(pi/3)*h
        if i%2 == 0
          uvs[i*8+2] = x+w
          uvs[i*8+3] = y+h
          uvs[i*8+4] = x
          uvs[i*8+5] = y+h
          uvs[i*8+6] = x
          uvs[i*8+7] = y
          uvs[i*8+0] = x+w
          uvs[i*8+1] = y
        else
          uvs[i*8+4] = x+w
          uvs[i*8+5] = y+h
          uvs[i*8+6] = x
          uvs[i*8+7] = y+h
          uvs[i*8+0] = x
          uvs[i*8+1] = y
          uvs[i*8+2] = x+w
          uvs[i*8+3] = y


      @mesh.updateVerticesData(BABYLON.VertexBuffer.UVKind, uvs)

M3D.Plane = class extends M3D.Mesh
  constructor:(scale,options)->
    @mesh = BABYLON.MeshBuilder.CreatePlane("plane",{ width: 1, height: 1})
    super(@mesh)

M3D.Sphere = class extends M3D.Mesh
  constructor:()->
    @mesh = BABYLON.MeshBuilder.CreateSphere("sphere",{diameter: 1})
    super(@mesh)

M3D.Box = class extends M3D.Mesh
  constructor:(scale,options)->
    @mesh = BABYLON.MeshBuilder.CreateBox("box",{size: 1,updatable: true})
    super(@mesh)

M3D.Light = class
  setIntensity:(intensity)->
    @light.intensity = intensity

  setColor:(r,g,b)->
    if not g? or not b? and typeof r == "string"
      match = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/.exec(r.replace(/ /g,""))
      if match? and match.length>=4
        c = [match[1]|0,match[2]|0,match[3]|0]
        @light.diffuse.set(c[0]/255,c[1]/255,c[2]/255)
        @light.specular.set(c[0]/255,c[1]/255,c[2]/255)

M3D.PointLight = class extends M3D.Light

M3D.DirectionalLight = class extends M3D.Light
  constructor:(@direction = new M3D.Vector3(0,1,0))->
    @light = new BABYLON.DirectionalLight("DirectionalLight", @direction)

M3D.HemisphericLight = class extends M3D.Light
  constructor:(@direction = new M3D.Vector3(0,1,0))->
    @light = new BABYLON.HemisphericLight("HemisphericLight", @direction)

M3D.ShadowCaster = class
  constructor:(@light)->
    @shadowGenerator = new BABYLON.ShadowGenerator(1024, @light.light)

  add:(object)->
    if object.mesh?
      @shadowGenerator.getShadowMap().renderList.push(object.mesh)
      @shadowGenerator.usePoissonSampling = true
