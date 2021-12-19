# micro 3D
## 3D rendering API

micro 3D is a simplified 3D API, created on top of Babylon.js. It is currently very minimal but it will grow in the future. If you are looking for a stable, feature-complete 3D API, look into Babylon.js instead.

## Basics

### Enable micro 3D

After creating your project, open the settings tab, click "Show advanced settings" and choose **micro 3D** as "Graphics library".

### Scene

Creating a new scene:

```
scene = new M3D.Scene()
scene.setBackground("rgb(9,0,28)")
```

### Adding objects

Adding a simple box:

```
box = new M3D.Box()
box.position.set(0,0,5)
box.setColor("rgb(255,192,0)")
scene.add(box)
```

### Adding lights

Adding a directional light:

```
light = new M3D.DirectionalLight(new M3D.Vector3(-1,-.5,1))
light.setColor("rgb(255,217,198)")
```

### Setting the camera

Setting up the camera:

```
camera = new M3D.Camera()
camera.position.set(0,0,1)
```

### Update

You can access objects properties in the `update()` function to make them spin around in space

```
update = function()
  box.rotation.x+=0.01
  box.rotation.y+=0.02
end
```

### Rendering

In your function `draw()`, simply call `screen.render`, passing your scene and camera as arguments:

```
draw = function()
  screen.render(scene,camera)
end
```

## Examples

https://microstudio.dev/i/gilles/m3dtest/
