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
