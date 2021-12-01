# micro 3D
## 3D rendering API


# micro 2D
## GPU accelerated 2D rendering


### Scene
Setting up the scene

### Adding objects


### Adding lights



### Setting the camera


### Rendering


### Full Example



```
init = function()
  scene = new M2D.Scene()
  camera = new M2D.Camera()
  sprite = new M2D.Sprite("icon",32,32)
  scene.add(sprite)
end

update = function()
  sprite.x = sin(system.time()/1000)*50
  sprite.y = sin(system.time()/1521)*50
end

draw = function()
  screen.render(scene,camera)
end
```
