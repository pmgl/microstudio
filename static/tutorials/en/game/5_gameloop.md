# Tutorial

:project Tutorial: Create a Game

## Game over

:position 50,50,40,40

### Game over

In the previous tutorial we have arranged to set a new variable *gameover* to 1 when the
player hits a blade. Once *gameover* is set, we need to:

* stop the game
* wait 5 seconds
* restart the game

We will stop the game by skipping all our code in the *update* function. We will wait 5
seconds by incrementing the value of gameover in the update function until it reaches 300.
We will restart the game by calling again function *init*, after making sure that it correctly
resets everything we need.

## Game over

### Game over

We will thus alter the contents of the *update* function as follows:

```
  if gameover>0 then
    gameover = gameover+1
    if gameover>300 then init() end
  else
    // other contents of the update function goes here
  end
```

The *init* function is now used to restart the game 5 seconds after the game is over. To serve that
purpose properly, it needs to reset the *score*, the initial *position* and to reset the value of *gameover*
to zero:

```
init = function()
  blades = [200,300,400]
  passed = [0,0,0]
  gameover = 0
  score = 0
  position = 0
end
```

## Game over

### Game over

When the game is over, we need some visual feedback about it! We will thus draw a semi-transparent rectangle
covering all the game interface and draw the text GAME OVER. We add this to the end of our *draw* function:

```
  if gameover then
    screen.fillRect(0,0,screen.width,screen.height,"rgba(255,0,0,.5)")
    screen.drawText("GAME OVER",0,0,50,"#FFF")
  end
```

## Accelerating the gameplay

### Accelerating the gameplay

Our game is too easy. Let's make it harder! We will progressively accelerate the hero during the game.
We do that by creating a variable *speed* which we initialize to value 2 in the *init* function:

```
  speed = 2
```
(in init function)

We will then change the line ```position = position + 2``` in the *update* method by this:

```
  position = position + speed
  speed = speed + 0.001
```

We are thus increasing the speed of the hero during the gameplay!

## Done!

### Done!

We have finished creating our game. The full code is given again below. If you look closely, you will notice that
we have added a variable *running* which purpose is to wait that the player touches the screen / clicks before
starting the game.

We have also added some sounds that are produced by calling function ```audio.beep()```. You can check that too in the
code below.

You can also start adding more features to the game. Why not some flying objects that would need to be avoided
when jumping? It is all up to you!

Thanks for reading this tutorial and have fun with microStudio!


```
init = function()
  gameover = 0
  running = 0
  blades = [200,300,400]
  passed = [0,0,0]
  score = 0
  position = 0
  speed = 2
end

update = function()
  if gameover>0 then
    gameover = gameover+1
    if gameover>300 then init() end
  elsif running then
    position = position+speed
    speed = speed + 0.001

    if touch.touching and hero_y == 0 then
       hero_vy = 7
       audio.beep("square tempo 20000 volume 10 span 100 C4 to C6")
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
          running = 0
          gameover = 1
          audio.beep("saw tempo 10000 volume 50 span 50 C2 to C4 to C2 to C4")
        elsif not passed[i] then
          passed[i] = 1
          score += 1
          audio.beep("saw tempo 960 volume 50 span 20 C6")
        end
      end
    end
  else
    if touch.touching then running = 1 end
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
  if gameover then
    screen.fillRect(0,0,screen.width,screen.height,"rgba(255,0,0,.5)")
    screen.drawText("GAME OVER",0,0,50,"#FFF")
  elsif not running then
    screen.drawText("READY?",0,30,50,"#FFF")
  end
end
```
