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

# microScript

**microScript** est un langage simple inspiré de Lua. Voici quelques principes généraux utilisés par microScript :

* les variables sont globales par défaut. Pour définir une variable locale, il faut utiliser le mot-clé ```local```.
* les retours à la ligne n'ont pas de signification particulière, ils sont considérés comme des espaces.
* en microScript il n'y a pas de valeur ```null```, ```nil``` ou ```undefined```. Toute variable non définie ou nulle est égale à ```0```.
* en microScript, il n'y a pas de type booléen. ```0``` est faux et tout ce qui n'est pas ```0``` est vrai.
* il n'y a pas d'erreur d'exécution ou d'exception en microScript. Toute variable qui n'est pas définie renvoie ```0```. Invoquer comme une fonction une valeur qui n'est pas une fonction renvoie la valeur elle-même.

## Variables

Une variable est un nom (ou "identifiant") auquel on décide d'affecter une valeur. Elle permet donc de mémoriser cette valeur

### Déclaration

Les variables en microScript n'ont pas besoin d'être déclarées. Toute variable qui n'a pas encore été utilisée peut être considérée comme existante et ayant la valeur ```0```.

Pour commencer à utiliser une variable, il suffit de lui assigner une valeur avec le signe égal :

```
x = 1
```
La valeur de x est désormais 1.

### Types de valeurs

*microScript* reconnaît cinq types de valeurs : les nombres, les chaînes de caractères (texte), les listes, les objets et les fonctions.

#### Nombre
Les valeurs de type Nombre en *microScript* peuvent être des nombres entiers ou décimaux.

```
pi = 3.1415
x = 1
demi = 1/2
```
#### Chaîne de caractères
Les chaînes de caractères sont des textes ou des morceaux de textes. Ils doivent être définis entre guillemets.

```
animal = "chat"
print("Bonjour "+animal)
```
#### Liste
Les listes peuvent contenir un certain nombre de valeurs :

```
liste_vide = []
nombres_premiers = [2,3,5,7,11,13,17,19]
liste_heteroclite = [1,"chat",[1,2,3]]
```

On peut accéder aux éléments d'une liste par leur indice, c'est à dire leur position dans la liste en partant de 0 :

```
liste = ["chat","chien","souris"]
print(liste[0])
print(liste[1])
print(liste[2])
```

On peut aussi facilement parcourir une liste avec une boucle ```for``` :

```
for element in list
  print(element)
end
```

#### Objet
Un objet en *microScript* est une forme de liste associative. L'objet comporte un ou plusieurs "champs" qui ont une clé et une valeur. La clé est une chaîne de caractères, la valeur peut être n'importe quelle valeur *microScript*. La définition d'un objet commence par le mot-clé ```object``` et se termine par le mot-clé ```end```. Entre les deux peuvent être définis plusieurs champs. Exemple :

```
mon_objet = object
  x = 0
  y = 0
  nom = "objet 1"
end
```
On peut accéder aux champs d'un objet avec l'opérateur ```.```. La définition ci-dessus peut donc aussi s'écrire :

```
mon_objet.x = 0
mon_objet.y = 0
mon_objet.nom = "objet 1"
```

On peut également y accéder avec les crochets ```[]```. La définition ci-dessus peut donc aussi s'écrire :

```
mon_objet["x"] = 0
mon_objet["y"] = 0
mon_objet["nom"] = "objet 1"
```

On peut parcourir la liste des champs d'un objet avec une boucle ```for``` :

```
for champ in mon_objet
  print(champ + " = " + mon_objet[champ])
end
```

Pour une utilisation plus avancée des objets, voir la section "Classes".

### Valeur fonction

Une valeur peut être de type fonction. Lorsqu'on écrit ```draw = function() ... end```, on crée une valeur de type fonction et on l'assigne à la variable ```draw``` (voir plus loin la section sur les fonctions).

### Variables locales

Par défaut, les variables déclarées en les assignant sont globales. Il est possible de définir une variable locale, dans le cadre d'une fonction, en utilisant le mot-clé ```local``` :

```
maFonction = function()
  local i = 0
end
```

## Fonctions

Une fonction est une sous-séquence d'opérations, qui effectue un travail, un calcul et parfois renvoie un résultat.

### Définir une fonction

Une fonction se définit avec le mot-clé ```function``` et se termine par le mot-clé ```end```.

```
nombreSuivant = function(x)
  x+1
end
```

### Invoquer une fonction

```
print(nombreSuivant(10))
```

Lorsque vous invoquez comme une fonction une valeur qui n'est pas une fonction, elle renvoie simplement sa valeur. Exemple :

```
x = 1
x(0)
```

Le code ci-dessus renvoie la valeur 1, sans générer d'erreur. Vous pouvez donc même invoquer une fonction qui n'est pas encore définie (elle vaut alors ```0```), sans déclencher une erreur. Cela vous permet de commencer très tôt à structurer votre programme avec des sous-fonctions, sur lesquelles vous travaillerez plus tard. Par exemple :

```
draw = function()
  dessinerCiel()
  dessinerNuages()
  dessinerDecor()
  dessinerEnnemis()
  dessinerHeros()
end

// je peux implémenter les fonctions ci-dessus à mon rythme.
```

## Conditions

### Condition simple
Un énoncé conditionnel permet au programme de tester une hypothèse et d'effectuer des opérations différentes selon le résultat du test. En *microScript*, les conditions s'écrivent comme suit :

```
if age<18 then
  print("enfant")
else
  print("adulte")
end
```
"if" signifie "si" ;
"then" signifie "alors" ;
"else" signifie "sinon" ;
"end" signifie "fin"

Dans l'exemple ci-dessus, **si** la valeur de la variable age est inférieure à 18, **alors** l'instruction ```print("enfant")``` sera exécutée, **sinon** l'instruction ```print("adulte")``` le sera.

#### Opérateurs binaires de comparaison
Voici les opérateurs binaires qui peuvent être utilisés pour les comparaisons :

