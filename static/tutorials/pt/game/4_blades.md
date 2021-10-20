# Tutorial

:project Tutorial: Create a Game

## Blades

:position 50,50,40,40

### Blades

We will now add some obstacles that our hero needs to avoid by jumping. We will call them
blades but you can design them as anything else provided they look dangerous enough!

Open the sprites tab, click "Add a sprite" to create a new sprite, make sure to rename it "blade"
to ensure it works correctly with the rest of this tutorial series. Draw your dangerous blade!

## Initializing blades

### Initializing blades

Now that your "blade" sprite is ready, we will create a set of blades by code, display them,
make them respawn ahead of the hero after they disappeared behind him.

We will initialize two arrays in the body of the ```init``` function. The first array, ```blades``` will
list the position of our 3 blades. The second array, ```passed``` will be used to record when a specific blade
was successfully jumped over by our hero.

```
init = function()
  blades = [200,300,400]
  passed = [0,0,0]
end
```

## Creating blades' "behaviour"

### Creating blades' "behaviour"

As our hero runs on the wall, the blades will seem to move toward him and disappear behind him.
Once disappeared, we will reuse the same blade and make it respawn ahead of the hero at a slightly
randomized location. The code below iterates on our list of blades and does exactly that. It must be
inserted in the body of the ```update``` function.

```
  for i=0 to blades.length-1
    if blades[i]<position-120 then
      blades[i] = position+280+random.next()*200
      passed[i] = 0
    end
  end
```

When respawning a blade ahead of the user, we also reset the value in the ```passed``` list to zero,
you will understand later why.

## Displaying blades

### Displaying blades

We should now display the blades on screen. To do that, add the code below to the body of our function ```draw```.
This code iterates on the blades positions, and draws the "blade" sprite at their location.

```
  for i=0 to blades.length-1
    screen.drawSprite("blade",blades[i]-position-80,-50,20)
  end
```

The x coordinate for drawing the sprite is computed as the difference between the blade's position and the global variable *position*.
Thus when the blade's position equals the hero's position, both will be drawn at the same place.

## Testing collisions with blades

### Testing collisions with blades

We will now check if the hero collides with a blade, or is jumping over it. For each blade, we will check the difference
between the blade's position and the hero's. If the absolute value of the difference is small enough, we can consider the two
to be overlapping. Now if the vertical position of the hero is high enough, the hero is jumping and not actually hurt by the blade.
Here is how this translates to code, to be inserted in the *for loop* in the body of function *update*:

```
    if abs(position-blades[i])<10 then
      if hero_y<10 then
        gameover = 1
      elsif not passed[i] then
        passed[i] = 1
        score += 1
      end
    end
```

In the code above, we set a variable ```gameover``` to 1 when the hero hits a blade. We will use that later.
We also increment a new variable ```score```. We are just counting how many blades are passed by the player and
using it as a score.

Here is the full code of the *for loop* within function *update*:

```
  for i=0 to blades.length-1
    if blades[i]<position-120 then
      blades[i] = position+280+random.next()*200
      passed[i] = 0
    end
    if abs(position-blades[i])<10 then
      if hero_y<10 then
        gameover = 1
      elsif not passed[i] then
        passed[i] = 1
        score += 1
      end
    end
  end
```

## Displaying the score

### Displaying the score

So we are now recording a score, how about actually displaying it? Let's add this to
the body of function *draw*:

```
    screen.drawText(score,120,80,20,"#FFF")
```


## Next

### Next

Our game is almost complete! In the next tutorial, we will manage the game over case and see
how to restart a new game. Here is the full code as it should look for now:

```
init = function()
  blades = [200,300,400]
  passed = [0,0,0]
end

update = function()
  position = position+2

  if touch.touching and hero_y == 0 then
     hero_vy = 7
  end

  hero_vy -= 0.3
  hero_y = max(0,hero_y+hero_vy)

  for i=0 to blades.length-1
    if blades[i]<position-120 then
      blades[i] = position+280+random.next()*200
      passed[i] = 0
    end
    if abs(position-blades[i])<10 then
      if hero_y<10 then
        gameover = 1
      elsif not passed[i] then
        passed[i] = 1
        score += 1
      end
    end
  end
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")

  for i=-6 to 6 by 1
    screen.drawSprite("wall",i*40-position%40,-80,40)
  end

  screen.drawSprite("hero",-80,-50+hero_y,20)

  for i=0 to blades.length-1
    screen.drawSprite("blade",blades[i]-position-80,-50,20)
  end

  screen.drawText(score,120,80,20,"#FFF")
end
```
