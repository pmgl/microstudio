# Tutorial

:project Tutorial: Creare un gioco

## Muro

:position 50,50,40,40

:highlight #menuitem-sprites

### Muro

Il nostro eroe si muoverà sopra un muro, o una piattaforma, o una strada... Per ora chiamiamolo un muro.
Creiamo questo muro avendo una piastrella muro come sprite e riempiendo un'intera area con questa piastrella. Create
un nuovo sprite e assicuratevi di rinominarlo "muro".

Sarebbe bello se questo sprite di piastrelle avesse un bell'aspetto una volta effettivamente piastrellato.
Per aiutarvi in questo, ti consigliamo di attivare l'opzione "Tile" in basso a destra dell'editor di sprite.
È ora di disegnare!

## Visualizzazione del muro

:highlight #menuitem-code

### Visualizzare il muro

Torniamo al nostro codice. Assicuratevi che il programma sia ancora in esecuzione (premete il pulsante Run quando necessario).
Aggiungiamo le seguenti linee nel corpo della funzione ```draw```:

```
  for i=-6 to 6 by 1
    screen.drawSprite("muro",i*40,-80,40)
  end
```

Il codice sopra è un ciclo ```for```. Esso afferma che la funzione ```screen.drawSprite``` sarà chiamata un certo numero di volte,
ogni volta con la variabile ```i``` che conterrà un valore diverso. ```i``` inizierà a -6, poi -5, -4 ... , 3, 4, 5, 6. Così la
coordinata x per disegnare lo sprite prenderà i valori -240, poi -200, -160 ... fino a 240. Potete vedere i risultati
nella finestra di esecuzione.

## Visualizzazione del muro

### Visualizzazione del muro

Il codice completo ora appare come segue. La nostra prossima missione è quella di animare il muro per creare l'illusione che l'eroe stia correndo
su di esso.

```
init = function()
end

update = function()
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgba(57,0,57)")
  
  for i=-6 to 6 by 1
    screen.drawSprite("muro",i*40,-80,40)
  end

  screen.drawSprite("eroe",-80,-50,20)
end
```

## Animare il muro

### Animazione del muro

Introdurremo una variabile ```posizione```. La useremo per spostare le piastrelle del muro a sinistra di una certa quantità. Riscriviamo
la linea di codiche che disegna le piastrelle del muro in questo modo:

```
    screen.drawSprite("muro",i*40-posizione,-80,40)
```

Il muro non si sta ancora muovendo! Questo perché non stiamo cambiando il valore della posizione. Inseriamo questo codice nel corpo della 
funzione ```update```:

```
update = function()
  posizione = posizione+2
end
```

Facendo questo, ci assicuriamo che 60 volte al secondo (frequenza di chiamata della funzione update), il valore di posizione sarà
aumentato di 2. Il nostro muro si è rapidamente spostato ed è scomparso completamente a sinistra. Ops!

## Animazione del muro

### Animazione del muro

Le piastrelle del nostro muro sono distanziate di 40 unità. Invece di spostarli a sinistra del valore di *posizione*, li sposteremo
a sinistra di ```posizione % 40```. ```posizione % 40``` è il resto della divisione di *posizione* per 40. Quando si incrementa 
posizione continuamente, prenderà quindi i valori 0,1,2,3..., 39 e poi di nuovo 0,1,2,3..., 39 e così via. Esattamente ciò di cui abbiamo bisogno. Non siete convinti? Proviamo:

```
  for i=-6 to 6 by 1
    screen.drawSprite("muro",i*40-posizione%40,-80,40)
  end
```

Vedete? Si muove ancora verso sinistra, senza scomparire. L'illusione è perfetta!

## Next

### Avanti

Nel prossimo breve tutorial, faremo saltare il nostro eroe. Per ora, ecco una copia del nostro codice completo come riferimento:

```
init = function()
end

update = function()
  posizione = posizione+2
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")
  
  for i=-6 to 6 by 1
    screen.drawSprite("muro",i*40-posizione%40,-80,40)
  end

  screen.drawSprite("eroe",-80,-50,20)
end
```
