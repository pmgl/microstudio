# Cannon
## 3D Physics Engine

Cannon.js is an open source 3D physics engine written in JavaScript:

Website: https://schteppe.github.io/cannon.js/

Github repository: https://github.com/schteppe/cannon.js

You can enable and use Cannon.js in your microStudio project, whichever language
you picked: microScript, JavaScript, Python, Lua.

## Basics

### Enable Cannon.js

After creating your project, open the settings tab and click "Show advanced options".
Check "Cannon.js" to enable the library for your project. The Cannon.js API will be exposed
to your code as a global variable `CANNON`.

### Creating a world

First step is to create a world:
```
world = new CANNON.World()
```

You can also set the gravity vector:

```
world.gravity.set(0, 0, -10)
```

### Adding shapes

The API sometimes requires you to pass JavaScript objects as arguments, for example
`{ mass: 0 , shape: new CANNON.Plane() }`. From microScript, you will pass the equivalent microScript object: `object mass = 0 shape = new CANNON.Plane() end`.
This is how you can add a fixed ground object to your world:

```
ground = new CANNON.Body(object
  mass = 0  // when the mass is set to zero, the object will be static
  shape = new CANNON.Plane()
end)

world.addBody(ground)
```

You can then add a moving sphere as follows:

```
sphere = new CANNON.Body(object
  mass = 5
  position = new CANNON.Vec3(0,0,200)
  shape = new CANNON.Sphere(5)
end)
world.addBody(sphere)
```

### Running the simulation

In the body of your function `update()`, simply call `world.step`:

```
update = function()
  world.step(1/60,1/60,10)
end
```

### Drawing

In order to visualize your simulation, you will have to create a 3D world using
BABYLON.js or micro 3D. You will create visual objects for each one of your physical objects,
add them to the 3D scene and update their positions.


## Documentation

### Official Documentation

Reference: https://schteppe.github.io/cannon.js/docs/

Demos: https://schteppe.github.io/cannon.js/

### Example projects

https://microstudio.dev/i/gilles/cannondemo/
