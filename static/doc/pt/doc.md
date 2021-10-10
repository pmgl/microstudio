**microStudio** é um ambiente de desenvolvimento integrado para jogos.
Inclui todas as ferramentas de que você precisa para criar seu primeiro videogame!

**microStudio** oferece todas as seguintes possibilidades:

* um editor de sprite (imagens, em pixel art)
* um editor de mapas (ou seja, mapas ou níveis)
* um editor de código para programar em microScript, uma linguagem simples, mas poderosa
* Operação 100% online, permitindo que você teste seu jogo instantaneamente a qualquer momento durante seu desenvolvimento
* a possibilidade de instalar facilmente o jogo, concluído ou em andamento, em smartphones e tablets
* a capacidade de trabalhar com várias pessoas no mesmo projeto com sincronização instantânea
* Recursos de compartilhamento da comunidade que permitem que você explore os projetos de outras pessoas, aprenda e reutilize tudo o que quiser em seu próprio projeto.

# Quick start

You can start by exploring projects made by other users, in the *Explore* section.

To start creating a game it is necessary to create an account. Choose a nickname (avoid using
your real name), enter your email address (necessary in case of password forgetfulness; must be validated to be able to publish) and let's go!

## First project

You can either create a new empty project in the Create section, or choose an existing project in the Explorer section and click on the "Clone" button to create your own copy and start customizing it.

### Code

Once your project has been created, you are in the "Code" section. This is where you can start programming. Try to copy and paste the code below:

```
draw = function()
  screen.drawSprite ("icon",0,0,100,100)
end
```

### Execute

Then click on the Play button on the right-hand side of the screen. Your program starts and you see that the code above displays the project icon in the middle of the screen. Change the display coordinates (the digits 0 and 100) to see the position and dimensions of the icon vary.

### Modify in real time

You can then make this first program more interactive, by copying and pasting the code below:

```
update = function()
  if keyboard.LEFT then x -= 1 end
  if keyboard.RIGHT then x += 1 end
  if keyboard.UP then y += 1 end
  if keyboard.DOWN then y -= 1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"#000")
  screen.drawSprite("icon",x,y,20,20)
end
```

This time the program allows you to move the project icon with the keyboard arrows. The meaning of the functions ```update``` and ```draw```, the test of the keyboard keys with ```keyboard```, the drawing on the screen with ```screen``` are all explained in detail later in this documentation.

You can also go to the Sprites section, click on the "icon" element and start editing the image. When you return to the Code section, you will see that your changes are instantly taken into account in the program currently running.

# Explore

The main section *Explorer* allows you to discover projects created by other users. You can find examples of games, reusable templates, sprite libraries in different styles and themes. If you are interested in a particular project, you can clone it, i.e. create a complete copy of it that you can then modify and reuse for your own purposes.

If you have previously opened one of your projects in the Create section, you will be able to import each sprite or source file of the projects you are exploring to your current project. This allows you to pick images or features that interest you from among the community's public projects, and reuse them for your own purposes.

# Create a project

You can create an empty project in the main section *Create*. Your project has several sections:

* **Code** : this is where you create your programs and start executing your project to test and debug it.
* **Sprites**: *sprites* are images that you can draw and modify in this section. You can easily refer to them to display them (paste them on the screen) when you program your game.
* **Maps**: Maps are scenes or levels that you can create by assembling your sprites on a grid. You can easily display them on the screen in your program
* **Doc** : here you can write documentation for your project; it can be a game design document, a tutorial, a guide to reuse your project as a template etc.
* **Options**: Here you can set various options for your project; you can also invite other users to participate in your project with you.
* **Publish**: Here you can make your project public; don't forget to create a description and add tags.

## Code

In this section you program and test your project. A source code file is automatically created for your project. You can add others to divide the functionalities of your project into various sub-sets.

The operation of a microStudio program is based on your implementation of 3 essential functions:

* the function ```init``` where you initialize your variables
* the function ```update``` where you animate your objects and scan the entries
* the ```draw``` function where you draw on the screen

<!--- help_start init = function --->
### Function ```init()```

The init function is called only once when the program is launched. It is useful in particular for defining the initial state of global variables that can be used in the rest of the program.
<!--- help_end --->
##### example
```
init = function()
  status = "welcome"
  level = 1
  position_x = 0
  position_y = 0
end
```

### Function ```update()```
<!--- help_start update = function --->
The function ```update``` is invoked 60 times per second. The body of this function is the best place to program the logic and physics of the game: state changes, sprite or enemy movements, collision detection, keyboard, evaluation of touch or gamepad inputs, etc.
<!--- help_end --->

##### example
```
update = function()
  if keyboard.UP then y = y+1 end
end
```

The above code increases the value of the y variable by 1 every 60th of a second if the ```UP``` key on the keyboard is pressed (up arrow).

<!--- help_start draw = function --->
### Function ```draw()```
The ```draw``` function is called as often as the screen can be refreshed. This is where you have to draw your scene on the screen, for example by filling in a large coloured rectangle (to erase the screen), then drawing a few sprites or shapes on top of it.
<!--- help_end --->

##### example
```
draw = function()
  // fill the screen with black
  screen.fillRect(0,0,screen.width,screen.width,screen.height, "rgb(0,0,0)")
  // draw the sprite "icon" in the center of the screen, in size 100x100
  screen.drawSprite("icon",0,0,100,100)
end
```

In most cases, ```draw``` is called 60 times per second. But some computers or tablets can refresh their screens 120 times per second or even more. It can also happen that the device running the program is overloaded and cannot refresh the screen 60 times per second, in which case the ```draw``` function will be called less often. This is why ```update``` and ```draw``` are two separate functions: no matter what happens, ```update``` will be called exactly 60 times per second; and when ```draw``` is called, it is time to redraw the screen.

### Execution

In the "Code" section, the right part of the screen allows you to see your program in action, while continuing to modify its source code. To launch the program, simply click on the <i class="fa fa-play"></i> button. You can interrupt the execution of your program at any time by clicking on the button <i class="fa fa-pause"></i>.

### Console

