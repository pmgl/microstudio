<!-- 1. Shapes (Rect, Round, RoundRect) -->
<!-- 2. Colors -->
<!-- 3. Lines, Polygons -->
<!-- 4. Text -->
<!-- 5. Sprites and Maps -->
<!-- 6. Gradients -->
<!-- 7. Rotating, Scaling, Transparency -->


# Tutorial

:project Tutorial: Drawing

## Transparency

:position 50,50,40,40

### Transparency

You can set your drawing operations to have some transparency by using
function ```screen.setAlpha```. Using this function, you will actually define the opacity
of your subsequent drawing calls. Opacity ranges from 0 to 1, 0 being fully transparent and
1 being fully opaque. You can thus draw semi-transparent shapes using:

```
screen.setAlpha(0.5)
screen.fillRect(0,0,50,50,"rgb(255,255,255)")
screen.fillRect(20,20,50,50,"rgb(255,255,255)")
```

## Transparency

:position 50,50,40,40

### Transparency

After setting some transparency level through ```screen.setAlpha```, remember to reset
opacity to its default value, or it will continue to impact subsequent drawing calls:

```
screen.setAlpha(1) // resetting opacity to 1
```

## Rotation

:position 50,50,40,40

### Rotation

You can set an amount of rotation before drawing shapes, sprites or maps, using ```screen.setDrawRotation(angle)```.
The angle argument is expressed in degrees. The origin of the rotation for each one of the subsequent draw calls will
be the center of your rectangle, sprite, map etc.

```
screen.setDrawRotation(45)
screen.fillRect(0,0,100,100,"rgb(255,255,255)")
```

Don't forget to reset the rotation to 0 after that:

```
screen.setDrawRotation(0)
```

## Scaling

:position 50,50,40,40

### Scaling

You can set an amount of scaling, especially before drawing sprites or maps, using ```screen.setDrawScale(xscale,yscale)```.
The two arguments are the scale factor for the x axis and the scale factor for the y axis. This can be used for example to
flip a sprite to make it look to the left instead of to the right. Example:

```
screen.setDrawScale(-1,1)  // x axis will be inverted
screen.drawSprite("sprite",0,0,100)
screen.setDrawScale(1,1) // reset to the default value 1,1
```

## Course finished

### You have finished this course!

It is time for you to play with all the drawing functions. Give yourself some goal of a landscape you would like to draw
(with shapes, sprites, or both). Try to code it. Come back to one of these tutorials when you need to check some of the features
exposed here. Also the documentation is always there to help!
