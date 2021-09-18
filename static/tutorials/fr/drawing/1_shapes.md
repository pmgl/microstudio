# Tutorial

:project Tutoriel: Dessiner

## Dessiner

:position 30,30,40,40

:overlay

### Dessiner

Dans microStudio, vous pouvez considérer l'écran d'ordinateur comme un tableau à dessin.
Vous pourrez y dessiner des formes, du texte, des lignes, des polygones, des images (sprites) et
des maps, depuis votre code, en appelant des fonctions prédéfinies.

Commençons par dessiner quelques formes !

## Rectangle

### Dessiner un rectangle

:position 50,50,40,40

Pour ce tutoriel, vous pouvez effacer tout le code par défaut dans la fenêtre de code.
Il suffit maintenant de commencer par la ligne de code suivante :

```
screen.fillRect(0,0,50,50,"#F00")
```

## Rectangle

### Dessiner un rectangle

:position 50,50,40,40

:highlight #run-button

Cliquez sur le bouton "Exécuter". Votre programme démarre et vous verrez qu'il dessine un
carré au centre de la fenêtre d'exécution. Regardons de plus près le code :

* ```screen``` est l'objet de base représentant l'écran
* ```fillRect``` est une fonction membre de ```screen```, qui remplit un rectangle, à des coordonnées données, avec la couleur donnée
* ```0,0,50,50``` sont les coordonnées du dessin dans cet ordre : 0,0 sont les coordonnées x et y du centre de notre rectangle ; 50,50 sont la largeur et la hauteur de notre rectangle.
* ```"#F00"``` définit la couleur comme étant le rouge. Vous en apprendrez plus sur les couleurs dans le prochain tutoriel.


## Rectangle

### Dessiner un rectangle

:position 50,50,40,40

Pour mieux comprendre votre code, vous pouvez commencer à jouer avec les valeurs : cliquez dans votre code
sur l'une des valeurs (```0,0,50,50```) puis maintenez la touche CTRL de votre clavier d'ordinateur enfoncée. Un curseur
apparaîtra, utilisez-le pour modifier la valeur et voir comment elle affecte le rectangle dessiné dans la
fenêtre d'exécution.

Vous pouvez également cliquer sur la couleur ```"#F00"``` et maintenir la touche CTRL enfoncée pour choisir d'autres couleurs.

## Coordonnées de l'écran

### Coordonnées de l'écran

Dans *microStudio*, le système de coordonnées a pour origine le centre de l'écran. Ainsi, le centre
de l'écran a les coordonnées 0,0. En mode portrait, la coordonnée x varie de -100 (point le plus à gauche) à +100 (point le plus à droite).
En mode paysage, la coordonnée y varie également de -100 à 100. Ceci est illustré ci-dessous :

![Coordonnées de l'écran](/doc/img/screen_coordinates.png "Coordonnées de l'écran")

Ce système de coordonnnées vous aidera à adapter facilement la taille des éléments que vous dessinez, quelle que soit la
résolution physique en pixels de l'écran sur lequel est affiché votre programme.

## Contour du rectangle

### Dessiner le contour d'un rectangle

:position 50,50,40,40

Vous pouvez dessiner le contour d'un rectangle en changeant notre code comme suit :

```
screen.drawRect(0,0,50,50,"#F00")
```

Avant de dessiner des contours ou des lignes, vous pouvez utiliser ```screen.setLineWidth``` pour définir
l'épaisseur des lignes. La largeur de ligne par défaut est de 1.

```
screen.setLineWidth(4)
screen.drawRect(0,0,50,50,"#F00")
```

## Formes rondes

### Dessiner des cercles ou des ellipses

:position 50,50,40,40

De même, vous pouvez dessiner une forme ronde (cercle, ellipse selon la taille utilisée) en utilisant ```fillRound``` ou ```drawRound```. Exemples :

```
screen.fillRound(0,0,50,50,"#F00")
```

ou

```
screen.drawRound(0,0,50,50,"#FFF")
```


## Rectangle arrondi

### Rectangle arrondi

:position 50,50,40,40

Vous pouvez dessiner des rectangles "arrondis" avec ```fillRoundRect``` et ```drawRoundRect```. Les coins de votre rectangle
seront arrondis. Il y a un paramètre supplémentaire ici, qui définit le rayon de courbure utilisé. Essayez par exemple :

```
screen.fillRoundRect(0,0,50,50,10,"#F00")
```

ou

```
screen.drawRoundRect(0,0,50,50,10,"#FFF")
```

Le rayon de courbure dans les exemples ci-dessus est 10. Vous pouvez changer cette valeur et voir comment cela affecte le rendu.


## Et maintenant les couleurs

### Il est temps d'en apprendre plus sur les couleurs !

Vous pouvez continuer avec le tutoriel suivant, qui vous apprendra comment utiliser les couleurs.