During the execution of your program, you can use the console to execute simple commands in *microScript*. For example, you can simply enter the name of a variable to find out its current value.

##### examples
Know the current value of the position_x variable
```
> position_x
34
>
```
Change position value_x
```
> position_x = -10
-10
>
```
Call the draw() function to see the change in position_x and its effect on the drawing on the screen (assuming that the execution is paused)
```
> draw()
>
```

### Traces

In your program code, you can send text to be displayed on the console at any time, using the ```print()``` function.

##### example
```
draw = function()
  // your draw implementation()

  print(position_x)
end
```
## Sprites

Sprites are images that can move on the screen. The drawing tool in *microStudio* allows you to create sprites, which can then be used in the program code to display them on the screen at the desired position and size.

### Create a sprite
Each project has a default sprite, called "icon", which will act as the application's icon. You can create new sprites by clicking on *Add a sprite*. You can rename them as you wish and define their size in pixels (width x height).

### Drawing options
*microStudio* offers the classic drawing functions: pencil, filling, eraser, lighten, darken, soften, increase contrast, change saturation.

The eyedropper tool can be used at any time by pressing the [Alt] key on the keyboard.

The *tile* and symmetry options will help you to create "repeatable" sprites or sprites with one or two symmetry axes.

##### Tip
You can import image files to your microStudio project. To do so, drag and drop PNG or JPG files (up to 256x256 pixels in size) to the list of sprites.

## Maps
A map in microStudio is a grid for assembling sprites. It allows you to assemble a decor or create a level.

### Create a map
Maps can be created, renamed just like sprites. It is possible to modify the size of the grid (in number of cells). Each cell can be painted with a sprite. It is possible to change the pixel size of each cell, which should generally reflect the size of the sprites used to paint the grid.


## Settings
The *Settings* tab allows you to customize some elements of your project.

### Options
You can define the title of your project, its identifier (used to create its URL i.e. its internet address).

You can specify whether your project should be used in portrait or landscape mode. This choice will be taken into account when installing your application on a smartphone or tablet.

You can also specify the desired proportions for the display area on the screen. This is an option to ensure the application always looks good when installed on devices with screens of different proportions.

### Users

The users section allows you to invite friends to participate in your project. You must know the nickname of the friend you want to invite. Once a friend is invited, if she accepts your invitation, she will have full access to your project and will be able to make any changes she wants (modify, add, delete sprites, maps, code etc.). However, the modification of the project options and the list of participants is reserved for the project owner.

## Publish

*microStudio* offers a few options for publishing or exporting your project. You can export your project as a standalone HTML5 app, for distribution online, on your site or on game distribution platforms. You can also make your project public on *microStudio* allowing the community to play with it, comment, explore the source code and assets... More export options are planned for the future.

### Make the project public

To make your project accessible to everyone (read-only), click on "Make my project public". Once your project is public, it will be displayed in the exploration tab of the microstudio site. Any visitor will be able to run the game, view and reuse the source code and other components of your project.

Your game has a permanent URL in the form ```https://microstudio.io/author_nickname/game_id/```. You can of course distribute the link to anyone or you may add your game to your existing website by embedding it into an iframe.

### Export to HTML5

To export your full project to a standalone HTML5 app, click "Export to HTML5". This triggers the download of a ZIP archive, containing all the files necessary to run your game: sprites, some JavaScript files, icons and a main HTML file "index.html". Your game can be run locally (double-click the file index.html) or you may upload it to your existing website. It is also ready to be published on many online game distribution platforms that accept HTML5 games (we suggest a few in the HTML5 export panel).

# microScript

**microScript** is a simple language inspired by Lua. Here are some general principles used by microScript:

* the variables are global by default. To define a local variable, use the keyword "local".
* line breaks have no particular meaning, they are considered as spaces.
* in microScript there is no value ```null```, ```nil``` or ```undefined```. Any undefined or null variable is equal to ```0```.
* In microScript, there is no Boolean type. ```0``` is false and everything that is not ```0``` is true.
* there is no execution error or exception in microScript. Any variable that is not defined returns ```0```. Invoking a value that is not a function as a function returns the value itself.

## Variables

A variable is a name (or "identifier") to which it is decided to assign a value. It therefore makes it possible to store this value

### Statement

Variables in microScript do not need to be declared. Any variable that has not yet been used can be considered existing and has the value ```0```.

To start using a variable, simply assign it a value with the equal sign:

```
x = 1
```
The value of x is now 1.

### Types of values

*microScript* recognizes five types of values: numbers, strings (text), lists, objects and functions.

#### Number
The values of type Number in *microScript* can be integer or decimal numbers.

```
pi = 3.1415
x = 1
half = 1/2
```

#### String of characters
Strings are texts or pieces of texts. They must be defined in quotation marks.

```
animal = "cat"
print("Hello "+animal)
```
#### List
Lists can contain a number of values:

```
empty_list = []
prime_numbers =[2,3,5,5,7,11,13,17,19]
mixed_list =[1,"cat",[1,2,3]]
```

You can access the elements of a list by their index, i.e. their position in the list from 0 :

```
list = ["cat", "dog", "mouse"]
print(list[0])
print(list[1])
print(list[2])
```

It is also easy to browse a list with a ```for loop```:

```
for element in list
  print(element)
end
```

#### Object
An object in *microScript* is a form of associative list. The object has one or more "fields" that have a key and a value. The key is a string of characters, the value can be any value *microScript*. The definition of an object begins with the keyword "object" and ends with the keyword "end". Between the two can be defined several fields. Example :

```
my_object = object
  x = 0
  y = 0
  name = "object 1"
end
```
You can access the fields of an object with the operator ```. ```. The above definition can therefore also be written:

```
my_object.x = 0
my_object.y = 0
my_object.name = "object 1"
```

It can also be accessed with brackets ```[]```. The above definition can therefore also be written:

```
my_object["x"] = 0
my_object["y"] = 0
my_object["name"] = "object 1"
```

You can browse the list of fields of an object with a ```for loop```:

```
for field in my_object
  print(field +" = " + " + my_object[field])
end
```

See "Classes" for a more in-depth coverage of object

#### Function value

