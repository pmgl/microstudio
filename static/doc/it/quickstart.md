**microStudio** è un ambiente di sviluppo di videogiochi integrato.
Include tutti gli strumenti necessari per creare il tuo primo videogioco!
**microStudio** ti offre tutte queste possibilità:

* un editor di sprite (immagini, in pixel art)
* un editor di mappe (cioè mappe o livelli)
* un editor di codice per programmare in microScript, un linguaggio semplice ma potente
* funzionamento online al 100% che ti permette di testare il tuo gioco istantaneamente in qualsiasi momento durante il suo sviluppo
* la possibilità di installare facilmente il gioco, finito o in creazione, su smartphone e tablet
* la capacità di lavorare con diverse persone sullo stesso progetto con sincronizzazione istantanea
* caratteristiche di condivisione nella comunità, che ti permettono di esplorare i progetti degli altri, imparare e riutilizzare tutto ciò che vuoi per il tuo progetto.

# Inizio rapido

Puoi iniziare esplorando i progetti fatti da altri utenti, nella sezione *Explore*.

Per iniziare a creare un gioco è necessario creare un account. Scegli un soprannome (evita di usare
il tuo vero nome), inserisci il tuo indirizzo e-mail (necessario in caso di smarrimento della password; inoltre deve essere convalidato per poter pubblicare) e partiamo!

## Primo progetto

Puoi creare un nuovo progetto vuoto nella sezione Crea, o scegliere un progetto esistente nella sezione Esplora e cliccare sul pulsante "Clona" per creare la tua copia e iniziare a personalizzarla.

### Codice

Una volta che il vostro progetto è stato creato, vi troverete nella sezione "Codice". Qui è dove puoi iniziare a programmare. Prova a copiare e incollare il codice qui sotto:

```
draw = function()
  screen.drawSprite ("icon",0,0,100,100)
end
```

### Esegui

Poi cliccate sul pulsante Esegui sul lato destro dello schermo. Il tuo programma si avvia e vedrai come il codice qui sopra visualizzi l'icona del progetto al centro dello schermo. Cambia le coordinate di visualizzazione (le cifre 0 e 100) per vedere variare la posizione e le dimensioni dell'icona.

### Modifica in tempo reale

Potete poi rendere questo primo programma più interattivo, copiando e incollando il codice qui sotto:

```
update = function()
  if keyboard.LEFT then x -= 1 end
  if keyboard.RIGHT then x += 1 end
  if keyboard.UP then y += 1 end
  if keyboard.DOWN then y -= 1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"#000")
  screen.drawSprite("icon",x,y,20,20)
end
```

Questa volta il programma ti permette di spostare l'icona del progetto con le frecce della tastiera. Il significato delle funzioni ```update``` e ```draw```, il controllo dei tasti della tastiera tramite ```keyboard```, il disegno sullo schermo con ```screen``` sono tutti spiegati in dettaglio più avanti in questa documentazione.

Potete anche andare nella sezione Sprites, cliccare sull'elemento "icona" e iniziare a modificare l'immagine. Quando tornerai alla sezione Codice, vedrai che le tue modifiche vengono istantaneamente applicate al programma in esecuzione.

# Esplora

La sezione principale *Esplora* ti permette di scoprire progetti creati da altri utenti. Puoi trovare esempi di giochi, modelli riutilizzabili, librerie di sprite in diversi stili e temi. Se ti interessa un progetto particolare, puoi clonarlo, cioè crearne una copia completa che potrai poi modificare e riutilizzare per i tuoi scopi.

Se hai precedentemente aperto uno dei tuoi progetti nella sezione Crea, sarai in grado di importare ogni sprite o file sorgente dei progetti che stai esplorando nel tuo progetto attuale. Questo ti permette di scegliere immagini o caratteristiche che ti interessano tra i progetti pubblici della comunità, e riutilizzarle per i tuoi scopi.

# Creare un progetto

Puoi creare un progetto vuoto nella sezione principale *Crea*. Il tuo progetto ha diverse sezioni:

* **Codice** : qui è dove si creano i programmi e si inizia l'esecuzione del progetto per testarlo e debuggarlo.
* **Sprites**: Gli *sprites* sono immagini che puoi disegnare e modificare in questa sezione. Puoi facilmente fare riferimento ad esse per visualizzarle (incollarle sullo schermo) quando programmi il tuo gioco.
* **Mappe**: Le mappe sono scene o livelli che puoi creare assemblando i tuoi sprites su una griglia. Potete facilmente visualizzarli sullo schermo nel vostro programma
* **Doc** : qui puoi scrivere la documentazione per il tuo progetto; può essere un documento di design del gioco, un tutorial, una guida per riutilizzare il tuo progetto come modello ecc.
* **Opzioni**: Qui puoi impostare varie opzioni per il tuo progetto; puoi anche invitare altri utenti a partecipare al tuo progetto con te.
* **Pubblica**: Qui puoi rendere pubblico il tuo progetto; non dimenticare di creare una descrizione e di aggiungere dei tag.