|Opérateur|Description|
|-|-|
|==|```a == b``` est vrai seulement si a est égal à b|
|!=|```a != b``` est vrai seulement si a est différent de b|
|<|```a < b``` est vrai seulement si a est strictement inférieur à b|
|>|```a > b``` est vrai seulement si a est strictement supérieur à b|
|<=|```a <= b``` est vrai seulement si a est inférieur ou égal à b|
|>=|```a >= b``` est vrai seulement si a est supérieur ou égal à b|

#### Opérateurs booléens
|Opérateur|Description|
|-|-|
|and|ET logique : ```a and b``` est vrai seulement si a et b sont vrais|
|or|OU logique : ```a or b``` est vrai seulement si a est vrai ou b est vrai|
|not|NON logique : ```not a``` est vrai si a est faux et faux si a est vrai|

#### Valeurs booléennes
En microScript, il n'y a pas de type booléen. ```0``` est considéré comme faux et toute autre valeur est vraie. Les opérateurs de comparaison renvoient ```1``` pour vrai et ```0``` pour faux. Par souci pratique, microScript vous permet aussi d'utiliser ces deux variables prédéfinies :

|Variable|Valeur|
|-|-|
|true|1|
|false|0|

### Conditions multiples

Il est possible de tester des hypothèses multiples grâce au mot-clé ```elsif``` (contraction de "sinon si")
```
if age<10 then
  print("enfant")
elsif age<18 then
  print("adolescent")
elsif age<30 then
  print("jeune adulte")
else
  print("âge très respectable")
end
```

## Boucles
Les boucles permettent d'effectuer des traitements répétés.

### Boucle for
La boucle ```for``` est très utilisée en programmation. Elle permet d'effectuer le même traitement sur tous les éléments d'une liste ou d'une série de valeurs.

```
for i=1 to 10
  print(i)
end
```
L'exemple ci-dessus affiche dans la console chaque nombre de 1 à 10.

```
for i=0 to 10 by 2
  print(i)
end
```
L'exemple ci-dessus affiche dans la console les nombres de 0 à 10 en avançant par pas de 2.

```
liste = [2,3,5,7,11]
for nombre in list
  print(nombre)
end
```
L'exemple ci-dessus définit une liste puis affiche chaque élément de la liste.

### Boucle while
La boucle ```while``` permet d'effectuer des opérations de manière répétée jusqu'à ce qu'un résultat satisfaisant soit obtenu. "while" signifie "tant que".

```
x = 1
while x*x<100
  print(x*x)
  x = x+1
end
```
L'exemple ci-dessus affiche le carré de x, puis incrémente x (c'est à dire ajoute 1 à x), tant que le carré de x est inférieur à 100.

### Interrompre ou continuer une boucle
Vous pouvez interrompre une boucle `for` ou `while` en cours avec la commande `break`. Exemple :

```
while true
  x = x+1
  if x>= 100 then break end
end
```

Vous pouvez passer les opérations restantes de votre boucle pour sauter immédiatement à l'itération suivante, avec la commande `continue`. Exemple :

```
for i=0 to 10000
  if i%10 == 0 then continue end // Les multiples de 10 ne seront pas traités, on passera directement à l'itération suivante.
  doSomeProcessing(i)
end
```

## Opérateurs

Voici la liste des opérateurs binaires en *microScript* (hors comparaisons, déjà citées plus haut)

|Opérateur|Description|
|-|-|
|+|Addition|
|-|Soustraction|
|*|Multiplication|
|/|Division|
|%|Modulo : ```x % y``` est égal au reste de la division de x par y|
|^|Puissance : ```x ^ y``` est égal à x élevé à la puissance y soit ```pow(x,y)```|

## Fonctions prédéfinies

### Fonctions
|Fonction|Description|
|-|-|
|max(a,b)|Renvoie le plus grand nombre de a ou de b|
|min(a,b)|Renvoie le plus petit nombre de a ou de b|
|round(a)|Renvoie la valeur a arrondie à la valeur entière la plus proche|
|floor(a)|Renvoie la valeur a arrondie à l'entier inférieur|
|ceil(a)|Renvoie la valeur a arrondie à l'entier supérieur|
|abs(a)|Renvoie la valeur absolue de a|
|sqrt(a)|Renvoie la racine carrée de a|
|pow(a,b)|Renvoie a élevé à la puissance b (autre notation possible : ```a ^ b```)|
|PI|Constante égale au nombre Pi|
|log(a)|Renvoie le logarithme népérien de a|
|exp(a)|Renvoie l'exponentielle de a|

#### Fonctions trigonométriques en radians
|Fonction|Description|
|-|-|
|sin(a)|Renvoie le sinus de a (a en radians)|
|cos(a)|Renvoie le cosinus de a (a en radians)|
|tan(a)|Renvoie la tangente de a (a en radians)|
|acos(a)|Renvoie l'arcosinus de a (résultat en radians)|
|asin(a)|Renvoie l'arcsinus de a (résultat en radians)|
|atan(a)|Renvoie l'arctangente de a (résultat en radians)|
|atan2(y,x)|Renvoie l'arctangente de y/x (résultat en radians)|

#### Fonctions trigonométriques en degrés
|Fonction|Description|
|-|-|
|sind(a)|Renvoie le sinus de a (a en degrés)|
|cosd(a)|Renvoie le cosinus de a (a en degrés)|
|tand(a)|Renvoie la tangente de a (a en degrés)|
|acosd(a)|Renvoie l'arcosinus de a (résultat en degrés)|
|asind(a)|Renvoie l'arcsinus de a (résultat en degrés)|
|atand(a)|Renvoie l'arctangente de a (résultat en degrés)|
|atan2d(y,x)|Renvoie l'arctangente de y/x (résultat en degrés)|

### Nombres aléatoires (random)
L'objet random permet de générer des nombre pseudo-aléatoires. Il est possible d'initialiser le générateur avec la fonction ```seed``` pour obtenir la même séquence de nombres à chaque exécution, ou au contraire une séquence à chaque fois différente.