A value can be of the function type. When writing ```draw = function() ... end```, a function value is created and assigned to the variable ```draw``` (see section on functions below).

#### Local variables

By default, the variables declared by assigning them are global. It is possible to define a local variable, as part of a function, by using the keyword "local":

```
maFunction = function()
  local i = 0
end
```

## Functions

A function is a sub-sequence of operations, which performs a job, a calculation and sometimes returns a result.

### Define a function

A function is defined with the keyword "function" and ends with the keyword "end".

```
nextNumber = function(s)
  x+1
end
```

### Invoke a function

```
print(nextNumber(10))
```

When you invoke a value that is not a function as a function, it simply returns its value. Example :

```
x = 1
x(0)
```

The code above returns the value 1, without generating an error. So you can even invoke a function that is not yet defined (it is then worth ```0```), without triggering an error. This allows you to start structuring your program very early on with sub-functions, which you will work on later. For example:

```
draw = function()
  drawSky()
  drawClouds()
  drawTrees()
  drawEnemies()
  drawHero()
end

// I can implement the above functions at my own pace.
```

## Conditions

### Simple condition
A conditional statement allows the program to test a hypothesis and perform different operations depending on the test result. In *microScript*, the conditions are written as follows:

```
if age<18 then
  print("child")
else
  print("adult")
end
```
"if" means "if";
"then" means "then";
"else" means "otherwise";
"end" means "end"

In the example above, **if** the value of the age variable is less than 18, **then** the instruction ``print("child")`` will be executed, **else** the instruction ```print("adult")``` will be executed.

### Binary comparison operators
Here are the binary operators that can be used for comparisons:

|Operator|Description|
|-|-|
|==|```a == b``` is true only if a is equal to b|
|!=|```a != b``` is true only if it is different from b|
|<|```a < b``` is true only if a is strictly less than b|
|>|```a > b``` is true only if a is strictly greater than b|
|<=|```a <= b``` is true only if a is less than or equal to b|
|>=|```a >= b``` is true only if a is greater than or equal to b|

### Boolean operators
|Operator|Description|
|-|-|
|and|logical AND: ```a and b``` is true only if a and b are true|
|or|logical OR: "a or b" is true only if a is true or b is true|
|not|logical NOT: not a is true if a is false and false if a is true.|

### Boolean values
In microScript, there is no boolean type. ```0``` is considered false and any other value is true. Comparison operators return ```1``` for true or ```0``` for false. For convenience, microScript also allows you to use these two predefined variables:

|Variable|Value|
|-|-|
|true|1|
|false|0|


### Multiple conditions

It is possible to test multiple hypotheses using the keyword "elsif" (contraction of "else if")
```
if age<10 then
  print("child")
elsif age<18 then
  print("teenager")
elsif age<30 then
  print("young adult")
else
  print("very respectable age")
end
```

## Loops
The loops allow repeated treatments to be performed.

### For loop
The ```for``` loop is widely used in programming. It allows the same treatment to be carried out on all the elements of a list or series of values.

```
for i=1 to 10
  print(i)
end
```
The above example shows in the console each number from 1 to 10.

```
for i=0 to 10 by 2
  print(i)
end
```
The above example shows the numbers from 0 to 10 in the console in steps of 2.

```
list =[2,3,5,5,7,11]
for number in list
  print(number)
end
```
The example above defines a list and then displays each item in the list.

### While loop
The ```while``` loop allows operations to be performed repeatedly until a satisfactory result is obtained.

```
x = 1
while x*x<100
  print(x*x)
  x = x+1
end
```
The example above prints the square of x, then increments x (i. e. adds 1 to x), as long as the square of x is less than 100.

### Break or continue loop
You can exit a `for` or `while` loop prematurely with the statement `break`. Example:

```
while true
  x = x+1
  if x>= 100 then break end
end
```

You can skip the remaining operations of a loop and continue to the next iteration of the loop with the statement `continue`. Example:

```
for i=0 to 10000
  if i%10 == 0 then continue end // this will skip processing of multiples of 10
  doSomeProcessing(i)
end
```

## Operators

Here is the list of binary operators in *microScript* (excluding comparisons, already mentioned above)

|Description|Description|
|-|-|
|+|Addition|
|-|Subtraction|
|*|Multiplication|
|/|Division|
|%|Modulo : ```x % y``` is equal to the rest of the division of x by y|
|^|Power: ```x ^ y``` is equal to x high at power y is ```pow(x,y)```|

## Predefined functions

### Functions
|Function|Description|
|-|-|
|max(a,b)|Returns the largest number of a or b|
|min(a,b)|Returns the smallest number of a or b|
|round(a)|Returns the value a rounded to the nearest integer value|
|floor(a)|Returns the value a rounded down to the lower integer|
|ceil(a)|Returns the value a rounded upwards|
|abs(a)|Returns the absolute value of a|
|sqrt(a)|Returns the square root from a|
|pow(a,b)|Returns a to the power of b (other possible notation: ```a ^ b```)|
|PI|Constant equals to the number Pi|
|log(a)|Returns the natural logarithm of a|
|exp(a)|Returns the Euler number raised to the power of a|

#### Trigonometry functions in radians
|Function|Description|
|-|-|
|sin(a)|Returns the sine from a (a in radians)|
|cos(a)|Returns the cosine from a (a in radians)|
|tan(a)|Returns the tangent from a (a in radians)|
|acos(a)|Returns the arc cosine of a (result in radians)|
|asin(a)|Returns the arc sine of a (result in radians)|
|atan(a)|Returns the arc tangent of a (result in radians)|
|atan2(y,x)|Returns the arc tangent of y/x (result in radians)|

#### Trigonometry functions in degrees
|Function|Description|
|-|-|
|sind(a)|Returns the sine from a (a in degrees)|
|cosd(a)|Returns the cosine from a (a in degrees)|
|tand(a)|Returns the tangent from a (a in degrees)|
|acosd(a)|Returns the arc cosine of a (result in degrees)|
|asind(a)|Returns the arc sine of a (result in degrees)|
|atand(a)|Returns the arc tangent of a (result in degrees)|
|atan2d(y,x)|Returns the arc tangent of y/x (result in degrees)|

