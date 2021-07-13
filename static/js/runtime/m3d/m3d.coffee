class @M3D
  constructor:(@runtime)->

  createScene:()-> new M3DScene @
  createCamera:()-> new M3DCamera @
  createBox:()-> new M3DBox @
  createSphere:()-> new M3DSphere @
  createPlane:(width,height)-> new M3DPlane @,width,height
  createTexture:(image)-> new M3DTexture @,image
  createCubeTexture:(px,nx,py,ny,pz,nz)-> new M3DCubeTexture @,px,nx,py,ny,pz,nz

  loadImage:()->
  loadModel:(asset)-> new M3DModelLoad @,asset

  createDirectionalLight:()-> new M3DDirectionalLight

class @M3DCamera
  constructor:()->
    @camera = new THREE.PerspectiveCamera(45,1,1,1000)
    @position = @camera.position

  lookAt:(x,y,z)->
    @camera.lookAt(x,y,z)

class @M3DScene
  constructor:()->
    @scene = new THREE.Scene()

  setFog:(color,density)->
    if not @scene.fog?
      @scene.fog = new THREE.FogExp2(M3DConvertColor(color),density)
    else
      @scene.fog.color = M3DConvertColor(color) if color?
      @scene.fog.density = density if density?

  setAmbientLight:(color)->
    color = M3DConvertColor(color)
    if not @ambient_light?
      @ambient_light = new THREE.AmbientLight(color)
      @scene.add @ambient_light
    else
      @ambient_light.color = color

  add:(object)->
    if object? and object.object?
      @scene.add object.object
    return

  setBackground:(rgb)->
    @scene.background = M3DConvertColor rgb
    return

  setEnvironment:(cube_texture)->
    @scene.environment = cube_texture.texture

class @M3DDirectionalLight
  constructor:(color=0xFFFFFF,intensity=1)->
    @object = new THREE.DirectionalLight color,intensity
    @position = @object.position

  setShadowFrame:(left,right,bottom,top)->
    @object.castShadow = true
    @object.shadow.camera.left = left
    @object.shadow.camera.right = right
    @object.shadow.camera.bottom = bottom
    @object.shadow.camera.top = top
    #@object.shadow.mapSize.width = 2048
    #@object.shadow.mapSize.height = 2048

class @M3DObject
  constructor:(@m3d)->

  setObject:(@object)->
    @rotation = @object.rotation
    @position = @object.position
    @scale = @object.scale

  setColor:(rgb)->
    @material.color = M3DConvertColor rgb
    return

  setRotationOrder:(order)->
    if @object?
      @object.rotation.order = order

  setCastShadow:(cast)->
    @object.castShadow = cast != 0

  setReceiveShadow:(receive)->
    @object.receiveShadow = receive != 0

  clone:()->
    o = new M3DObject @m3d
    o.setObject SkeletonUtils.clone(@object) #@object.clone()
    o.animations = @animations
    o

  setMap:(@texture)->
    @object.material.map = @texture.texture
    @object.material.needsUpdate = true

  startAnimation:(num)->
    return if not @animations?
    if not @mixer?
      @mixer = new THREE.AnimationMixer( @object )
    return if not @animations[num]?
    action = @mixer.clipAction( @animations[num] )
    action.play()

  updateAnimation:(t)->
    if @mixer?
      @mixer.update(t)

class @M3DBox extends @M3DObject
  constructor:(m3d)->
    super m3d
    @geometry = new THREE.BoxGeometry(1,1,1)
    @material = new THREE.MeshStandardMaterial
      color: 0xFFFFFF

    @setObject new THREE.Mesh @geometry,@material

class @M3DSphere extends @M3DObject
  constructor:(m3d)->
    super m3d
    @geometry = new THREE.SphereGeometry(.5,12,12)
    @material = new THREE.MeshStandardMaterial
      color: 0xFFFFFF

    @setObject new THREE.Mesh @geometry,@material

class @M3DPlane extends @M3DObject
  constructor:(m3d,width=1,height=1)->
    super m3d
    @geometry = new THREE.PlaneGeometry(width,height)
    @material = new THREE.MeshStandardMaterial
      color: 0xFFFFFF

    @setObject new THREE.Mesh @geometry,@material

class M3DModelLoad extends @M3DObject
  constructor:(m3d,asset)->
    super(m3d)
    @ready = false
    url = m3d.runtime.getAssetURL asset
    loader = new THREE.GLTFLoader
    loader.load url,(glb)=>
      @animations = glb.animations
      @object = glb.scene
      @rotation = @object.rotation
      @position = @object.position
      @scale = @object.scale
      @ready = true


class M3DTexture
  constructor:(@m3d,image)->
    image = M3DResolveImage @m3d,image

    @texture = new THREE.Texture image
    @texture.needsUpdate = true

class M3DCubeTexture
  constructor:(@m3d,px,nx,py,ny,pz,nz)->
    px = M3DResolveImage @m3d,px
    nx = M3DResolveImage @m3d,nx
    py = M3DResolveImage @m3d,py
    ny = M3DResolveImage @m3d,ny
    pz = M3DResolveImage @m3d,pz
    nz = M3DResolveImage @m3d,nz

    @texture = new THREE.CubeTexture [px,nx,py,ny,pz,nz]
    @texture.needsUpdate = true

@M3DConvertColor = (rgb)->
  try
    s = rgb.split("(")[1].split(")")[0]
    s = s.split(",")
    if s.length == 3
      return new THREE.Color(s[0]/255,s[1]/255,s[2]/255)
  catch err
    return new THREE.Color 0,0,0

@M3DResolveImage = (m3d,img)->
  if m3d.runtime.sprites[img]?
    m3d.runtime.sprites[img].frames[0].canvas
