# Tutorial

:project Tutoriel: Premier projet

## Premier projet

:position 30,30,40,40

:overlay

### Premier projet

Votre premier projet est déjà initialisé ! Vous allez créer un personnage et
programmer microStudio pour qu'il s'affiche à l'écran et se déplace avec les
touches de votre clavier.


## Créer un sprite

### Créer un sprite

Cliquez sur **Sprites** pour accéder à l'éditeur de sprites.

:highlight #projectview .sidemenu #menuitem-sprites

:auto


## Créer un sprite 2

### Créer un sprite

Cliquez sur le bouton "Ajouter un sprite" pour créer un nouveau sprite.

:navigate projects.sprites

:highlight #create-sprite-button

:auto


## Dessiner un sprite

:navigate projects.sprites

:position 0,50,30,40

### Dessinez un personnage

Utilisez les outils de dessin à droite de l'écran pour dessiner votre personnage.
Vous pouvez y passer le temps que vous voulez!

Lorsque votre sprite est prêt, passez à l'étape suivante.


## Code 1

### Code

Cliquez maintenant sur **Code**, nous allons programmer un peu!

:highlight #projectview .sidemenu #menuitem-code

:auto


## Code

:navigate projects.code

:position 55,30,45,40

### Code

Le code de votre projet est prérempli avec la définition de trois fonctions :
```init```, ```update``` et ```draw```. Nous allons travailler sur le contenu
de la fonction ```draw```. Ajoutez la ligne suivante entre la ligne
```draw = function()``` et la ligne ```end```:

```
  screen.drawSprite("sprite",0,0,20)
```

Votre code ressemble donc à ceci:

```
draw = function()
  screen.drawSprite("sprite",0,0,20)
end
```

## Exécuter

:navigate projects.code

:position 55,55,45,40

### Exécution

Allez faisons un essai ! Cliquez sur le bouton play pour lancer
votre programme.

:highlight #run-button

:auto

## Exécuter

:navigate projects.code

:position 55,55,45,40

### Exécution

Votre personnage s'affiche au milieu de l'écran dans la vue d'exécution. La ligne de code
que nous avons ajoutée appelle la fonction ```drawSprite``` (dessiner le sprite) sur l'objet
```screen``` (l'écran). Elle donne en paramètres le nom du sprite à afficher ```"sprite"```,
les coordonnées x et y où l'afficher (0,0 est le centre de l'écran) et la taille d'affichage (20).

Vous pouvez jouer avec ces coordonnées pour changer la position de dessin du sprite. Vous
constaterez qu'avec microStudio, les modifications sont instantanément reflétées dans la fenêtre
d'exécution.

## Ajouter un fond

:navigate projects.code

### Ajouter une couleur de fond

Au-dessus de notre ligne ```screen.drawSprite(...)```, nous allons ajouter la ligne suivante :

```
  screen.fillRect(0,0,400,400,"#468")
```

```fillRect``` signifie "remplir le rectangle". Le paramètre ```"#468"``` représente
une couleur bleu-gris. Cliquez dessus puis maintenez la touche CTRL du clavier enfoncée
pour faire apparaître une palette de couleurs. Piochez la couleur qui vous convient le mieux !



## Contrôler le personnage

:navigate projects.code

### Contrôler le personnage

Pour contrôler la position du personnage, nous allons utiliser deux variables, ```x``` et ```y```.
Modifions comme suit la ligne de code qui affiche le sprite :

```
  screen.drawSprite("sprite",x,y,20)
```

Le personnage s'affichera maintenant aux coordonnées ```x``` et ```y```.

## Contrôler le personnage

:navigate projects.code

### Contrôler le personnage

Il suffit donc maintenant de modifier les variables ```x``` et ```y``` lorsque les
touches fléchées du clavier sont enfoncées. Insérez la ligne suivante entre les lignes
```update = function()``` et ```end```:

```
  if keyboard.LEFT then x = x-1 end
```

Votre code complet ressemble donc à ceci:

```
init = function()
end

update = function()
  if keyboard.LEFT then x = x-1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"rgb(140,198,110)")
  screen.drawSprite("sprite",x,y,20)
end
```

## Contrôler le personnage

:navigate projects.code

### Contrôler le personnage

Cliquez dans la fenêtre d'exécution du programme, puis enfoncez la touche "flèche gauche"
de votre clavier d'ordinateur. Le personnage se déplace vers la gauche !

Explications : La ligne que nous avons ajoutée spécifie que si la touche gauche (LEFT) du clavier
(keyboard) est enfoncée, alors la valeur de ```x``` doit être diminuée de 1 (```x = x-1```).

Sachant que "droite" se dit RIGHT, "haut" se dit UP et "bas" se dit DOWN, ajoutez trois lignes
à votre code pour déplacer votre personnage dans toutes les directions.

(Solution à l'étape suivante)

## Contrôler le personnage

:navigate projects.code

### Contrôler le personnage

Voici le code complet de la fonction ```update``` pour déplacer le personnage dans toutes
les directions avec les touches du clavier :

```
update = function()
  if keyboard.LEFT then x = x-1 end
  if keyboard.RIGHT then x = x+1 end
  if keyboard.UP then y = y+1 end
  if keyboard.DOWN then y = y-1 end
end
```

## Fin

Ce tutoriel est terminé. Pour en apprendre plus sur la programmation en *microScript*,
vous pouvez maintenant essayer le parcours de tutoriels de programmation.
