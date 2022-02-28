<!-- 1. Shapes (Rect, Round, RoundRect) -->
<!-- 2. Colors -->
<!-- 3. Lines, Polygons -->
<!-- 4. Text -->
<!-- 5. Sprites and Maps -->
<!-- 6. Gradients -->
<!-- 7. Rotating, Scaling, Transparency -->


# Tutorial

:project Tutorial: Drawing

## Color gradients

:position 50,50,40,40

### Color gradients

Linear color gradients can be created this way:

```
screen.setLinearGradient(0,0,100,0,"rgb(255,0,0)","rgb(0,255,255)")
screen.fillRect(0,0,500,500)
```

The first two arguments define the x1,y1 coordinates of a point p1. The two next arguments define the x2,y2 coordinates
of another point p2. The next parameters are two colors, defining the color the gradient will have at point p1 and the
color the gradient will turn into at point p2.

## Color gradients

:position 50,50,40,40

### Color gradients

Once you have set a color gradient, it will be used at the drawing color for all subsequent calls to drawing functions,
*provided such functions calls are omitting their color argument*. Your gradient will be discarded as soon as you will set the color for one of your drawing
calls (like ```screen.fillRect(0,0,50,50,"rgb(0,0,0)")```) or use ```screen.setColor```.

## Radial gradients

:position 50,50,40,40

### Radial gradients

Radial color gradients can be created this way:

```
screen.setRadialGradient(0,0,100,"rgb(255,0,0)","rgb(0,255,255)")
screen.fillRect(0,0,500,500)
```

The first two arguments define the x,y coordinates of the center point of your radial gradient. The next argument is the radius of your radial gradient.
The next parameters are two colors, defining the color the gradient will have at the center and the
color the gradient will turn into at the boundary of the circle you have thus defined.

## Play with gradients

### Play with gradients

Spend some time defining gradients and drawing shapes, lines or text with them. If things aren't working as they should, make sure
to check your arguments passed to setLinearGradient (expects two points and two colors) and setRadialGradient (expects one point, a radius and two colors).

You can then move on to the last tutorial in this series, about transparency, rotation and scaling.
