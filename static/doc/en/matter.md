# Matter.js
## 2D Physics Engine




### Full Example

```
init = function()
  engine = Matter.Engine.create()
  engine.world.gravity.y = -0.5
  ground = Matter.Bodies.rectangle(0,-90,200,10,object isStatic=true end)
  boxes = []
  for i=1 to 1000
    local box = Matter.Bodies.rectangle(random.next()*100-50,random.next()*40000,20,20)
    box.frictionAir = .02
    boxes.push(box)
    Matter.Composite.add(engine.world,box)
  end
  Matter.Composite.add(engine.world,ground)
end

update = function()
  Matter.Engine.update(engine,1000/60)
end

draw = function()
  screen.clear()
  for box in boxes
    screen.setDrawRotation(box.angle/PI*180)
    screen.drawRect(box.position.x,box.position.y,20,20,"#FF0")
  end
  screen.setDrawRotation(0)
  screen.drawRect(ground.position.x,ground.position.y,200,10,"rgb(255,0,0)")
end
```

### Example projects

https://microstudio.dev/i/gilles/matterjstest/
