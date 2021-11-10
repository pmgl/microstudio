# Tutorial

:project Programming

## Functions ##

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Functions

A function is a subprogram that performs a well-defined task and
that may return a result. Functions allow you to better structure your
program.

During this tutorial, do not hesitate to copy the various examples in the console
or to experiment with your own.

## Calling a function

:navigate projects.code.console

:position 55,30,40,40

### Calling a function

To call a function (i.e. to execute the subprogram), you write
its identifier then a list of arguments in parentheses. For example,
in microScript, the predefined function ```max``` returns the greater of two
numbers:

```
max(12,17)
```

There are many other predefined functions, which you will find listed
in the documentation.

## Calling a function

:navigate projects.code.console

:position 55,30,40,40

### The *print* function

The ```print``` function writes to the console the value passed to it as an argument.
It can be useful to verify that the program acts as expected and produces
good results.

For example:

```
print( "The maximum between 12 and 17 is "+ max(12,17) )
```

There are many other useful functions to know about. But first and foremost,
we're going to learn how to create our own functions.

## Create a function

:navigate projects.code.console

### Define a function

Here's how to define a function yourself that you can use afterwards
in your code. Write down:

```
average = function(x,y)
  return (x+y)/2
end
```

Above, we assign a value to the variable ```average```. This value is
a function, which accepts two arguments ```x``` and ```y```. The subprogram is very simple,
it returns the result of the calculation ```(x+y)/2```. To *close* the definition of the function, you must
simply use the keyword ```end```.

## Using our function

:navigate projects.code.console

### Using our function

We can now use our "average" function. Write:

```
average(14,16)
```

or

```
average(10,13)
```

## Arguments

:navigate projects.code.console

### Values passed as arguments

Values passed as arguments to a function can be any *expression*,
i.e. a number, a variable, a calculation, another function call. We can therefore write :

```
average( 10+2 , 8+5 )
```

or again:

```
average( average( 5,18 ) , average( 11,20 ) )
```

## Local variables

:navigate projects.code.console

### Local variable

A function can use local variables. As their name tell us, these variables only exist
in the context of the function in which they are defined, and are probably unknown outside of it. Their *visibility*, or *scope*,
is limited to the body of the function.

For example:

```
sumSquares = function(a,b)
  local sum = 0
  sum = sum + a*a
  sum = sum + b*b
  return sum
end
```

## Local variables

:navigate projects.code.console

### Local variable

Our function "sumSquares" returns the sum of the squared values of its two arguments. Let's try this:

```
sumSquares(3,4)
```

The result returned by the function is displayed. Now let's check the value of the variable ```sum``` :

```
sum
```

Having exited the execution context of the function, the local variable ```sum``` is no longer
defined and therefore has the default value ```0```. It does not exist in the *global context*.
Let's check that right now:

```
global
```

We have just displayed the global context, i.e. the content of the computer's memory.
We can see there all the variables we have defined, in particular the functions that we
have created in this tutorial.

## End

:navigate projects.code.console

### Functions

We have just learnt the basics about the functions! We will now discuss
in the next chapters of this course:

* How to create and use lists
* How to make choices with "if" conditions
* How to repeat tasks with the "for" and "while" loops.
