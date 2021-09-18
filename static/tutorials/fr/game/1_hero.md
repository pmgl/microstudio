# Tutorial

:project Tutoriel: Créer un jeu

## Introduction

:position 30,30,40,40

:overlay

### Créer un jeu

Dans cette série de tutoriels, nous allons créer un jeu simple mais complètement fonctionnel,
en moins de 70 lignes de code.

Cette série suppose que vous avez déjà suivi la série de tutoriels sur la programmation.

En suivant ce tutoriel, vous pouvez laisser votre jeu tourner continuellement, vous le verrez
s'améliorer en temps réel.

Voici un exemple de ce à quoi votre jeu final pourra ressembler :

https://microstudio.io/gilles/skaterun/

## Héros

:position 50,50,40,40

:highlight #menuitem-sprites

### Héros

Notre jeu a besoin d'un héros. Allez dans l'onglet Sprites et cliquez sur "Ajouter un sprite".

Assurez-vous de renommer le sprite "hero", cela sera utile plus tard. Vous pouvez alors
commencer à dessiner votre sprite. Vous pouvez y passer autant de temps que vous le souhaitez.
Vous pouvez même le rendre animé, en ouvrant le panneau d'animation qui se trouve en bas de la fenêtre
et en ajoutant des étapes d'animation.

## Code initial

:highlight #menuitem-code

### Code initial

Nous allons maintenant commencer à coder pour afficher notre héros à l'écran. Cliquez sur l'onglet Code.

Pour le moment, notre code ressemble à ceci :

```
init = function()
end

update = function()
end

draw = function()
end
```

```init```, ```update``` et ```draw``` sont les trois fonctions clé à connaître avec microStudio.

```init``` est appelée une seule fois, lorsque votre jeu démarre. Nous l'utiliserons bientôt pour initialiser quelques variables globales.

```update``` est appelée exactement 60 fois par seconde lorsque votre jeu est en cours d'exécution. Nous l'utiliserons également plus tard, pour y implémenter l'animation, la physique et la logique du jeu.

```draw``` est appelée à chaque fois que l'écran peut être redessiné. Nous allons commencer tout de suite à implémenter cette fonction.


## Dessiner l'arrière-plan

###  Dessiner l'arrière-plan

Nous allons ajouter une ligne au corps de la fonction draw :

```
draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")
end
```

## Exécuter

:highlight #run-button

### Lancer le programme

Cliquez sur le bouton d'Exécution pour démarrer le programme.

La ligne que nous avons ajoutée remplit un rectangle, centré sur l'écran et qui s'étend jusqu'aux bords de l'écran.
Le cinquième paramètre est la couleur. Cliquez dessus et maintenez la touche CTRL du clavier enfoncée pour pouvoir choisir une autre couleur
à l'aide du sélecteur de couleur !

## Affichage du héros

### Affichage du héros

Ajoutez la ligne suivante, dans le corps de la fonction draw, après l'appel à ```screen.fillRect``` :

```
  screen.drawSprite("hero",-80,-50,20)
```

Cette ligne dessine notre sprite "hero" à l'écran. Si rien ne s'affiche, vérifiez que le programme est bien
en cours d'exécution et que vous avez bien renommé ce sprite "hero".

Votre code complet devrait ressembler à ceci maintenant :

```
init = function()
end

update = function()
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")
  screen.drawSprite("hero",-80,-50,20)
end
```

## La suite

### La suite

Continuons avec le tutoriel suivant où nous créerons un mur sur lequel notre héros est
en train de courir.
