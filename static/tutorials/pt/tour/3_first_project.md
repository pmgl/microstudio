# Tutorial

:project Tutorial: First project

## Primeiro Projeto

:position 30,30,40,40

:overlay

### Primeiro Projeto

Your first project is already created! You will create a character and
program microStudio to display it on screen and ensure it can be moved around
by pressing the arrow keys of your computer keyboard.


## Criar um *Sprite*

### Criar um *Sprite*

Click **Sprites** to open the sprites editor.

:highlight #projectview .sidemenu #menuitem-sprites

:auto

## Criar um *Sprite* 2

### Criar um *Sprite*

Click button "Add Sprite" to create a new sprite.

:navigate projects.sprites

:highlight #create-sprite-button

:auto

## Pinte seu *Sprite*

:navigate projects.sprites

:position 0,50,30,40

### Desenhe seu Personagem

Use the drawing tools on the right-hand side of the screen to draw your character.
You can spend as much time as you wish on it!

When your sprite is done, move to the next step.

## Código 1

### Código

Now click **Code**, we are about to program a bit!

:highlight #projectview .sidemenu #menuitem-code

:auto


## Código

:navigate projects.code

:position 55,30,45,40

### Código

Your project's code is already filled with the definition of three functions:
```init```, ```update``` et ```draw```. We will work on the contents of function
```draw```. Add the following line, between line
```draw = function()``` and line ```end```:

```
  screen.drawSprite("sprite",0,0,20)
```

This is how your code now looks like:

```
draw = function()
  screen.drawSprite("sprite",0,0,20)
end
```

## Executar

:navigate projects.code

:position 55,55,45,40

### Execute seu Programa

Let's give it a try! Click button play to launch your program.

:highlight #run-button

:auto

## Executar

:navigate projects.code

:position 55,55,45,40

### Executando

Your character is now displayed in the middle of the execution view. The line of code
we have added calls function ```drawSprite``` on object
```screen```. The call is made with parameters: the name of the sprite to display  ```"sprite"```
(make sure that it is actually the name of the sprite you created), x and y coordinates of the point
where to display it (0,0 is the center of the screen) and the display size (20).

You can play with these coordinates to change the drawing position of the sprite. You will notice
that your changes are reflected in real time in the execution view.

## Adicione um Fundo

:navigate projects.code

### Adicione uma Cor de Fundo

Above our line ```screen.drawSprite(...)```, we will add the following line:

```
  screen.fillRect(0,0,400,400,"#468")
```

```fillRect``` means "fill a rectangle". Parameter ```"#468"``` represents
a blue-gray color. Click on it and then press and hold CTRL down, a color picker will show up.
Pick the color you like the most!


## Controle o Personagem

:navigate projects.code

### Controle o Personagem

In order to control the drawing position of the character, we will use two variables, ```x``` and ```y```.
Let's change the line of code which draws the sprite, as follows:

```
  screen.drawSprite("sprite",x,y,20)
```

The character will now be drawn at coordinates ```x``` , ```y```.

## Controle

:navigate projects.code

### Controle o Personagem

All we need now is to change the value of ```x``` and ```y``` when keyboard
arrow keys are pressed. Insert the following line between
```update = function()``` and ```end```:

```
  if keyboard.LEFT then x = x-1 end
```

Your full code now looks like this:

```
init = function()
end

update = function()
  if keyboard.LEFT then x = x-1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"rgb(140,198,110)")
  screen.drawSprite("sprite",x,y,20)
end
```

## Controle o Personagem

:navigate projects.code

### Controle o Personagem

Click on the execution view, then press the left arrow key of your computer keyboard.
You should see the character moving to the left!

Why: the code line we have added checks whether the left arrow key is pressed (```keyboard.LEFT```) and
when it is the case, the value of ```x``` is reduced by 1.

Knowing that the other arrow keys identifiers are RIGHT, UP and DOWN, add three lines to your code
to ensure your character can move in every direction.

(Solution in the next step)

## Controle o Personagem

:navigate projects.code

### Controle o Personagem

Here is the full code of the function  ```update``` to move the character in all 4 directions with
keyboard arrow keys:

```
update = function()
  if keyboard.LEFT then x = x-1 end
  if keyboard.RIGHT then x = x+1 end
  if keyboard.UP then y = y+1 end
  if keyboard.DOWN then y = y-1 end
end
```

## Fim

This tutorial is over. You can now learn more about programming in *microScript*, by
starting the course on Programming.
