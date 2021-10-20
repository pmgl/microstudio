# Tutorial

:project Programming

## Loops

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Loops

A loop is a special programming pattern allowing you to repeat a set of instructions
many times. Loops can be useful in order to perform a treatment
on all the items in a list, or to repeat a job until
a particular condition is met.

## ```for``` loop

:navigate projects.code.console

:position 55,30,40,40

### ```for``` loop

The keyword ```for``` allows you to create a loop with a variable which value
will change with each replay of the loop. For example:

```
for i=1 to 10
  print(i)
end
```

In the above loop, the variable ```i``` will successively take the values
1, 2, 3... up to 10. For each of these values, the function ```print(i)``` will be
invoked. Like a ```function``` or a ```if```, a loop must be closed with
the keyword ```end```.

## Loop ```for``` loop

:navigate projects.code.console

:position 55,30,40,40

### Increment

The keyword ```by``` allows to define the *increment* used for each iteration,
i.e. by how much the value of the iteration variable must be increased:

```
for i=1 to 10 by 2
  print(i)
end
```

Copy the above example and see the result. You can also try other
values.

## Increment

:navigate projects.code.console

:position 55,30,40,40

### Increment

Here's how to do a proper countdown!

```
for i=10 to 0 by -1
  print(i)
end
```

## Iteration on a list

:navigate projects.code.console

:position 55,30,40,40

### Iteration on a list

Here is how to perform repeated processing on all items in a list with
```for``` followed by the keyword ```in```:

```
list = [ "dog", "cat", "mouse" ]

for animal in list
  print(animal)
end
```

This is called *iterating* over a list.

## As long as

:navigate projects.code.console

:position 55,30,40,40

### Repeat as long as (...)

The instruction ```while``` allows you to repeat a sequence of operations as long as a
condition remains true. For example:

```
i = 1

while i<1000
  print(i)
  i = i*2
end
```

The operations in the above loop will be repeated as long as variable i remains
lower than 1000. As soon as the condition is no longer met, the execution exits the loop
and continues execution of the rest of the program.


## Caution

:navigate projects.code.console

:position 55,30,40,40

### Caution

When you write a ```for``` or ```while``` loop, don't forget to close it
with the keyword ```end```. Also ask yourself about the stop condition:
is my loop going to stop at some point? Be careful not to create an infinite loop,
such as the one below:

```
i = 1

while i<1000
  print(i)
end
```

In the above example, the loop will never stop, since nothing will
change the value of ```i``` in the body of the loop. *microScript* will warn you
with a time-out error.
