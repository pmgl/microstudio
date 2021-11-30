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
for element in liste
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
for nombre in liste
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

## Ordonner une liste

Vous pouvez trier les éléments d'une liste en utilisant la fonction ```liste.sortList(compareFunction)```. La fonction ```compareFunction``` que vous fournissez doit accepter deux arguments (que nous appellerons ```a``` et ```b```) et doit renvoyer :

|Valeur renvoyée|quand|
|-|-|
|un nombre négatif|quand ```a``` doit être classé avant ```b``` (a est moins que b)|
|zéro|quand ```a``` et ```b``` ont une position équivalente du point de vue du critère de tri choisi|
|un nombre positif|quand ```a``` doit être classé après ```b``` (a est plus que b)|

##### exemple

L'exemple ci-dessous considère que la liste contient des *points*, chaque point ayant un champ coordonnée ```x```. Nous voulons ordonner les points de la plus petite valeur de point.x jusqu'à la plus grande valeur de point.x :

```
compare = function(point1,point2)
  return point1.x - point2.x
end

liste.sortList(compare)
```

Notez que nous pouvons écrire le même code de façon plus concise :

```
liste.sortList(function(point1,point2) point1.x - point2.x end)
```

Lorsque la fonction de comparaison n'est pas fournie, les éléments seront ordonnés selon l'ordre alphabétique.

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
