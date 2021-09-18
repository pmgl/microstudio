# Tutorial

:project Tutorial: Creare un gioco

## Introduzione

:position 30,30,40,40

:overlay

### Creare un gioco

In questa serie di tutorial, creeremo un gioco semplice ma perfettamente funzionante in meno di
di 70 righe di codice.

Questa serie presuppone che abbiate già fatto la serie di tutorial sulla programmazione.

Quando fate questo tutorial, potete lasciare il vostro gioco in esecuzione continua, lo vedrete migliorare
in tempo reale.

Ecco un esempio di come può apparire il gioco finale:

https://microstudio.io/gilles/skaterun/

## Eroe

:position 50,50,40,40

:highlight #menuitem-sprites

### Eroe

Il nostro gioco ha bisogno di un Eroe. Vai alla scheda Sprites e clicca su "Add a sprite".

Assicurati di rinominare il tuo sprite in "eroe", questo ti sarà utile più tardi. Poi potete iniziare a disegnare il vostro sprite.
Puoi dedicare tutto il tempo che vuoi al tuo eroe. Potete anche renderlo animato, aprendo la barra degli strumenti Animazione
nella parte inferiore della finestra e aggiungendo fotogrammi di animazione.


## Codice iniziale

:highlight #menuitem-code

### Codice iniziale

Ora inizieremo a codificare per visualizzare il nostro eroe sullo schermo. Clicca per aprire la scheda Codice.

Per ora il nostro codice di gioco assomiglia a questo:

```
init = function()
end

update = function()
end

draw = function()
end
```

```init```, ```update``` e ```draw``` sono le tre funzioni chiave da conoscere in microStudio.

```init``` viene chiamata solo una volta, quando il gioco inizia. La useremo per inizializzare alcune variabili globali più tardi.

```update``` viene chiamata esattamente 60 volte al secondo mentre il gioco è in esecuzione. Lo useremo anche in seguito per aggiornare il gioco
le animazioni, la fisica e la logica del gioco.

```draw``` è chiamato ogni volta che lo schermo può essere ridisegnato. Inizieremo a lavorare sul corpo di questa funzione.


## Disegnare lo sfondo

### Disegnare lo sfondo

Inseriamo una linea nel corpo della funzione draw:

```
draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")
end
```

## Run

:highlight #run-button

### Esegui il programma

Clicca sul pulsante esegui per avviare il tuo programma.

La linea che abbiamo aggiunto riempie un rettangolo, centrato sul centro dello schermo, che si estende fino ai confini dello schermo.
Il quinto parametro è il colore. Cliccate su di esso e tenete premuto CTRL per scegliere un altro colore con il color picker!

## Visualizzazione del nostro eroe

### Visualizzazione del nostro eroe

Aggiungi la seguente linea, nel corpo della funzione draw, dopo la chiamata a ``screen.fillRect``:

```
  screen.drawSprite("eroe",-80,-50,20)
```

Questa linea disegna il tuo sprite "eroe" sullo schermo. Se non appare nulla, controllate che il programma sia in esecuzione e 
controlla di aver rinominato correttamente il tuo sprite in "eroe".

Il tuo codice completo dovrebbe assomigliare a questo per ora:

```
init = function()
end

update = function()
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")
  screen.drawSprite("eroe",-80,-50,20)
end
```

## Next

### Avanti

Continuiamo con il prossimo tutorial dove creeremo un muro su cui 
il nostro eroe sta correndo.

