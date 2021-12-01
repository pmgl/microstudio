# Pixi.js
## Accelerated 2D rendering API



### Pixi.js reference documentation

https://pixijs.download/dev/docs/index.html

### Full Example

```
init = function()
  stage = new PIXI.Container()
  list = []
  for i=1 to 1000
    local s = PIXI.Sprite.from("icon")
    list.push(s)
    s.x = random.next()*1500
    s.y = random.next()*1000
    s.vx = (random.next()-.5)*10
    s.vy = (random.next()-.5)*10
    s.vr = (random.next()-.5)*0.1
    s.scale.x = 2
    s.scale.y = 2
    stage.addChild(s)
  end
end

update = function()
end

draw = function()
  for i=1 to 1000
    local s = list[list.length-i]
    s.x += s.vx
    s.y += s.vy
    if s.x>=screen.width-16 and s.vx>0 then
      s.vx *= -1
    end
    if s.x<=0 and s.vx<0 then
      s.vx *= -1
    end
    if s.y>=screen.height-16 and s.vy>0 then
      s.vy *= -1
    end
    if s.y<=0 and s.vy<0 then
      s.vy *= -1
    end
    s.rotation += s.vr
  end
  screen.render(stage)
end
```
