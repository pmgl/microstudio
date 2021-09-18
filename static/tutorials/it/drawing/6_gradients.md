<!-- 1. Forme (Rect, Round, RoundRect) -->
<!-- 2. Colori -->
<!-- 3. Linee, Poligoni -->
<!-- 4. Testo -->
<!-- 5. Sprite e mappe -->
<!-- 6. Gradienti -->
<!-- 7. Rotazione, scalatura, trasparenza -->


# Tutorial

:project Tutorial: Disegno

## Gradienti di colore

:position 50,50,40,40

### Gradienti di colore

I gradienti di colore lineari possono essere creati in questo modo:

```
screen.setLinearGradient(0,0,100,0,"rgb(255,0,0)","rgb(0,255,255)")
screen.fillRect(0,0,500,500)
```

I primi due argomenti definiscono le coordinate x1,y1 di un punto p1. I due argomenti successivi definiscono le coordinate x2,y2
di un altro punto p2. I parametri successivi sono due colori, che definiscono il colore che il gradiente avrà nel punto p1 e il 
colore in cui il gradiente si trasformerà nel punto p2.

## Gradienti di colore

:position 50,50,40,40

### Gradienti di colore

Una volta impostato un gradiente di colore, questo sarà usato come colore di disegno per tutte le successive chiamate alle funzioni di disegno,
*a patto che tali chiamate alle funzioni omettano il loro argomento di colore*. 
Il vostro gradiente sarà scartato non appena imposterete il colore per una delle vostre chiamate di disegno
(ad esempio ```screen.fillRect(0,0,50,50, "rgb(0,0,0)")```) o se usate ```screen.setColor```.

## Gradienti radiali

:position 50,50,40,40

### Gradienti radiali

I gradienti di colore radiali possono essere creati in questo modo:

```
screen.setRadialGradient(0,0,100,"rgb(255,0,0)","rgb(0,255,255)")
screen.fillRect(0,0,500,500)
```

I primi due argomenti definiscono le coordinate x,y del punto centrale del vostro gradiente radiale. L'argomento successivo è il raggio del tuo gradiente radiale.
I parametri successivi sono due colori, che definiscono il colore che il gradiente avrà al centro e il 
colore in cui il gradiente si trasformerà al confine del cerchio così definito.

## Gioca con i gradienti

### Gioca con i gradienti

Passa un po' di tempo a definire i gradienti e a disegnare forme, linee o testo con essi. Se le cose non funzionano come dovrebbero, assicurati
di controllare gli argomenti passati a setLinearGradient (si aspetta due punti e due colori) e setRadialGradient (si aspetta un punto, un raggio e due colori).

Potete poi passare all'ultimo tutorial di questa serie, sulla trasparenza, rotazione e scalatura.

