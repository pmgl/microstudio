# Tutorial

:project Tutorial: Creare un gioco

## Jump!

:position 50,50,40,40

### Jump!

Abbiamo bisogno che il nostro eroe salti con un tocco o un clic del mouse sullo schermo. Saltare significa acquisire
una certa velocità verticale, che influenzerà la posizione verticale dell'eroe. La velocità verticale
stessa sarà influenzata dalla gravità.

## Jump!

### Jump!

Scegliamo di usare una variabile ```eroe_y``` come posizione verticale dell'eroe e ```eroe_vy``` come
velocità verticale dell'eroe.

```eroe_y``` deve influenzare la posizione verticale in cui viene disegnato il nostro eroe. Lo facciamo cambiando questa linea
nel corpo della nostra funzione ```draw```:

```
  screen.drawSprite("eroe",-80,-50+eroe_y,20)
```

Ora la nostra posizione verticale è influenzata dalla velocità verticale. Modelliamo questo nella nostra funzione ``update`` aggiungendo
aggiungendo:

```
  eroe_y = eroe_y + eroe_vy
```

## Iniziare il salto

### Iniziare il salto

Le nostre due condizioni per iniziare un salto sono:

1. l'eroe deve essere a terra quindi ```eroe_y == 0```
2. il giocatore sta toccando lo schermo / tenendo premuto il pulsante del mouse, che può essere testato con ```touch.touching```

Iniziare un salto significa impostare la velocità verticale a qualche valore positivo (verso l'alto), ad esempio ```eroe_vy = 7```

Aggiungiamo il seguente codice al corpo della funzione ``update``:

```
  if touch.touching and eroe_y == 0 allora
    eroe_vy = 7
  end
```

## Gravità

### Gravità

Ora, quando fai saltare il tuo eroe, lui va attraverso il tetto e scompare molto velocemente! Questo perché non abbiamo
introdotto la gravità. La gravità è simile ad un'accelerazione verso il basso. Ogni breve periodo di tempo, diminuisce la nostra
velocità verticale di una quantità fissa. Aggiungiamo la seguente linea al corpo della nostra funzione ``update``:

```
  eroe_vy = eroe_vy - 0.3
```

Abbastanza rapidamente, il nostro eroe ora cadrà... e passerà attraverso il terreno. Dobbiamo impedirlo, cambiando questa linea:

```
  eroe_y = eroe_y + eroe_vy
```

a

```
  eroe_y = max(0,eroe_y+eroe_vy)
```

Ora ci stiamo assicurando che la posizione verticale del nostro eroe non possa essere inferiore a zero.

## Next

### Avanti

Nel prossimo breve tutorial, aggiungeremo delle lame che il nostro eroe dovrà evitare saltandoci sopra.
Ecco il nostro codice attuale completo qui sotto:

```
init = function()
end

update = function()
  position = position+2

  if touch.touching and eroe_y == 0 then
    eroe_vy = 7
  end
  
  eroe_vy = eroe_vy - 0.3
  eroe_y = max(0,eroe_y+eroe_vy)
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height,"rgb(57,0,57)")
  
  for i=-6 to 6 by 1
    screen.drawSprite("muro",i*40-position%40,-80,40)
  end

  screen.drawSprite("eroe",-80,-50+eroe_y,20)
end
```
