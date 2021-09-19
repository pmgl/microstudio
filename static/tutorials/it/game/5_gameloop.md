# Tutorial

:project Tutorial: Creare un gioco

## Gioco

:position 50,50,40,40

### Game over

Nel tutorial precedente abbiamo fatto in modo di impostare una nuova variabile *gameover* a 1 quando il
giocatore colpisce una lama. Una volta che *gameover* è impostato, abbiamo bisogno di:

* fermare il gioco
* aspettare 5 secondi
* riavviare il gioco

Fermeremo il gioco saltando tutto il nostro codice nella funzione *update*. Aspetteremo 5
secondi incrementando il valore di gameover nella funzione update fino a raggiungere 300.
Riavvieremo il gioco richiamando la funzione *init*, dopo esserci assicurati che abbia correttamente
resettato tutto ciò di cui abbiamo bisogno.

## Game over

### Game over

Modificheremo quindi il contenuto della funzione *update* come segue:

```
  if gameover>0 then
    gameover = gameover+1
    if gameover>300 then init() end
  else
    // gli altri contenuti della funzione di aggiornamento vanno qui
  end
```

La funzione *init* è ora usata per riavviare il gioco 5 secondi dopo la fine della partita. Per fa funzionare questo
correttamente, hai bisogno di azzerare il *punteggio*, la *posizione* iniziale e di resettare il valore di *gameover*
a zero:

```
init = function()
  lame = [200,300,400]
  superate = [0,0,0]
  gameover = 0
  punteggio = 0
  posizione = 0
end
```

## Game Over

### Game Over

Quando il gioco è finito, abbiamo bisogno di un feedback visivo su di esso! Disegneremo quindi un rettangolo semitrasparente
che copre tutta l'interfaccia di gioco e disegneremo il testo GAME OVER. Aggiungiamo questo alla fine della nostra funzione *draw*:

```
  if gameover then
    screen.fillRect(0,0,screen.width,screen.height, "rgba(255,0,0,.5)")
    screen.drawText("GAME OVER",0,0,50, "#FFF")
  end
```

## Accelerare il gameplay


### Accelerare il gameplay

Il nostro gioco è troppo facile. Rendiamolo più difficile! Accelereremo progressivamente l'eroe durante il gioco.
Lo facciamo creando una variabile *speed* che inizializziamo al valore 2 nella funzione *init*:

```
  movimento = 2
```
(nella funzione *init)

Cambieremo poi la linea ```posizione = posizione + 2``` nel metodo *update* con questa:

```
  posizione = posizione + movimento
  movimento = movimento + 0.001
```

Stiamo quindi aumentando la velocità di movimento dell'eroe durante il gioco!

## Fatto!

### Fatto!

Abbiamo finito di creare il nostro gioco. Il codice completo è riportato di nuovo qui sotto. Se guardate attentamente, noterete che
abbiamo aggiunto una variabile *esecuzione* il cui scopo è aspettare che il giocatore tocchi lo schermo prima di
iniziare il gioco.

Abbiamo anche aggiunto alcuni suoni che vengono prodotti chiamando la funzione ```audio.beep()```. Puoi verificare anche questo nel
codice qui sotto.

Puoi anche iniziare ad aggiungere altre caratteristiche al gioco. Perché non alcuni oggetti volanti che dovrebbero essere evitati
quando si salta? Dipende tutto da voi!

Grazie per aver letto questo tutorial e buon divertimento con microStudio!


```
init = function()
  gameover = 0
  esecuzione = 0
  lame = [200,300,400]
  superate = [0,0,0]
  punteggio = 0
  posizione = 0
  movimento = 2
end

update = function()
  if gameover>0 then
    gameover = gameover+1
    if gameover>300 then init() end
  else esecuzione then
    posizione = posizione + movimento
    movimento = movimento + 0.001
    
    if touch.touching and eroe_y == 0 then
       eroe_vy = 7
       audio.beep("square tempo 20000 volume 10 span 100 C4 to C6")
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
          esecuzione = 0
          gameover = 1
          audio.beep("saw tempo 10000 volume 50 span 50 C2 to C4 to C2 to C4")
        elsif not superate[i] then
          superate[i] = 1
          punteggio += 1
          audio.beep("saw tempo 960 volume 50 span 20 C6")
        end
      end
    end
  else
    if touch.touching then esecuzione = 1 end
  end
end

draw = function()
  screen.fillRect(0,0,screen.width,screen.height, "rgb(57,0,57)")
  
  for i=-6 to 6 by 1
    screen.drawSprite("muro",i*40-posizione%40,-80,40)
  end

  screen.drawSprite("eroe",-80,-50+eroe_y,20)
  for i=0 to lame.length-1
    screen.drawSprite("lama",lame[i]-posizione-80,-50,20)
  end
  
  screen.drawText(score,120,80,20, "#FFF")
  if gameover then
    screen.fillRect(0,0,screen.width,screen.height, "rgba(255,0,0,.5)")
    screen.drawText("GAME OVER",0,0,50, "#FFF")
  elsif not esecuzione then
    screen.drawText("PRONTO?",0,30,50, "#FFF")
  end
end
```