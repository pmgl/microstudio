# Tutorial

:project Programming

## Conditions

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Conditions

Conditions or *conditional statements*
are the opportunity for the program to make decisions.
It is about testing a hypothesis and making
different operations depending on whether the result is true or false.


## Vocabulary

:navigate projects.code.console

:position 55,30,40,40

### Vocabulary

Conditional statements are built with the keywords ```if```,
```then```, ```else```, ```end```.


## Simple condition

:navigate projects.code.console

:position 55,30,40,40

### Simple condition

Let's define the following function:

```
test = function(number)
  if number<0 then
    print( "the number is negative" )
  end
end
```

This function accepts a number as an argument. It tests *if* the number is less than
zero. If true, *then* the instruction ```print("the number is negative")``` is executed.
The first "end" closes the "if" condition. The second "end" closes the definition of
our function.

## Simple condition

:navigate projects.code.console

:position 55,30,40,40

### Simple condition

Let's test our function! Try for example :

```
test(10)
test(-5)
test(0)
test(-100)
```

## Simple condition

:navigate projects.code.console

:position 55,30,40,40

### What else?

The keyword ```else``` allows you to execute a sequence of operations when the condition
tested by the "if" statement is false. For example:

```
test = function(number)
  if number<0 then
    print( "the number is negative" )
  else
    print( "The number is positive" )
  end
end
```

## Simple condition

:navigate projects.code.console

:position 55,30,40,40

### Positive or negative?

Let's test some values again:

```
test(1)
test(-15)
```

## Simple condition

:navigate projects.code.console

:position 55,30,40,40

### Any other options?

*microScript* proposes a last keyword ```elsif``` which is a contraction of *else*
and *if*. It literally means "and else if" and therefore allows for a series of tests
to isolate more than two different possibilities. For example:

```
test = function(number)
  if number<0 then
    print( "the number is negative" )
  elsif number == 0 then
    print( "The number is zero")
  else
    print( "The number is positive" )
  end
end
```

## Simple condition

:navigate projects.code.console

:position 55,30,40,40

### More possibilities

Our code is now able to differentiate 3 cases: negative number, zero, or none of
these, i.e. the number is strictly greater than zero (strictly positive). Let's test it!

```
test(0)
test(-15)
test(12)
```

## Simple condition

:navigate projects.code.console

:position 55,30,40,40

### Check your code!

When you write a conditional expression, be careful not to forget
the keyword ```then``` after every ```if``` and every ```elsif```.

Also, don't forget to *close* the conditional expression with ```end```. Each
```if``` statement should have exactly one matching ```end```.
