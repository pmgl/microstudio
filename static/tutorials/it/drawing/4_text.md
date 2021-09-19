<!-- 1. Forme (Rect, Round, RoundRect) -->
<!-- 2. Colori -->
<!-- 3. Linee, Poligoni -->
<!-- 4. Testo -->
<!-- 5. Sprite e mappe -->
<!-- 6. Gradienti -->
<!-- 7. Rotazione, scalatura, trasparenza -->


# Tutorial

:project Tutorial: Disegno

## Testo

:position 50,50,40,40

### Disegno del testo

Puoi disegnare del testo chiamando ```screen.drawText```. Poiché per disegnare il testo microStudio richiede che
i font siano già stati caricati in background, disegneremo il testo nella funzione draw():

```
draw = function()
  screen.clear()
  screen.drawText("Del testo",0,0,20,"rgb(255,255,255)")
end
```

Il primo argomento è una stringa che contiene il testo che volete disegnare. I due successivi
argomenti sono le coordinate x,y dove disegnare il testo. Il testo sarà centrato
su questo punto. Il quarto parametro è la dimensione del testo (altezza dei caratteri).
Il 5° parametro opzionale è il colore (se omesso, verrà riutilizzato l'ultimo colore usato).

## Font


### Font

Puoi usare un font diverso chiamando ```screen.setFont```:

```
draw = function()
  screen.clear()
  screen.setFont("Awesome")
  screen.drawText("Dell'altro testo",0,0,20, "rgb(255,255,255)")
end
```

## Font disponibili

### Font disponibili

microStudio include un set di simpatici font in stile bitmap. Per ottenere la lista completa:

* quando il vostro programma è già in esecuzione, date un'occhiata alla variabile ```global.fonts``` nella console; essa mantiene l'elenco completo dei font disponibili.
* esegui questo demo che mostra tutti i font: https://microstudio.io/gilles/fonts/

## Font list

### Elenco dei font

Questo tutorial è finito! Abbiamo riprodotto l'elenco dei font disponibili qui sotto.
Puoi passare al prossimo tutorial, sul disegno di sprites e mappe.

#### Elenco dei font disponibili

AESystematic
 
Alkhemikal
 
AlphaBeta
 
Arpegius
 
Awesome
 
BitCell
 
Blocktopia
 
Comicoro
 
Commodore64
 
DigitalDisco
 
Edunline
 
EnchantedSword
 
EnterCommand
 
Euxoi
 
FixedBold
 
GenericMobileSystem
 
GrapeSoda
 
JupiterCrash
 
Kapel
 
KiwiSoda
 
Litebulb8bit
 
LycheeSoda
 
MisterPixel
 
ModernDos
 
NokiaCellPhone
 
PearSoda
 
PixAntiqua
 
PixChicago
 
PixelArial
 
PixelOperator
 
Pixellari
 
Pixolde
 
PlanetaryContact
 
PressStart2P
 
RainyHearts
 
RetroGaming
 
Revolute
 
Romulus
 
Scriptorium
 
Squarewave
 
Thixel
 
Unbalanced
 
UpheavalPro
 
VeniceClassic
 
ZXSpectrum
 
Zepto