## Codice

In questa sezione programmate e testate il vostro progetto. Un file di codice sorgente viene creato automaticamente per il tuo progetto. Puoi aggiungerne altri per dividere le funzionalità del tuo progetto in vari sottoinsiemi.

Il funzionamento di un programma microStudio si basa sulla vostra implementazione di 3 funzioni essenziali:

* la funzione ```init``` dove si inizializzano le variabili
* la funzione ```update``` dove si animano gli oggetti e si scansionano gli elementi
* la funzione ```draw``` dove si disegna sullo schermo

<!--- help_start init = function --->
### Funzione ```init()```

La funzione init viene chiamata solo una volta quando il programma viene lanciato. È utile in particolare per definire lo stato iniziale delle variabili globali che possono essere utilizzate nel resto del programma.
<!--- help_end --->
##### esempio
```
init = function()
  status = "benvenuto"
  livello = 1
  posizione_x = 0
  posizione_y = 0
end
```

### Funzione ```update()```
<!--- help_start update = function --->
La funzione ```update``` viene invocata 60 volte al secondo. Il corpo di questa funzione è il posto migliore per programmare la logica e la fisica del gioco: cambiamenti di stato, movimenti di sprite o dei nemici, rilevamento delle collisioni, lettura della tastiera, valutazione degli input touch o gamepad, ecc.
<!--- help_end --->

##### esempio
```
update = function()
  if keyboard.UP then y = y+1 end
end
```

Il codice qui sopra aumenta il valore della variabile y di 1 ogni 60esimo di secondo se viene premuto il tasto ```UP``` della tastiera (freccia su).

<!--- help_start draw = function --->
### Funzione ```draw()```
La funzione ```draw``` viene chiamata ogni volta che lo schermo può essere aggiornato. Questo è il momento in cui devi disegnare la tua scena sullo schermo, per esempio riempiendla con un grande rettangolo colorato (per cancellare lo schermo) e poi disegnandoci sopra alcuni sprites o forme.
<!--- help_end --->

##### esempio
```
draw = function()
  // riempie lo schermo con il nero
  screen.fillRect(0,0,screen.width,screen.width,screen.height, "rgb(0,0,0)")
  // disgna lo sprite "icon" al centro dello schermo, con dimensione 100x100
  screen.drawSprite("icon",0,0,100,100)
end
```

Nella maggior parte dei casi, il ```draw``` viene chiamato 60 volte al secondo. Ma alcuni computer o tablet possono aggiornare i loro schermi 120 volte al secondo o anche di più. Può anche succedere che il dispositivo che esegue il programma sia sovraccarico e non possa aggiornare lo schermo 60 volte al secondo, nel qual caso la funzione ```draw``` sarà chiamata meno spesso. Questo è il motivo per cui ```update``` e ```draw``` sono due funzioni separate: non importa cosa succede, ```update``` sarà chiamato esattamente 60 volte al secondo; e quando ```draw``` viene chiamato, è il momento di ridisegnare lo schermo.

### Esecuzione

Nella sezione "Codice", la parte destra dello schermo vi permette di vedere il vostro programma in azione, continuando a modificare il suo codice sorgente. Per lanciare il programma, basta cliccare sul pulsante <i class="fa fa-play"></i>. Puoi interrompere l'esecuzione del tuo programma in qualsiasi momento cliccando sul pulsante <i class="fa fa-pause"></i>.

### Console

Durante l'esecuzione del vostro programma, potete usare la console per eseguire semplici comandi in *microScript*. Per esempio, potete semplicemente inserire il nome di una variabile per scoprire il suo valore attuale.

