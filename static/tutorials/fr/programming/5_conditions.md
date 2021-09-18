# Tutorial

:project Programmation

## Conditions

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Conditions

Les conditions ou *expressions conditionnelles*,
représentent la possibilité pour le programme de prendre des décisions.
Il s'agit de tester une hypothèse et d'effectuer des
opérations différentes selon que le résultat est vrai ou faux.


## Vocabulaire

:navigate projects.code.console

:position 55,30,40,40

### Vocabulaire

Les expressions conditionnelles se construisent avec les mots-clé ```if```,
```then```, ```else```, ```end```.

|mot-clé|signification|
|-|-|
|```if```|"si" ; suivi d'une hypothèse ou *condition*|
|```then```|"alors" ; suivi des instructions à exécuter si la condition est vraie|
|```else```|"sinon" ; suivi des instructions à exécuter si la condition est fausse|
|```end```|"fin" ; permet de fermer l'expression conditionnelle|

## Condition simple

:navigate projects.code.console

:position 55,30,40,40

### Condition simple

Définissons la fonction suivante :

```
test = function(nombre)
  if nombre<0 then
    print("le nombre est négatif")
  end
end
```

Cette fonction accepte un nombre en paramètre. Elle teste *si* (```if```) le nombre est inférieur
à zéro. Si oui, *alors* (```then```) l'instruction ```print("le nombre est négatif")``` est exécutée.
Le premier ```end``` ferme la condition ```if```. Le second ```end``` ferme notre définition de
fonction.

## Condition simple

:navigate projects.code.console

:position 55,30,40,40

### Condition simple

Testons notre fonction ! Essayez par exemple :

```
test(10)
test(-5)
test(0)
test(-100)
```

## Condition simple

:navigate projects.code.console

:position 55,30,40,40

### Et sinon ?

Le mot clé ```else``` permet d'exécuter une suite d'opérations différentes dans le cas
ou la condition testée par le ```if``` est fausse. Exemple :

```
test = function(nombre)
  if nombre<0 then
    print("le nombre est négatif")
  else
    print("Le nombre est positif")
  end
end
```

## Condition simple

:navigate projects.code.console

:position 55,30,40,40

### Positif ou négatif ?

Testons à nouveau quelques valeurs :

```
test(1)
test(-15)
```

## Condition simple

:navigate projects.code.console

:position 55,30,40,40

### Et sinon si ?

*microScript* propose un dernier mot-clé ```elsif``` qui est une contraction de *else*
et *if*. Il signifie littéralement "Et sinon si ?" et permet donc d'enchaîner les tests
pour isoler plus de deux possibilités différentes. Exemple :

```
test = function(nombre)
  if nombre<0 then
    print("le nombre est négatif")
  elsif nombre<10 then
    print("Le nombre est positif mais inférieur à 10")
  else
    print("Le nombre est positif et supérieur ou égal à 10")
  end
end
```

## Condition simple

:navigate projects.code.console

:position 55,30,40,40

### 3 possibilités

Notre code est maintenant capable de distinguer 3 cas : nombre négatif, nombre positif
inférieur à 10, ou ... les possibilités restantes, c'est à dire un nombre supérieur ou
égal à 10. Testons !

```
test(1)
test(-15)
test(12)
```

## Condition simple

:navigate projects.code.console

:position 55,30,40,40

### Attention aux oublis

Lorsque vous écrivez une expression conditionnelle, attention de ne pas oublier
le mot-clé ```then``` après chaque ```if``` et chaque ```elsif```.

De même, n'oubliez pas de *fermer* l'expression conditionnelle avec ```end```. A chaque
```if``` correspond exactement un ```end```.