|Fonction|Description|
|-|-|
|```random.next()```|Renvoie un nouveau nombre aléatoire compris entre 0 et 1|
|```random.nextInt(a)```|Renvoie un nouveau nombre aléatoire entier compris entre 0 et a-1|
|```random.seed(a)```|réinitialise la séquence de nombre aléatoires en utilisant la valeur a ; si vous utilisez deux fois la même valeur d'initialisation, vous obtiendrez la même séquence de nombres aléatoires. Si a == 0, le générateur de nombre aléatoires est initialisé ... de manière aléatoire et donc non-reproductible|


## Opérations sur les chaînes de caractères

|Opération|Description|
|-|-|
|```string1 + string2```|L'opérateur ```+``` peut être utilisé pour concaténer des chaînes de caractères.|
|```string.length```|Champ qui contient la longueur de la chaîne de caractères|
|```string.substring(i1,i2)```|Renvoie une nouvelle chaîne, sous-chaîne de la chaîne ```string``` commençant à l'index i1 et finissant à l'index i2|
|```string.startsWith(s)```|Renvoie 1 si ```string``` commence exactement par  ```s```, 0 sinon|
|```string.endsWith(s)```|Renvoie 1 si ```string``` termine exactement par  ```s```, 0 sinon|
|```string.indexOf(s)```|Renvoie l'index de la première occurrence de ```s``` dans ```string```, ou -1 si ```string``` ne contient aucune telle occurrence|
|```string.lastIndexOf(s)```|Renvoie l'index de la première occurrence de ```s``` dans ```string```, ou -1 si ```string``` ne contient aucune telle occurrence|
|```string.replace(s1,s2)```|Renvoie une nouvelle chaîne où la première occurrence de ```s1``` (si elle existe) est remplacée par ```s2```|
|```string.toUpperCase()```|Renvoie la chaîne de caractères convertie en minuscules|
|```string.toLowerCase()```|Renvoie la chaîne de caractères convertie en majuscules|
|```string.split(s)```|La fonction split divise la chaîne de caractères en une liste de sous-chaînes, en recherchant la sous-chaîne de séparation donnée en argument, et renvoie la liste ainsi constituée|


## Opérations sur les listes
|Opération|Description|
|-|-|
|```liste.length```|Champ qui contient la longueur de la liste.|
|```liste.push(element)```|Ajoute un nouvel élément en fin de liste|
|```liste.insert(element)```|Insère un nouvel élément en début de liste|
|```list.insertAt(element,index)```|Insère un nouvel élément à la position ```index``` dans la liste|
|```liste.indexOf(element)```|Renvoie la position de l'élément dans la liste (0 pour le premier élément, 1 pour le suivant etc.). Si l'élément n'est pas dans la liste, renvoie -1|
|```liste.contains(element)```|Renvoie 1 (vrai) si ```element``` fait partie de la liste, 0 (faux) dans le cas contraire|
|```liste.removeAt(index)```|Retire de la liste l'élément se trouvant à la position ```index```|
|```liste.removeElement(element)```|Retire l'élément ```element```, s'il se trouve quelque part dans la liste|
|```liste1.concat(liste2)```|Renvoie une nouvelle liste, qui est la concaténation de liste1 et liste 2|

## Commentaires
Les commentaires en *microScript* peuvent être ajoutés après un double-slash : ```//``` ; tout ce qui suit jusqu'au prochain retour à la ligne est ignoré lors de l'analyse du programme.

##### exemple
```
maFonction = ()
  // mes notes sur le rôle de la fonction maFonction
end
```

## Classes

Une classe dans un langage de programmation est une sorte de modèle pour créer des objets. La classe définit des propriétés par défaut et des fonctions
qui constituent l'état et le comportement par défaut de tous les objets qui seront créés sur son modèle. Vous pouvez créer des objets dérivés d'une classe, qui vont donc hériter de toutes les propriétés de la classe. Utiliser des classes et leurs objets dérivés dans un programme est appelé "programmation orientée objet".

Pour illustrer cela, nous allons voir comment utiliser les classes pour gérer les ennemis dans votre jeu :

### Définir une classe

Nous allons commencer par créer une classe ```Ennemi``` qui sera partagée par tous nos objets ennemis. Chaque ennemi va avoir une position (à l'écran). Il aura aussi des points de vie ```pv``` et se déplacera à une certaine ```vitesse```.

```
Ennemi = class
  constructor = function(position)
    this.position = position
  end

  pv = 10
  vitesse = 1

  deplacement = function()
    position += vitesse
  end

  touche = function(dommages)
    pv -= dommages
  end
end
```

En microScript, les classes et les objets sont des concepts très similaires et sont presque interchangeables. La définition de notre classe se termine donc par le mot-clé ```end```. La première propriété que nous avons définie pour notre classe est la fonction "constructor". Cette fonction est appelée lorsqu'une nouvelle instance de cette classe (c'est à dire un objet dérivé de cette classe) est créée. La fonction ici définit la propriété *position* de l'objet. ```this``` permet de désigner l'objet sur lequel la fonction est appliquée, donc ```this.position``` indique la propriété ```position``` de l'objet.

### Créer des instances (objets dérivés) d'une classe

Nous allons maintenant créer deux ennemis, dérivés de notre classe :

```
ennemi_1 = new Ennemi(50)
ennemi_2 = new Ennemi(100)
```

L'opérateur ```new``` est utilisé pour créer une nouvelle instance d'objet, dérivée d'une classe. L'argument que nous passons ici en paramètre est destiné au constructeur de la classe (```constructor```). Nous avons donc créé une instance d'Ennemi à la position 50 et une autre à la position 100.

Les deux ennemis partagent la même *vitesse* et les mêmes points de vie (*pv*). Mais nous pouvons maintenant choisir de donner une vitesse différente au deuxième ennemi :

```
ennemi_2.vitesse = 2
```

Nous pouvons maintenant déplacer nos ennemis en appelant :

