# Tutorial

:project Programmation

## Objets

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Objets

Les objets en microScript peuvent être comparés aux objets dans la vie réelle. Un
objet est une entité qui a un ensemble de propriétés. Il peut être assigné à une
variable, passé en paramètre à une fonction etc.

Les propriétés d'un objet peuvent être considérées comme des sous-variables, des variables
qui sont internes à l'objet.

## Objet

:navigate projects.code.console

:position 55,30,40,40

### Créer un objet

La création d'un objet commence avec le mot-clé ```object```. La définition de l'objet
est fermée avec un ```end```.

```
maChaise = object
  pieds = 4
  couleur = "blanche"
  style = "bois"
end
```

Copiez le code ci-dessus. Vous pouvez changer la valeur des propriétés ou en ajouter,
pour que cette chaise ressemble à la vôtre.

## Accéder aux propriétés de l'objet

:navigate projects.code.console

:position 55,30,40,40

### Accéder aux propriétés de l'objet

Une fois que votre objet est créé, vous pouvez accéder à ses propriétés comme suit :

```
maChaise.pieds
maChaise.style
```

Copiez les exemples ci-dessus et constatez le résultat. Vous pouvez aussi essayer
avec d'autres propriétés.

## Assigner des propriétés à un objet

:navigate projects.code.console

:position 55,30,40,40

### Assigner des propriétés à un objet


Vous pouvez modifier les propriétés d'un objet ou en définir de nouvelles:

```
maChaise.couleur = "rouge"
maChaise.roues = 5
```

Regardez maintenant à quoi ressemble votre objet, tapez juste :

```
maChaise
```

## Set object properties

:navigate projects.code.console

:position 55,30,40,40

### Autres moyens d'accéder aux propriétés d'un objet

Vous pouvez également accéder aux propriétés d'un objet en utilisant des crochets
et une valeur de type *chaîne de caractères* (string) qui contient le nom de la propriété :

```
maChaise["couleur"] = "bleue"
```

Ceci est aussi autorisé :

```
prop = "couleur"
maChaise[prop] = "jaune"
```

Notez que contrairement aux variables, le nom des propriétés peut être n'importe
quelle chaîne de caractères, donc les accents, espaces ou caractères spéciaux sont
autorisés dans leurs noms. Il est donc acceptable d'écrire :

```
maChaise["% de bois"] = 50
```

Cependant, en raison du fonctionnement de l'analyseur syntaxique, vous ne pouvez pas écrire
ceci :

```
maChaise.% de bois = 50 // ceci n'est pas compréhensible par l'analyseur syntaxique microStudio
```

## Types de propriétés

:navigate projects.code.console

:position 55,30,40,40

### Types de propriétés

Les propriétés d'un objet peuvent avoir n'importe quelle valeur microScript : un nombre,
une *chaîne de caractères*, une liste, un objet, une fonction.
Jouons encore avec les objets :

```
maChambre = object
  meubles = []
  taille = "assez grande"
end
```

Maintenant nous pouvons créer une relation entre nos deux objets :

```
maChambre.meubles.push(maChaise)
maChaise.chambre = maChambre
```

## Fonction membre

:navigate projects.code.console

:position 55,30,40,40

### Fonction membre

Vous pouvez ajouter une fonction comme propriété d'un objet :

```
maChambre.ajouterMeuble = function(meuble)
  meubles.push(meuble)
end
```

Notez que lorsque la fonction sera appelée explicitement *sur* l'objet, elle va opérer
dans le champ de l'objet. Dès lors, la variable ```meubles``` ci-dessus fera correctement
référence à la propriété ```meubles``` de l'objet sur lequel est appelée la fonction.
Appelons donc :

```
maChambre.ajouterMeuble(object
  nom = "table"
  pieds = 4
end)
```

Maintenant nous pouvons vérifier

```
maChambre.meubles[0]
maChambre.meubles[1]
```

## Iteration

:navigate projects.code.console

:position 55,30,40,40

### Itération sur les propriétés d'un objet

Vous pouvez parcourir les propriétés d'un objet avec une boucle ```for``` comme suit :

```
for prop in maChaise
  print(prop + " = " + maChaise[prop])
end
```

Le code ci-dessus va afficher le nom et la valeur de toutes les propriétés de
votre objet enregistré dans la variable ```maChaise```.

## Fin

:navigate projects.code.console

:position 55,30,40,40

### The end!

Nous avons atteint la fin de cette série sur la programmation. Lorsque vous recherchez
plus de détails, pensez à consulter la documentation de microStudio. Vous pouvez aussi
refaire tel ou tel tutoriel pour vous rafraîchir la mémoire si le besoin s'en fait
ressentir.

Il est temps pour vous de créer votre premier projet microStudio ! Vous pouvez essayer
le tutoriel intitulé "Premier Projet" ou visiter la section Exploration pour découvrir
d'autres projets et voir comment ils sont codés.
