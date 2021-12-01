# Cannon
## 3D Physics Engine





```
init = function()
  world = new CANNON.World()
  world.gravity.set(0, 0, -100)

  spheres = []

  tick = 0

  ground = new CANNON.Body(object
    mass = 0
    shape = new CANNON.Plane()
  end)

  world.addBody(ground)

  scene = new BABYLON.Scene()

  scene.fogMode = BABYLON.Scene.FOGMODE_EXP
  scene.fogColor = new BABYLON.Color3(.2,.3,.4)
  scene.fogDensity = .0015
  scene.clearColor = new BABYLON.Color3(0,0,0)

local box = BABYLON.MeshBuilder.CreateBox("box", object size = 2000 end, scene)
    local material = new BABYLON.StandardMaterial("stdmaterial", scene)
    material.diffuseColor.set(.6,.8,1)
    material.backFaceCulling = false
    box.material = material


  light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-500, -100, -200), scene)
  light.intensity = .75
  l2 = new BABYLON.HemisphericLight("Hemispheric", new BABYLON.Vector3(0, 0,1), scene)
  l2.intensity = .25
  shadowGenerator = new BABYLON.ShadowGenerator(2048, light)
  shadowGenerator.usePercentageCloserFiltering = true
  light.shadowFrustumSize = 300
  light.shadowMinZ = 50
  light.shadowMaxZ = 1000
  shadowGenerator.useBlurCloseExponentialShadowMap = true

  light.diffuse = new BABYLON.Color3(1,.8,.5)
  light.specular = new BABYLON.Color3(1,.8,.5)

  l2.diffuse = new BABYLON.Color3(.6,.8,1)
  l2.specular = new BABYLON.Color3(0,0,0)
  l2.groundColor = new BABYLON.Color3(0,0,0)
  camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 200,50), scene)
  camera.rotation.x = PI/2
  //light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
  balls = []

  plane = BABYLON.MeshBuilder.CreatePlane("plane",object width = 10000 height = 10000 end)
  plane.rotation.x = PI
  plane.receiveShadows = true

  pipeline = new BABYLON.DefaultRenderingPipeline(
    "defaultPipeline", // The name of the pipeline
    true, // Do you want the pipeline to use HDR texture?
    scene, // The scene instance
    [camera] // The list of cameras to be attached to
  )
  pipeline.bloomEnabled = true
  //pipeline.fxaaEnabled = true
  pipeline.samples = 4

  pipeline.bloomThreshold = 0.5
pipeline.bloomWeight = 1
pipeline.bloomKernel = 256
pipeline.bloomScale = 0.5

pipeline.depthOfFieldEnabled = true // 0 by default
pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Medium
            pipeline.depthOfField.fStop = 1.4 // 1.4 by default
            pipeline.depthOfField.focalLength = 5000 // 50 by default, mm
            pipeline.depthOfField.focusDistance = 200000 // 2000 by default, mm
            pipeline.depthOfField.lensSize = 50 // 50 by default
end

update = function()
  tick += 1
  if tick%30 == 0 and balls.length<100 then
    local sphere = new CANNON.Body(object
      mass = 5
      position = new CANNON.Vec3(random.next()*10-5, random.next()*10-5,200+random.next()*100)
      shape = new CANNON.Sphere(5)
    end)
    world.addBody(sphere)
    spheres.push(sphere)

    local ball = BABYLON.MeshBuilder.CreateSphere("box", object diameter = 10 end, scene)
    local material = new BABYLON.PBRMetallicRoughnessMaterial("stdmaterial", scene)
    material.baseColor = new BABYLON.Color3(random.next(),random.next(),random.next())
    material.roughness = .3
    material.metallic = .1

    ball.material = material
    balls.push(ball)
    ball.sphere = sphere
    shadowGenerator.getShadowMap().renderList.push(ball)
    ball.receiveShadows = true
  end

  world.step(1/60,1/60,10)
  for ball in balls
    ball.position.x = ball.sphere.position.x
    ball.position.y = ball.sphere.position.y
    ball.position.z = ball.sphere.position.z
  end

  pipeline.bloomThreshold = 0.2
pipeline.bloomWeight = 5
pipeline.bloomKernel = 32
pipeline.bloomScale = 0.5

end

draw = function()
  screen.render(scene)
end

```