##### esempi
Conoscere il valore corrente della variabile posizione_x
```
> posizione_x
34
>
```
Cambia il valore a posizione_x
```
> posizione_x = -10
-10
>
```
Chiamare la funzione draw() per vedere il cambiamento di posizione_x e il suo effetto sul disegno nello schermo (supponendo che l'esecuzione sia in pausa)
```
> draw()
>
```

### Traces

Nel codice del tuo programma, puoi inviare del testo da visualizzare sulla console in qualsiasi momento, usando la funzione ```print()```.

##### esempio
```
draw = function()
  // la tua implementazione del metodo draw()

  print(posizione_x)
end
```
## Sprites

Gli sprites sono immagini che possono muoversi sullo schermo. Lo strumento di disegno in *microStudio* permette di creare sprites, che possono poi essere usati dal codice per visualizzarli sullo schermo nella posizione e dimensione desiderata.

### Creare uno sprite
Ogni progetto ha uno sprite predefinito, chiamato "icon", che fungerà da icona dell'applicazione. Potete creare nuovi sprite cliccando su *Aggiungi uno sprite*. Potete rinominarli come volete e definire la loro dimensione in pixel (larghezza x altezza).

### Opzioni di disegno
*microStudio* offre le classiche funzioni di disegno: matita, riempimento, gomma, schiarire, scurire, ammorbidire, aumentare il contrasto, cambiare la saturazione.

Lo strumento contagocce può essere utilizzato in qualsiasi momento premendo il tasto [Alt] sulla tastiera.

Le opzioni *piastrella* e simmetria vi aiuteranno a creare sprites "ripetibili" o sprites con uno o due assi di simmetria.

##### Suggerimento
È possibile importare file di immagini nel vostro progetto microStudio. Per farlo, trascinate e rilasciate i file PNG o JPG (fino a 256x256 pixel di dimensione) nell'elenco degli sprites.

## Mappe
Una mappa in microStudio è una griglia per assemblare gli sprites. Permette di costruire una decorazione o di creare un livello.

### Creare una mappa
Le mappe possono essere create e rinominate proprio come gli sprites. È possibile modificare la dimensione della griglia (in numero di celle). Ogni cella può essere disegnata con uno sprite. È possibile modificare la dimensione in pixel di ogni cella, che dovrebbe generalmente riflettere la dimensione degli sprite utilizzati per disegnare la griglia.


## Impostazioni
La scheda *Impostazioni* ti permette di personalizzare alcuni elementi del tuo progetto.

### Opzioni
Puoi definire il titolo del tuo progetto, il suo identificatore (usato per creare il suo URL, cioè il suo indirizzo internet).

Potete specificare se il vostro progetto deve essere utilizzato in modalità verticale o orizzontale. Questa scelta sarà attiva quando si installa l'applicazione su uno smartphone o tablet.

Potete anche specificare le proporzioni desiderate per l'area di visualizzazione sullo schermo. Questa è un'opzione per garantire che l'applicazione abbia sempre un bell'aspetto quando viene installata su dispositivi con schermi di proporzioni diverse.

### Utenti

La sezione utenti ti permette di invitare gli amici a partecipare al tuo progetto. Devi conoscere il soprannome dell'amico che vuoi invitare. Una volta che un amico è invitato, se accetta il tuo invito, avrà pieno accesso al tuo progetto e potrà fare tutte le modifiche che vuole (modificare, aggiungere, cancellare sprites, mappe, codice ecc.) Tuttavia, la modifica delle opzioni del progetto e la lista dei partecipanti è riservata al proprietario del progetto.

## Pubblica

*microStudio* offre alcune opzioni per pubblicare o esportare il tuo progetto. Potete esportare il vostro progetto come app HTML5 standalone, per la distribuzione online, sul vostro sito o su piattaforme di distribuzione di giochi. Potete anche rendere il vostro progetto pubblico su *microStudio* permettendo alla comunità di giocarci, commentare, esplorare il codice sorgente e le risorse... Altre opzioni di esportazione sono previste per il futuro.

### Rendere il progetto pubblico

Per rendere il tuo progetto accessibile a tutti (sola lettura), clicca su "Rendi il mio progetto pubblico". Una volta che il tuo progetto è pubblico, sarà visualizzato nella scheda di esplorazione del sito microstudio. Qualsiasi visitatore sarà in grado di eseguire il gioco, visualizzare e riutilizzare il codice sorgente e altri componenti del tuo progetto.

Il tuo gioco ha un URL permanente nella forma
```https://microstudio.io/soprannome/game_id/```. Puoi naturalmente distribuire il link a chiunque o puoi aggiungere il tuo gioco al tuo sito web esistente incorporandolo in un iframe.

### Esportazione in HTML5

Per esportare il tuo progetto completo in un'app HTML5 standalone, clicca su "Esporta in HTML5". Questo attiva il download di un archivio ZIP, contenente tutti i file necessari per eseguire il tuo gioco: sprites, alcuni file JavaScript, icone e un file HTML principale "index.html". Il tuo gioco può essere eseguito localmente (doppio clic sul file index.html) o puoi caricarlo su un altro sito web esistente. È già pronto per essere pubblicato su molte piattaforme di distribuzione di giochi online che accettano giochi HTML5 (ne suggeriamo alcune nel pannello di esportazione HTML5).
