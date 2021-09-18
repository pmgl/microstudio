# Tutorial

:project Programmation

## Boucles

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Les boucles

Les boucles permettent de répéter les mêmes instructions un grand
nombre de fois. Elles sont utiles par exemple pour effectuer un traitement
sur tous les éléments d'une liste, ou pour répéter un travail jusqu'à ce
qu'une condition particulière soit remplie.

## Boucle ```for```

:navigate projects.code.console

:position 55,30,40,40

### Boucle ```for```

Le mot-clé ```for``` permet de créer une boucle avec une variable dont la valeur
va changer à chaque répétition de la boucle. Exemple :

```
for i=1 to 10
  print(i)
end
```

Dans la boucle ci-dessus, la variable i va prendre successivement les valeurs
1, 2, 3 ... jusqu'à 10. Pour chacune de ces valeurs, la fonction ```print(i)``` sera
appelée. Comme les ```function``` et les ```if```, une boucle doit être refermée avec
le mot-clé ```end```

## Boucle ```for```

:navigate projects.code.console

:position 55,30,40,40

### Boucle ```for```

Le mot-clé ```by``` permet de définir l'*incrément* utilisé pour chaque itération,
c'est à dire de combien la valeur de la variable d'itération doit être augmentée :

```
for i=1 to 10 by 2
  print(i)
end
```

Copiez l'exemple ci-dessus et constatez le résultat. Vous pouvez aussi essayer d'autres
valeurs.

## Boucle ```for```

:navigate projects.code.console

:position 55,30,40,40

### Boucle ```for```

Voici comment faire un compte à rebours en bonne et due forme !

```
for i=10 to 0 by -1
  print(i)
end
```

## Itération sur une liste

:navigate projects.code.console

:position 55,30,40,40

### Itération sur une liste

Voici comment effectuer un traitement répété sur tous les éléments d'une liste avec
```for``` suivi du mot-clé ```in``` :

```
liste = ["chien","chat","souris"]

for animal in liste
  print(animal)
end
```

On parle alors de faire une *itération* sur la liste.

## Tant que

:navigate projects.code.console

:position 55,30,40,40

### Répéter tant que (...)

L'instruction ```while``` permet de répéter une séquence d'opérations tant qu'une
condition reste vraie. Exemple :

```
i = 1

while i<1000
  print(i)
  i = i*2
end
```

Les opérations de la boucle ci-dessus seront répétées tant que la variable i reste
inférieure à 1000. Dès que la condition n'est plus remplie, l'exécution sort de la boucle
et exécute la suite du programme.


## Attention

:navigate projects.code.console

:position 55,30,40,40

### Précautions

Lorsque vous écrivez une boucle ```for``` ou ```while``` n'oubliez pas de la refermer
avec le mot-clé ```end```. Posez-vous aussi la question de la condition d'arrêt :
est-ce que ma boucle va bien s'arrêter ? Attention de ne pas créer de boucle perpétuelle,
comme celle ci-dessous :

```
i = 1

while i<1000
  print(i)
end
```

Dans l'exemple ci-dessus, la boucle ne s'arrêtera jamais, puisque rien ne fait
changer la valeur de i dans le corps de la boucle. *microScript* vous avertira
avec une erreur ```Timeout```.
