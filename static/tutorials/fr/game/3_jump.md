# Tutorial

:project Tutoriel: Créer un jeu

## Sautons !

:position 50,50,40,40

### Sautons !

Notre héros va sauter lorsqu'on tapote l'écran ou clique avec la souris. Sauter signifie
acquérir un peu de vitesse verticale, qui va affecter la position du héros. La vitesse
verticale elle même sera affectée par la gravité.

## Sautons !

### Sautons !

Nous allons utiliser une variable ```hero_y``` comme position verticale du héros et ```hero_vy```
comme vitesse verticale du héros.

```hero_y``` est donc la position verticale où notre héros doit être dessiné. Nous rendons cela effectif
en modifiant la ligne suivante dans la fonction ```draw```:

```
  screen.drawSprite("hero",-80,-50+hero_y,20)
```

Maintenant notre position verticale doit évoluer en fonction de la vitesse verticale. Modélisons cela
dans notre fonction ```update``` en ajoutant :

```
  hero_y = hero_y + hero_vy
```

## Initier le saut

### Initier le saut

Nos deux conditions pour initier un saut sont :

1. Le héros doit être sur le sol, ce qui se traduit par ```hero_y == 0```
2. Le joueur touche l'écran / enfonce le bouton de la souris, ce qui peut être testé avec ```touch.touching```

Initier un saut signifie donner une valeur positive à la vitesse verticale, par exemple ```hero_vy = 7```

Ajoutons ce code à la fonction ```update``` :

```
  if touch.touching and hero_y == 0 then
    hero_vy = 7
  end
```

## Gravité

### Gravité

Maintenant que notre héros peut sauter, il traverse le plafond et disparaît en un rien de temps ! C'est parce que
nous n'avons pas encore introduit la gravité. La gravité est semblable à une accélération vers le bas. Chaque période de
temps écoulée, elle diminue notre vitesse verticale d'un montant fixe. Ajoutons la ligne suivant à notre fonction ```update``` :

```
  hero_vy = hero_vy - 0.3
```

Assez rapidement, notre héros va maintenant tomber ... et passer à travers le sol. Nous devons éviter cela, en changeant cette ligne :

```
  hero_y = hero_y + hero_vy
```

par :

```
  hero_y = max(0,hero_y+hero_vy)
```

Nous nous assurons juste désormais que la position verticale de notre héros ne peut pas tomber sous zéro.

## Suite

### Suite

Dans le tutoriel suivant, nous allons ajouter des lames que notre héros doit éviter en sautant par-dessus.
Voici notre code complet actuel :

```
init = function()
end

update = function()
  position = position+2

  if touch.touching and hero_y == 0 then
    hero_vy = 7
  end

  hero_vy = hero_vy - 0.3
  hero_y = max(0,hero_y+hero_vy)
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")

  for i=-6 to 6 by 1
    screen.drawSprite("wall",i*40-position%40,-80,40)
  end

  screen.drawSprite("hero",-80,-50+hero_y,20)
end
```
