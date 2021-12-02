# JavaScript

## Setting up

You can choose to use the JavaScript programming language for any of your projects. Open your project settings tab, click "Show advanced options" and select JavaScript as Programming Language.

Your JavaScript microStudio project can be exported to any target (HTML5, Windows, Mac, Linux, Android...). You can also use any of the rendering APIs for 2D or 3D, as well as any of the proposed optional libs.

## Simple Example

```
init = function() {
  x = 0 ;
  y = 0 ;
}

update = function() {
  if (keyboard.LEFT) { x = x-1 ; }
  if (keyboard.RIGHT) { x = x+1 ; }
  if (keyboard.UP) { y = y+1 ; }
  if (keyboard.DOWN) { y = y-1 ; }
}

draw = function() {
  screen.clear()
  screen.drawSprite("icon",x,y,50)
}
```