### Random numbers
The random object is used to generate pseudo-random numbers. It is possible to initialize the generator with the ```seed``` function to obtain the same sequence of numbers at each execution, or on the contrary a different sequence each time.

|Description|Description|
|-|-|
|```random.next()```|Removes a new random number between 0 and 1|
|```random.nextInt(a)```|Returns a new integer random number between 0 and a-1|
|```random.seed(a)```|reset the random number sequence using the value a ; if you use the same initialization value twice, you will get the same random number sequence. If a == 0, the random number generator is initialized... randomly and therefore not reproducible|

## String operations

|Operation|Description|
|-|-|
|```string1 + string2```|The + operator can be used to concatenate strings.|
|```string.length```|Field retains the length of the string.|
|```string.substring(i1,i2)```|Returns a substring of the character string, starting at index i1 and ending at index i2|
|```string.startsWith(s)```|Returns whether string starts exactly with ```s```|
|```string.endsWith(s)```|Returns whether string ends exactly with ```s```|
|```string.indexOf(s)```|Returns the index of the first occurrence of ```s``` in ```string```, or -1 if ```string``` doesn't contain any such occurrence|
|```string.lastIndexOf(s)```|Returns the index of the last occurrence of ```s``` in ```string```, or -1 if ```string``` doesn't contain any such occurrence|
|```string.replace(s1,s2)```|Returns a new string in which the first occurrence of ```s1``` (if any) is replaced with ```s2```|
|```string.toUpperCase()```|Returns the string converted to upper case|
|```string.toLowerCase()```|Returns the string converted to lower case|
|```string.split(s)```|The split function divides the string into a list of substrings, by searching for the separator substring given as argument and returns that list|


## List operations
|Operation|Description|
|-|-|
|```list.length```|Retains the length of the list (number of elements in the list).|
|```list.push(element)```|Adds the element to the end of the list|
|```list.insert(element)```|Inserts an element at the beginning of the list|
|```list.insertAt(element,index)```|Inserts an element at the given index in the list|
|```list.indexOf(element)```|Returns the position of the element in the list (0 for the first element, 1 for the second element ...). Returns -1 when the element is not found in the list.|
|```list.contains(element)```|Returns 1 (true) when ```element``` is in the list, or 0 (false) when the element cannot be found in the list|
|```list.removeAt(index)```|Removes from the list the element at position ```index```|
|```list.removeElement(element)```|Removes from the list ```element```, if it can be found in the list|
|```list1.concat(list2)```|Returns a new list obtained by appending list2 to list1|

## Sorting a list

You can sort the elements of a list using the function ```list.sortList(compareFunction)```. The ```compareFunction``` you provide has to accept two arguments (which we will call ```a``` and ```b```) and should return:
|Return value|when|
|-|-|
|a negative number|when ```a``` must be sorted before ```b```(a is less than b)|
|zero|when ```a``` and ```b``` have an equal position regarding to the desired ordering criterion|
|a positive number|when ```a``` must be sorted after ```b``` (a is greater than b)|

##### example

The example below assumes that the list contains *points*, each point having an ```x``` coordinate field. We want to sort the points from the lesser value of point.x to the greater value of point.x:

```
compare = function(point1,point2)
  return point1.x - point2.x
end

list.sortList(compare)
```

Note that you could make the code above shorter:

```
list.sortList(function(point1,point2) point1.x - point2.x end)
```

Whenever a comparison function is not provided, the elements of the list will be sorted according to the alphabetical order.

## Comments

Comments in *microScript* can be added after a double-slash: ```//```; everything that follows until the next line break is ignored when analyzing the program.

##### example
```
myFunction = ()
  // my notes on the role of the myFunction function
end
```

## Classes

A class in a programming language refers to a kind of blueprint or template for creating objects. A class defines default properties and functions which constitute the default state and behavior of all objects that will be created from it. You can create object instances derived from a class, which will all inherit from the properties of the class. Using classes and their derived objects in a program is called object-oriented programming (OOP).

To illustrate these concepts, we will see how you can use classes to manage enemies in your game:

### Define a class

We will start by creating a class ```Enemy``` that will be shared by all our enemies objects. Each enemy will have a position (on screen). It will have health points ```hp```, move at a certain ```velocity```:

```
Enemy = class
  constructor = function(position)
    this.position = position
  end

  hp = 10
  velocity = 1

  move = function()
    position += velocity
  end

  hit = function(damage)
    hp -= damage
  end
end
```

In microScript, classes and objects are very similar concepts and can almost be used interchangeably. The class definition thus ends with keyword ```end```. The first property we defined in the class above is the function "constructor". This function is called when a object instance of the class is created. It will set the property *position* of the object. ```this``` refers to the object instance on which the function will be called, thus setting ```this.position``` means the object sets the property position on itself.

### Create object instances from a class

Let's create two enemies objects derived from our class:

```
enemy_1 = new Enemy(50)
enemy_2 = new Enemy(100)
```

The operator ```new``` is used to create a new object instance derived from a class. The argument we pass here will is aimed at the constructor function of our class. We thus have created an enemy instance at position 50 and another enemy instance at position 100.

Both enemies share the same velocity or health points (hp). However, we may choose to set a different velocity to the second enemy:

```
enemy_2.velocity = 2
```

We can now make our enemies move by calling:

```
enemy_1.move()
enemy_2.move()
```

The second enemy will move twice faster because we altered its property velocity before calling function move.

### Inheritance

We can make a class inherit from another class. For example, if we want to create a variation of our Enemy, we could do as follows:

```
Boss = class extends Enemy
  constructor = function(position)
    super(position)
    hp = 50
  end

  move = function()
    super()
    hp += 1
  end
end
```

We have created a new class ```Boss``` by extending the class ```Enemy```. Our new class shares all properties from Enemy, except that it replaces some of these properties by its own values. Calling ```super(position)``` in the constructor of our new class ensures that the constructor of our parent class Enemy is also called.

