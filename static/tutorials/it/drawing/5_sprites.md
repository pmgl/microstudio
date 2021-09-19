<!-- 1. Forme (Rect, Round, RoundRect) -->
<!-- 2. Colori -->
<!-- 3. Linee, Poligoni -->
<!-- 4. Testo -->
<!-- 5. Sprite e mappe -->
<!-- 6. Gradienti -->
<!-- 7. Rotazione, scalatura, trasparenza -->


# Tutorial

:project Tutorial: Disegno

## Disegno degli sprites

:position 50,50,40,40

### Disegno degli sprites

Quando crei degli sprites nella scheda Sprites, puoi impostare il loro nome. Questo nome sarà
usato per fare riferimento ad essi quando si chiama la funzione ```screen.drawSprite```. Gli sprites sono caricati in
background all'avvio del tuo programma, quindi li disegneremo dal corpo della funzione ```draw```.

```
draw = function()
  screen.drawSprite("icon",0,0,40,40)
end
```

Il primo argomento è il nome del vostro sprite. Ogni progetto ha uno sprite chiamato
"icon", che servirà come icona dell'app. Puoi creare altri sprite nella scheda Sprites
e provare a disegnarli sullo schermo in modo simile.

Il secondo e il terzo argomento sono le coordinate x,y dove disegnare lo sprite.
Lo sprite sarà centrato su queste coordinate. I prossimi due parametri danno la
larghezza e l'altezza con cui volete che lo sprite sia disegnato (l'altezza può essere omessa).

## Disegno degli sprite animati

:position 50,50,40,40

### Disegno di sprite animati

Gli sprite animati possono essere creati nella scheda Sprites. Quando modifichi il tuo sprite, apri la scheda
Animazione in fondo alla finestra. Puoi aggiungere fotogrammi, disegnarli, controllare l'anteprima dell'animazione e impostare
la velocità di riproduzione.

Una volta creato uno sprite animato, disegnalo semplicemente come un normale sprite dal corpo della
vostra funzione ``draw``:

```
draw = function()
  screen.clear()
  screen.drawSprite("mio_sprite_animato",0,0,100)
end
```

## Impostazione del fotogramma dell'animazione

### Impostazione del fotogramma dell'animazione

La vostra animazione dello sprite andrà in loop continuamente, ma ad un certo punto potreste voler resettare l'animazione
al primo fotogramma. Puoi farlo con:

```
draw = function()
  schermo.clear()
  sprites["mio_sprite_animato"].setFrame(0)
  screen.drawSprite("mio_sprite_animato",0,0,100)
end
```

Questo resetta l'animazione dello sprite "mio_sprite_animato" al fotogramma 0 (che è il primo fotogramma).

## Disegno di un fotogramma di animazione specificato

### Disegno di un fotogramma di animazione specificato

Potete scegliere di disegnare uno specifico fotogramma di animazione del vostro sprite. Per questo potete aggiungere "." e l'indice
del fotogramma di animazione, al nome del vostro sprite. L'indice dei fotogramma di animazione va da 0 a (numero_di_frames-1).

```
draw = function()
  screen.clear()
  screen.drawSprite("mio_sprite_animato.0",0,0,100)
end
```

Il codice sopra disegna il primo frame di animazione dello sprite "mio_sprite_animato".

## Disegno delle mappe

### Disegno di mappe

Le mappe possono essere create nella scheda Mappe. Una mappa è una griglia le cui celle possono essere riempite con piastrelle di sprite. Permette di
creare immagini di sfondo o livelli mettendo insieme le piastrelle sprite.
Il seguente codice disegnerà la mappa "mappa1", centrata su (0,0), con larghezza 320 e altezza 200:

```
draw = function()
  screen.clear()
  screen.drawMap("mappa1",0,0,320,200)
end
```

È ora di continuare con il prossimo tutorial, sulla creazione di gradienti di colore!


