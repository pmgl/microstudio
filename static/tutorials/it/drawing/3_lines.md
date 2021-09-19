<!-- 1. Forme (Rect, Round, RoundRect) -->
<!-- 2. Colori -->
<!-- 3. Linee, Poligoni -->
<!-- 4. Testo -->
<!-- 5. Sprite e mappe -->
<!-- 6. Gradienti -->
<!-- 7. Rotazione, scalatura, trasparenza -->


# Tutorial

:project Tutorial: Disegno

## Disegno di una linea

:position 50,50,40,40

### Disegno di una linea

Puoi disegnare una linea dando le coordinate x,y dei due punti finali alla
funzione ```screen.drawLine```:

```
screen.drawLine(0,0,100,50,"rgb(255,255,255)")
```

L'esempio sopra disegna una linea che unisce il punto (0,0) e il punto (100,50). Come per
qualsiasi chiamata di disegno, l'ultimo parametro è il colore del disegno e può essere omesso.

## Disegno di un poligono

### Disegno di un poligono

Puoi disegnare un poligono chiamando ```screen.drawPolygon```, passando le coordinate dello schermo
dei tuoi punti come parametri:

```
screen.drawPolygon(-50,50,50,50,0,0,-50,50,"rgb(0,255,255)")
```

Potete aggiungere qualsiasi numero di punti. Notate che se non chiudete il poligono
ripetendo il primo punto come ultimo punto, il risultato assomiglierà più ad una "polilinea".


## Disegno di un poligono

### Disegno di un poligono

Puoi anche chiamare ```screen.drawPolygon``` con una lista (di coordinate) come
il primo argomento (e un colore opzionale per il secondo argomento):

```
punti = [-50,50,50,50,50,0,0,-50,50]
screen.drawPolygon(punti, "rgb(0,255,255)")
```

Questo può essere utile per esempio se vuoi animare il tuo poligono da codice.


## Impostazione della larghezza della linea

### Impostazione della larghezza della linea

Puoi impostare la larghezza o lo spessore della linea chiamando ```screen.setLineWidth```.
Assicurati di eseguirlo prima delle tue chiamate a drawLine o drawPolygon:

```
screen.setLineWidth(4)
screen.drawPolygon(-50,50,50,50,0,0,-50,50,"rgb(0,255,255)")
```

La larghezza predefinita della linea è 1. Usate valori tra 0.0 e 1.0 per linee molto sottili o 
valori superiori a 5 per linee molto spesse.


## Poligono riempito

### Poligono riempito

Puoi chiamare ```screen.fillPolygon``` per disegnare un poligono riempito.
Assicurati di "chiudere" il tuo poligono ripetendo il primo punto come ultimo punto, o
potresti ottenere risultati inaspettati:

```
punti = [-50,50,50,50,0,0,-50,50]
screen.fillPolygon(punti, "rgb(0,255,255)")

screen.fillPolygon(30,-40,70,20,-12,-20,"rgba(255,128,0)")
```

## Avanti

### Cosa c'è dopo?

Il prossimo tutorial di questo corso riguarda il disegno del testo.