```
enemy_1.deplacement()
enemy_2.deplacement()
```

Le second ennemi se déplacera deux fois plus vite, car nous avons altéré sa propriété *vitesse* avant d'appeler la fonction *deplacement*.

### Héritage

Nous pouvons faire en sorte qu'une classe hérite d'une autre classe. Par exemple, si nous voulons créer une variation de notre Ennemi, nous pouvons faire comme suit :

```
Boss = class extends Ennemi
  constructor = function(position)
    super(position)
    pv = 50
  end

  deplacement = function()
    super()
    pv += 1
  end
end
```

Nous avons créé une nouvelle classe ```Boss``` par extension de la classe ```Ennemi```. Notre nouvelle classe hérité de toutes les propriétés de la classe Ennemi, sauf qu'elle remplace ensuite certaines de ces propriétés par les siennes. Appeler ```super(position)``` dans le constructeur assure que le constructeur de la classe parente Ennemi est aussi appelé.

Nous avons créé un nouveau comportement ```deplacement``` pour notre Boss, qui *surcharge* le comportement par défaut de Ennemi. Dans cette nouvelle fonction, nous appelons ```super()``` de manière à conserver le comportement par défaut qui était défini dans la classe Ennemi ; nous incrémentons ensuite la valeur de ```pv```, ce qui implique que notre Boss va regagner des points de vie lorsqu'il se déplace.

Nous pouvons maintenant créer une instance de notre Boss et le placer à la position 120:

```
le_boss_final = new Boss(120)
```

##### notes

* espace de variables : lorsqu'une fonction est invoquée sur un objet (comme ```ennemi_1.deplacement()```), les variables auxquelles le code de la fonction fait référence sont les propriétés de l'objet. Par exemple, dans le corps de la fonction *deplacement*, ```position += 1``` va incémenter la propriété position de l'objet lui-même.

* Il est parfois nécessaire d'utiliser ```this``` pour spécifier explicitement qu'on se réfère à une propriété de l'objet. C'est pourquoi dans le constructeur de la classe Ennemi, nous écrivons ```this.position = position```, car ```position``` est aussi le nom de l'argument de la fonction et donc "cache" la propriété de l'objet.

* ```super()``` peut être utilisé dans une fonction membre d'un objet ou d'une classe, pour invoquer la fonction de la classe parente qui porte le même nom.

# Référence des fonctions

## Affichage ```screen```

Dans *microStudio* l'écran est représenté par l'objet prédéfini ```screen```. Pour afficher des formes ou images à l'écran, il suffit d'appeler des fonctions (aussi appelées *méthodes*) sur cet object. Par exemple :

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100)
```
Le code ci-dessus définit la couleur de dessin comme ```"#FFF"``` c'est à dire du blanc (voir explications plus loin). Puis il dessine un rectangle rempli de cette couleur, centré aux coordonnées 0,0 de l'écran (c'est à dire le centre de l'écran), de largeur 100 et hauteur 100.

Pour faciliter votre travail, *microStudio* met à l'échelle automatiquement les coordonnées de l'écran, indépendamment de la résolution effective d'affichage. Par convention, la dimension d'affichage la plus petite (largeur en mode portrait, hauteur en mode paysage) mesure 200. Le point d'origine (0,0) étant le centre de l'écran, la dimension la plus petite est donc graduée de -100 à +100. La dimension la plus grande sera graduée par exemple de -178 à +178 (écran classique 16:9), de -200 à +200 (écran 2:1, plus allongé, des smartphones plus récents) etc.


![Coordonnées écran](/doc/img/screen_coordinates.png "Coordonnées écran")

<small>*Système de coordonnées de dessin sur un écran 16:9 en mode portrait et un autre en mode paysage*</small>


### Définir une couleur
<!--- suggest_start screen.setColor --->
##### screen.setColor( couleur )

Définit la couleur à utiliser pour les prochains appels à des fonctions de dessin.

<!--- suggest_end --->

La couleur est définie par une chaîne de caractères, donc entre guillemets "". Elle est décrite en général par ses composantes RVB, c'est à dire un mélange de Rouge, de Vert et de Bleu. Plusieurs types de notations sont possibles :

* "rgb(255,255,255)" : (rgb pour red, green, blue, l'équivalent de RVB en anglais). On indique ici une valeur pour le rouge, le vert et le bleu, variant entre 0 et 255 maximum. "rgb(255,255,255)" donne du blanc, "rgb(255,0,0)" du rouge vif, "rgb(0,255,0)" du vert etc. Pour choisir une couleur plus facilement lorsque vous codez, cliquez sur votre couleur rgb et maintenez la touche Control appuyée pour afficher le sélecteur de couleur.
* "#FFF" ou "#FFFFFF" : cette notation utilise l'hexadécimal, pour décrire les 3 composantes de rouge de vert et de bleu. L'hexadécimal est un système de notation des nombres en "base 16", c'est à dire utilisant 16 chiffres, de 0 à 9 puis de A à F.
* d'autres notations existent, qui ne sont pas décrites ici.


### Effacer l'écran
<!--- suggest_start screen.clear --->
##### screen.clear()
Efface l'écran (le remplit de noir).
<!--- suggest_end --->

### Dessiner des formes
<!--- suggest_start screen.fillRect --->
##### screen.fillRect( x , y , largeur , hauteur , &lt;couleur&gt; )
Dessine un rectangle rempli, centré aux coordonnées x et y, avec la largeur et la hauteur spécifiées. La couleur est optionnelle, si elle est omise, la dernière couleur utilisée sera réutilisée.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRoundRect --->
##### screen.fillRoundRect( x , y , largeur , hauteur , rayon , &lt;couleur&gt; )
Dessine un rectangle arrondi rempli, centré aux coordonnées x et y, avec la largeur, la hauteur et le rayon de courbure spécifiés. La couleur est optionnelle, si elle est omise, la dernière couleur utilisée sera réutilisée.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRound --->
##### screen.fillRound( x , y , largeur , hauteur , &lt;couleur&gt; )
Dessine une forme ronde pleine (un disque ou une ellipse selon les dimensions utilisées), centrée aux coordonnées x et y, avec la largeur et la hauteur spécifiées. La couleur est optionnelle, si elle est omise, la dernière couleur utilisée sera réutilisée.
<!--- suggest_end --->

<!--- suggest_start screen.drawRect --->
##### screen.drawRect( x , y , largeur , hauteur , &lt;couleur&gt; )
Dessine le contour d'un rectangle, centré aux coordonnées x et y, avec la largeur et la hauteur spécifiées. La couleur est optionnelle, si elle est omise, la dernière couleur utilisée sera réutilisée.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRoundRect --->
##### screen.drawRoundRect( x , y , largeur , hauteur , rayon , &lt;couleur&gt; )
Dessine le contour d'un rectangle arrondi, centré aux coordonnées x et y, avec la largeur, la hauteur et le rayon de courbure spécifiés. La couleur est optionnelle, si elle est omise, la dernière couleur utilisée sera réutilisée.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRound --->
##### screen.drawRound( x , y , largeur , hauteur , &lt;couleur&gt; )
Dessine le contour d'une forme ronde (un disque ou une ellipse selon les dimensions utilisées), centrée aux coordonnées x et y, avec la largeur et la hauteur spécifiées. La couleur est optionnelle, si elle est omise, la dernière couleur utilisée sera réutilisée.
<!--- suggest_end --->

<!--- suggest_start screen.drawLine --->
##### screen.drawLine( x1, y1, x2, y2, couleur )
Dessine une ligne joignant les points (x1,y1) et (x2,y2). La couleur est optionnelle, si elle est omise, la dernière couleur utilisée sera réutilisée.
<!--- suggest_end --->

<!--- suggest_start screen.fillPolygon --->
##### screen.fillPolygon( x1, y1, x2, y2, x3, y3, ... , couleur )
Dessine un polygone rempli, défini par la liste des coordonnées de points passées en paramètres. La couleur est optionnelle, si elle est omise, la dernière couleur utilisée sera réutilisée.
<!--- suggest_end --->

La fonction peut aussi accepter une liste comme premier argument et une couleur comme second argument. Dans ce cas, la liste doit contenir les coordonnées des points comme ceci : ```screen.fillPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon( x1, y1, x2, y2, x3, y3, ... , couleur )
Dessine le contour d'un polygone, défini par la liste des coordonnées de points passées en paramètres. La couleur est optionnelle, si elle est omise, la dernière couleur utilisée sera réutilisée.
<!--- suggest_end --->

