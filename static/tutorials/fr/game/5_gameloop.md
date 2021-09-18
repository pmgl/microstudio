# Tutorial

:project Tutoriel: Créer un jeu

## Game over

:position 50,50,40,40

### Game over

Dans le tutoriel précédent, nous avons fait en sorte d'assigner la valeur 1 à une variable
*gameover* lorsque le joueur heurte une lame. Une fois que *gameover* est ainsi établie, nous devons :

* interrompre la partie
* attendre 5 secondes
* redémarrer une nouvelle partie

Nous allons interrompre le jeu en évitant tout le code actuel de notre fonction *update* (car c'est
lui qui fait avancer le jeu !). Nous attendrons 5 secondes en incrémentant la valeur de *gameover* dans
la fonction *update*, jusqu'à ce qu'elle atteigne 300. Nous redémarrerons une partie en appelant
une nouvelle fois la fonction *init*, après nous être assurés qu'elle réinitialise bien tout ce
qui devrait l'être.

## Game over

### Game over

Nous allons donc modifier le contenu de la fonction *update* comme suit :

```
  if gameover>0 then
    gameover = gameover+1
    if gameover>300 then init() end
  else
    // l'ancien contenu de update se retrouve ici
  end
```

La fonction *init* est maintenant réutilisée pour redémarrer le jeu 5 secondes après que la partie
soit terminée. Pour répondre correctement à cette mission, elle doit réinitialiser le *score*, remettre
la *position* à zéro, ainsi que la valeur de *gameover* :

```
init = function()
  blades = [200,300,400]
  passed = [0,0,0]
  gameover = 0
  score = 0
  position = 0
end
```

## Game over

### Game over

Lorsque la partie est terminée, nous devrions l'indiquer à l'écran ! Nous allons donc dessiner un rectangle
semi-transparent qui va couvrir toute l'interface du jeu et écrire le texte GAME OVER. Nous ajoutons cela à
la fin de notre fonction *draw* :

```
  if gameover then
    screen.fillRect(0,0,screen.width,screen.height,"rgba(255,0,0,.5)")
    screen.drawText("GAME OVER",0,0,50,"#FFF")
  end
```

## Accélération du jeu

### Accélération du jeu

Notre jeu est trop facile. Rendons-le un peu plus dur ! Nous allons progressivement accélérer le héros
pendant la partie. Nous faisons cela en créant une variable *speed* (vitesse) que nous initialisons à la
valeur 2 dans la fonction *init* :

```
  speed = 2
```
(dans la fonction init)

Nous remplaçons ensuite la ligne ```position = position + 2``` dans la fonction *update* par ceci :

```
  position = position + speed
  speed = speed + 0.001
```

La vitesse du héros va donc désormais augmenter tout au long de la partie !

## Terminé !

### Terminé !

Nous avons terminé notre jeu. Le code complet est fourni encore ci-dessous. Si vous regardez de plus près,
vous verrez que nous avons ajouté une variable *running* ("partie en cours"), qui sert à attendre que le joueur
touche l'écran ou clique pour démarrer le jeu.

Nous avons ajouté également quelques sons qui sont produits en appelant la fonction ```audio.beep()```. Vous pouvez
voir ça également en relisant le code ci-dessous.

Vous pouvez commencer à ajouter d'autres fonctionnalités au jeu. Pourquoi pas des objets volants à éviter ? Ou à
attraper ? A vous de jouer !

Merci d'avoir étudié cette série de tutoriels et amusez-vous bien avec microStudio !

```
init = function()
  gameover = 0
  running = 0
  blades = [200,300,400]
  passed = [0,0,0]
  score = 0
  position = 0
  speed = 2
end

update = function()
  if gameover>0 then
    gameover = gameover+1
    if gameover>300 then init() end
  elsif running then
    position = position+speed
    speed = speed + 0.001

    if touch.touching and hero_y == 0 then
       hero_vy = 7
       audio.beep("square tempo 20000 volume 10 span 100 C4 to C6")
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
          running = 0
          gameover = 1
          audio.beep("saw tempo 10000 volume 50 span 50 C2 to C4 to C2 to C4")
        elsif not passed[i] then
          passed[i] = 1
          score += 1
          audio.beep("saw tempo 960 volume 50 span 20 C6")
        end
      end
    end
  else
    if touch.touching then running = 1 end
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
  if gameover then
    screen.fillRect(0,0,screen.width,screen.height,"rgba(255,0,0,.5)")
    screen.drawText("GAME OVER",0,0,50,"#FFF")
  elsif not running then
    screen.drawText("READY?",0,30,50,"#FFF")
  end
end
```
