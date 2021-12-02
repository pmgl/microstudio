# micro 2D
## Accelerated 2D rendering

micro 2D is a simplified API for accelerated 2D rendering. It is based on Pixi.js. It is currently very minimal but it will grow in the future. If you are looking for a stable, feature-complete 2D API, look into Pixi.js instead.

### Scene
Setting up the scene:

```
scene = new M2D.Scene()
```

### Adding sprites

```
sprite = new M2D.Sprite("icon",32,32)
scene.add(sprite)
```

### Setting up the camera

```
camera = new M2D.Camera()
```

### Rendering

In your function `draw()`, simply call `screen.render`, passing your scene and camera as arguments:

```
screen.render(scene,camera)
```

## Examples

https://microstudio.dev/i/gilles/m2dtest/
