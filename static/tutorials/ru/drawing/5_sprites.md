<!-- 1. Shapes (Rect, Round, RoundRect) -->
<!-- 2. Colors -->
<!-- 3. Lines, Polygons -->
<!-- 4. Text -->
<!-- 5. Sprites and Maps -->
<!-- 6. Gradients -->
<!-- 7. Rotating, Scaling, Transparency -->


# Tutorial

:project Tutorial: Drawing

## Drawing Sprites

:position 50,50,40,40

### Drawing Sprites

When you create sprites in the Sprites tab, you can set their name. This name will
be used to reference them when calling ```screen.drawSprite```. Sprites are loaded in the
background when your program start, thus we will draw them from the body of the ```draw```
function.

```
draw = function()
  screen.drawSprite("icon",0,0,40,40)
end
```

The first argument is the name of your sprite. Every project has a sprite named
"icon", which will serve as app icon. You can create more sprites in the Sprites tab
and try to draw them on screen similarly.

The second and third arguments are the x,y coordinates where to draw the sprite.
The sprite will be centered on these coordinates. The next two parameters give the
width and height you want the sprite to be drawn in (height can be omitted).

## Drawing animated sprites

:position 50,50,40,40

### Drawing animated sprites

Animated sprites can be created in the Sprites tab. When editing your sprite, open the
Animation tab at the bottom of the window. You can add frames, draw them, check the animation preview and set
the playback speed.

Once you have created an animated sprite, simply draw it like a normal sprite from the body of
your function ```draw```:

```
draw = function()
  screen.clear()
  screen.drawSprite("my_animated_sprite",0,0,100)
end
```

## Setting animation frame

### Setting animation frame

Your sprite animation will loop continuously, but at some point you might want to reset the animation
to the first frame. You can do this with:

```
draw = function()
  screen.clear()
  sprites["my_animated_sprite"].setFrame(0)
  screen.drawSprite("my_animated_sprite",0,0,100)
end
```

This resets the animation of sprite "my_animated_sprite" to frame 0 (which is the first frame).

## Drawing a specified animation frame

### Drawing a specified animation frame

You can choose to draw a specific animation frame of your sprite. For this you can append "." and the index
of the animation frame, to the name of your sprite. The index of the animation frames range from 0 to (number_of_frames-1).

```
draw = function()
  screen.clear()
  screen.drawSprite("my_animated_sprite.0",0,0,100)
end
```

The code above draws the first animation frame of sprite "my_animated_sprite".

## Drawing maps

### Drawing maps

Maps can be created in the Maps tabs. A map is a grid which cells can be filled with sprite tiles. It allows to
create background images or levels by putting sprites tiles together.
The following code will draw the map "map1", centered on (0,0), with width 320 and height 200:

```
draw = function()
  screen.clear()
  screen.drawMap("map1",0,0,320,200)
end
```

Time to continue with the next tutorial, about creating color gradients!