We created a new behavior ```move``` for our Boss, which overrides the default behavior of Enemy. In this new function, we call ```super()``` in order to keep the default behavior that was defined in the class Enemy ; we then increment the value of ```hp```, which implies that our Bosses will regain health points when moving.

We can now create an instance of our Boss at position 120:

```
the_final_boss = new Boss(120)
```

##### notes

* variables space: when a function is called on an object (like ```enemy_1.move()```), the variables referred to in the body of the called functions are the properties of the object. For example, in the body of the move function, ```position += 1``` will increment the property ```position``` of the object itself.

* It is sometimes necessary to use ```this``` to ensure we are correctly referring to a property of our object. This is why, in the constructor of our class Enemy, we use ```this.position = position```, because ```position``` also refers to the argument of the function and thus "hides" the property of our object.

* ```super()``` can be used in a function attached to an object or a class, to invoke the equally named function of the parent class.


# Function reference

## Display ```screen```

In *microStudio* the screen is represented by the predefined object "screen". To display shapes or images on the screen, simply call functions (also called *methods*) on this object. For example:

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```
The code above defines the drawing color as ```#FFF``` i. e. white (see explanations below). Then it draws a rectangle filled with this color, centered at the coordinates 0.0 of the screen (i.e. the center of the screen), of width 100 and height 100.

To make your work easier, *microStudio* automatically scales the screen coordinates, regardless of the actual display resolution. By convention, the smallest display size (width in portrait mode, height in landscape mode) is 200. The origin point (0,0) being the center of the screen, the smallest dimension is therefore graduated from -100 to +100. The largest dimension will be graduated for example from -178 to +178 (classic 16:9 screen), from -200 to +200 (2:1 screen, longer, more recent smartphones) etc.


![Screen coordinates](/doc/img/screen_coordinates.png "Screen coordinates")

<small>*Drawing coordinate system on a 16:9 screen in portrait mode and in landscape mode*</small>


### Define a color
<!--- suggest_start screen.setColor --->
##### screen.setColor( color)

Defines the color to use for future calls to drawing functions.

<!--- suggest_end --->

The color is defined by a string of characters, so between quotation marks "". It is generally described by its RGB components, i.e. a mixture of Red, Green and Blue. Several types of ratings are possible:

* "rgb(255,255,255)": (rgb for red, green, blue). A value for red, green and blue is indicated here, varying between 0 and 255 maximum. "rgb(255,255,255)" gives white, "rgb(255,0,0)" gives bright red, "rgb(0,255,0)" gives green etc. To choose a color more easily when encoding, click on your rgb color and hold down the Control key to display the color selector.
* "#FFF" or "#FFFFFF": this notation uses hexadecimal, to describe the 3 components of red, green and blue. Hexadecimal is a number notation system in "base 16", i. e. using 16 digits, from 0 to 9 then from A to F.
* other notations exist, which are not described here.

### Clear screen
<!--- suggest_start screen.clear --->
##### screen.clear(color)
Clears the screen (fills it with the provided color, or with black if no color is passed as argument).
<!--- suggest_end --->

### Drawing shapes
<!--- suggest_start screen.fillRect --->
##### screen.fillRect( x, y, width, height, color)
Draw a filled rectangle, centered at x and y coordinates, with the specified width and height. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRoundRect --->
##### screen.fillRoundRect( x, y, width, height, radius, color)
Draws a filled rounded rectangle, centered at x and y coordinates, with the specified width, height and radius of curvature. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRound --->
##### screen.fillRound( x, y, width, height, color)
Draws a solid round shape (a disc or ellipse depending on the dimensions used), centered at x and y coordinates, with the specified width and height. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

<!--- suggest_start screen.drawRect --->
##### screen.drawRect( x, y, width, height, color)
Draws a rectangle outline, centered at x and y coordinates, with the specified width and height. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRoundRect --->
##### screen.drawRoundRect( x, y, width, height, radius, color)
Draws a rounded rectangle outline, centered at x and y coordinates, with the specified width, height and radius of curvature. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRound --->
##### screen.drawRound( x, y, width, height, color)
Draws a round shape outline, centered at x and y coordinates, with the specified width and height. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

<!--- suggest_start screen.drawLine --->
##### screen.drawLine( x1, y1, x2, y2, color )
Draws a line joining points (x1,y1) and (x2,y2). The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

<!--- suggest_start screen.fillPolygon --->
##### screen.fillPolygon( x1, y1, x2, y2, x3, y3, ... , color )
Fills a polygon defined by the list of point coordinates passed as arguments. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

The function can also accept an array as first argument and a color as second argument. In that case, the array is expected to hold the points coordinates like this: ```screen.fillPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon( x1, y1, x2, y2, x3, y3, ... , color )
Draws a polygon outline, defined by the list of point coordinates passed as arguments. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

The function can also accept an array as first argument and a color as second argument. In that case, the array is expected to hold the points coordinates like this: ```screen.drawPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolyline --->
##### screen.drawPolyline( x1, y1, x2, y2, x3, y3, ... , color )
Same as `drawPolygon` except that the drawing path will not be automatically closed.
<!--- suggest_end --->

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth( width )
Sets the line width for all subsequent line draw operation (drawLine, drawPolygon, drawRect etc.). The default line width is 1.
<!--- suggest_end --->

<!--- suggest_start screen.setLineDash --->
##### screen.setLineDash( array_of_values )
Sets the line dash style for all subsequent line draw operation (drawLine, drawPolygon, drawRect etc.). The argument must be an array of positive values, defining the length of lines and gaps.

#### example
```
screen.setLineDash([2,4])
```
<!--- suggest_end --->


### Display sprites and maps

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite( sprite, x, y, width, height)

Draws one of the sprites you created in the *Sprites* section on the screen. The first parameter is a string that corresponds to the name of the sprite to be displayed, for example ```"icon"```. Then follow the x,y coordinates where to display the sprite (the sprite will be centered on these coordinates). Then the width and height of the display.
<!--- suggest_end --->

```
screen.drawSprite("icon",0,50,50,50)
```
The height can be omitted, as in the example above. In this case the height will be calculated according to the width and proportions of the sprite.

##### Animated sprites

