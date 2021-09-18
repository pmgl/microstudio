# Tutorial

:project Programmation

## Les variables

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Les variables

Les variables sont un élément essentiel des langages de programmation. Une variable
est un emplacement dans la mémoire de l'ordinateur, qui contient une valeur et qui
est désigné par un identifiant choisi par le programmeur.

Pendant ce tutoriel, n'hésitez pas à recopier les divers exemples dans la console
ou à expérimenter avec les vôtres.

## Les variables

:navigate projects.code.console

:position 55,30,40,40

### Les variables

Les variables sont donc là pour nous faciliter la tâche ! Elles nous permettent
par exemple d'écrire :

```
meubles = chaises + tables
```

Au lieu de :

```
memoire_514 = memoire_23 + memoire_1289
```

Ce dernier exemple parle peut-être mieux à un ordinateur mais serait beaucoup plus difficile
à relire pour un être humain !

## Affecter une valeur à une variable

:navigate projects.code.console

### Affecter une valeur à une variable

Affecter une valeur à une variable signifie la définir, c'est à dire lui attribuer une valeur. On utilise le
signe ```=``` pour cela, par exemple :

```
mavariable = 1000
```

En microScript, il suffit d'affecter une valeur à une variable pour qu'elle soit définie
(c'est à dire pour qu'une case mémoire lui soit attribuée). Une variable qui n'a pas
encore été définie, donc n'a pas de case mémoire, aura toujours la valeur par défaut ```0```.

## Nommer ses variables

:navigate projects.code.console

### Nommer ses variables

Il existe quelques règles pour bien nommer ses variables. En microScript, on ne peut
utiliser que les lettres de l'alphabet, sans accent ni cédille, en majuscules ou en minuscules,
ainsi que le caractère "souligné" ```_```. Les chiffres de 0 à 9 peuvent aussi être utilisés,
sauf pour le premier caractère du nom de variable.


## Nommer ses variables

:navigate projects.code.console

### Nommer ses variables

Exemples :
```
// variables correctement nommées

score = 100
Joueur_1 = 0

// variables incorrectes :

mémoire = 10       // accents interdits !
2_joueurs = 2      // on ne peut pas commencer par un chiffre !
mon personnage = 3 // espaces non autorisés !
```

## Nommer ses variables

### Nommer ses variables

En plus de ces règles à respecter strictement, nous vous conseillons de choisir
des noms de variables évocateurs pour facilier la relecture de votre code. Préférez
toujours :

```
nombre_de_carottes = 25
```

plutôt que

```
c = 25
```

## Types de valeurs

:navigate projects.code.console

### Types de valeurs

Les variables en microScript peuvent mémoriser plusieurs types de valeurs :

* Un nombre, comme ```15```, ```-7``` ou ```3.141592```
* Du texte, on parlera alors de "chaîne de caractères". Exemple : ```"Bonjour"```,
```"Vous avez gagné !"```...
* Une fonction (étudiées dans la suite de ce parcours). Exemple : ```function(x) return x*x end```
* Une liste (étudiées dans la suite de ce parcours). Exemple : ```[1,3,5,7]``` ou ```["chien","chat","lapin"]```
* Un objet (étudiés dans la suite de ce parcours). Exemple : ```object x=1 y=2 end```

## Utiliser une variable

### Utiliser une variable

Une variable peut être utilisée dans toute *expression* du programme et sera alors
substituée par sa valeur courante lors de l'exécution.

```
score = 124
texte = "Votre score est de "
affichage = texte + score
print( affichage )
```

Dans l'exemple ci-dessus, la fonction ```print``` affiche dans la console la valeur
qu'on lui passe en paramètre (entre parenthèses).

L'opérateur ```+```, lorsqu'il est utilisé sur une chaînes de caractères, opère une
concaténation de chaînes de caractères (une mise bout à bout des textes). La valeur
de la variable ```affichage``` ci-dessus sera donc ```"Votre score est de 124"```.

## Portée et contexte

:navigate projects.code.console

### Visibilité et contexte

Les variables que nous avons définies jusqu'ici sont globales, c'est à dire qu'elles
appartiennent à une mémoire générale du programme et sont utilisables partout dans le programme.

Nous verrons lors de l'étude des fonctions et des objets que certaines variables peuvent
avoir une *visibilité* limitée. Par exemple une fonction, qui est une sorte de sous-programme,
pourra définir et utiliser une *variable locale*, qui ne sera connue que dans le corps
de la fonction et donc invisible ailleurs.
