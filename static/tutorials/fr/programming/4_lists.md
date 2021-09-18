# Tutorial

:project Programmation

## Les listes

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Les listes

Dans tout langage de programmation, il est utile de pouvoir rassembler des
informations dans des listes. Les listes sont modifiables (on peut ajouter des éléments
et en enlever). Le tutoriel sur les boucles expliquera comment effectuer un traitement
sur tous les éléments d'une liste.

## Définition d'une liste

:navigate projects.code.console

:position 55,30,40,40

### Création d'une liste

En *microScript*, une liste se définit comme suit :

```
nombres_premiers = [1,3,5,7,11,13,17]
animaux = ["chat","chien","lapin"]
```

Notez que les crochets pour délimiter la liste et les virgules pour séparer
les éléments de la liste. Les éléments d'une liste peuvent être n'importe quelle
valeur *microScript* : nombres, textes, fonctions, listes (!), objets.

## Liste vide

:navigate projects.code.console

:position 55,30,40,40

### Liste vide

Une liste vide se définit comme suit :

```
liste = []
```

## Ajouter un élément

:navigate projects.code.console

:position 55,30,40,40

### Ajouter un élément


On peut y ajouter des éléments avec la fonction membre ```push```

```
liste.push("élément 1")
```

La fonction ```push``` ajoute les éléments à la fin de la liste.

## Insérer un élément

:navigate projects.code.console

:position 55,30,40,40

### Insérer un élément

On peut insérer un élément au début de a liste en utilisant la fonction membre  ```insert```

```
liste.insert("élément 2")
```

## Longueur d'une liste

:navigate projects.code.console

:position 55,30,40,40

### Longueur d'une liste

On peut connaître la longueur d'une liste (le nombre d'éléments) avec le champ
membre ```length``` :

```
print( "La longueur de la liste est " + liste.length )
```

## Accès aux éléments de la liste

:navigate projects.code.console

:position 55,30,40,40

### Accès aux éléments

Les éléments d'une liste sont numérotés en partant de 0. On peut alors accéder
à chaque élément d'une liste avec l'écriture suivante :

```
liste[0]
liste[1]
```

## Modifier un élément

:navigate projects.code.console

:position 55,30,40,40

### Modifier un élément

On peut modifier un élément de la liste en le référençant avec son numéro :

```
liste[0] = "autre élément"
```

Si l'élément n'existe pas encore, il est créé :

```
liste[2] = "nouvel élément"
```

## Connaître l'indice d'un élément

:navigate projects.code.console

:position 55,30,40,40

### Indice d'un élément

L'indice d'un élément, c'est à dire son numéro, peut être trouvé avec la fonction
membre ```indexOf``` :

```
liste.indexOf("nouvel élément")
```

## Enlever un élément

:navigate projects.code.console

:position 55,30,40,40

### Enlever un élément

On peut enlever un élément de la liste si on connaît son indice (son numéro) :

```
liste.remove(1) // retire l'élément d'indice 1... c'est à dire le deuxième élément
```

## Listes

:navigate projects.code.console

:position 55,30,40,40

### Listes

Les listes sont un outil très utile dont vous comprendrez mieux l'intérêt lorsque
nous étudierons les boucles. Il est temps de passer au tutoriel suivant !
