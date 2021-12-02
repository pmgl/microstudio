**microStudio** est un environnement intégré de développement de jeux vidéo.
Il inclut tous les outils nécessaires pour créer votre premier jeu vidéo !
**microStudio** offre notamment toutes les possibilités suivantes :

* un éditeur de "sprites" (images, en pixel art)
* un éditeur de "maps" (c'est à dire cartes ou niveaux)
* un éditeur de code pour programmer en microScript, un langage simple mais puissant
* un fonctionnement 100% en ligne permettant de tester son jeu instantanément à tout moment de son développement
* la possibilité d'installer facilement le jeu, fini ou en cours, sur smartphone et tablettes
* la possibilité de travailler à plusieurs sur un même projet avec une synchronisation instantanée
* des fonctions communautaires de partage qui permettent d'explorer les projets des autres, d'apprendre et de réutiliser tout ce que vous souhaitez pour votre propre projet.

# Démarrage rapide

Vous pouvez commencer par explorer les projets réalisés par d'autres utilisateurs, dans la section *Explorer*.

Pour commencer à créer un jeu il est nécessaire de créer un compte. Choisissez un pseudonyme (évitez d'utiliser
votre vrai nom), insérez votre adresse e-mail (nécessaire en cas d'oubli de mot de passe ; doit être validée pour pouvoir publier) et c'est parti !

## Premier projet

Vous pouvez soit créer un nouveau projet vide dans la section Créer, soit choisir un projet existant dans la section Explorer et cliquer sur le bouton "Cloner" pour créer votre propre copie et commencer à la personnaliser.

### Coder

Une fois votre projet créé, vous êtes dans la section "Code". C'est là que vous pouvez commencer à programmer. Essayez de copier-coller le code ci-dessous :

```
draw = function()
  screen.drawSprite("icon",0,0,100,100)
end
```

### Exécuter

Puis cliquez sur le bouton Play dans la partie droite de l'écran. Votre programme démarre et vous voyez que le code ci-dessus affiche l'icône du projet au milieu de l'écran. Modifiez les coordonnées d'affichage (les chiffres 0 et 100) pour voir la position et les dimensions de l'icône varier.

### Modifier en temps réel

Vous pouvez ensuite rendre ce premier programme plus interactif, en copiant-collant le code ci-dessous :

```
update = function()
  if keyboard.LEFT then x -= 1 end
  if keyboard.RIGHT then x += 1 end
  if keyboard.UP then y += 1 end
  if keyboard.DOWN then y -= 1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"#000")
  screen.drawSprite("icon",x,y,20,20)
end
```

Cette fois le programme permet de déplacer l'icône du projet avec les flèches du clavier. La signification des fonctions ```update``` et ```draw```, le test des touches du clavier avec ```keyboard```, le dessin sur l'écran avec ```screen``` sont tous expliqués en détail dans la suite de cette documentation.

Vous pouvez également aller dans la section Sprites, cliquer sur l'élément "icon" et commencer à modifier l'image. Lorsque vous retournez dans la section Code, vous verrez que vos modifications sont instantanément prises en compte dans le programme en cours d'exécution.

# Explorer

La section principale *Explorer* vous permet de découvrir des projets créés par d'autres utilisateurs. Vous pouvez y trouver des exemples de jeux, des modèles réutilisables ("templates"), des bibliothèques de sprites dans différents styles et thématiques. Si un projet particulier vous intéresse, vous pouvez le cloner, c'est à dire en créer une copie intégrale que vous pouvez ensuite modifier et réutiliser à vos propres fins.

Si vous avez au préalable ouvert l'un de vos projets dans la section Créer, vous aurez la possibilité d'importer chaque sprite ou chaque fichier source des projets que vous explorez, vers votre projet en cours. Cela vous permet de piocher des images ou des fonctionnalités qui vous intéressent parmi les projets publics de la communauté, et de les réutiliser à vos propres fins.

# Créer un projet

Vous pouvez créer un projet vide dans la section principale *Créer*. Votre projet comporte plusieurs rubriques :

* **Code** : c'est ici que vous créerez votre programmes et lancerez l'exécution de votre projet pour le tester et le débugguer.
* **Sprites** : les *sprites* sont des images que vous pouvez dessiner et modifier dans cette section. Vous pourrez facilement y faire référence pour les afficher (les "coller" sur l'écran) lorsque vous programmerez votre jeu.
* **Maps** : les maps sont des cartes, des scènes ou encore niveaux que vous pouvez créer en assemblant vos sprites sur une grille. Vous pourrez facilement les afficher à l'écran dans votre programme
* **Doc** : ici vous pouvez rédiger une documentation pour votre projet ; ce peut être un document de conception pour votre jeu (game design document), un tutoriel, un guide pour réutiliser votre projet comme modèle etc.
* **Options** : vous pouvez régler ici diverses options de votre projet ; vous pouvez aussi inviter d'autres utilisateurs à participer à votre projet avec vous.
* **Publier** : Vous pouvez ici rendre votre projet public ; n'oubliez pas de créer une description et d'ajouter des tags.

## Code

C'est dans la section code que vous programmez et testez votre projet. Un fichier "source" de code est créé automatiquement pour votre projet. Vous pourrez en ajouter d'autres pour répartir les fonctionnalités de votre projet en divers sous-ensembles.

Le fonctionnement d'un programme microStudio repose sur votre implémentation de 3 fonctions essentielles :

* la fonction ```init``` où vous initialisez vos variables
* la fonction ```update``` où vous animez vos objets et scrutez les entrées
* la fonction ```draw``` où vous dessinez sur l'écran

<!--- help_start init = function --->
### Fonction ```init()```

La fonction init est appelée une unique fois au lancement du programme. Elle est utile notamment pour définir l'état initial de variables globales qui peuvent être utilisées dans la suite du programme.
<!--- help_end --->
##### exemple
```
init = function()
  etat = "accueil"
  niveau = 1
  position_x = 0
  position_y = 0
end
```

### Fonction ```update()```
<!--- help_start update = function --->
La fonction ```update```est invoquée 60 fois par seconde. Le corps de cette fonction est le meilleur endroit pour programmer la logique et la physique du jeu : changement d'états, déplacements de sprites ou ennemis, détection de collisions, évaluation des entrées clavier, tactile ou gamepad etc.
<!--- help_end --->

##### exemple
```
update = function()
  if keyboard.UP then y = y+1 end
end
```

Le code ci-dessus incrémente la valeur de la variable y de 1 à chaque soixantième de seconde, si la touche ```UP``` du clavier est enfoncée (flèche vers le haut).

<!--- help_start draw = function --->
### Fonction ```draw()```
La fonction ```draw``` est appelée aussi souvent que l'écran peut être rafraîchi. C'est ici que vous devez dessiner votre scène à l'écran, par exemple en remplissant un grand rectangle de couleur (pour effacer l'écran), puis en dessinant quelques sprites ou formes par-dessus.
<!--- help_end --->

##### exemple
```
draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgba(0,0,0)") // remplit l'écran de noir
  screen.drawSprite("icon",0,0,100,100) // dessine le sprite "icon" au centre de l'écran, en taille 100x100
end
```

Dans la plupart des cas, ```draw``` est appelée 60 fois par seconde. Mais certains ordinateurs ou tablettes peuvent rafraîchir leur écran 120 fois par seconde ou même plus. Il peut aussi arriver que l'appareil qui exécute le programme soit surchargé et ne parvienne pas à rafraîchir l'écran 60 fois par seconde, dans ce cas la fonction ```draw``` sera appelée moins souvent. C'est la raison pour laquelle ```update``` et ```draw``` sont deux fonctions séparées : quoiqu'il arrive, ```update``` sera appelée exactement 60 fois par seconde ; et lorsque ```draw``` est invoquée, c'est le moment de redessiner l'écran.

### Exécution

Dans la section "Code", la partie droite de l'écran permet de voir votre programme en action, tout en continuant à en modifier le code source. Pour lancer le programme, il suffit de cliquer sur le bouton <i class="fa fa-play"></i>. Vous pouvez à tout moment interrompre l'exécution de votre programme en cliquant sur le bouton <i class="fa fa-pause"></i>.

### Console

Pendant l'exécution de votre programme, vous pouvez utiliser la console pour exécuter des ordres simples en *microScript*. Vous pouvez par exemple entrer simplement le nom d'une variable pour connaître sa valeur actuelle.

##### exemples
Connaître la valeur courant de la variable position_x
```
> position_x
34
> █
```
Modifier la valeur de position_x
```
> position_x = -10
-10
> █
```
Appeler la fonction draw() pour constater le changement de position_x et son effet sur le dessin à l'écran (en supposant que l'exécution est en pause)
```
> draw()
> █
```

### Traces

Dans le code de votre programme, vous pouvez à tout moment envoyer du texte à afficher sur la console, en utilisant la fonction ```print()```.

##### exemple
```
draw = function()
  // votre implementation de draw()

  print(position_x)
end
```
## Sprites

Les sprites (qui signifient lutins en anglais) sont des images qui peuvent se déplacer à l'écran. L'outil de dessin de *microStudio* permet de créer des sprites, qui peuvent ensuite être utilisés dans le code du programme pour les afficher à l'écran à la position et la taille souhaitées.

### Créer un sprite
Chaque projet comporte un sprite par défaut, nommé "icon", qui fera office d'icône de l'application. Vous pouvez créer de nouveaux sprites en cliquant sur *Ajouter un sprite*. Vous pouvez les renommer à votre guise et définir leur taille en pixels (largeur x hauteur).

### Options de dessin
*microStudio* propose les fonctions de dessin classiques : pinceau, remplissage, gomme, éclaircir, obscurcir, adoucir, augmenter le contraste, modifier la saturation.

L'outil de sélection de couleur ("pipette") peut être utilisé à tout moment en pressant la touche [Alt] du clavier.

Les options *tuile* et de symétrie vous aideront à réaliser des sprites "répétables" ou ayant un ou deux axes de symétrie.

##### Astuce
Vous pouvez importer des images existantes dans votre projet microStudio. Pour ce faire, faites glisser et déposez vos fichiers PNG ou JPG (jusqu'à 256x256 pixels) dans la liste des sprites.

## Maps
Les "maps" peuvent aussi être appelées des cartes en bon Français. Une map dans microstudio est une grille d'assemblage de sprites. Elle permet d'assembler un décor ou de créer un niveau.

### Créer une carte (map)
Les maps peuvent être créées, renommées de même que les sprites. Il est possible de modifier la taille de la grille (en nombre de cases). Chaque case peut être peinte avec un sprite. Il est possible de modifier la taille en pixels de chaque case, qui doit en général refléter la taille des sprites utilisés pour peindre la grille.

## Réglages
L'onglet *Réglages* permet de personnaliser quelques éléments de votre projet.

### Options
Vous pouvez définir le titre de votre projet, son identifiant (utilisé pour créer son URL c'est à dire son adresse internet).

Vous pouvez indiquer si l'usage de votre projet doit se faire en mode portrait ou paysage. Il sera tenu compte de ce choix lors de l'installation de votre application sur un smartphone ou une tablette.

Vous pouvez également indiquer les proportions souhaitées pour la zone d'affichage à l'écran. C'est une option permettant d'éviter les déconvenues lorsque l'application sera installée sur des appareils avec des écrans de proportions variées.

### Utilisateurs

La section utilisateurs permet d'inviter des amis à participer à votre projet. Vous devez connaître le pseudonyme de l'ami que vous souhaitez inviter. Une fois un ami invité, s'il accepte votre invitation, il aura un accès complet à votre projet et pourra faire toutes les modifications qu'il souhaite (modifier, ajouter, supprimer des sprites, des maps, du code etc.). La modification des options du projet et de la liste des participants est cependant réservée au propriétaire du projet.

## Publier

*microStudio* propose quelques options pour publier ou exporter votre projet. Vous pouvez exporter votre projet en tant qu'application HTML5 autonome, pour la distribuer en ligne, sur votre site ou sur une plateforme de distribution de jeux. Vous pouvez aussi rendre votre projet public sur *microStudio* pour permettre à la communauté d'y jouer, de commenter, d'explorer le code source et les images... De nouvelles options d'export sont prévues dans le futur.

*microStudio* permettra bientôt d'exporter votre projet dans différents formats (notamment sous la forme d'une archive web pour publication par exemple sur itch.io). Actuellement il est seulement possible de rendre le projet public, ce qui aura pour effet de le rendre visible sur la page d'accueil de *microStudio*. D'autres utilisateurs pourront alors le lancer, ou même le cloner entièrement ou partiellement pour le réutiliser dans le cadre d'un autre projet.

### Rendre le projet public

Pour rendre votre projet accessible à tout le monde (en lecture seule), cliquez sur "Rendre mon projet public". Une fois votre projet public, il sera affiché dans l'onglet d'exploration du site microstudio. N'importe quel visiteur pourra exécuter le jeu, visualiser et réutiliser le code source et autres constituants de votre projet.

### Exporter en HTML5

Pour exporter votre projet complet en HTML5, cliquez sur "Exporter en HTML5". Cela déclenche le téléchargement d'une archive ZIP qui contient tous les fichiers nécessaires pour exécuter votre jeu : sprites, quelques fichiers JavaScript, les icônes et un fichier "index.html". Votre jeu peut être exécuté localement (double-cliquez sur le fichier index.html) ou vous pouvez le transférer vers votre site web existant. Il est aussi prêt à être publié sur beaucoup de plateformes en ligne de publication de jeux, qui acceptent les jeux en HTML5 (nous en suggérons plusieurs sur le panneau d'export).
