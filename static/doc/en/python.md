# Python

## Setting up

You can choose to use the Python programming language for any of your projects. Open your project settings tab, click "Show advanced options" and select Python as Programming Language.

Your Python microStudio project can be exported to any target (HTML5, Windows, Mac, Linux, Android...). You can also use any of the rendering APIs for 2D or 3D, as well as any of the proposed optional libs.

## Tips



### Checking user inputs

User inputs can be scanned in microStudio by checking fields in `keyboard`, `touch`, `mouse` or `gamepad` interfaces. For example, to check if the key `A` is pressed, you can check `keyboard.A`. This field can actually have 3 different statuses:
* if you haven't pressed `A` yet in the current session, `keyboard.A` is *undefined*
* `keyboard.A` is equal to `1` (`true` in microScript) if you are currently pressing it
* `keyboard.A` is equal to `0` (`false` in microScript) if have pressed it before and are not currently pressing it

To check for such fields in Python without errors, you need to check whether the field is actually defined before you can check its value:

```
  if hasattr(keyboard,"A"):
    if keyboard.A:
      doSomething()
```


```
def checkInput(obj,val):
  if hasattr(obj,val):
    return obj[val] != 0
  return 0
```

### Instanciating classes

```
  light = BABYLON.HemisphericLight.new("light", BABYLON.Vector3.new(0, 1, 0), scene)
```

## Example

## Limitations
