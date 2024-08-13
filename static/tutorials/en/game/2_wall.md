# Tutorial

:project Tutorial: Create a Game

## Wall

:position 50,50,40,40

:highlight #menuitem-sprites

### Wall

Our hero will be moving on top of a wall, or a platform, or a road... Let's call it a wall. We will
create this wall by having a wall tile as a sprite and by filling a whole area with this tile. Create
a new sprite and make sure to rename it "wall".

It would be nice if this tile sprite looks good once actually tiled.
To help you with that, we recommend activating the option "Tile" on the bottom right of the sprite editor.
Time to draw now!

## Displaying the wall

:highlight #menuitem-code

### Displaying the wall

Let's go back to our code. Make sure the program is still running (press the Run button again whenever needed).
We will add the following lines in the body of the function ```draw```:

```
  for i=-6 to 6 by 1
    screen.drawSprite("wall",i*40,-80,40)
  end
```

The code above is a ```for``` loop. It states that the function ```screen.drawSprite``` will be called a number of times,
each time with variable ```i``` holding a different value. ```i``` will start at -6, then -5, -4 ... , 3, 4, 5, 6. Thus the
x coordinate for drawing the sprite will take the values -240, then -200, -160 ... to 240. You can see the results
in the execution window.

## Displaying the wall

### Displaying the wall

The full code now looks as below. Our next mission is to animate the wall to create the illusion that the hero is running
on it.

```
init = function()
end

update = function()
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgba(57,0,57)")

  for i=-6 to 6 by 1
    screen.drawSprite("wall",i*40,-80,40)
  end

  screen.drawSprite("hero",-80,-50,20)
end
```

## Animating the wall

### Animating the wall

We will introduce a variable ```position```. We will use it to move the wall tiles to the left by some amount. Let's
rewrite the line that draws the wall tiles like this:

```
    screen.drawSprite("wall",i*40-position,-80,40)
```

The wall isn't moving yet, because we are not changing the value of position. Let's inject this line in the body of
function ```update```:

```
update = function()
  position = position+2
end
```

Doing this, we ensure that 60 times per second (call rate of the update function), the value of position will be
raised by 2. Our wall quickly moved and disappeared completely to the left. Whoops!

## Animating the wall

### Animating the wall

Our wall tiles are spaced by 40 units. Instead of moving them to the left by the value of *position*, we will move
them to the left by ```position % 40```. ```position % 40``` is the remainder of the division of *position* by 40. When incrementing
position continuously, it will thus take the values 0,1,2,3..., 39 and then back to 0,1,2,3..., 39 and so on. Exactly what we need. Not convinced? Let's try it:

```
  for i=-6 to 6 by 1
    screen.drawSprite("wall",i*40-position%40,-80,40)
  end
```

See? Still moving to the left, without disappearing. Illusion is perfect!

## Next

### Next

In the next short tutorial, we will make our hero jump. For now, here is a copy of our full code for reference:

```
init = function()
end

update = function()
  position = position+2
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")

  for i=-6 to 6 by 1
    screen.drawSprite("wall",i*40-position%40,-80,40)
  end

  screen.drawSprite("hero",-80,-50,20)
end
```
