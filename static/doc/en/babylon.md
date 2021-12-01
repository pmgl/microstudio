# Babylon.js
## 3D rendering API

## Full Documentation

https://doc.babylonjs.com/

## Getting started

### Scene

### Adding objects

### Adding lights

### Setting the camera

### Rendering




## Full Example

```
init = function()
  scene = new BABYLON.Scene()
  camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 12.5, -170), scene)
  light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
  boxes = []

  for i=-5 to 5
    local material = new BABYLON.StandardMaterial("stdmaterial", scene)
    material.diffuseColor.set(random.next(),random.next(),random.next())
    for j=-5 to 5
      local b = BABYLON.MeshBuilder.CreateBox("box", object end, scene)
      b.position.set(i*2+random.next()-.5,random.next()*25,j*2)
      b.rx = random.next()/100
      b.ry = random.next()/100
      boxes.push(b)
      b.material = material
    end
  end

  scene.clearColor.set(.1,.1,.1)
end

update = function()
  camera.position.z += .2
  camera.rotation.z += .001
end

draw = function()
  screen.render(scene)
end
```

## Example projects

https://microstudio.dev/i/gilles/babylontest/
