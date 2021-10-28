# Tutorial

:project Programming

## Variáveis

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Variáveis

Variables are an essential part of programming languages. A variable
is a location in the computer's memory that contains a value and which
is designated by an identifier chosen by the programmer.

During this tutorial, do not hesitate to copy the various examples in the console
or to experiment with your own.

## Variáveis

:navigate projects.code.console

:position 55,30,40,40

### Variáveis

The variables are there to make our job easier! For example, they allow us to
write :

```
furniture = chairs + tables
```

Instead of:

```
memory_514 = memory_23 + memory_1289
```

This last example may sound better to a computer but would be much more difficult
to read for a human!

## Atribuindo um valor a uma variável

:navigate projects.code.console

### Atribuindo um valor a uma variável

Assigning a value to a variable means to request it to hold a value. We use the
sign ```=``` for this, for example:

```
myvariable = 1000
```

In microScript, simply assigning a value to a variable is enough to define it
(i.e. to have a memory slot assigned to it). A variable which hasn't been defined
yet, therefore having no reserved memory slot, will always have the default value ```0```.

## Nomeando variáveis

:navigate projects.code.console

### Nomeie suas variáveis

There are a few rules for naming your variables correctly. In microScript, you should
only use letters of the alphabet, without any accent. You can use them in upper or lower case.
Other characters allowed include the "underscore" character ```_``` and digits from 0 to 9 may
also be used, except for the first character of the variable name.


## Nomeando variáveis

:navigate projects.code.console

### Nomeie suas variáveis

Examples :
```
// correctly named variables

score = 100
Player_1 = 0

// incorrect variables :

2_players = 2 // you can't start with a number!
my character = 3 // spaces not allowed!
```

## Nomeando variáveis

### Nomeie suas variáveis

In addition to these rules, we advise you to choose rather
descriptive variable names. It will make it easier to proofread your code.
For example you'd better use:

```
number_of_carrots = 25
```

rather than:

```
c = 25
```

## Tipos de valores

:navigate projects.code.console

### Tipos de valores

Variables in microScript can store several types of values:

* A number, like 15, 7 or 3.141592
* Some text, which we will call the "string" type (because it is a *string of characters*). Example: 'Hello',
"You win!"...
* A function (studied later in this course). Example: ```function(x) return x*x end```
* A list (studied in the rest of this course). Example: ```[1,3,5,7]``` or ```["dog", "cat", "rabbit"]```.
* An object (studied in the rest of this course). Example: ```object x=1 y=2 end```

## Usando uma variável

### Usando uma variável

A variable can be used in any *expression* of the program and will then be
substituted by its current value at runtime.

```
score = 124
text = "Your score is "
display = text + score
print( display )
```

In the example above, the "print" function displays in the console the value
that is passed to it as a parameter (in parentheses).

The ```+``` operator, when used on a string, operates a
concatenation of character strings (it joins the two text snippets). The value
of the "display" variable above will therefore be "Your score is 124".

## Escopo e contexto

:navigate projects.code.console

### Visibilidade e contexto

The variables we have defined so far are global, i.e. they
belong to a general program memory and can be used anywhere in the program.

We will see during the study of functions and objects that some variables can have
a restricted *visibility* or "scope". For example a function, which is a kind of subprogram,
will be able to define and use a *local variable*, which will only be known in the body
of the function and therefore invisible elsewhere.
