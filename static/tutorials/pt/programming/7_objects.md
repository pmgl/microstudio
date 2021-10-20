# Tutorial

:project Programming

## Objects

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Objects

Objects in microScript can be compared to objects in real life. An object is
an entity which has a set of properties. It can be assigned to a variable, passed
as an argument to a function etc.

The properties of an object can be seen as sub-variables, variables that are internal
to the object.

## Object

:navigate projects.code.console

:position 55,30,40,40

### Create an object

Creating an object starts with keyword ```object```. The object definition
is closed with ```end```:

```
myChair = object
  legs = 4
  color = "white"
  material = "wood"
end
```

Copy the code above. You can change the properties and add some to match your own chair.

## Access object properties

:navigate projects.code.console

:position 55,30,40,40

### Accessing object properties

Once you have created your object, you can access its properties as follows:

```
myChair.legs
myChair.material
```

Copy the above example and see the result. You can also try other
properties.

## Set object properties

:navigate projects.code.console

:position 55,30,40,40

### Setting object properties

You can change properties and set new ones to your chair object:

```
myChair.color = "red"
myChair.wheels = 5
```

Check how your object looks now, just type:

```
myChair
```

## Set object properties

:navigate projects.code.console

:position 55,30,40,40

### Other ways to access object properties

You can also access object properties by using brackets and a string value holding
the name of the property:

```
myChair["color"] = "blue"
```

This is also allowed:

```
property_to_change = "color"
myChair[property_to_change] = "yellow"
```

Note that unlike variables, properties can be any string value, thus accents, spaces or
special characters are allowed in their names. Thus it is ok to write:

```
myChair["% of wood"] = 50
```

Because of how code syntax analysis works, you wouldn't be allowed to write this though:

```
myChair.% of wood = 50 // this doesn't make sense for microScript syntax parser
```

## Types of properties

:navigate projects.code.console

:position 55,30,40,40

### Type of properties

The properties of an object can be any valid microScript value: string, number, list, object, function.
Let's keep playing with objects:

```
myRoom = object
  furniture = []
  size = "large enough"
end
```

Now we may "connect" our two objects:

```
myRoom.furniture.push(myChair)
myChair.location = myRoom
```

## Member function

:navigate projects.code.console

:position 55,30,40,40

### Member function

You can set an object property to be a function:

```
myRoom.addFurniture = function(piece)
  furniture.push(piece)
end
```

Note that when the function will be called explicitly *on* the object, it will operate
in the object's scope. Thus the variable ```furniture``` above correctly refers to the property
```myRoom.furniture```. Let's call then:

```
myRoom.addFurniture(object
  name = "table"
  legs = 4
end)
```

Now we can check:

```
myRoom.furniture[0]
myRoom.furniture[1]
```


## Iteration

:navigate projects.code.console

:position 55,30,40,40

### Iterating on the object properties

You can iterate on the object properties with a ```for``` loop as follows:

```
for prop in myChair
  print(prop + " = " + myChair[prop])
end
```

The code above will print out the name and value of all the properties of our
object stored in variable ```myChair```.

## End

:navigate projects.code.console

:position 55,30,40,40

### The end!

We have reached the end of this programming course. When looking for more details,
make sure to look in the documentation tab of microStudio. You may also relaunch
one or the other of these shorts tutorials whenever you feel the need to.

It is time to build your first microStudio project! You may want to check the tutorial
"First Project", or visit the Explore section to check other projects and see how they
were coded.
