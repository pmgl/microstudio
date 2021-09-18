<!-- 1. Shapes (Rect, Round, RoundRect) -->
<!-- 2. Colors -->
<!-- 3. Lines, Polygons -->
<!-- 4. Text -->
<!-- 5. Sprites and Maps -->
<!-- 6. Gradients -->
<!-- 7. Rotating, Scaling, Transparency -->


# Tutorial

:project Tutoriel: Dessiner

## Dessiner une ligne

:position 50,50,40,40

### Dessiner une ligne

Vous pouvez dessiner une ligne en donnant les coordonnées x,y des deux points
à joindre, avec la fonction ```screen.drawLine``` :

```
screen.drawLine(0,0,100,50,"rgb(255,255,255)")
```

L'exemple ci-dessus dessine une ligne joignant le point (0,0) au point (100,50).
Comme pour tout appel de dessin, le dernier paramètre est la couleur à utiliser. Il
peut être omis.

## Dessiner un polygone

### Dessiner un polygone

Vous pouvez dessiner un polygone en appelant ```screen.drawPolygon```, avec comme arguments
les coordonnées de vos points :

```
screen.drawPolygon(-50,50,50,50,0,0,-50,50,"rgb(0,255,255)")
```

Vous pouvez ajouter autant de points que vous voulez. Notez que si vous ne "fermez" pas
le polygone en répétant le premier point à la fin de votre liste, le résultat ressemblera
plus à une "polyligne" qu'à un polygone.


## Dessiner un polygone

### Dessiner un polygone

Vous pouvez aussi appeler ```screen.drawPolygon``` avec une liste (de coordonnées) comme premier
argument (et une couleur optionnelle comme second argument) :

```
points = [-50,50,50,50,0,0,-50,50]
screen.drawPolygon(points,"rgb(0,255,255)")
```

Ceci peut être utile, par exemple si vous voulez animer votre polygone en changeant les coordonnées
régulièrement.

## Définir l'épaisseur du trait

### Définir l'épaisseur du trait

Vous pouvez changer l'épaisseur du trait en appelant ```screen.setLineWidth```. Assurez-vous
d'appeler cette fonction avant vos appels à drawLine ou drawPolygon :

```
screen.setLineWidth(4)
screen.drawPolygon(-50,50,50,50,0,0,-50,50,"rgb(0,255,255)")
```

L'épaisseur par défaut est 1. Utilisez des valeurs entre 0.0 et 1.0 pour des lignes très
fines ou au-delà de 5 pour des lignes très épaisses.

## Polygone rempli

### Polygone rempli

Vous pouvez appeler ```screen.fillPolygon``` pour dessiner un polygone plein à l'écran.
Assurez-vous de "fermer" votre polygone en répétant le premier point en guise de dernier point, ou
vous pourriez obtenir des résultats inattendus :

```
points = [-50,50,50,50,0,0,-50,50]
screen.fillPolygon(points,"rgb(0,255,255)")

screen.fillPolygon(30,-40,70,20,-12,-20,"rgba(255,128,0)")
```

## Et ensuite ?

### Et ensuite ?

Le prochain tutoriel de cette série porte sur le dessin de texte !