Animated sprites will automatically draw the correct frame according to animation settings. You can set the current frame of a sprite (e.g. to restart the animation) this way:

```
sprites["sprite1"].setFrame(0) // 0 is the index of the first frame
```

You can also draw a specific animation frame of your sprite, by appending "." and the index of the requested frame:

```
screen.drawSprite("sprite1.0",0,50,50,50)
```

The example above draws the frame 0 of sprite "sprite1".

<!--- suggest_start screen.drawSpritePart --->
##### screen.drawSpritePart( sprite, part_x, part_y, part_width, part_height, x, y, width, height)

Draws part of a sprite on the screen. The first parameter is a string that corresponds to the name of the sprite to be displayed, for example ```"icon"```. The next 4 parameters define the coordinate of a sub-rectangle of the sprite to actually be painted on screen (coordinate 0,0 is the top-left corner of the sprite). The last 4 parameters are the same as for ```drawSprite```.
<!--- suggest_end --->

```
screen.drawSpritePart("icon",4,4,8,8,0,50,50,50)
```
The height can be omitted, as in the example above. In this case the height will be calculated according to the width and proportions of the sprite part.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap( map , x , y , width , height )
Draws one of the maps you created in the *Maps* section on the screen. The first parameter is a string that corresponds to the name of the map to be displayed, for example ```map1```. Then follow the x,y coordinates where to display the map (the map will be centered on these coordinates). Then the width and height of the display.
<!--- suggest_end --->

```
screen.drawMap("map1",0,0,300,200)
```

### Display text

<!--- suggest_start screen.drawText --->
##### screen.drawText( text, x, y, size, &lt;color&gt; )
Draws text on the screen. The first parameter is the text to be displayed, then the x and y coordinates where the text will be centered, then the size (height) of the text. The last parameter is the drawing color, it can be omitted, in this case the last defined color will be reused.
<!--- suggest_end --->

```
screen.drawText("Hello!",0,0,30, "#FFF")
```

<!--- suggest_start screen.drawTextOutline --->
##### screen.drawTextOutline( text, x, y, size, &lt;color&gt; )
Draws the outline of the text. Drawing an outline in a different color can be done after a ```drawText``` to increase the contrast. The thickness of the outline can be set with ```screen.setLineWidth```.
<!--- suggest_end --->

