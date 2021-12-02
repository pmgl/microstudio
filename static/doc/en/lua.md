# Lua

## Setting up

You can choose to use the Lua programming language for any of your projects. Open your project settings tab, click "Show advanced options" and select Lua as Programming Language.

Your Lua microStudio project can be exported to any target (HTML5, Windows, Mac, Linux, Android...). You can also use any of the rendering APIs for 2D or 3D, as well as any of the proposed optional libs.

## Tips

### Calling object methods

Be careful when calling object functions (methods) in Lua, you have to use `:` instead of `.` as in:

```
screen:clear()
screen:drawSprite("icon",x,y,50)
```

### Checking user inputs

User inputs can be scanned in microStudio by checking fields in `keyboard`, `touch`, `mouse` or `gamepad` interfaces. For example, to check if the key `A` is pressed, you can check `keyboard.A`. This field can actually have 3 different statuses:
* if you haven't pressed `A` yet in the current session, `keyboard.A` is *undefined*
* `keyboard.A` is equal to `1` (`true` in microScript) if you are currently pressing it
* `keyboard.A` is equal to `0` (`false` in microScript) if have pressed it before and are not currently pressing it

To check for such fields in Lua, it is recommended to check equality with `1`:

```
  if keyboard.A == 1 then
    -- do something when A is pressed
  end
```

### Instanciating classes

Especially when using alternative graphics libs or optional libs, you may have to
instantiate JavaScript objects as if you were using the `new` operator in JavaScript.
To do this, simply call `new(class, arguments)` on the class you want to instantiate:

```
  light = new( BABYLON.HemisphericLight, "light", BABYLON.Vector3.new(0, 1, 0), scene)
```

## Simple Example

```
init = function()
  x = 0
  y = 0
end

update = function()
  if keyboard.LEFT == 1 then x = x-1 end
  if keyboard.RIGHT == 1 then x = x+1 end
  if keyboard.UP == 1 then y = y+1 end
  if keyboard.DOWN == 1 then y = y-1 end
end

draw = function()
  screen:clear()
  screen:drawSprite("icon",x,y,50)
end
```