La fonction peut aussi accepter une liste comme premier argument et une couleur comme second argument. Dans ce cas, la liste doit contenir les coordonnées des points comme ceci : ```screen.drawPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth( width )
Définit l'épaisseur de ligne pour tous les prochains appels à des fonctions dessinant des lignes (drawLine, drawPolygon, drawRect etc.). L'épaisseur par défaut est 1.
<!--- suggest_end --->


### Afficher sprites et maps

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite( sprite , x , y , largeur , &lt;hauteur&gt; )

Dessine à l'écran l'un des sprites que vous avez créés dans la section *Sprites*. Le premier paramètre est une chaîne de caractères qui correspond au nom du sprite à afficher, par exemple ```"icon"```. Suivent les coordonnées x,y où afficher le sprite (le sprite sera centré sur ces coordonnées). Puis la largeur et la hauteur d'affichage.
<!--- suggest_end --->

```
screen.drawSprite("icon",0,50,50)
```
La hauteur peut être omise, comme dans l'exemple ci-dessus. Dans ce cas la hauteur sera calculée en fonction de la largeur et des proportions du sprite.

##### Sprites animés

Les sprites animés vont automatiquement afficher l'étape d'animation correspondant aux paramètres du sprite. Vous pouvez régler l'étape courant d'un sprite (par exemple pour redémarrer l'animation) comme suit:

```
sprites["sprite1"].setFrame(0) // 0 est l'index de la première étape d'animation
```

Vous pouvez aussi dessiner une étape spécifique de l'animation, en ajoutant "." et l'index de l'étape désirée :
```
screen.drawSprite("sprite1.0",0,50,50,50)
```

L'exemple ci-dessus dessine l'étape 0 du sprite "sprite1".

<!--- suggest_start screen.drawSpritePart --->
##### screen.drawSpritePart( sprite, part_x, part_y, part_width, part_height, x, y, width, height)

Dessine un partie d'un sprite à l'écran. Le premier paramètre est une chaîne de caractères qui correspond au nom du sprite à afficher, par exemple ```"icon"```. Les 4 paramètres suivants définissent les coordonnées d'un sous-rectangle du sprite (le point 0,0 est le coin supérieur gauche du sprite). Les 4 autres paramètres sont les mêmes que pour ```drawSprite```.
<!--- suggest_end --->

```
screen.drawSpritePart("icon",4,4,8,8,0,50,50,50)
```
La hauteur peut être omise, comme dans l'exemple ci-dessus. Dans ce cas la hauteur sera calculée en fonction de la largeur et des proportions du sous-rectangle à dessiner.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap( map , x , y , largeur , &lt;hauteur&gt; )
Dessine à l'écran l'une des maps que vous avez créés dans la section *Maps*. Le premier paramètre est une chaîne de caractères qui correspond au nom de la map à afficher, par exemple ```"map1"```. Suivent les coordonnées x,y où afficher la map (la map sera centrée sur ces coordonnées). Puis la largeur et la hauteur d'affichage.
<!--- suggest_end --->

```
screen.drawMap("map1",0,0,300,200)
```

### Afficher du texte

<!--- suggest_start screen.drawText --->
##### screen.drawText( text , x , y , size , &lt;color&gt; )
Dessine du texte à l'écran. Le premier paramètre est le texte à afficher, puis les coordonnées x et y où le texte sera centré, puis la taille (hauteur) du texte. Le dernier paramètre est la couleur de dessin, il peut être omis, dans ce cas la dernière couleur définie sera réutilisée.
<!--- suggest_end --->

```
screen.drawText("Bonjour !",0,0,30,"#FFF")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont( font_name )
Définit la police de caractères à utiliser pour les prochains appels à ```drawText```.

