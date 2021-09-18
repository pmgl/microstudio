# Tutorial

:project Programmation

## Les fonctions

:overlay

:position 30,30,40,40

:navigate projects.code.console

### Les fonctions

Une fonction est un sous-programme qui effectue une tâche bien définie et
qui peut retourner un résultat. Les fonctions permettent de mieux structurer un
programme.

Pendant ce tutoriel, n'hésitez pas à recopier les divers exemples dans la console
ou à expérimenter avec les vôtres.

## Appeler une fonction

:navigate projects.code.console

:position 55,30,40,40

### Appeler une fonction

Pour appeler une fonction (c'est à dire exécuter le sous-programme), on écrit
son identifiant puis une liste de paramètres entre parenthèses. Par exemple,
en microScript, la fonction prédéfinie ```max``` retourne le plus grand de deux
nombres :

```
max(12,17)
```

Il existe beaucoup d'autres fonctions prédéfinies, dont vous trouverez la liste
dans la documentation.

## Appeler une fonction

:navigate projects.code.console

:position 55,30,40,40

### La fonction print

La fonction ```print``` écrit dans la console ce qu'on lui passe en paramètre.
Elle peut être utile pour vérifier que le programme agit comme prévu et produit
les bons résultats.

Exemple :

```
print( "Le maximum entre 12 et 17 est "+ max(12,17) )
```

Il existe beaucoup d'autres fonctions utiles à connaître. Mais avant tout,
nous allons apprendre à créer nos propres fonctions.

## Créer une fonction

:navigate projects.code.console

### Définir une fonction

Voici comment définir vous-même une fonction que vous pourrez utiliser ensuite
dans votre code. Ecrivez :

```
moyenne = function(x,y)
  return (x+y)/2
end
```

Ci-dessus, nous affectons à la variable ```moyenne``` une valeur. Cette valeur est
une fonction, qui accepte deux paramètres ```x``` et ```y```. Le sous-programme est très simple,
il retourne le résultat du calcul ```(x+y)/2```. Pour *fermer* la définition de la fonction, il faut
utiliser le mot-clé ```end``` (qui signifie "fin").

## Utiliser notre fonction

:navigate projects.code.console

### Utiliser notre fonction

Nous pouvons maintenant utiliser notre fonction ```moyenne```. Ecrivez :

```
moyenne(14,16)
```

ou

```
moyenne(10,13)
```

## Paramètres

:navigate projects.code.console

### Valeurs passées en paramètres

Les valeurs passées en paramètre à une fonction peuvent être n'importe quelle *expression*,
c'est à dire un nombre, une variable, un autre appel de fonction. On peut donc tout à fait écrire :

```
moyenne(10+2,8+5)
```

ou encore :

```
moyenne(moyenne(5,18),moyenne(11,20))
```

## Variables locales

:navigate projects.code.console

### Variable locales

Une fonction peur recourir à des variables locales. Comme leur nom l'indique, ces variables n'existent
que dans le contexte de la fonction où elles sont définies. On dit que leur *visibilité*, ou *portée*
est limitée au corps de la fonction.

Exemple :

```
sommeCarres = function(a,b)
  local somme = 0
  somme = somme + a*a
  somme = somme + b*b
  return somme
end
```

## Variables locales

:navigate projects.code.console

### Variable locales

Notre fonction ```sommeCarres``` fait la somme des carrés de ses deux paramètres. Essayons :

```
sommeCarres(3,4)
```

Le résultat retourné par la fonction s'affiche. Maintenant vérifions la valeur de la variable ```somme``` :

```
somme
```

Etant sortis du contexte d'exécution de la fonction, la variable locale ```somme``` n'est plus
définie et a donc la valeur par défaut ```0```. Elle n'existe pas dans le *contexte global*.
D'ailleurs vérifions cela tout de suite :

```
global
```

Nous venons d'afficher le contexte global, c'est à dire le contenu de la mémoire de l'ordinateur.
Nous y voyons l'ensemble des variables que nous avons définies, notamment les fonctions que nous
avons créées dans ce tutoriel.

## Fin

:navigate projects.code.console

### Les fonctions

Nous avons déjà appris l'essentiel sur les fonctions ! Nous allons maintenant aborder
dans la suite de ce parcours :

* Comment créer et utiliser des listes
* Comment faire des choix avec les conditions ```if```
* Comment répéter des tâches avec les boucles ```for``` et ```while```
