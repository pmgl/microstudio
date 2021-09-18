<!-- 1. Forme (Rect, Round, RoundRect) -->
<!-- 2. Colori -->
<!-- 3. Linee, Poligoni -->
<!-- 4. Testo -->
<!-- 5. Sprite e mappe -->
<!-- 6. Gradienti -->
<!-- 7. Rotazione, scalatura, trasparenza -->


# Tutorial

:project Tutorial: Disegno

## Disegno

:position 30,30,40,40

:overlay

### Disegno

In microStudio, potete considerare lo schermo del computer come un tavolo da disegno.
Sarete in grado di disegnare forme, testo, linee, poligoni, immagini (sprites) e
mappe con il codice, chiamando funzioni predefinite.

Cominciamo a disegnare forme!


## Rettangolo

### Disegno di un rettangolo

posizione 50,50,40,40

Per questo tutorial potete cancellare tutti i contenuti predefiniti del codice nella finestra del codice.
Ora basta iniziare con la seguente linea di codice:

```
screen.fillRect(0,0,50,50,"#F00")
```

## Rettangolo

### Disegno di un rettangolo

:position 50,50,40,40

:highlight #run-button

Cliccate il pulsante "Run". Il tuo programma si avvia e vedrai che disegna un quadrato rosso
rosso al centro della finestra di esecuzione. Diamo un'occhiata più da vicino al codice:

* ```screen``` è l'oggetto base che rappresenta lo schermo
* ```fillRect``` è una funzione membro di screen, che riempie un rettangolo, alle coordinate date, con il colore dato
* ```0,0,50,50``` sono le coordinate di disegno in questo ordine: 0,0 sono le coordinate x e y del centro del nostro rettangolo; 50,50 sono la larghezza e l'altezza del nostro rettangolo.
* ```"#F00"``` definisce il colore come rosso. Imparerai di più sui colori nel prossimo tutorial.


## Rettangolo

### Disegno di un rettangolo

:position 50,50,40,40

Per capire meglio il tuo codice, puoi iniziare a giocare con i valori: clicca nel tuo codice
su uno dei valori (```0,0,50,50```) poi tieni premuto il tasto CTRL della tastiera del tuo computer. Un cursore
apparirà, usalo per cambiare il valore e vedere come influisce sul rettangolo disegnato nella
finestra di esecuzione.

Puoi anche cliccare sul colore ```"#F00"``` e tenere premuto CTRL per scegliere altri colori.

## Coordinate dello schermo

### Coordinate dello schermo

In *microStudio*, il sistema di coordinate è basato sul centro dello schermo. Quindi il centro
dello schermo ha le coordinate 0,0. In modalità ritratto, la coordinata x va da -100 (punto più a sinistra) a +100 (punto più a destra).
In modalità paesaggio, anche la coordinata y andrà da -100 a 100. Questo è illustrato di seguito:

![Coordinate dello schermo](/doc/img/screen_coordinates.png "Coordinate dello schermo")

Questo sistema di coordinate ti aiuterà a scalare correttamente il tuo contenuto e ad adattarsi a qualsiasi dimensione dello schermo indipendentemente dall'effettiva
risoluzione fisica in pixel dello schermo.

## Contorno del rettangolo

### Disegno del contorno di un rettangolo

posizione 50,50,40,40

Puoi disegnare il contorno di un rettangolo cambiando il tuo codice in:

```
screen.drawRect(0,0,50,50,"#F00")
```

Quando prima di disegnare i contorni, potete usare ``screen.setLineWidth`` per definire lo
spessore delle linee. La larghezza predefinita delle linee è 1. Prova per esempio:

```
screen.setLineWidth(4)
screen.drawRect(0,0,50,50,"#F00")
```

## Forme rotonde

### Disegnare cerchi ed ellissi

:position 50,50,40,40

Allo stesso modo, puoi disegnare una forma rotonda (cerchio, ellisse a seconda della dimensione usata) usando ``fillRound`` o
```drawRound```. Esempi:

```
screen.fillRound(0,0,50,50,"#F00")
```

oppure

```
screen.drawRound(0,0,50,50, "#FFF")
```


## Rettangolo arrotondato

### Rettangolo arrotondato

:position 50,50,40,40

Puoi disegnare rettangoli arrotondati con ```fillRoundRect``` e ```drawRoundRect```. Gli angoli della tua 
rettangolo saranno arrotondati. C'è un parametro aggiuntivo qui che è il raggio dell'arrotondamento
per gli angoli. Prova per esempio:

```
screen.fillRoundRect(0,0,50,50,10,"#F00")
```

oppure

```
screen.drawRoundRect(0,0,50,50,10, "#FFF")
```

Il raggio di arrotondamento negli esempi precedenti è 10. Puoi cambiare il suo valore e vedere come influisce sul disegno.


## Passa ai colori

### È ora di imparare i colori!

Ora puoi continuare con il prossimo tutorial, dove imparerai a conoscere i colori.



