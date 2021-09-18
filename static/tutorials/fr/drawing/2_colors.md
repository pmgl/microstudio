<!-- 1. Shapes (Rect, Round, RoundRect) -->
<!-- 2. Colors -->
<!-- 3. Lines, Polygons -->
<!-- 4. Text -->
<!-- 5. Sprites and Maps -->
<!-- 6. Gradients -->
<!-- 7. Rotating, Scaling, Transparency -->


# Tutorial

:project Tutoriel: Dessiner

## Couleurs

:position 50,50,40,40

### Couleurs

Votre écran d'ordinateur peut afficher presque toutes les couleurs en mélangeant du Rouge, du
Vert et du Bleu. Ce système s'appelle le modèle de couleurs RVB comme Rouge, Vert, Bleu (en anglais RGB pour Red Green Blue). Dans microStudio, une couleur
est définie par une chaîne de caractères, qui peut se conformer à différents formats. Commençons par
celui-ci :

```
screen.fillRect(0,0,50,50,"rgb(255,255,255)")
```

La couleur utilisée ci-dessus "rgb(255,255,255)" est le blanc, exprimé en RVB. La valeur pour le rouge, le vert et le bleu est fixée à 255, qui est la valeur maximale acceptée
(les valeurs acceptées vont de 0 à 255). Si vous mélangez toutes les couleurs au maximum de leur intensité, vous obtenez donc du blanc.

## Couleurs

### Couleurs RVB

Essayez de changer les valeurs du rouge, du vert et du bleu dans l'exemple précédent et constatez les couleurs que vous
arrivez à créer. Voici quelques exemples :

```
// rouge à fond et pas de vert ni de bleu : c'est du rouge pur et intense !
screen.fillRect(0,0,50,50,"rgb(255,0,0)")
```

```
// mélanger du rouge et du vert donne du jaune :
screen.fillRect(0,0,50,50,"rgb(255,255,0)")
```

```
// rouge = vert = bleu vous donnera une nuance de gris plus ou moins claire
screen.fillRect(0,0,50,50,"rgb(128,128,128)")
```

Essayez d'autres couleurs ! Vous pouvez utiliser aussi le sélecteur de couleur (maintenez la touche CTRL enfoncée)
et voyez comment la couleur que vous choisissez se traduit en RVB.

## Couleurs

### Omettre la couleur

microStudio vous autorise à omettre la couleur dans tous vos appels à des fonctions de dessin. Lorsqu'elle
est omise, la couleur sera remplacée par la dernière couleur utilisée. Vous pouvez aussi appeler la fonction
```screen.setColor``` pour définir une nouvelle couleur, qui sera utilisée pour tous les prochains appels
à des fonctions de dessin.

```
screen.setColor("rgb(0,255,255)")  // turquoise
screen.fillRect(0,0,50,50)
```

## Transparence

### Transparence

Vous pouvez rendre vos couleurs partiellement transparentes. En fonction de l'opacité
choisie, le contenu déjà dessiné sous votre nouvelle forme va rester partiellement visible.
L'opacité peut varier de 0 (complètement transparent) à 1 (complètement opaque). Voici
un exemple avec un blanc semi-opaque :

```
screen.setColor("rgba(255,255,255,0.5)")
```

Notez le "a" ajouté, formant "rgba" et le paramètre additionel après les trois composantes
de la couleur. "a" désigne en fait le canal "alpha", qui est le canal d'opacité lorsqu'on
encode les données d'une image.

## Autres formats

### Autres formats

microStudio accepte toutes les couleurs au format HTML/CSS. Cela signifie que vous pouvez utiliser
les formats RGB hexadécimaux (comme ```#FF00FF```), HSL etc. Nous ne les couvrirons pas dans ce tutoriel
cependant, si vous souhaitez en apprendre plus sur ces formats, vous pouvez consulter cette page :

https://developer.mozilla.org/fr/docs/Web/CSS/Type_color
