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
##### screen.clear( couleur )
Efface l'écran en le remplissant soit de la couleur passée en paramètre, soit de noir si aucune couleur n'est passée en paramètre.
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


<!--- suggest_start screen.drawTextOutline --->
##### screen.drawTextOutline( text, x, y, size, &lt;color&gt; )
Dessine le contour du texte. On peut dessiner le contour dans une couleur différente, après un ```drawText``` pour augmenter le contraste. L'épaisseur du contour peut être réglée avec ```screen.setLineWidth```.
<!--- suggest_end --->

```
screen.drawTextOutline("Hello!",0,0,30, "#F00")
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

<!--- suggest_start screen.loadFont --->
##### screen.loadFont( font_name )
Initie le chargement d'une police de caractères. Utile en conjonction avec `screen.isFontReady`
<!--- suggest_end --->

```
screen.loadFont("DigitalDisco")
```
<!--- suggest_start screen.isFontReady --->
##### screen.isFontReady( font_name )
Renvoie 1 (vrai) si la police demandée est chargée et prête à être utilisée. Prenez soin d'appeler `screen.loadFont` au préalable, sans quoi votre police pourrait ne jamais être chargée.
<!--- suggest_end --->
Vous pouvez omettre l'argument, dans ce cas la fonction testera si la police en cours est chargée et prête à être utilisée (la police par défaut, ou la dernière police que vous avez choisie avec `screen.setFont( nom_de_police )`.

```
if screen.isFontReady() then
  // nous pouvons ici utiliser la police par défaut
  screen.drawText("DU TEXTE",0,0,50)
end

screen.loadFont("DigitalDisco") // assurons-nous que DigitalDisco va être chargée

if screen.isFontReady("DigitalDisco")
  screen.setFont("DigitalDisco")
  screen.drawText("ENCORE DU TEXTE",0,50,20)
end
```

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

<!--- suggest_start screen.setBlending --->
##### screen.setBlending( blending )
Définit comment les opérations de dessin à venir doivent être appliquées sur le contenu déjà à l'image (blending). Peut être réglé sur `normal` ou `additive`.
<!--- suggest_end --->

Vous pouvez aussi utiliser tous les modes de composition définis pour le Canvas HTML5, voir ce lien pour référence : https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation


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

*microStudio* vous permet maintenant de jouer des sons et musiques que vous avez importées dans votre projet (sous la forme de fichiers WAV ou MP3). Vous pouvez aussi créer des sons avec du code en utilisant le *beeper*.

### Jouer un son
<!--- suggest_start audio.playSound --->
##### audio.playSound( nom, volume, vitesse, panoramique, boucle )
Joue le son donné, avec les éventuels paramètres optionnels.
<!--- suggest_end --->

##### paramètres
|Paramètre|Description|
|-|-|
|nom|Le nom du son à jouer (son identifiant dans l'onglet Sons de votre projet)|
|volume|[optionnel] Le volume de sortie de 0 à 1|
|vitesse|[optionnel] La vitesse de lecture du son, 1 étant la vitesse par défaut|
|panoramique|[optionnel] Le réglage de panoramique, variant de -1 (gauche) à 1 (droite)|
|boucle|[optionnel] Réglez à 1 (vrai) si vous voulez que le son soit joué en boucle|

L'appel de fonction renvoie un objet. Cet objet permet de contrôler la lecture du son pendant qu'il est joué :

##### exemple
```
mon_son = audio.playSound("monson")
mon_son.setVolume(0.5)
```

|Fonction de contrôle|description|
|-|-|
|mon_son.setVolume(volume)|Modifie le volume de lecture du son (entre 0 et 1)|
|mon_son.setPitch(vitesse)|Modifie la vitesse de lecture du son (1 est la vitesse normale)|
|mon_son.setPan(pan)|Modifie le panoramique (de -1 à 1)|
|mon_son.stop()|Stoppe la lecture du son|

### Jouer une musique
<!--- suggest_start audio.playMusic --->
##### audio.playMusic( nom, volume, boucle )
Joue la musique donnée, avec les réglages optionnels.
<!--- suggest_end --->

##### paramètres
|Paramètre|Description|
|-|-|
|nom|Le nom de la musique (son identifiant dans l'onglet musique de votre projet)|
|volume|[optionnel] Le volume de lecture, entre 0 et 1|
|boucle|[optionnel] Réglez à 1 (vrai) si vous voulez que la musique soit jouée en boucle|

L'appel de fonction renvoie un objet. Cet objet permet de contrôler la lecture de la musique pendant qu'elle est jouée :

##### exemple
```
ma_musique = audio.playMusic("mamusique")
ma_musique.setVolume(0.5)
```

|Fonction de contrôle|description|
|-|-|
|ma_musique.setVolume(volume)|Modifie le volume de lecture de la musique (entre 0 et 1)|
|ma_musique.stop()|Stoppe la musique|
|ma_musique.play()|Reprend la lecture, si vous l'aviez stoppée avant|
|ma_musique.getPosition()|Renvoie la position de lecture actuelle en secondes|
|ma_musique.getDuration()|Renvoie la durée totale de la musique, en secondes|

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
L'objet ```storage``` permet de stocker des données de manière permanente. Vous pouvez ainsi sauvegarder le progrès du joueur, une liste des meilleurs scores ou toute autre information sur l'état de votre jeu ou projet.

<!--- suggest_start storage.set --->
### storage.set( nom , valeur )
Enregistre votre valeur de manière permanente, référencée par la chaîne de caractères ```nom```. Cette valeur peut être n'importe quel nombre, chaîne de caractères, liste ou objet structuré.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get( nom )
Renvoie la valeur enregistrée pour la référence ```nom```. Renvoie ```0``` s'il n'existe pas d'enregistrement pour cette référence.
<!--- suggest_end --->
