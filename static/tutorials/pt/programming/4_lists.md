# Tutorial

:project Programming

## Lists ##

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Lists

In any programming language, it is useful to be able to gather
information in lists. The lists are modifiable (you can add elements to the list
and remove them). The tutorial on loops will explain how to perform a task
for all the items in a list.

## Definition of a list

:navigate projects.code.console

:position 55,30,40,40

### Creating a list

In *microScript*, a list is defined as follows:

```
prime_numbers = [1,3,5,7,11,13,17]
animals = [ "Cat", "Dog", "Rabbit" ]
```

Note that square brackets are used to delimit the list and commas to separate
the items in the list. The items in a list can be any
*microScript* value: numbers, texts, functions, lists (!), objects.

## Empty list

:navigate projects.code.console

:position 55,30,40,40

### Empty list

An empty list is defined as follows:

```
list = []
```

## Add an item

:navigate projects.code.console

:position 55,30,40,40

### Add an item


You can add elements with the member function "push".

```
list.push("element 1")
```

The push function adds the item to the end of the list.

## Insert an element

:navigate projects.code.console

:position 55,30,40,40

### Insert an item

You can insert an item at the beginning of a list by using the member function "insert".

```
list.insert("element 2")
```

## Length of a list

:navigate projects.code.console

:position 55,30,40,40

### Length of a list

The length of a list (the number of items) can be found with the member field ```length```:

```
print( "The length of the list is " + list.length )
```

## Access to list items

:navigate projects.code.console

:position 55,30,40,40

### Access to the elements

The items in a list are indexed starting from 0. You can then access
to each item in a list using their indices:

```
list[0]
list[1]
```

## Modify an item

:navigate projects.code.console

:position 55,30,40,40

### Edit an item

You can modify an item in the list by referencing it with its index:

```
list[0] = "other element"
```

If the element does not yet exist, it is created :

```
list[2] = "new element"
```

## To know the index of an element

:navigate projects.code.console

:position 55,30,40,40

### Item index

The index of an element, i.e. its location in the list, can be found with the function
member "indexOf" :

```
list.indexOf("new element")
```

## Remove an item

:navigate projects.code.console

:position 55,30,40,40

### Remove an item

You can remove an item from the list if you know its index:

```
list.remove(1)
```

(removes element at index 1, which actually is the second element!)

## Lists

:navigate projects.code.console

:position 55,30,40,40

### Lists

Lists are a very powerful tool! You will see later in this course how they can work together with loops.
Let's move on to the next tutorial.