```
screen.drawTextOutline("Hello!",0,0,30, "#F00")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont( font_name )
Defines the font to use for future calls to ```drawText```.

**Available fonts in current version**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->

```
screen.setFont("BitCell")
```

**Tip**: the global variable ```fonts``` is an array of all available fonts in microStudio


<!--- suggest_start screen.textWidth --->
##### screen.textWidth( text, size )
Returns the width of the given text when drawn on screen with given size.
<!--- suggest_end --->

```
width = screen.textWidth( "My Text", 20 )
```

### Drawing parameters
<!--- suggest_start screen.setAlpha --->
##### screen.setAlpha
Defines the overall opacity level for all drawing functions called up later. The value 0 is equivalent to a total transparency (invisible elements) and the value 1 corresponds to a total opacity (the drawn elements totally hide what is below).
<!--- suggest_end --->

```
screen.setAlpha(0.5) // the next drawn elements will be semi-transparent
```

When you use this function to draw some elements with a little transparency, don't forget to reset the alpha parameter to its default value:

```
screen.setAlpha(1) // the default value, total opacity
```

---

<!--- suggest_start screen.setLinearGradient --->
##### screen.setLinearGradient(x1, y1, x2, y2, color1, color2)
Defines the drawing color as a linear gradient of color, i. e. a gradient. ```x1 and y1``` are the coordinates of the starting point of the gradient. ```x2 and y2``` are the coordinates of the ending point of the gradient. ```color1``` is the starting color (see ```setColor``` for the color values). "Color2" is the arrival color.
<!--- suggest_end --->

```
screen.setLinearGradient(0,100,0,-100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
The above example creates a gradient from white to red, from top to bottom of the screen, and then fills the screen with this gradient.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient( x, y, radius, color1, color2)
Defines the drawing color as a radial gradient of color, i.e. a gradient in the shape of a circle. ```x``` and ```y``` are the coordinates of the center of the circle. ```radius``` is the radius of the circle. ```color1``` is the color at the center of the circle (see ```setColor``` for the color values). ```color2``` is the color at the perimeter of the circle.
<!--- suggest_end --->

```
screen.setRadialGradient(0,0,100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
The above example creates a gradient of white in the center of the screen, towards the red on the edges of the screen, then fills the screen with this gradient.

---

<!--- suggest_start screen.setTranslation --->
##### screen.setTranslation( tx, ty )
Defines the translation of the screen coordinates for the subsequent drawing operations.
<!--- suggest_end --->

```
screen.setTranslation(50,50)
screen.fillRect(0,0,20,20)
```
The rectangle in the above example will be drawn with an offset of 50,50

Don't forget to reset the translation to 0,0 whenever you need to stop translating draw operations.
```
screen.setTranslation(0,0)
```

<!--- suggest_start screen.setDrawRotation --->
##### screen.setDrawRotation( angle)
Defines a rotation angle for the next drawing operations. The angle is expressed in degrees.
<!--- suggest_end --->

```
screen.setDrawRotation(45)
screen.drawSprite ("icon",0,0,100)
```
The example above shows the project icon, tilted 45 degrees.

Don't forget to reset the rotation angle to 0 after using it!
```
screen.setDrawRotation(0) // returns the rotation angle to its default value
```

<!--- suggest_start screen.setDrawScale --->
##### screen.setDrawScale( x, y)
Defines a scale factor for drawing the next elements on the screen. ```x``` defines the scale factor on the x-axis and ```y``` the scale factor on the y-axis. A value of 2 will display twice as much. A value of -1 allows, for example, to flip a sprite (mirror), horizontally (x) or vertically (y).
<!--- suggest_end --->

```
screen.setDrawScale(1,-1)
screen.drawSprite ("icon",0,0,100)
```
The example above shows the project icon, returned vertically.

Don't forget to reset the scale factor to 1.1 after using it!
```
screen.setDrawScale(1,1) // returns the scale factor to its default value.
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setDrawAnchor( anchor_x, anchor_y )
By default, all drawing operations consider your coordinates to be the center of the shape to draw. You can change this by calling
`screen.setDrawAnchor( anchor_x, anchor_y )` to specify a different anchor point for drawing shapes.

<!--- suggest_end --->
On the x axis, the anchor point can be set to -1 (left side of your shape), 0 (center of your shape), 1 (right side of your shape) or any intermediary value. On the y axis, the anchor point can be set to -1 (bottom side of your shape), 0 (center of your shape), 1 (top of your shape) or any intermediary value.

Examples
```
screen.setDrawAnchor(-1,0) // useful to align text on the left
screen.setDrawAnchor(-1,-1) // your drawing coordinates are now interpreted as the bottom left corner of your shape.
screen.setDrawAnchor(0,0) // default value, all shapes will be drawn centered on your coordinates
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setBlending( blending )
Defines how subsequent drawing operations will be composed with the underlying, already drawn image. Can be set to `normal` or `additive`.

You can also use any of the compositing modes defined in the HTML5 Canvas specification with `setBlending`, for reference see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation

<!--- suggest_start screen.width --->
##### screen.width
The "width" field of the object screen has the current screen width as its value (always 200 if the screen is in portrait mode, see *screen coordinates*).
<!--- suggest_end --->

<!--- suggest_start screen.height --->
###### screen.height
The "height" field of the object screen has the current height of the screen as its value (always 200 if the screen is in landscape mode, see *screen coordinates*).
<!--- suggest_end --->

<!--- suggest_start screen.setCursorVisible --->
##### screen.setCursorVisible( visible )
You can use this function to show or hide the mouse cursor.
<!--- suggest_end --->


## Inputs, control

To make your program interactive, you need to know if and where the user presses a key on the keyboard, joystick, touches the touch screen. *microStudio* allows you to know the status of these different control interfaces, via the objects ```keyboard``` (for the keyboard), ```touch``` (for the touch screen / mouse), ```mouse``` (for mouse pointer / touch screen) ```gamepad``` (for the controller).

##### Note
The object ```system.inputs``` retains useful information on which input methods are available on the host system:

|Field|Value|
|-|-|
|system.inputs.keyboard|1 if the system is believed to have a physical keyboard, 0 otherwise|
|system.inputs.mouse|1 if the system has a mouse, 0 otherwise|
|system.inputs.touch|1 if the system has a touch screen, 0 otherwise|
|system.inputs.gamepad|1 if there is at least 1 gamepad connected to the system, 0 otherwise (the gamepad may appear connected only when the user has performed an action on it)|


### Keyboard inputs
<!--- suggest_start keyboard --->
Keyboard inputs can be tested using the ```keyboard``` object.
<!--- suggest_end --->

##### example
```
if keyboard.A then
  // the A key is currently pressed
end
```

Note that when you test your project, in order for keyboard events to reach the execution window, it is necessary to click in it first.

The code below shows the ID of each keyboard key pressed. It can be useful for you to establish the list of identifiers you will need for your project.

```
draw = function()
  screen.clear()
  local y = 80
  for key in keyboard
    if keyboard[key] then
      screen.drawText(key,0,y,15, "#FFF")
      y -= 20
    end
  end
end
```
*microStudio* creates for you some useful generic codes, such as UP, DOWN, LEFT and RIGHT that react to both the arrow keys and ZQSD / WASD depending on your keyboard layout.

To test special characters such as +, - or even parentheses, you must use the following syntax: ```keyboard["("]```, ```keyboard["-"]```.

##### Test whether a key was just pressed
In the context of the function ```update()```, you can check if a keyboard key was just pressed by the user using ```keyboard.press.<KEY>```.

Example:

```
if keyboard.press.A then
  // Do something once, just as the user presses the key A
end
```

##### Test whether a key was just released
In the context of the function ```update()```, you can check if a keyboard key was just released by the user using ```keyboard.release.<KEY>```.

Example:

```
if keyboard.release.A then
  // Do something once, just as the user releases the key A
end
```


<!--- suggest_start touch --->
### Touch inputs

The touch inputs can be tested with the "touch" object (which also reports the state of the mouse).
<!--- suggest_end --->

|Field|Value|
|-|-|
|touch.touching|Is true if the user touches the screen, false if not|
|touch.x|Position x where the screen is touched|
|touch.y|Position y where the screen is touched|
|touch.touches|In case you need to take into account multiple touch points simultaneously, touch.touches is a list of currently active touch points|
|touch.press|true if a finger just started touching the screen|
|touch.release|true if the finger just left the screen|

```
if touch.touching
  // the user touches the screen
else
 // the user does not touch the screen
end
```

```
draw = function()
  for t in touch.touches
    screen.drawSprite("icon",t.x,t.y,50)
  end
end
```
The example above shows the project icon at each active touch point on the screen.  

<!--- suggest_start mouse --->
### Mouse inputs

The mouse inputs can be tested with the ```mouse``` object (which also reports touch events).
<!--- suggest_end --->

|Field|Value|
|-|-|
|mouse.x|Position x of the mouse pointer|
|mouse.y|Position y of the mouse pointer|
|mouse.pressed|1 if any button of the mouse is pressed, 0 otherwise|
|mouse.left|1 if left mouse button is pressed, 0 otherwise|
|mouse.right|1 if right mouse button is pressed, 0 otherwise|
|mouse.middle|1 if middle mouse button is pressed, 0 otherwise|
|mouse.press|true if a mouse button was just pressed|
|mouse.release|true if a mouse button was just released|

### Controller inputs (gamepad)
<!--- suggest_start gamepad --->
The status of the buttons and joysticks on the controller (gamepad) can be tested using the "gamepad" object.
<!--- suggest_end --->

##### example
```
if gamepad.UP then y += 1 end
```

**Tip**: To get a complete list of the fields of the "gamepad" object, simply type "gamepad" in the console when your program is running.

In the same way as for keyboard key presses, you can use ```gamepad.press.<BUTTON>``` to check whether a button was just pressed or ```gamepad.release.<BUTTON>``` to check whether a button was just released.

## Sounds

*microStudio* currently allows you to play sounds and music you have imported to your project (as WAV files and MP3 files) or to create sounds programmatically using the legacy *beeper*.

### Play Sound
<!--- suggest_start audio.playSound --->
##### audio.playSound( name, volume, pitch, pan, loop )
Plays the given sound, with optional given playback settings.
<!--- suggest_end --->

##### arguments
|Argument|Description|
|-|-|
|name|The name of the sound (from the sounds tab of your project) to play|
|volume|[optional] The output volume for this sound playback, ranging from 0 to 1|
|pitch|[optional] The output pitch for this sound playback, 1 is the default pitch|
|pan|[optional] The pan setting for this sound playback, ranging from -1 (left) to 1 (right)|
|loop|[optional] Set to 1 (true) if you want the sound to loop indefinitely|

The function call returns an object. This object allows you to control the playback settings while the sound is being played:

##### example
```
my_sound = audio.playSound("soundname")
my_sound.setVolume(0.5)
```

|Control functions|description|
|-|-|
|my_sound.setVolume(volume)|Changes the playback volume of the sound (value ranging from 0 to 1)|
|my_sound.setPitch(pitch)|Changes the pitch of the sound (1 is default pitch)|
|my_sound.setPan(pan)|Changes the pan setting of the sound (value ranging from -1 to 1)|
|my_sound.stop()|Stops the playback of that sound|

### Play Music
<!--- suggest_start audio.playMusic --->
##### audio.playMusic( name, volume, loop )
Plays the given music, with optional given playback settings.
<!--- suggest_end --->

##### arguments
|Argument|Description|
|-|-|
|name|The name of the music (from the music tab of your project) to play|
|volume|[optional] The output volume for this music playback, ranging from 0 to 1|
|loop|[optional] Set to 1 (true) if you want the music to loop indefinitely|

The function call returns an object. This object allows you to control the playback settings while the music is being played:

##### example
```
my_music = audio.playMusic("musicname")
my_music.setVolume(0.5)
```

|Control functions|description|
|-|-|
|my_music.setVolume(volume)|Changes the playback volume of the music (value ranging from 0 to 1)|
|my_music.stop()|Stops the playback of that music|
|my_music.play()|Resumes the playback is you stopped it before|
|my_music.getPosition()|Returns the current playback position in seconds|
|my_music.getDuration()|Returns the total music duration in seconds|


<!--- suggest_start audio.beep --->
### audio.beep
Plays a sound described by the string passed as a parameter.

```
audio.beep("C E G")
```
<!--- suggest_end --->
More detailed example and explanations in the table below:
```
"saw duration 100 span 50 duration 500 volume 50 span 50 loop 4 C2 C F G G G F end"
```

|Command|Description|
|-|-|
|saw|indicates the type of sound generator (sound color), possible values: saw, sine, square, noise|
|duration|followed by a number of milliseconds indicates the duration of the notes|
|tempo|followed by a number of notes per minute, indicates the tempo|
|span|followed by a number between 1 and 100, indicates the percentage of keeping each note|
|volume|followed by a number between 0 and 100, sets the volume|
|C|or D, E, F etc. indicates a note to be played. It is possible to indicate the octave also, example C5 for the C of the 5th octave of the keyboard.|
|loop|followed by a number, indicates the number of times the following sequence will have to be repeated. The sequence ends with the keyword ```end``` example: ```loop 4 C4 E G end```; the number 0 means that the loop must be repeated indefinitely.

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Cancels all sounds being played by the *beeper*. Useful for muting the sound after having started music loops.
<!--- suggest_end --->

## Sprite methods
Your program can access your project's sprites, which are stored in a predefined object ```sprites```:

```
mysprite = sprites["icon"]
```

You can then access different fields and methods of your sprite:

|field/method|description|
|-|-|
|```mysprite.width```|The width of the sprite in pixels|
|```mysprite.height```|The height of the sprite in pixels|
|```mysprite.ready```|1 when the sprite is fully loaded, 0 otherwise|
|```mysprite.name```|Name of the sprite|

*Note: other fields and native methods may currently seem available when you inspect a sprite object in the console. Such undocumented fields and methods may break in the future, thus do not rely too much on them!*

## Map methods
Your program can access your project's maps, which are stored in a predefined object ```maps```:

```
mymap = maps["map1"]
```

You can then access different fields and methods of your map:

|field/method|description|
|-|-|
|```mymap.width```|The width of the map in cells|
|```mymap.height```|The height of the map in cells|
|```mymap.block_width```|The width of the map cell in pixels|
|```mymap.block_height```|The height of the map cell in pixels|
|```mymap.ready```|1 when the map is fully loaded, 0 otherwise|
|```mymap.name```|Name of the map|
|```mymap.get(x,y)```|Returns the name of the sprite in cell (x,y) ; coordinates origin is (0,0), located at the bottom left of the map. Returns 0 if cell is empty|
|```mymap.set(x,y,name)```|Sets a new sprite in cell (x,y) ; coordinates origin is (0,0), located at the bottom left of the map. Third parameter is the name of the sprite.|
|```mymap.clone()```|Returns a new map which is a full copy of mymap.|

*Note: other fields and native methods may currently seem available when you inspect a map object in the console. Such undocumented fields and methods may break in the future, thus do not rely too much on them!*

## System
The object ```system``` allows to access the function ```time```, which returns the elapsed time in milliseconds (since January 1st, 1970). But above all, invoked at various times, it makes it possible to measure time differences.

<!--- suggest_start system.time --->
### system.time()
Returns the elapsed time in milliseconds (since January 1, 1970)
<!--- suggest_end --->

## Storage
The ```storage``` object allows for the permanent storage of your application data. You can use it to store user progress, highscores or other status information about your game or project.

<!--- suggest_start storage.set --->
### storage.set( name , value )
Stores your value permanently, referenced by the string ```name```. The value can be any number, string, list or structured object.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get( name )
Returns the value permanently recorded under reference string ```name```. Returns ```0``` when no such record exists.
<!--- suggest_end --->
