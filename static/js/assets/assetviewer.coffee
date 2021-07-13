class @AssetViewer
  constructor:(@manager)->

  init:()->
    return if @initialized or not window.THREE?

    @initialized = true

    @renderer = new THREE.WebGLRenderer
      antialias: true

    @renderer.setSize 1000,1000
    document.getElementById("asset-viewer").appendChild @renderer.domElement

    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(45,1,1,1000)
    @camera.position.z = 10

    @light = new THREE.DirectionalLight(0xFFFFFF,1)
    @light.position.set(.5,1,1)
    @scene.add @light

    @ambient = new THREE.AmbientLight(0x808080)
    @scene.add @ambient

    createFace = (c1,c2)->
      canvas = document.createElement "canvas"
      canvas.width = canvas.height = 256
      c = canvas.getContext "2d"
      if c2?
        c.fillStyle = c1
        c.fillRect 0,0,canvas.width,canvas.height/2
        c.fillStyle = c2
        c.fillRect 0,canvas.height/2,canvas.width,canvas.height/2
      else
        c.fillStyle = c1
        c.fillRect 0,0,canvas.width,canvas.height
      canvas

    @scene.environment = new THREE.CubeTexture [
      createFace("#ACE","#A86")
      createFace("#ACE","#A86")
      createFace("#BDF")
      createFace("#A86")
      createFace("#ACE","#A86")
      createFace("#ACE","#A86")
    ]

    @scene.environment.needsUpdate = true

    @scene.background = new THREE.Color(0x202020)
    requestAnimationFrame ()=>
      @update()

    window.addEventListener "resize",()=>@resize()
    @resize()

    @renderer.domElement.addEventListener "mousedown",(event)=>@mouseDown(event)
    document.addEventListener "mousemove",(event)=>@mouseMove(event)
    document.addEventListener "mouseup",(event)=>@mouseUp(event)

    @renderer.domElement.addEventListener("mousewheel", ((e)=>@mouseWheel(e)), false)
    @renderer.domElement.addEventListener("DOMMouseScroll", ((e)=>@mouseWheel(e)), false)

  view:(url)->
    @init()

    if window.THREE? and THREE.GLTFLoader?
      loader = new THREE.GLTFLoader
      loader.load url,(glb)=>
        @clear()

        if glb.animations? and glb.animations[0]?
          @mixer = new THREE.AnimationMixer( glb.scene )
          action = @mixer.clipAction( glb.animations[ 0 ] )
          action.play()

        @model = glb.scene
        @scene.add @model
        b = new THREE.Box3().setFromObject(@model)
        max = Math.max(Math.abs(b.max.x),Math.abs(b.max.y),Math.abs(b.max.z),Math.abs(b.min.x),Math.abs(b.min.y),Math.abs(b.min.z))
        @model.scale.set 3/max,3/max,3/max


  clear:()->
    if @model?
      @scene.remove @model
      @model.traverse (o)->
        if o.geometry?
          o.geometry.dispose()

  update:()->
    requestAnimationFrame ()=>
      @update()

    if @mixer?
      @mixer.update(1/60)
    @renderer.render @scene,@camera

    if not @thumb?
      @buffer = document.createElement "canvas"
      @buffer.width = 256
      @buffer.height = 256
      @thumb = document.createElement "canvas"
      @thumb.width = 128
      @thumb.height = 128

    c1 = @buffer.getContext "2d"
    r = Math.max(256/@renderer.domElement.width,256/@renderer.domElement.height)
    w = r*@renderer.domElement.width
    h = r*@renderer.domElement.height
    c1.drawImage @renderer.domElement,128-w/2,128-h/2,w,h

    c2 = @thumb.getContext "2d"
    c2.drawImage @buffer,0,0,128,128

  getThumbnail:()->
    return @thumb.toDataURL().split(",")[1]

  resize:()->
    b = document.getElementById("asset-viewer").getBoundingClientRect()
    return if b.width<=0 or b.height<=0 or not @renderer?

    @renderer.setSize b.width,b.height
    @camera.aspect = b.width/b.height
    @camera.updateProjectionMatrix()

  mouseDown:(event)->
    @last_x = event.clientX
    @last_y = event.clientY
    @mousedown = true

  mouseMove:(event)->
    if @mousedown and @model?
      x = event.clientX
      y = event.clientY
      @model.rotation.y += (x-@last_x)*.01
      @model.rotation.x += (y-@last_y)*.01
      @last_x = x
      @last_y = y

  mouseUp:(event)->
    @mousedown = false

  mouseWheel:(e)->
    e.preventDefault()
    @next_wheel_action = Date.now() if not @next_wheel_action?

    return if Date.now()<@next_wheel_action
    @next_wheel_action = Date.now()+50

    return if not @model?

    if e.wheelDelta < 0 or e.detail > 0
      @model.scale.x /= 1.1
      @model.scale.y /= 1.1
      @model.scale.z /= 1.1
    else
      @model.scale.x *= 1.1
      @model.scale.y *= 1.1
      @model.scale.z *= 1.1
