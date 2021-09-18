# Tutorial

:project Tutorial: Primo progetto

## Primo progetto

:position 30,30,40,40

:overlay

### Primo progetto

Il tuo primo progetto è già stato creato! Creerai un personaggio e 
programmerai microStudio per visualizzarlo sullo schermo e fare in modo che possa essere spostato
premendo i tasti freccia della tastiera del tuo computer.


## Creare uno sprite

### Creare uno sprite

Cliccate su **Sprites** per aprire l'editor di sprites.

:highlight #projectview .sidemenu #menuitem-sprites

:auto

## Creare uno sprite 2

### Creare uno sprite

Clicca sul pulsante "Aggiungi sprite" per creare un nuovo sprite.

:navigate projects.sprites

:highlight #create-sprite-button

:auto


## Dipingi il tuo sprite

:navigate projects.sprites

:position 0,50,30,40

### Disegna il tuo personaggio

Usa gli strumenti di disegno sul lato destro dello schermo per disegnare il tuo personaggio.
Puoi metterci tutto il tempo che vuoi!

Quando il tuo sprite è finito, passa al passo successivo.

## Codice 1

### Codice

Ora clicca su **Codice**, stiamo per programmare un po'!

:highlight #projectview .sidemenu #menuitem-code

:auto


## Codice

:navigate projects.code

:position 55,30,45,40

### Codice

Il codice del tuo progetto è già riempito con la definizione di tre funzioni:
```init```, ```update``` e ```draw```. Lavoreremo sul contenuto della funzione
```draw```. Aggiungete la seguente linea, tra le linee 
```draw = function()``` e la linea ```end```:

```
  screen.drawSprite("sprite",0,0,20)
```

Ecco come appare ora il tuo codice:

```
draw = function()
  screen.drawSprite("sprite",0,0,20)
end
```

## Esegui

:navigate projects.code

:position 55,55,45,40

### Esegui il tuo programma

Facciamo una prova! Clicca sul pulsante esegui per lanciare il tuo programma.

:highlight #run-button

:auto

## Esegui

:navigate projects.code

:position 55,55,45,40

### Esecuzione

Il tuo personaggio è ora visualizzato al centro della vista di esecuzione. La linea di codice
che abbiamo aggiunto chiama la funzione ```drawSprite``` sull'oggetto
```screen```. La chiamata è fatta con dei parametri: il nome dello sprite da visualizzare ```sprite```
(assicurati che sia effettivamente il nome dello sprite che hai creato), le coordinate x e y del punto
dove visualizzarlo (0,0 è il centro dello schermo) e la dimensione con cui visualizzarlo (20).

Puoi giocare con queste coordinate per cambiare la posizione di disegno dello sprite. Noterai
che i tuoi cambiamenti si riflettono in tempo reale nella vista di esecuzione.

## Aggiungi uno sfondo

:navigate projects.code

### Aggiungi un colore di sfondo

Sopra la nostra linea ```screen.drawSprite(...)```, aggiungeremo la seguente linea:

```
  screen.fillRect(0,0,400,400,"#468")
```

```fillRect``` significa "riempire un rettangolo". Il parametro ```"#468"``` rappresenta
un colore grigio-blu. Clicca su di esso e poi tieni premuto CTRL, apparirà un selezionatore di colori.
Scegli il colore che ti piace di più!


## Controlla il personaggio

:navigate projects.code

### Controlla il personaggio

Per controllare la posizione di disegno del personaggio, useremo due variabili, ```x``` e ```y```.
Cambiamo la linea di codice che disegna lo sprite, come segue:

```
  screen.drawSprite("sprite",x,y,20)
```

Il personaggio sarà ora disegnato alle coordinate ```x``` , ```y```.

## Controllo 

:navigate projects.code

### Controlla il personaggio

Tutto ciò di cui abbiamo bisogno ora è cambiare il valore di ```x``` e ```y``` quando i tasti freccia della tastiera
sono premuti. Inserisci la seguente linea tra
```update = function()``` e ```end```:

```
  if keyboard.LEFT then x = x-1 end
```

Il tuo codice completo ora assomiglia a questo:

```
init = function()
end

update = function()
  if keyboard.LEFT then x = x-1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"rgb(140,198,110)")
  screen.drawSprite("sprite",x,y,20)
end
```

## Controlla il personaggio

:navigate projects.code

### Controlla il personaggio

Clicca sulla vista di esecuzione, poi premi il tasto freccia sinistra della tastiera del tuo computer.
Dovresti vedere il personaggio muoversi verso sinistra!

Perché: la linea di codice che abbiamo aggiunto controlla se il tasto freccia sinistra è premuto (```keyboard.LEFT```) e
quando lo è, il valore di ```x``` viene ridotto di 1.

Sapendo che gli altri identificatori dei tasti freccia sono RIGHT, UP e DOWN, aggiungi tre linee al tuo codice
per assicurarti che il tuo personaggio possa muoversi in ogni direzione.

(Soluzione nel prossimo passo)

## Controlla il personaggio

:navigate projects.code

### Controlla il personaggio

Ecco il codice completo della funzione ```update``` per muovere il personaggio in tutte e 4 le direzioni con
i tasti freccia della tastiera:

```
update = function()
  if keyboard.LEFT then x = x-1 end
  if keyboard.RIGHT then x = x+1 end
  if keyboard.UP then y = y+1 end
  if keyboard.DOWN then y = y-1 end
end
```

## Fine

Questo tutorial è finito. Ora puoi imparare di più sulla programmazione in *microScript*, iniziando
il corso sulla programmazione.