**Polices de caractères disponibles actuellement**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->

```
screen.setFont("BitCell")
```

**Astuce**: La variable globale ```fonts``` est une liste de tous les noms de polices de caractères disponibles dans microStudio.

<!--- suggest_start screen.textWidth --->
##### screen.textWidth( texte, taille )
Permet de connaître la largeur du texte donné en paramètre, lorsqu'il sera dessiné avec la taille spécifiée.
<!--- suggest_end --->

```
width = screen.textWidth( "Mon texte", 20 )
```

### Paramètres de dessin

<!--- suggest_start screen.setAlpha --->
##### screen.setAlpha( alpha )
Définit le niveau d'opacité global pour toutes les fonctions de dessin appelées ultérieurement. La valeur 0 équivaut à une transparence totale (éléments invisibles) et la valeur 1 correspond à une opacité totale (les élements dessinées cachent totalement ce qui est dessous).
<!--- suggest_end --->

```
screen.setAlpha(0.5) // les prochains élements dessinés seront semi-transparents
```

Lorsque vous utilisez cette fonction pour dessiner quelques éléments avec un peu de transparence, n'oubliez pas de remettre ensuite le paramètre alpha à sa valeur par défaut :

```
screen.setAlpha(1) // la valeur par défaut, opacité totale
```

---

<!--- suggest_start screen.setLinearGradient --->
##### screen.setLinearGradient( x1 , y1 , x2 , y2 , couleur1 , couleur 2 )
Définit la couleur de dessin comme un gradient linéraire de couleur, c'est à dire un dégradé. ```x1 et y1``` sont les coordonnées du point de départ du dégradé. ```x2 et y2``` sont les coordonnées du point d'arrivée du dégradé. ```couleur1``` est la couleur de départ (voir ```setColor``` pour les valeurs de couleurs). ```couleur2``` est la couleur d'arrivée.
<!--- suggest_end --->

