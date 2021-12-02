# Pixi.js
## Accelerated 2D rendering

Pixi.js is an open source JavaScript API for accelerated 2D rendering, taking benefit from the GPU through WebGL.

Website: https://pixijs.com/

Github: https://github.com/pixijs/pixijs

## Basics

### Enable Pixi.js

After creating your project, open the settings tab, click "Show advanced settings" and choose Pixi.js as "Graphics library".

### Creating a stage

The scene or "stage" is a normal Pixi Container:

```
stage = new PIXI.Container()
```

### Creating a sprite

```
my_sprite = PIXI.Sprite.from("mysprite")
stage.add(my_sprite)
```

### Updating

You can easily change the position, scale or rotation of your sprite:

```
  my_sprite.x += 1
  my_sprite.scale.y = 2
  my_sprite.rotation = PI/4
```

### Rendering

To render your scene, in your implementation of `draw()`, simply call `screen.render`, passing the stage to render as argument:

```
draw = function()
  screen.render(stage)
end
```

## Documentation

### Official documentation

https://pixijs.download/dev/docs/index.html

### Examples

https://microstudio.dev/i/gilles/pixitest/
