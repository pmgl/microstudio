<!-- 1. Shapes (Rect, Round, RoundRect) -->
<!-- 2. Colors -->
<!-- 3. Lines, Polygons -->
<!-- 4. Text -->
<!-- 5. Sprites and Maps -->
<!-- 6. Gradients -->
<!-- 7. Rotating, Scaling, Transparency -->


# Tutorial

:project Tutorial: Drawing

## Drawing a line

:position 50,50,40,40

### Drawing a line

You can draw a line by giving the x,y coordinates of the two end points to
function ```screen.drawLine```:

```
screen.drawLine(0,0,100,50,"rgb(255,255,255)")
```

The example above draws a line joining point (0,0) and point (100,50). As for
any drawing call, the last parameter is the drawing color and can be omitted.

## Drawing a polygon

### Drawing a polygon

You can draw a polygon by calling ```screen.drawPolygon```, passing screen coordinates
of your points as parameters:

```
screen.drawPolygon(-50,50,50,50,0,0,-50,50,"rgb(0,255,255)")
```

You can add any number of points. Note that if you do not close the polygon by
repeating the first point as the last point, the result will look more like a "polyline".


## Drawing a polygon

### Drawing a polygon

You can also call ```screen.drawPolygon``` with a list (of coordinates) as
the first argument (and an optional color for the second argument):

```
points = [-50,50,50,50,0,0,-50,50]
screen.drawPolygon(points,"rgb(0,255,255)")
```

This can be useful for example if you want to animate your polygon programmatically.


## Setting line width

### Setting line width

You can set the line width or (thickness) by calling ```screen.setLineWidth```. Make
sure to call it before your calls to drawLine or drawPolygon:

```
screen.setLineWidth(4)
screen.drawPolygon(-50,50,50,50,0,0,-50,50,"rgb(0,255,255)")
```

The default line width is 1. Use values between 0.0 and 1.0 for very thin lines or
values above 5 for very thick lines.


## Filled polygon

### Filled polygon

You can call ```screen.fillPolygon``` to draw a filled polygon on screen. Make
sure to "close" your polygon by repeating the first point as the last point, or you
could get unexpected results:

```
points = [-50,50,50,50,0,0,-50,50]
screen.fillPolygon(points,"rgb(0,255,255)")

screen.fillPolygon(30,-40,70,20,-12,-20,"rgba(255,128,0)")
```

## Next

### What's next?

Next tutorial in this course is about drawing text.
