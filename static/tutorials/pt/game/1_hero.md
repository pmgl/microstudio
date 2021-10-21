# Tutorial

:project Tutorial: Create a Game

## Introdução

:position 30,30,40,40

:overlay

### Criar um Jogo

In this tutorial series, we will create a simple yet fully working game in less
than 70 lines of code.

This series assumes that you have already done the programming tutorial series.

When doing this tutorial, you can let your game run continuously, you will see it improve
in real time.

Here is an example of how the final game can look like:

https://microstudio.io/gilles/skaterun/

## Herói

:position 50,50,40,40

:highlight #menuitem-sprites

### Herói

Our game needs a Hero. Go to the Sprites tab and click "Add a sprite".

Make sure to rename your sprite to "hero", this will be useful later. Then you can start drawing your sprite.
You can spend as much time as you wish on your hero. You can even make it animated, by opening the Animation
toolbar at the bottom of the window and adding animation frames.


## Código inicial

:highlight #menuitem-code

### Código inicial

We will now start coding to display our hero on screen. Click to open the Code tab.

For now our game code looks like this:

```
init = function()
end

update = function()
end

draw = function()
end
```

```init```, ```update``` and ```draw``` are the three key functions to know about in microStudio.

```init``` is called only once, when your game starts. We will use it to initialize a few global variables later.

```update``` is called exactly 60 times per second while your game is running. We will also use it later to update the game
animations, physics and logic.

```draw``` is called everytime the screen can be redrawn. We will start working on the body of this function.


## Pintando o fundo

### Pintando o fundo

We will insert a line in the body of the function draw:

```
draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")
end
```

## Executar

:highlight #run-button

### Executar o programa

Click on the run button to start your program.

The line we have added fills a rectangle, centered on the center of the screen, extending to the screen boundaries.
The fifth parameter is the color. Click on it and hold down CTRL to pick another color with the color picker!

## Exibindo o herói

### Exibindo o herói

Add the following line, in the body of the function draw, after the call to ```screen.fillRect```:

```
  screen.drawSprite("hero",-80,-50,20)
```

This line draws your "hero" sprite on screen. If nothing shows up, check that the program is running and
check that you have correctly renamed your sprite to "hero".

Your full code should look like this for now:

```
init = function()
end

update = function()
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")
  screen.drawSprite("hero",-80,-50,20)
end
```

## Próximo

### Próximo

Let's continue with the next tutorial where we will create a wall on which our hero is
running.
