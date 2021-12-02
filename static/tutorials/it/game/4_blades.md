# Tutorial

:project Tutorial: Creare un gioco

## Lame

:position 50,50,40,40

### Lame

Ora aggiungeremo alcuni ostacoli che il nostro eroe deve evitare saltando. Li chiameremo
lame, ma potete disegnarle come qualsiasi altra cosa, purché sembrino abbastanza pericolose!

Aprite la scheda sprites, cliccate "Aggiungi Sprite" per creare un nuovo sprite, assicuratevi di rinominarlo "lama"
per assicurarsi che funzioni correttamente con il resto di questa serie di tutorial.

Disegna la tua lama pericolosa!

## Inizializzazione delle lame

### Inizializzazione delle lame

Ora che il vostro sprite "lama" è pronto, creeremo una serie di lame per codice, le visualizzeremo,
farle respawnare davanti all'eroe dopo che sono scomparse dietro di lui.

Inizializzeremo due array nel corpo della funzione ```init```. Il primo array, ```lame``` sarà
elencherà la posizione delle nostre 3 lame. Il secondo array, ```superate``` sarà usato per registrare quando una specifica lama
è stata saltata con successo dal nostro eroe.

```
init = funzione()
  lame = [200,300,400]
  superate = [0,0,0]
end
```

## Creare il "comportamento" delle lame

### Creazione del "comportamento" delle lame

Mentre il nostro eroe corre sul muro, le lame sembreranno muoversi verso di lui e scomparire dietro di lui.
Una volta scomparse, riutilizzeremo le stesse lame e le faremo riapparire davanti all'eroe in una posizione leggermente
posizione casuale. Il codice qui sotto itera sulla nostra lista di lame e fa esattamente questo. Deve essere
inserito nel corpo della funzione ```update```.

```
  for i=0 to lame.length-1
    if lame[i]<posizione-120 then
      lame[i] = posizione+280+random.next()*200
      superate[i] = 0
    end
  end
```

Quando facciamo comparire una lama davanti all'utente, azzeriamo anche il valore nella lista ```superate```,
capirete più avanti perché.

## Visualizzazione delle lame

### Visualizzazione delle lame

Ora dovremmo visualizzare le lame sullo schermo. Per farlo, aggiungiamo il codice qui sotto al corpo della nostra funzione ```draw```.
Questo codice itera sulle posizioni delle lame, e disegna lo sprite "blade" nella loro posizione. 

```
  for i=0 to lame.length-1
    screen.drawSprite("lama",lame[i]-posizione-80,-50,20)
  end
```

La coordinata x per disegnare lo sprite è calcolata come la differenza tra la posizione della lama e la variabile globale *posizione*.
Così, quando la posizione della lama è uguale alla posizione dell'eroe, entrambi saranno disegnati nello stesso punto.

## Test delle collisioni con le lame

### Test di collisione con le lame

Ora controlleremo se l'eroe si scontra con una lama, o se sta saltando sopra di essa. Per ogni lama, controlleremo la differenza
tra la posizione della lama e quella dell'eroe. Se il valore assoluto della differenza è abbastanza piccolo, possiamo considerare i due
come sovrapposti. Ora, se la posizione verticale dell'eroe è abbastanza alta, l'eroe sta saltando e non è effettivamente ferito dalla lama.
Ecco come questo si traduce in codice, da inserire nel *for loop* nel corpo della funzione *update*:

```
    if abs(posizione-lame[i])<10 then
      if eroe_y<10 then
        gameover = 1
      elsif not superate[i] then
        superate[i] = 1
        punteggio += 1
      end
    end
```

Nel codice sopra, impostiamo una variabile ```gameover``` a 1 quando l'eroe colpisce una lama. La useremo più tardi.
Incrementiamo anche una nuova variabile ```punteggio```. Stiamo semplicemente contando quante lame sono passate dal giocatore per
usarlo come punteggio.

Ecco il codice completo del *ciclo for* all'interno della funzione *update*:

```
  for i=0 to lame.length-1
    if lame[i]<posizione-120 then
      lame[i] = posizione+280+random.next()*200
      superate[i] = 0
    end
    if abs(posizione-lame[i])<10 then
      se eroe_y<10 allora
        gameover = 1
      elsif not superate[i] then
        superate[i] = 1
        punteggio += 1
      end
    end
  end
```

## Visualizzazione del punteggio

### Visualizzazione del punteggio

Quindi ora stiamo registrando un punteggio, che ne dite di visualizzarlo effettivamente? Aggiungiamo questo codice 
al corpo della funzione *draw*:

```
    screen.drawText(punteggio,120,80,20, "#FFF")
```


## Next

### Avanti

Il nostro gioco è quasi completo! Nel prossimo tutorial, gestiremo il caso di fine gioco e vedremo
come riavviare una nuova partita. Ecco il codice completo come dovrebbe apparire per ora:

```
init = function()
  lame = [200,300,400]
  superate = [0,0,0]
end

update = function()
  posizione = posizione+2

  if touch.touching and eroe_y == 0 then
     eroe_vy = 7
  end

  eroe_vy -= 0.3
  eroe_y = max(0,eroe_y+eroe_vy)

  for i=0 to lame.length-1
    if lame[i]<posizione-120 then
      lame[i] = posizione+280+random.next()*200
      superate[i] = 0
    end
    if abs(posizione-lame[i])<10 then
      if eroe_y<10 then
        gameover = 1
      elsif not superate[i] then
        superate[i] = 1
        punteggio += 1
      end
    end
  end
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")
  
  for i=-6 to 6 by 1
    screen.drawSprite("muro",i*40-posizione%40,-80,40)
  end
  
  screen.drawSprite("eroe",-80,-50+eroe_y,20)
  
  for i=0 to lame.length-1
    screen.drawSprite("lama",lame[i]-posizione-80,-50,20)
  end
  
  screen.drawText(punteggio,120,80,20,"#FFF")
end
```