```
screen.setLinearGradient(0,100,0,-100,"#FFF","#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
L'exemple ci-dessus crée un dégradé du blanc vers le rouge, de haut en bas de l'écran, puis remplit l'écran avec ce dégradé.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient( x , y , rayon , couleur1 , couleur2 )
Définit la couleur de dessin comme un gradient radial de couleur, c'est à dire un dégradé en forme de cercle. ```x et y``` sont les coordonnées du centre du cercle. ```rayon``` est le rayon du cercle. ```couleur1``` est la couleur au centre du cercle (voir ```setColor``` pour les valeurs de couleurs). ```couleur2``` est la couleur au niveau du périmètre du cercle.
<!--- suggest_end --->

```
screen.setRadialGradient(0,0,100,"#FFF","#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
L'exemple ci-dessus crée un dégradé de blanc au centre de l'écran, vers le rouge sur les bords de l'écran, puis remplit l'écran avec ce dégradé.

---

<!--- suggest_start screen.setTranslation --->
##### screen.setTranslation( tx, ty )
Définit une translation des coordonnées de l'écran pour toutes les opérations de dessin qui vont suivre.
<!--- suggest_end --->

```
screen.setTranslation(50,50)
screen.fillRect(0,0,20,20)
```
Le rectangle dans l'exemple ci-dessus sera dessiné avec un décalage de 50,50.

N'oubliez pas de remettre la translation à 0,0 lorsque vous souhaitez cesser de décaler les opérations de dessin:
```
screen.setTranslation(0,0)
```


<!--- suggest_start screen.setDrawRotation --->
##### screen.setDrawRotation( angle )
Définit un angle de rotation pour les prochaines opérations de dessin. L'angle est exprimé en degrés.
<!--- suggest_end --->

```
screen.setDrawRotation(45)
screen.drawSprite("icon",0,0,100)
```
L'exemple ci-dessus dessine l'icône du projet, inclinée de 45 degrés.

N'oubliez pas de remettre l'angle de rotation à 0 après l'avoir utilisé !
```
screen.setDrawRotation(0) // remet l'angle de rotation à sa valeur par défaut
```


<!--- suggest_start screen.setDrawScale --->
##### screen.setDrawScale( x , y )
Définit un facteur d'échelle pour le dessin des prochains éléments à l'écran. ```x``` définit le facteur d'échelle sur l'axe x et ```y``` le facteur d'échelle sur l'axe y. Une valeur de 2 affichera tout deux fois plus grand. Une valeur de -1 permet par exemple de retourner un sprite (miroir), horizontalement (x) ou verticalement (y).
<!--- suggest_end --->

```
screen.setDrawScale(1,-1)
screen.drawSprite("icon",0,0,100)
```
L'exemple ci-dessus dessine l'icône du projet, retournée verticalement.

N'oubliez pas de remettre le facteur d'échelle à 1,1 après l'avoir utilisé !
```
screen.setDrawScale(1,1) // remet le facteur d'échelle à sa valeur par défaut.
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setDrawAnchor( anchor_x, anchor_y )
Par défaut, toutes les opérations de dessin considèrent que vos coordonnées donnent le centre de la forme à dessiner. Vous pouvez changer cela en appelant :
`screen.setDrawAnchor( anchor_x, anchor_y )` pour définir un nouveau point d'ancrage de vos opérations de dessin.

<!--- suggest_end --->
Sur l'axe X, le point d'ancrage peut être réglé à -1 (côté gauche de votre forme), 0 (centre de votre forme), 1 (côté droit de votre forme) ou toute valeur intermédiaire. Sur l'axe Y, votre point d'ancrage peut être placé à -1 (côté inférieur de votre forme), 0 (centre de votre forme), 1 (côté supérieur de votre forme) our toute valeur intermédiaire.

Exemples
```
screen.setDrawAnchor(-1,0) // utile pour aligner le texte à gauche par exemple
screen.setDrawAnchor(-1,-1) // vos coordonnées de dessin seront désormais considérées comme la position du coin inférieur gauche de votre forme.
screen.setDrawAnchor(0,0) // valeur par défaut, toutes les formes seront dessinées centrées sur vos coordonnées.
```


<!--- suggest_start screen.width --->
##### screen.width
Le champ ```width``` de l'object screen a pour valeur la largeur actuelle de l'écran (toujours 200 si l'écran est en mode portrait, voir *coordonnées d'affichage*).
<!--- suggest_end --->

<!--- suggest_start screen.height --->
##### screen.height
Le champ ```height``` de l'object screen a pour valeur la hauteur actuelle de l'écran (toujours 200 si l'écran est en mode paysage, voir *coordonnées d'affichage*).
<!--- suggest_end --->

<!--- suggest_start screen.setCursorVisible --->
##### screen.setCursorVisible( visible )
Vous pouvez utiliser cette fonction pour afficher ou cacher le curseur de la souris.
<!--- suggest_end --->


## Entrées, contrôle

Pour rendre votre programme interactif, vous devez savoir si l'utilisateur presse une touche du clavier, de la manette de jeu, est-ce qu'il touche l'écran tactile et à quel endroit. *microStudio* vous permet de connaître l'état de ces différentes interfaces de contrôle, via les objets ```keyboard``` (pour le clavier), ```touch``` (pour l'écran tactile / la souris), ```gamepad``` (pour la manette de jeu).

##### Note
L'objet ```system.inputs``` donne quelques informations utiles sur les entrées disponibles sur le système hôte :

|Champ|Valeur|
|-|-|
|system.inputs.keyboard|1 si le système est supposé comporter un clavier physique, 0 sinon|
|system.inputs.mouse|1 si le système a une souris, 0 sinon|
|system.inputs.touch|1 si le système est doté d'un écran tactile, 0 sinon|
|system.inputs.gamepad|1 s'il y a au moins une manette (gamepad) connectée au système, 0 sinon (le gamepad peut n'apparaître qu'après que l'utilisateur ait effectué une première action dessus.)|

### Entrées clavier
<!--- suggest_start keyboard --->
Les entrées clavier peuvent être testées grâce à l'objet ```keyboard```. Par exemple:

```
if keyboard.A then
  // la touche A est actuellement pressée
end
```
<!--- suggest_end --->

Notez que lorsque vous testez votre projet, pour que les événements clavier parviennent jusqu'à la fenêtre d'éxécution, il est nécessaire de cliquer dans celle-ci au préalable.

Le code ci-dessous permet de visualiser l'identifiant de chaque touche clavier pressée. Il peut vous être utile pour établir la liste des identifiants dont vous aurez besoin pour votre projet.

```
draw = function()
  screen.clear()
  local y = 80
  for key in keyboard
    if keyboard[key] then
      screen.drawText(key,0,y,15,"#FFF")
      y -= 20
    end
  end
end
```
*microStudio* crée pour vous quelques codes génériques utiles, comme UP, DOWN, LEFT et RIGHT qui réagissent à la fois aux touches flèches et à ZQSD / WASD selon la disposition de votre clavier.

Pour tester les caractères spéciaux comme les signes +, - ou encore les parenthèses, vous devez utiliser la syntaxe suivante : ```keyboard["("]```, ```keyboard["-"]```.

##### Tester si une touche vient juste d'être pressée
Dans le contexte de la fonction ```update()```, vous pouvez vérifier si une touche du clavier vient juste d'être enfoncée en utilisant ```keyboard.press.<KEY>```.

Exemple:

```
if keyboard.press.A then
  // Faire quelque chose une seule fois, juste au moment où la touche A est enfoncée
end
```

##### Tester si une touche vient juste d'être relâchée
Dans le contexte de la fonction ```update()```, vous pouvez vérifier si une touche du clavier vient juste d'être relâchée en utilisant ```keyboard.release.<KEY>```.

Exemple:

```
if keyboard.release.A then
  // Faire quelque chose une seule fois, juste au moment où la touche A est relâchée
end
```

### Entrées tactiles

Les entrées tactiles peuvent être testées avec l'objet ```touch``` (qui relate aussi l'état de la souris).

|Champ|Valeur|
|-|-|
|touch.touching|Est vrai si l'utilisateur touche l'écran, faux sinon|
|touch.x|Position x où l'écran est touché|
|touch.y|Position y où l'écran est touché|
|touch.touches|Dans le cas où vous devez prendre en compte de multiples points tactiles simultanément, touch.touches est une liste des points tactiles actifs en cours|
|touch.press|Vrai si le doigt vient juste de commencer à toucher l'écran|
|touch.release|Vrai si le doigt vient juste de quitter l'écran|

```
if touch.touching
  // l'utilisateur touche l'écran
else
 // l'utilisateur ne touche pas l'écran
end
```

```
draw = function()
  for t in touch.touches
    screen.drawSprite("icon",t.x,t.y,50)
  end
end
```
L'exemple ci-dessus affiche l'icône du projet à chaque point tactile actif sur l'écran.  

<!--- suggest_start mouse --->
### Entrées souris

Les entrées souris peuvent être testées avec l'objet ```mouse``` (qui prend aussi en compte les événements tactiles).
<!--- suggest_end --->

|Champ|Valeur|
|-|-|
|mouse.x|Position x du curseur de la souris|
|mouse.y|Position y du curseur de la souris|
|mouse.pressed|1 si un quelconque bouton de la souris est pressé, 0 sinon|
|mouse.left|1 si le bouton gauche de la souris est pressé, 0 sinon|
|mouse.right|1 si le bouton droit de la souris est pressé, 0 sinon|
|mouse.middle|1 si le bouton du milieu de la souris est pressé, 0 sinon|
|mouse.press|Vrai si un bouton de la souris vient juste d'être enfoncé|
|mouse.release|Vrai si un bouton de la souris vient juste d'être relâché|

### Entrées manette (gamepad)
<!--- suggest_start gamepad --->
Le statut des boutons et joysticks de la manette (gamepad) peuvent être testés grâce à l'objet ```gamepad```. Exemple :

```
if gamepad.UP then y += 1 end
```

**Astuce** : Pour connaître la liste complète des champs de l'objet ```gamepad```, tapez simplement "gamepad" dans la console lorsque votre programme est en cours d'exécution.

De même que pour les touches du clavier, vous pouvez utiliser ```gamepad.press.<BOUTON>``` pour savoir si un bouton de la manette vient juste d'être
enfoncé ou ```gamepad.release.<BOUTON>```pour savoir si un bouton vient juste d'être relâché.

<!--- suggest_end --->

## Sons (```audio```)

*microStudio* disposera bientôt d'une section dédiée pour créer des sons et de la musique. En attendant, il est possible d'utiliser le *beeper* pour sonoriser vos créations de façon simple.

<!--- suggest_start audio.beep --->
### audio.beep
Joue un son décrit par la chaîne de caractères passée en paramètre.

```
audio.beep("DO MI SOL")
```
<!--- suggest_end --->
Exemple plus élaboré et explications dans le tableau ci-dessous :
```
"saw duration 100 span 50 duration 500 volume 50 span 50 loop 4 DO2 DO FA SOL SOL FA end"
```

|Commande|Description|
|-|-|
|saw|indique le type de générateur de son (couleur du son), valeurs possibles : saw, sine, square, noise|
|duration|suivi d'un nombre de millisecondes indique la durée des notes|
|tempo|suivi d'un nombre de notes par minute, indique le tempo|
|span|suivi d'un nombre entre 1 et 100, indique le pourcentage de tenue de chaque note|
|volume|suivi d'un nombre entre 0 et 100, règle le volume sonore|
|DO|ou RE, MI, FA etc. indique une note à jouer. Il est possible d'indiquer l'octave également, exemple DO5 pour le DO du 5ème octave du clavier.|
|C|il est possible d'utiliser également la notation anglo-saxonne des notes, avec des lettres de A à G ; exemple ```"C4 E G"```|
|loop|suivi d'un nombre, indique le nombre de fois que la séquence qui suit devra être répétée. La séquence se termine par le mot-clé ```"end"``` exemple : ```"loop 4 C4 E G end"``` ; le nombre 0 signifie que la boucle doit être répétée indéfiniment.|

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Annule tous les sons en train d'être joués par le *beeper*. Utile notamment pour couper le son après avoir démarré une boucle musicale.
<!--- suggest_end --->

## Accès aux Sprites
Votre programme peut accéder aux sprites de votre projet, qui sont stockés dans l'objet prédéfini ```sprites```:

```
monsprite = sprites["icon"]
```

Vous pouvez alors accéder aux différents champs et méthodes de votre sprite :

|field/method|description|
|-|-|
|```monsprite.width```|La largeur du sprite en pixels|
|```monsprite.height```|La hauteur du sprite en pixels|
|```monsprite.ready```|1 lorsque le sprite est complètement chargé, 0 sinon|
|```monsprite.name```|Nom du sprite|

*Note: d'autres champs et méthodes natives peuvent paraître disponibles lorsque vous inspectez un objet sprite dans la console. De tels champs et méthodes, non documentés, pourraient être remplacés à l'avenir. Nous vous déconseillons de les utiliser !*

## Accès aux Maps
Votre programme peut accéder aux maps de votre projet, qui sont stockés dans l'objet prédéfini ```maps```:

```
mamap = maps["map1"]
```

Vous pouvez alors accéder aux différents champs et méthodes de votre map :

|field/method|description|
|-|-|
|```mamap.width```|La largeur de la map en nombre de cellules|
|```mamap.height```|La hauteur de la map en nombre de cellules|
|```mamap.block_width```|La largeur d'une cellule de la map en pixels|
|```mamap.block_height```|La hauteur d'une cellule de la map en pixels|
|```mamap.ready```|1 lorsque la map est complètement chargée, 0 sinon|
|```mamap.name```|Nom de la map|
|```mamap.get(x,y)```|Renvoie le nom du sprite dans la cellule (x,y) ; l'origine des coordonnées est (0,0), située en bas à gauche de la map. Renvoie 0 si la cellule est vide|
|```mamap.set(x,y,name)```|Place un nouveau sprite dans la cellule (x,y) ; l'origine des coordonnées est (0,0), située en bas à gauche de la map. Le troisième paramètre est le nom du sprite.|
|```mamap.clone()```|Renvoie un nouvel objet map, copie conforme de mamap.|

*Note: d'autres champs et méthodes natives peuvent paraître disponibles lorsque vous inspectez un objet map dans la console. De tels champs et méthodes, non documentés, pourraient être remplacés à l'avenir. Nous vous déconseillons de les utiliser !*

## Système
L'objet ```system``` permet d'accéder à la fonction ```time```, qui renvoie le temps écoulé en millisecondes (depuis le 1er janvier 1970). Mais surtout, invoquée à divers moments, elle permet de mesurer des écarts de temps.

<!--- suggest_start system.time --->
### system.time()
Renvoie le temps écoulé en millisecondes (depuis le 1er janvier 1970)
<!--- suggest_end --->

## Stockage
L'objet ```storage``` permet de stocker des données de manière permanente. Voud pouvez ainsi sauvegarder le progrès du joueur, une liste des meilleurs scores ou toute autre information sur l'état de votre jeu ou projet.

<!--- suggest_start storage.set --->
### storage.set( nom , valeur )
Enregistre votre valeur de manière permanente, référencée par la chaîne de caractères ```nom```. Cette valeur peut être n'importe quel nombre, chaîne de caractères, liste ou objet structuré.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get( nom )
Renvoie la valeur enregistrée pour la référence ```nom```. Renvoie ```0``` s'il n'existe pas d'enregistrement pour cette référence.
<!--- suggest_end --->
