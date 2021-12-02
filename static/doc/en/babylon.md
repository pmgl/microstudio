# Babylon.js
## 3D rendering API

Babylon.js is an open-source 3D rendering engine based on WebGL.

Website: https://www.babylonjs.com/

Github: https://github.com/BabylonJS/Babylon.js

## Basics

### Enable Babylon.js

After creating your project, open the settings tab, click "Show advanced settings" and choose Babylon.js as "Graphics library".

### Scene

Creating a new scene:

```
scene = new BABYLON.Scene()
```

### Adding objects

Adding a simple box:

```
box = BABYLON.MeshBuilder.CreateBox("box", object end, scene)
box.position.set(0,20,0)
```

### Adding lights

Adding an hemispherical light:

```
light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
```

### Setting the camera

Setting up the camera:

```
camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -100), scene)
```

### Rendering

In your function `draw()`, simply call `screen.render`, passing your scene as argument:

```
draw = function()
  screen.render(scene)
end
```

## Documentation

### Official documentation

https://doc.babylonjs.com/

### Examples

https://microstudio.dev/i/gilles/babylontest/
