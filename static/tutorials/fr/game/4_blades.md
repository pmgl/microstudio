# Tutorial

:project Tutoriel: Créer un jeu

## Lames

:position 50,50,40,40

### Lames

Nous allons maintenant ajouter quelques obstacles que notre héros doit éviter en sautant.
Nous les appellerons les lames (blades en anglais) mais vous pouvez imaginer n'importe quoi
d'autre pourvu que ça ait l'air vraiment dangereux !

Ouvrez l'onglet Sprites, cliquez sur "Ajouter un sprite" pour créer votre nouveau sprite. Assurez-vous
de le renommer "blade" pour qu'il fonctionne correctement avec le reste de ce tutoriel. Dessinez
votre méchante lame !

## Initialisation des lames

### Initialisation des lames

Maintenant que votre sprite "blade" est prêt, nous allons créer un ensemble de trois lames avec notre
code, nous allons les afficher et les faire réapparaître loin devant notre héros une fois qu'elles
disparaissent derrière lui.

Nous allons initialiser deux listes dans le corps de la fonction ```init```. La première liste, ```blades``` va
contenir la position de nos 3 lames. Le deuxième tableau, ```passed``` sera utilisé pour mémoriser le passage de
notre héros au-dessus d'une lame :

```
init = function()
  blades = [200,300,400]
  passed = [0,0,0]
end
```

## Création du "comportement" des lames

### Création du "comportement" des lames

Pendant que notre héros court sur le mur, les lames vont sembler se déplacer jusqu'à lui puis
disparaître derrière lui. Une fois une lame disparue, nous allons la réutiliser et la faire réapparaître
loin devant le héros, avec une position partiellement aléatoire. Le code ci-dessous parcourt la liste de
lames et fait exactement cela. Il doit être inséré dans le corps de la fonction ```update```.

```
  for i=0 to blades.length-1
    if blades[i]<position-120 then
      blades[i] = position+280+random.next()*200
      passed[i] = 0
    end
  end
```

Lorsque nous faisons réapparaître une lame loin devant le héros, nous remettons aussi à zéro la valeur
dans la liste ```passed```, pour mémoriser que le joueur n'a pas encore franchi cette lame.

## Affichage des lames

### Affichage des lames

Nous pouvons maintenant afficher les lames à l'écran. Pour faire cela, ajoutons le code ci-dessous dans le corps
de notre fonction ```draw```.
Ce code parcourt la liste des lames et dessine le sprite "blade" à leur position.

```
  for i=0 to blades.length-1
    screen.drawSprite("blade",blades[i]-position-80,-50,20)
  end
```

La coordonnée x pour dessiner le sprite est calculée comme la différence entre la position de la lame et la variable globale
*position*. Ainsi, lorsque la position de la lame est égale à la position de notre héros, les deux seront dessinés à la même place,
ce qui semble logique.

## Test de collision avec les lames

### Test de collision avec les lames

Nous allons maintenant déterminer si le héros entre en collision avec une lame, ou saute par dessus. Pour chaque lame, nous
allons calculer la différence entre la position de la lame et la position du héros. Si la valeur absolue de cette différence
est suffisamment petite, nous pouvons considérer que les deux se touchent. Maintenant, si la position verticale du héros est
suffisamment haute, le héros est en fait en train de sauter et ne touche pas vraiment la lame. Voici comment tout cela se traduit
en code, à insérer dans la *boucle for* dans le corps de la fonction *update* :

```
    if abs(position-blades[i])<10 then
      if hero_y<10 then
        gameover = 1 // c'est perdu !
      elsif not passed[i] then
        passed[i] = 1
        score += 1
      end
    end
```

Dans le code ci-dessus, nous assignons la valeur 1 à une variable ```gameover```  lorsque le héros touche une lame.
Nous allons utiliser cela un peu plus tard pour déterminer que la partie est perdue. Nous incrémentons aussi
une nouvelle variable ```score```, pour compter combien de lames ont été franchies par le joueur avec succès et utiliser
cela comme un score que nous afficherons.

Voici le code complet de la *boucle for* dans la fonction *update* :

```
  for i=0 to blades.length-1
    if blades[i]<position-120 then
      blades[i] = position+280+random.next()*200
      passed[i] = 0
    end
    if abs(position-blades[i])<10 then
      if hero_y<10 then
        gameover = 1
      elsif not passed[i] then
        passed[i] = 1
        score += 1
      end
    end
  end
```

## Affichage du score

### Affichage du score

Nous enregistrons donc maintenant un score, pourquoi pas l'afficher maintenant ? Ajoutons ceci
au corps de la fonction *draw* :

```
    screen.drawText(score,120,80,20,"#FFF")
```


## Suite

### Suite

Notre jeu est presque terminé ! Dans le tutoriel suivant, nous nous occuperons du cas où la partie
est perdue et verrons comment réinitialiser une nouvelle partie. Voici le code complet tel qu'il
devrait être maintenant :

```
init = function()
  blades = [200,300,400]
  passed = [0,0,0]
end

update = function()
  position = position+2

  if touch.touching and hero_y == 0 then
     hero_vy = 7
  end

  hero_vy -= 0.3
  hero_y = max(0,hero_y+hero_vy)

  for i=0 to blades.length-1
    if blades[i]<position-120 then
      blades[i] = position+280+random.next()*200
      passed[i] = 0
    end
    if abs(position-blades[i])<10 then
      if hero_y<10 then
        gameover = 1
      elsif not passed[i] then
        passed[i] = 1
        score += 1
      end
    end
  end
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")

  for i=-6 to 6 by 1
    screen.drawSprite("wall",i*40-position%40,-80,40)
  end

  screen.drawSprite("hero",-80,-50+hero_y,20)

  for i=0 to blades.length-1
    screen.drawSprite("blade",blades[i]-position-80,-50,20)
  end

  screen.drawText(score,120,80,20,"#FFF")
end
```
