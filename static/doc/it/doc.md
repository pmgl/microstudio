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

# microScript

**microScript** è un semplice linguaggio ispirato a Lua. Ecco alcuni principi generali utilizzati da microScript:

* Le variabili sono globali per impostazione predefinita. Per definire una variabile locale, usate la parola chiave "local".
* Le interruzioni di riga non hanno un significato particolare, sono considerate come spazi.
* In microScript non esiste il valore ```null```, ```nil``` o ```undefined```. Qualsiasi variabile non definita o nulla è uguale a ```0```.
* In microScript, non esiste un tipo booleano. ```0``` è falso e tutto ciò che non è ```0``` è vero.
* Non ci sono errori di esecuzione o eccezioni in microScript. Qualsiasi variabile che non è definita restituisce ```0```. Invocare un valore che non è una funzione come funzione restituisce il valore stesso.

## Variabili

Una variabile è un nome (o "identificatore") al quale si decide di assegnare un valore. Permette quindi di memorizzare questo valore

### Dichiarazione

Le variabili in microScript non hanno bisogno di essere dichiarate. Qualsiasi variabile che non è ancora stata usata può essere considerata esistente e ha il valore ```0```.

Per iniziare a usare una variabile, basta assegnarle un valore con il segno di uguale:

```
x = 1
```
Il valore di x è ora 1.

### Tipi di valori

*microScript* riconosce cinque tipi di valori: numeri, stringhe (testo), liste, oggetti e funzioni.

#### Numero
I valori di tipo Numero in *microScript* possono essere numeri interi o decimali.

```
pi = 3,1415
x = 1
mezzo = 1/2
```

#### Stringa di caratteri
Le stringhe sono testi o pezzi di testo. Devono essere definiti tra virgolette.

```
animale = "gatto"
print("Ciao "+animale)
```
#### Elenco
Le liste possono contenere un certo numero di valori:

```
elenco_vuoto = []
numeri_primi =[2,3,5,5,7,11,13,17,19]
elenco_misto =[1, "gatto",[1,2,3]]
```

Si può accedere agli elementi di una lista tramite il loro indice, cioè la loro posizione nella lista da 0 :

```
lista = ["gatto", "cane", "topo"]
print(elenco[0])
print(elenco[1])
print(elenco[2])
```

È anche facile scorrere gli elementi di una lista tramite un ciclo for ```for loop```:

```
for elemento in lista
  print(elemento)
end
```

#### Oggetto
Un oggetto in *microScript* è un tipo di lista associativa. L'oggetto ha uno o più "campi" che hanno una chiave e un valore. La chiave è una stringa di caratteri, il valore può essere qualsiasi valore valido in  *microScript*. La definizione di un oggetto inizia con la parola chiave "object" e finisce con la parola chiave "end". Tra i due delimitatori possono essere definiti diversi campi. Esempio :

```
mio_oggetto = object
  x = 0
  y = 0
  nome = "oggetto 1"
end
```
Potete accedere ai campi di un oggetto con l'operatore ```.``` . La definizione di cui sopra può quindi anche essere riscritta come:

```
mio_oggetto.x = 0
mio_oggetto.y = 0
mio_oggetto.nome = "oggetto 1"
```

Si può anche accedere ai campi tramite parentesi ```[]```. La definizione di cui sopra è quindi equivalente a:

```
mio_oggetto["x"] = 0
mio_oggetto["y"] = 0
mio_oggetto["nome"] = "oggetto 1"
```

Potete sfogliare la lista dei campi di un oggetto tramite ciclo ```for```:

```
for campo in my_object
  print(campo +" = " + " + my_object[field])
end
```

Vedere "Classi" per una copertura più approfondita degli oggetti

#### Valore della funzione

Un valore può essere di tipo funzione. Quando si scrive ```draw = function() ... end```, viene creato un valore di funzione e assegnato alla variabile ```draw``` (vedi la sezione sulle funzioni più avanti).

#### Variabili locali

Per default, le variabili dichiarate con l'assegnazione sono globali. È possibile definire una variabile locale, come parte di una funzione, usando la parola chiave "local":

```
myFunction = function()
  local i = 0
end
```

## Funzioni

Una funzione è una sotto-sequenza di operazioni, che esegue un lavoro, un calcolo e talvolta restituisce un risultato.

### Definire una funzione

Una funzione viene definita con la parola chiave "function" e termina con la parola chiave "end".

```
numeroSucessivo = function(x)
  x+1
end
```

### Invocare una funzione

```
print(numeroSucessivo(10))
```

Quando si invoca un valore che non è una funzione come una funzione, essa restituisce semplicemente il suo valore. Esempio :

```
x = 1
x(0)
```

Il codice qui sopra restituisce il valore 1, senza generare un errore. Così potete anche invocare una funzione che non è ancora definita (vale allora ```0```), senza che si generi un errore. Questo vi permette di iniziare a strutturare il vostro programma fin da subito con delle sottofunzioni, su cui lavorerete in seguito. Per esempio:

```
draw = function()
  disegnaCielo()
  disegnaNuvole()
  disegnaAlberi()
  disegnaNemici()
  disegnaErore()
end

// Posso implementare le funzioni cui sopra al mio ritmo, senza generare errori
```

## Condizioni

### Condizione semplice
Una dichiarazione condizionale permette al programma di testare un'ipotesi ed eseguire diverse operazioni a seconda del risultato del test. In *microScript*, le condizioni sono scritte come segue:

```
if anni<18 then
  print("bambino")
else
  print("adulto")
end
```
"if" significa "se";
"then" significa "allora";
"else" significa "altrimenti";
"end" significa "fine"

Nell'esempio qui sopra, **se** il valore della variabile anni è inferiore a 18, **allora** sarà eseguita l'istruzione ```print("bambino")```, **altrimenti** sarà eseguita l'istruzione ```print("adulto")```.

### Operatori di confronto binario
Ecco gli operatori binari che possono essere usati per i confronti:

|Operatore|Descrizione|
|-|-|
|==|```a == b``` è vero solo se a è uguale a b|
|!=|```a != b``` è vero solo se è diverso da b|
|<| ```a < b``` è vero solo se a è strettamente inferiore a b
|>| ```a > b``` è vero solo se a è strettamente maggiore di b".
|<=|```a <= b``` è vero solo se a è minore o uguale a b
|>=|```a >= b``` è vero solo se a è maggiore o uguale a b

### Operatori booleani
|Operatore|Descrizione|
|-|-|
|and| E logico: ```a and b``` è vero solo se a e b sono entrambi veri
|or| O logico: ```a or b``` è vero solo se a è vero o b è vero
|not| NO logico: ```not a``` è vero se a è falso e falso se a è vero.

### Valori booleani
In microScript, non esiste un tipo booleano. ```0``` è considerato falso e qualsiasi altro valore è vero. Gli operatori di confronto restituiscono ```1``` quando vero o ```0``` per il falso. Per comodità, microScript permette anche di usare queste due variabili predefinite:

|Variabile|Valore|
|-|-|
|true|1|
|false|0|


### Condizioni multiple

È possibile testare più ipotesi usando la parola chiave "elsif" (contrazione di "else if")
```
if anni<10 then
  print("bambino")
elsif anni<18 then
  print("adolescente")
elsif anni<30 then
  print("giovane adulto")
else
  print("età molto rispettabile")
end
```

## Loop
I loop permettono di eseguire operazioni ripetute.

### For loop
Il ciclo ```for``` è molto usato nella programmazione. Permette di effettuare la stessa operazione su tutti gli elementi di una lista o di una serie di valori.

```
for i=1 to 10
  print(i)
end
```
L'esempio precedente mostra nella console ogni numero da 1 a 10.

```
for i=0 to 10 by 2
  print(i)
end
```
L'esempio precedente mostra i numeri da 0 a 10 nella console in passi di 2.

```
lista =[2,3,5,5,7,11]
for numero in lista
  print(numero)
end
```
L'esempio qui sopra definisce una lista e poi visualizza ogni elemento della lista nella console.

### While loop
Il ciclo ```while``` permette di eseguire ripetutamente delle operazioni fino ad ottenere un risultato soddisfacente.

```
x = 1
while x*x<100
  print(x*x)
  x = x+1
end
```
L'esempio precedente stampa il quadrato di x, poi incrementa x (cioè aggiunge 1 a x), fintanto che il quadrato di x è inferiore a 100.

### Interruzione o continuazione del ciclo
Potete uscire prematuramente da un ciclo `for` o `while` con l'istruzione `break`. Esempio:

```
while true
  x = x+1
  if x>= 100 then break end
end
```

Potete saltare le operazioni rimanenti di un ciclo e continuare alla prossima iterazione del ciclo con l'istruzione `continue`. Esempio:

```
for i=0 to 10000
  if i%10 == 0 then continue end // questo salterà l'elaborazione dei multipli di 10
  faiQualcheOperazione(i)
end
```

## Operatori

Ecco la lista degli operatori binari in *microScript* (esclusi i confronti, già menzionati sopra)

### Operazioni
|Funzione|Descrizione|
|-|-|
|+|Addizione|
|-|Sottrazione|
|*|Moltiplicazione|
|/|Divisione|
|%|Modulo : ```x % y``` è uguale al resto della divisione di x per y|
|^|Potenza: ```x ^ y``` è uguale a x elevato alla potenza di y oppure ```pow(x,y)```|

## Funzioni predefinite

### Funzioni
|Funzione|Descrizione|
|-|-|
|max(a,b)|Restituisce il numero più grande tra a e b|
|min(a,b)|Restituisce il numero più piccolo tra a e b|
|round(a)|Ritorna il valore a arrotondato al valore intero più vicino|
|floor(a)|Restituisce il valore a arrotondato per difetto al numero intero inferiore|
|ceil(a)|Restituisce il valore a arrotondato per eccesso|
|abs(a)|Restituisce il valore assoluto di a|
|sqrt(a)|Restituisce la radice quadrata di a|
|pow(a,b)|Restituisce a alla potenza di b (altra notazione possibile: ```a ^ b```)|
|PI|Costante è uguale al numero Pi|
|log(a)|Restituisce il logaritmo naturale di a|
|exp(a)|Restituisce il numero di Eulero elevato alla potenza di a|

#### Funzioni trigonometriche in radianti
|Funzione|Descrizione|
|-|-|
|sin(a)|Restituisce il seno di a (a in radianti)|
|cos(a)|Ritorna il coseno di a (a in radianti)|
|tan(a)|Restituisce la tangente di a (a in radianti)|
|acos(a)|Restituisce l'arcocoseno di a (risultato in radianti)|
|asin(a)|Restituisce l'arcoseno di a (risultato in radianti)|
|atan(a)|Restituisce l'arcotangente di a (risultato in radianti)|
|atan2(y,x)|Ritorna l'arcotangente di y/x (risultato in radianti)|

#### Funzioni trigonometriche in gradi
|Function|Description|
|-|-|
|sind(a)|Restituisce il seno di a (a in gradi)|
|cosd(a)|Ritorna il coseno di a (a in gradi)|
|tand(a)|Restituisce la tangente di a (a in gradi)|
|acosd(a)|Restituisce l'arcocoseno di a (risultato in gradi)|
|asind(a)|Restituisce l'arcoseno di a (risultato in gradi)|
|atand(a)|Restituisce l'arcotangente di a (risultato in gradi)|
|atan2d(y,x)|Restituisce l'arco tangente di y/x (risultato in gradi)|

### Numeri casuali
L'oggetto random viene utilizzato per generare numeri pseudo-casuali. È possibile inizializzare il generatore con la funzione ```seed``` per ottenere la stessa sequenza di numeri ad ogni esecuzione, o al contrario una sequenza diversa ogni volta.

|Function|Description|
|-|-|
|```random.next()```|Restituisce un nuovo numero casuale tra 0 e 1|
|```random.nextInt(a)```|Restituisce un nuovo numero intero casuale tra 0 e a-1|
|```random.seed(a)```|Resetta la sequenza di numeri casuali usando il valore a ; se usate lo stesso valore di inizializzazione due volte, otterrete la stessa sequenza di numeri casuali. Se a == 0, il generatore di numeri casuali è inizializzato... in modo casuale e quindi non riproducibile|

## Operazioni con le stringhe

|Operazione|Descrizione|
|-|-|
|```string1 + string2```|L'operatore + può essere usato per concatenare stringhe|
|```string.length```|Il campo ```length``` contiene la lunghezza della stringa.|
|```string.substring(i1,i2)```|Restituisce una sottostringa della stringa di caratteri, partendo dall'indice i1 e finendo all'indice i2|
|```string.startsWith(s)``` |Ritorna true se la stringa inizia esattamente con ```s```|
|```string.endsWith(s)```|Ritorna true se la stringa finisce esattamente con ```s```|
|```string.indexOf(s)``` |Restituisce l'indice della prima occorrenza di ```s``` in ```string```, oppure -1 se ```string``` non contiene alcuna occorrenza|
|```string.lastIndexOf(s)```|Restituisce l'indice dell'ultima occorrenza di ```s``` in ```string```, o -1 se ```stringa``` non ne contiene alcuna occorrenza|
|```string.replace(s1,s2)```|Restituisce una nuova stringa in cui la prima occorrenza di ```s1``` (se presente) è sostituita con ```s2```|
|```string.toUpperCase()```|Restituisce la stringa convertita in maiuscolo|
|```string.toLowerCase()```|restituisce la stringa convertita in minuscolo|
|```stringa.split(s)```|La funzione split divide la stringa in una lista di sottostringhe, utilizzando la sottostringa separatrice passata come argomento. Restituisce quindi una lista delle sottostringhe trovate|


## Operazioni di lista
|Operazione|Descrizione|
|-|-|
|```list.length```|Contiene la lunghezza della lista (numero di elementi nella lista).|
|```list.push(elemento)```|Aggiunge un elemento alla fine della lista|
|```list.insert(elemento)```|Inserisce un elemento all'inizio della lista|
|```list.insertAt(elemento,indice)```|Inserisce un elemento nella lista all'indice dato|
|```list.indexOf(elemento)```|Restituisce la posizione dell'elemento nella lista (0 per il primo elemento, 1 per il secondo elemento ...). Restituisce -1 quando l'elemento non si trova nella lista|
|```list.contains(elemento)```|Restituisce 1 (true) quando ```elemento``` è nella lista, o 0 (false) quando l'elemento non può essere trovato nella lista|
|```list.removeAt(indice)```|Rimuove dalla lista l'elemento nella posizione ```index```|
|```list.removeElement(elemento)```|Rimuove dalla lista ```elemento```, se si trova nella lista|
|```list1.concat(list2)```|Restituisce una nuova lista ottenuta concatenando list2 a list1|

## Ordinamento di un elenco

Potete ordinare gli elementi di una lista usando la funzione ```list.sortList(funzioneDiConfronto)```. La ```funzioneDiConfronto``` che fornite deve accettare due argomenti (che chiameremo ```a``` e ```b```) e deve restituire:

|Valore di ritorno|quando|
|-|-|
|un numero negativo|quando ```a``` deve essere ordinato prima di ```b``` (a è minore di b)|
|zero|quando ```a``` e ```b``` hanno una posizione uguale rispetto al criterio di ordinamento desiderato|
|un numero positivo|quando ```a``` deve essere ordinato dopo ```b``` (a è maggiore di b)|

##### esempio

L'esempio che segue presuppone che la lista contenga *punti*, ogni punto con un campo di coordinate ```x```. Vogliamo ordinare i punti dal valore minore di punto.x al valore maggiore di punto.x:

```
confronto = function(punto1,punto2)
  return punto1.x - punto2.x
end

list.sortList(confronto)
```

Nota che potreste accorciare il codice qui sopra in questo modo:

```
list.sortList(function(point1,point2) punto1.x - punto2.x end)
```

Ogni volta che non viene fornita una funzione di confronto, gli elementi della lista saranno ordinati secondo l'ordine alfabetico.

## Commenti

I commenti in *microScript* possono essere aggiunti dopo una doppia barra: ```//```; tutto ciò che segue fino alla prossima interruzione di riga viene ignorato quando si analizza il programma per la compilazione.

##### esempio
```
miaFunzione = ()
  // le mie note sullo scopo della funzione miaFunzione
end
```

## Classi

Una classe in un linguaggio di programmazione si riferisce a una sorta di modello o template per la creazione di oggetti. Una classe definisce proprietà e funzioni di default che costituiscono lo stato e il comportamento standard di tutti gli oggetti che saranno creati da essa. È possibile creare istanze di oggetti derivati da una classe, che erediteranno tutte le proprietà della classe. L'uso delle classi e dei loro oggetti derivati in un programma è chiamato programmazione orientata agli oggetti (OOP).

Per illustrare questi concetti, vedremo come potete usare le classi per gestire i nemici nel vostro gioco:

### Definire una classe

Inizieremo creando una classe ```Nemico``` che sarà condivisa da tutti i nostri oggetti nemici. Ogni nemico avrà una ```posizione``` (sullo schermo). Avrà punti salute ```vita```, si muoverà ad una certa velocità ```movimento```:

```
Nemico = class
  constructor = function(posizione)
    this.posizione = posizione
  end

  vita = 10
  movimento = 1

  muovi = function()
    posizione += movimento
  end

  colpito = function(danno)
    vita -= danno
  end
end
```

In microScript, le classi e gli oggetti sono concetti molto simili e possono essere usati quasi in modo intercambiabile. La definizione della classe termina quindi con la parola chiave ```end```. La prima proprietà che abbiamo definito nella classe qui sopra è la funzione "constructor". Questa funzione viene chiamata quando viene creata un'istanza dell'oggetto della classe. Imposta la proprietà *posizione* dell'oggetto. ```this``` si riferisce all'istanza dell'oggetto su cui la funzione sarà chiamata, quindi impostare ```this.posizione``` significa che l'oggetto imposta la proprietà posizione su se stesso.

### Creare istanze di oggetti da una classe

Creiamo due oggetti nemici derivati dalla nostra classe:

```
nemico_1 = new Nemico(50)
nemico_2 = new Nemico(100)
```

L'operatore ```new``` è usato per creare una nuova istanza di un oggetto derivato da una classe. L'argomento che passiamo qui sarà rivolto alla funzione costruttore della nostra classe. Abbiamo così creato un'istanza del nemico alla posizione 50 e un'altra istanza del nemico alla posizione 100.

Entrambi i nemici condividono la stessa velocità(movimento) e punti vita (vita). Tuttavia, possiamo scegliere di impostare una velocità di movimento diverso per il secondo nemico:

```
nemico_2.movimento = 2
```

Ora possiamo far muovere i nostri nemici chiamando:

```
nemico_1.muovi()
nemico_2.muovi()
```

Il secondo nemico si muoverà due volte più velocemente perché abbiamo alterato la velocità di movimento tramite la sua proprietà prima di chiamare la funzione movi.

### Eredità

Possiamo fare in modo che una classe erediti da un'altra classe. Per esempio, se vogliamo creare una variante del nostro Nemico, potremmo fare come segue:

```
Boss = class extends Nemico
  constructor = function(posizione)
    super(posizione)
    vita = 50
  end

  muovi = function()
    super()
    vita += 1
  end
end
```

Abbiamo creato una nuova classe ```Boss``` estendendo la classe ```Nemico```. La nostra nuova classe condivide tutte le proprietà di Nemico, tranne che sostituisce alcune di queste proprietà con i propri valori. Chiamando ```super(posizione)``` nel costruttore della nostra nuova classe ci assicuriamo che venga chiamato anche il costruttore della nostra classe madre Nemico.

Abbiamo creato un nuovo comportamento ```muovi``` per il nostro Boss, che sovrascrive il comportamento di default di Nemico. In questa nuova funzione, chiamiamo ```super()``` per mantenere il comportamento di default che è stato definito nella classe Enemy; poi però incrementiamo il valore di ```vita```, cioò implica che i nostri Boss recupereranno punti salute mentre si muovono.

Possiamo ora creare un'istanza del nostro Boss nella posizione 120:

```
boss_finale = new Boss(120)
```

##### note

* spazio delle variabili: quando una funzione viene chiamata su un oggetto (come ```nemico_1.muovi()```), le variabili a cui si fa riferimento nel corpo delle funzioni chiamate sono le proprietà dell'oggetto. Per esempio, nel corpo della funzione mouvi, ```posizione += 1``` incrementerà la proprietà ```posizione``` dell'oggetto stesso.

* A volte è necessario usare ```this``` per assicurarsi che ci stiamo riferendo correttamente a una proprietà del nostro oggetto. Per questo, nel costruttore della nostra classe Nemico, usiamo ```this.posizione = posizione```, perché ```posizione``` si riferisce anche all'argomento della funzione e quindi "nasconde" la proprietà del nostro oggetto.

* ```super()``` può essere usato in una funzione collegata a un oggetto o a una classe, per invocare la funzione con lo stesso nome della classe madre.


# Riferimento alle funzioni

## Visualizzare nello schermo ```screen```.

In *microStudio* lo schermo è rappresentato dall'oggetto predefinito "screen". Per visualizzare forme o immagini sullo schermo, basta chiamare funzioni (chiamate anche *metodi*) di questo oggetto. Per esempio:

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```
Il codice qui sopra definisce il colore del disegno come ``#FFF``` cioè bianco (vedi spiegazione più sotto). Poi disegna un rettangolo riempito di questo colore, centrato sulle coordinate 0.0 dello schermo (cioè il centro dello schermo), di larghezza 100 e altezza 100.

Per facilitare il vostro lavoro, *microStudio* scala automaticamente le coordinate dello schermo, indipendentemente dalla risoluzione effettiva del display. Per convenzione, la dimensione più piccola dello schermo (larghezza in modalità verticale, altezza in modalità orizzontale) è 200. Essendo il punto di origine (0,0) il centro dello schermo, la dimensione più piccola è quindi graduata da -100 a +100. La dimensione più grande sarà graduata per esempio da -178 a +178 (schermo classico 16:9), oppure da -200 a +200 (schermo 2:1, smartphone più lunghi e recenti) ecc.


![Coordinate dello schermo](/doc/img/screen_coordinates.png "Coordinate dello schermo")

<small>*Sistema di coordinate di disegno su uno schermo 16:9 in modalità verticale e in modalità orizzontale*</small>


### Definire un colore
<!--- suggest_start screen.setColor --->
##### screen.setColor( colore)

Definisce il colore da usare per le sucessive chiamate alle funzioni di disegno.

<!--- suggest_end --->

Il colore è definito da una stringa di caratteri, quindi tra virgolette "". È generalmente descritto dalle sue componenti RGB, cioè una miscela di Rosso, Verde e Blu. Sono possibili diversi tipi di classificazione:

* "rgb(255,255,255)": (rgb per rosso, verde, blu). Qui viene indicato un valore per il rosso, il verde e il blu che varia tra 0 e 255 massimo. "rgb(255,255,255)" dà il bianco, "rgb(255,0,0)" dà il rosso vivo, "rgb(0,255,0)" dà il verde ecc. Per scegliere più facilmente un colore durante la codifica, clicca sul tuo colore rgb e tieni premuto il tasto Control per visualizzare il selettore di colori.
* "#FFF" o "#FFFFFF": questa notazione usa l'esadecimale, per descrivere le 3 componenti del rosso, del verde e del blu. L'esadecimale è un sistema di notazione numerica in "base 16", cioè utilizzando 16 cifre, da 0 a 9 quindi da A a F.
* esistono altre notazioni, che non sono descritte qui.

### Cancella lo schermo
<!--- suggest_start screen.clear --->
##### screen.clear(colore)
Cancella lo schermo (lo riempie con il colore fornito, o con il nero se nessun colore è passato come argomento).
<!--- suggest_end --->

### Disegno di forme
<!--- suggest_start screen.fillRect --->
##### screen.fillRect( x, y, larghezza, altezza, colore)
Disegna un rettangolo riempito di colore, centrato sulle coordinate x e y, con la larghezza e l'altezza specificate. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRoundRect --->
##### screen.fillRoundRect( x, y, larghezza, altezza, raggio, colore)
Disegna un rettangolo arrotondato riempito di colore, centrato sulle coordinate x e y, con la larghezza, l'altezza e il raggio di curvatura specificati. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRound --->
##### screen.fillRound( x, y, larghezza, altezza, colore)
Disegna una forma rotonda solida (un disco o un'ellisse a seconda delle dimensioni utilizzate), centrata nelle coordinate x e y, con la larghezza e l'altezza specificate. Il colore di riempimento è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

<!--- suggest_start screen.drawRect --->
##### screen.drawRect( x, y, larghezza, altezza, colore)
Disegna il contorno di un rettangolo, centrato sulle coordinate x e y, con la larghezza e l'altezza specificate. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRoundRect --->
##### screen.drawRoundRect( x, y, larghezza, altezza, raggio, colore)
Disegna un contorno di rettangolo arrotondato, centrato sulle coordinate x e y, con la larghezza, l'altezza e il raggio di curvatura specificati. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRound --->
##### screen.drawRound( x, y, larghezza, altezza, colore)
Disegna il contorno di una forma rotonda, centrata alle coordinate x e y, con la larghezza e l'altezza specificate. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

<!--- suggest_start screen.drawLine --->
##### screen.drawLine( x1, y1, x2, y2, colore )
Disegna una linea che unisce i punti (x1,y1) e (x2,y2). Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore usato.
<!--- suggest_end --->

<!--- suggest_start screen.fillPolygon --->
##### screen.fillPolygon( x1, y1, x2, y2, x3, y3, ... , colore )
Riempie un poligono definito dall'elenco di coordinate di punti passati come argomenti. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

La funzione può anche accettare un array come primo argomento e un colore come secondo argomento. In tal caso, ci si aspetta che l'array contenga le coordinate dei punti come in questo esempio: ```screen.fillPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon( x1, y1, x2, y2, x3, y3, ... , colore )
Disegna un contorno di poligono, definito dall'elenco di coordinate di punti passati come argomenti. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

La funzione può anche accettare un array come primo argomento e un colore come secondo argomento. In tal caso, ci si aspetta che l'array contenga le coordinate dei punti come in questo esempio: ```screen.drawPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolyline --->
##### screen.drawPolyline( x1, y1, x2, y2, x3, y3, ... , colore )
Equivalente a `drawPolygon`, eccetto che il percorso di disegno non sarà chiuso automaticamente.
<!--- suggest_end --->

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth( larghezza )
Imposta la larghezza della linea per tutte le successive operazioni di disegno di linee (drawLine, drawPolygon, drawRect ecc.). La larghezza di linea predefinita è 1.
<!--- suggest_end --->

<!--- suggest_start screen.setLineDash --->
##### screen.setLineDash( array_di_valori )
Imposta lo stile del tratto di linea per tutte le successive operazioni di disegno di linee (drawLine, drawPolygon, drawRect ecc.). L'argomento deve essere un array di valori positivi, che definiscono la lunghezza delle linee e degli spazi vuoti.

#### esempio
```
screen.setLineDash([2,4])
```
<!--- suggest_end --->


### Visualizza sprites e mappe

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite( sprite, x, y, larghezza, altezza)

Disegna sullo schermo uno degli sprite che hai creato nella sezione *Sprites*. Il primo parametro è una stringa che corrisponde al nome dello sprite da visualizzare, per esempio ``"icon"``. Poi seguono le coordinate x,y dove visualizzare lo sprite (lo sprite sarà centrato su queste coordinate). Poi la larghezza e l'altezza della visualizzazione.
<!--- suggest_end --->

```
screen.drawSprite("icon",0,50,50,50)
```
L'altezza può essere omessa, come nell'esempio precedente. In questo caso l'altezza sarà calcolata in base alla larghezza e alle proporzioni dello sprite.

##### Sprites animati

Gli sprite animati disegneranno automaticamente il frame corretto secondo le impostazioni dell'animazione. È possibile impostare il fotogramma corrente di uno sprite (ad esempio per riavviare l'animazione) in questo modo:

```
sprites["sprite1"].setFrame(0) // 0 è l'indice del primo frame
```

Potete anche disegnare un fotogramma di animazione specifico del vostro sprite, aggiungendo "." e l'indice del fotogramma richiesto:

```
screen.drawSprite("sprite1.0",0,50,50,50)
```

L'esempio qui sopra disegna il fotogramma 0 dello sprite "sprite1".

<!--- suggest_start screen.drawSpritePart --->
##### screen.drawSpritePart( sprite, part_x, part_y, part_width, part_height, x, y, larghezza, altezza)

Disegna parte di uno sprite sullo schermo. Il primo parametro è una stringa che corrisponde al nome dello sprite da visualizzare, per esempio ```"icon"```. I prossimi 4 parametri definiscono la coordinata di un sotto-rettangolo dello sprite da disegnare effettivamente sullo schermo (la coordinata 0,0 è l'angolo in alto a sinistra dello sprite). Gli ultimi 4 parametri sono gli stessi della funzione ```drawSprite```.
<!--- suggest_end --->

```
screen.drawSpritePart("icon",4,4,8,8,0,50,50,50)
```
L'altezza può essere omessa, come nell'esempio precedente. In questo caso l'altezza sarà calcolata in base alla larghezza e alle proporzioni della parte di sprite.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap( map , x , y , larghezza , altezza )
Disegna sullo schermo una delle mappe che hai creato nella sezione *Maps*. Il primo parametro è una stringa che corrisponde al nome della mappa da visualizzare,
per esempio ```mappa1```. Poi seguono le coordinate x,y dove visualizzare la mappa (la mappa sarà centrata su queste coordinate). In sucessione poi, la larghezza e l'altezza della visualizzazione.
<!--- suggest_end --->

```
screen.drawMap("map1",0,0,300,200)
```

### Display text

<!--- suggest_start screen.drawText --->
##### screen.drawText( testo, x, y, dimensione, &lt;colore&gt; )
Disegna un testo sullo schermo. Il primo parametro è il testo da visualizzare, poi le coordinate x e y dove il testo sarà centrato, poi la dimensione (altezza) del testo. L'ultimo parametro è il colore del disegno, può essere omesso, in questo caso verrà riutilizzato l'ultimo colore definito.
<!--- suggest_end --->

```
screen.drawText("Ciao!",0,0,30, "#FFF")
```

<!--- suggest_start screen.drawTextOutline --->
##### screen.drawTextOutline( text, x, y, size, &lt;colore&gt; )
Disegna il contorno del testo. Il disegnare il contorno di un colore diverso può essere fatto dopo un ```drawText``` per aumentare il contrasto del testo stesso. Lo spessore del contorno può essere impostato con ```screen.setLineWidth```.
<!--- suggest_end --->

```
screen.drawTextOutline("Ciao!",0,0,30, "#F00")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont( font_name )
Definisce il font da usare per le future chiamate a ```drawText```.

**Fonts disponibili nella versione corrente**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->

```
screen.setFont("BitCell")
```

**Suggerimento**: la variabile globale ```fonts``` è un array di tutti i font disponibili in microStudio

<!--- suggest_start screen.loadFont --->
##### screen.loadFont( font_name )
Avvia il caricamento di un font. Utile insieme a `screen.isFontReady`.
<!--- suggest_end --->

```
screen.loadFont("DigitalDisco")
```
<!--- suggest_start screen.isFontReady --->
##### screen.isFontReady( font_name )
Restituisce 1 (vero) se il dato font è caricato e pronto per essere usato. Assicurati di chiamare prima `screen.loadFont` o il tuo font potrebbe non essere mai caricato.
<!--- suggest_end --->
Potete omettere l'argomento della funzione, nel qual caso controlla se il font corrente è caricato e pronto per essere usato (font di default, o un altro font che avete impostato con la vostra ultima chiamata a `screen.setFont( font_name )``).

```
if screen.isFontReady() then
  // possiamo usare il font predefinito
  screen.drawText("MIO TESTO",0,0,50)
end

screen.loadFont("DigitalDisco") // avvia il caricamento del font DigitalDisco

if screen.isFontReady("DigitalDisco") then  // controlla che DigitalDisco sia caricato
  screen.setFont("DigitalDisco") // imposta il font DigitalDisco per la scrittura
  screen.drawText("QUALCHE ALTRO TESTO",0,50,20) // scrivi il testo con il font caricato
end
```

<!--- suggest_start screen.textWidth --->
##### screen.textWidth( testo, dimensione )
Restituisce la larghezza del testo impostato quando verrà disegnato sullo schermo con la dimensione data.
<!--- suggest_end --->

```
larghezza = screen.textWidth( "Il mio testo", 20 )
```

### Parametri di disegno
<!--- suggest_start screen.setAlpha --->
##### screen.setAlpha(opacità)
Definisce il livello di opacità generale per tutte le funzioni di disegno richiamate in seguito. Il valore 0 equivale a una trasparenza totale (elementi invisibili) e il valore 1 corrisponde a un'opacità totale (gli elementi disegnati nascondono totalmente ciò che sta sotto).
<!--- suggest_end --->

```
screen.setAlpha(0.5) // i prossimi elementi disegnati saranno semi-trasparenti
```

Quando usate questa funzione per disegnare alcuni elementi con un po' di trasparenza, non dimenticate di resettare il parametro alfa al suo valore predefinito quando non è più necessario:

```
screen.setAlpha(1) // il valore predefinito, opacità totale
```

---

<!--- suggest_start screen.setLinearGradient --->
##### screen.setLinearGradient(x1, y1, x2, y2, colore1, colore2)
Definisce il colore del disegno come un gradiente lineare di colore, cioè un gradiente. ```x1 e y1``` sono le coordinate del punto di partenza del gradiente. ```x2 e y2``` sono le coordinate del punto finale del gradiente. ```colore1``` è il colore di partenza (vedi ```setColor``` per i valori del colore). ```colore2``` è il colore di arrivo.
<!--- suggest_end --->

```
screen.setLinearGradient(0,100,0,-100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
L'esempio precedente crea un gradiente dal bianco al rosso, dall'alto al basso dello schermo, e poi riempie lo schermo con questo gradiente.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient( x, y, raggio, colore1, colore2)
Definisce il colore del disegno come un gradiente radiale di colore, cioè un gradiente a forma di cerchio. ```x``` e ```y``` sono le coordinate del centro del cerchio. ```raggio``` è il raggio del cerchio. ```colore1``` è il colore al centro del cerchio (vedi ```setColor``` per i valori dei colori). ```colore2``` è il colore sul perimetro del cerchio.
<!--- suggest_end --->

```
screen.setRadialGradient(0,0,100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
L'esempio precedente crea un gradiente di bianco al centro dello schermo, verso il rosso sui bordi dello schermo, poi riempie lo schermo con questo gradiente.

---

<!--- suggest_start screen.setTranslation --->
##### screen.setTranslation( tx, ty )
Definisce la traslazione delle coordinate dello schermo per le successive operazioni di disegno.
<!--- suggest_end --->

```
screen.setTranslation(50,50)
screen.fillRect(0,0,20,20)
```
Il rettangolo nell'esempio precedente sarà disegnato con un offset di 50,50

Non dimenticate di resettare la traslazione a 0,0 ogni volta che avete bisogno di interrompere la traslazione delle sucessive operazioni di disegno.
```
screen.setTranslation(0,0)
```

<!--- suggest_start screen.setDrawRotation --->
##### screen.setDrawRotation(angolo)
Definisce un angolo di rotazione per le prossime operazioni di disegno. L'angolo è espresso in gradi.
<!--- suggest_end --->

```
screen.setDrawRotation(45)
screen.drawSprite ("icon",0,0,100)
```
L'esempio qui sopra mostra l'icona del progetto, inclinata di 45 gradi.

Non dimenticare di resettare l'angolo di rotazione a 0 dopo averlo usato!
```
screen.setDrawRotation(0) // ripristina l'angolo di rotazione al suo valore predefinito
```

<!--- suggest_start screen.setDrawScale --->
##### screen.setDrawScale( x, y)
Definisce un fattore di scala per disegnare i prossimi elementi sullo schermo. ```x``` definisce il fattore di scala sull'asse ```x``` e ```y``` il fattore di scala sull'asse y. Un valore di 2 visualizzerà i disegni sucessivi con il doppio della dimensione. Un valore di -1 permette, per esempio, di capovolgere uno sprite (specchio), orizzontalmente (x) o verticalmente (y).
<!--- suggest_end --->

```
screen.setDrawScale(1,-1)
screen.drawSprite ("icon",0,0,100)
```
L'esempio qui sopra mostra l'icona del progetto, capovolta verticalmente.

Non dimenticare di resettare il fattore di scala a (1,1) dopo averlo usato!
```
screen.setDrawScale(1,1) // ripristina il fattore di scala al suo valore predefinito.
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setDrawAnchor( ancoraggio_x, ancoraggio_y )
Per impostazione predefinita, tutte le operazioni di disegno considerano le vostre coordinate come il centro della forma da disegnare. Puoi cambiare questo comportamento chiamando
`screen.setDrawAnchor( ancoraggio_x, ancoraggio_y )`per specificare un punto di ancoraggio diverso per disegnare le forme.

<!--- suggest_end --->
Sull'asse x, il punto di ancoraggio può essere impostato a -1 (lato sinistro della tua forma), 0 (centro della tua forma), 1 (lato destro della tua forma) o qualsiasi valore intermedio. Sull'asse y, il punto di ancoraggio può essere impostato a -1 (lato inferiore della tua forma), 0 (centro della tua forma), 1 (parte superiore della tua forma) o qualsiasi valore intermedio.

Esempi
```
screen.setDrawAnchor(-1,0) // utile per allineare il testo a sinistra
screen.setDrawAnchor(-1,-1) // le vostre coordinate di disegno sono ora interpretate come l'angolo inferiore sinistro della vostra forma.
screen.setDrawAnchor(0,0) // valore predefinito, tutte le forme saranno disegnate centrate sulle vostre coordinate
```

<!--- suggest_start screen.setBlending --->
##### screen.setBlending( blending )
Definisce come le successive operazioni di disegno saranno composte con l'immagine sottostante, già disegnata. Può essere impostato su `normal` (normale) o `additive` (additivo).

Puoi anche usare qualsiasi modalità di composizione definita nella specifica HTML5 Canvas con `setBlending`, per riferimento vedi https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation

<!--- suggest_start screen.width --->
##### screen.width
Il campo "width" dell'oggetto schermo ha come valore la larghezza attuale dello schermo (sempre 200 se lo schermo è in modalità verticale, vedi *coordinate schermo*).
<!--- suggest_end --->

<!--- suggest_start screen.height --->
##### screen.height
Il campo "altezza" dell'oggetto schermo ha come valore l'altezza attuale dello schermo (sempre 200 se lo schermo è in modalità paesaggio, vedi *coordinate schermo*).
<!--- suggest_end --->

<!--- suggest_start screen.setCursorVisible --->
##### screen.setCursorVisible( visibile )
Potete usare questa funzione per mostrare o nascondere il cursore del mouse.
<!--- suggest_end --->


## Ingressi, controllo

Per rendere il vostro programma interattivo, avete bisogno di sapere se e dove l'utente preme un tasto sulla tastiera, il joystick, o i tocchi del touch screen. *microStudio* ti permette di conoscere lo stato di queste diverse interfacce di controllo, tramite gli oggetti ```keyboard``` (per la tastiera), ```touch``` (per il touch screen / mouse), ```mouse``` (per il puntatore del mouse / touch screen) ```gamepad``` (per il controller o joypad).

##### Nota
L'oggetto ```system.inputs``` contiene informazioni utili su quali metodi di input sono disponibili sul sistema host:

|Campo|Valore|
|-|-|
|system.inputs.keyboard|1 se si rileva che il sistema abbia una tastiera fisica, 0 altrimenti|
|system.inputs.mouse|1 se il sistema ha un mouse, 0 altrimenti|
|system.inputs.touch|1 se il sistema ha un touch screen, 0 altrimenti|
|system.inputs.gamepad|1 se c'è almeno 1 gamepad collegato al sistema, 0 altrimenti (il gamepad appare collegato solo quando l'utente ha eseguito un'azione su di esso)|


### Ingressi da tastiera
<!--- suggest_start keyboard --->
Gli input da tastiera possono essere testati usando l'oggetto ```keyboard```.
<!--- suggest_end --->

##### esempio
```
if keyboard.A allora
  // il tasto A è attualmente premuto
end
```

Notate che mentre provate il vostro progetto, affinché gli eventi della tastiera si propaghino fino alla finestra di esecuzione, è necessario cliccare prima su di essa.

Il codice qui sotto mostra l'ID di ogni tasto della tastiera premuto. Può esservi utile per stabilire l'elenco degli identificatori di cui avrete bisogno per il vostro progetto.

```
draw = function()
  screen.clear()
  local y = 80
  for key in keyboard
    if keyboard[key] then
      screen.drawText(key,0,y,15, "#FFF")
      y -= 20
    end
  end
end
```

*microStudio* crea per voi alcuni utili codici generici, come UP, DOWN, LEFT e RIGHT che reagiscono sia ai tasti freccia che a ZQSD / WASD a seconda del layout della vostra tastiera.

Per testare i caratteri speciali come +, - o anche le parentesi, devi usare la seguente sintassi: ```keyboard["("]```, ```keyboard["-"]```.

##### Verifica se un tasto è stato appena premuto
Nel contesto della funzione ```update()```, potete controllare se un tasto della tastiera è stato appena premuto dall'utente usando ```keyboard.press.<KEY>```.

Esempio:

```
if keyboard.press.A then
  // Fai qualcosa una volta, proprio quando l'utente preme il tasto A
end
```

##### Verificare se un tasto è stato appena rilasciato
Nel contesto della funzione ```update()```, potete controllare se un tasto della tastiera è stato appena rilasciato dall'utente usando ```keyboard.release.<KEY>```.

Esempio:

```
if keyboard.release.A then
  // Fai qualcosa una volta, proprio quando l'utente rilascia il tasto A
end
```


<!--- suggest_start touch --->
### Ingressi touch

Gli input tattili possono essere testati con l'oggetto "touch" (che riporta anche lo stato del mouse).
<!--- suggest_end --->

|Campo|Valore|
|-|-|
|touch.touching|è vero se l'utente sta toccando lo schermo, falso se non lo sta toccando|
|touch.x|Posizione x in cui lo schermo viene toccato|
|touch.y|Posizione y in cui lo schermo viene toccato|
|touch.touches|Nel caso in cui si debba tener conto di più punti di contatto simultaneamente, touch.touches è una lista dei punti di contatto attualmente attivi|
|touch.press|vero se un dito ha appena iniziato a toccare lo schermo|
|touch.release|vero se il dito ha appena rilasciato lo schermo|

```
if touch.touching
  // l'utente sta toccando lo schermo
else
 // l'utente non sta toccando lo schermo
end
```

```
draw = function()
  for t in touch.touches
    screen.drawSprite("icon",t.x,t.y,50)
  end
end
```
L'esempio qui sopra mostra l'icona del progetto in ogni punto di contatto attivo sullo schermo.  

<!--- suggest_start mouse --->
### Ingressi del mouse

Gli input del mouse possono essere testati con l'oggetto ```mouse``` (che riporta anche eventi touch).
<!--- suggest_end --->

|Campo|Valore|
|-|-|
|mouse.x|Posizione x del puntatore del mouse|
|mouse.y|Posizione y del puntatore del mouse|
|mouse.pressed|1 se un qualsiasi pulsante del mouse è premuto, 0 altrimenti|
|mouse.left|1 se il tasto sinistro del mouse è premuto, 0 altrimenti|
|mouse.right|1 se il tasto destro del mouse è premuto, 0 altrimenti|
|mouse.middle|1 se il pulsante centrale del mouse è premuto, 0 altrimenti|
|mouse.press|vero se un pulsante del mouse è stato appena premuto|
|mouse.release|vero se un pulsante del mouse è stato appena rilasciato|

### Ingressi del controller (gamepad)
<!--- suggest_start gamepad --->
Lo stato dei pulsanti e dei joystick del controller (gamepad) può essere testato utilizzando l'oggetto "gamepad".
<!--- suggest_end --->

##### esempio
```
if gamepad.UP then y += 1 end
```

**Suggerimento**: Per ottenere una lista completa dei campi dell'oggetto "gamepad", digitate semplicemente "gamepad" nella console quando il vostro programma è in esecuzione.

Come per la pressione dei tasti della tastiera, puoi usare ```gamepad.press.<BUTTON>``` per controllare se un pulsante è stato appena premuto o ```gamepad.release.<BUTTON>``` per controllare se un pulsante è stato appena rilasciato.

## Suoni

*microStudio* attualmente vi permette di riprodurre suoni e musica che avete importato nel vostro progetto (come file WAV e MP3) o di creare suoni programmaticamente usando il tradizionale *beeper*.

### Riproduci un suono
<!--- suggest_start audio.playSound --->
##### audio.playSound( nome, volume, intonazione, panoramica, ripetizione )
Riproduce il suono dato, con le impostazioni di riproduzione opzionali date.
<!--- suggest_end --->

##### argomenti
|Argomento|Descrizione|
|-|-|
|nome|Il nome del suono (dalla scheda sounds del tuo progetto) da riprodurre|
|volume|[opzionale] Il volume di uscita per questa riproduzione sonora, che va da 0 a 1|
|intonazione|[opzionale] Il tono di uscita per questa riproduzione del suono, 1 è il tono predefinito|
|panoramica|[opzionale] L'impostazione di pan per questa riproduzione del suono, che va da -1 (sinistra) a 1 (destra)|
|ripetizione|Impostare a 1 (true) se volete che il suono venga ripetuto all'infinito|

La chiamata alla funzione restituisce un oggetto. Questo oggetto vi permette di controllare le impostazioni di riproduzione mentre il suono viene riprodotto:

##### esempio
```
mio_suono = audio.playSound("nomedelsuono")
mio_suono.setVolume(0.5)
```

|Funzioni di controllo|Descrizione|
|-|-|
|mio_suono.setVolume(volume)|Cambia il volume di riproduzione del suono (valore che va da 0 a 1)|
|mio_suono.setPitch(intonazione)|Cambia l'intonazione del suono (1 è il pitch predefinito)|
|mio_suono.setPan(panoramica)|Cambia l'impostazione di panoramicità stereofonica del suono (valore che va da -1 a 1)|
|mio_suono.stop()|Ferma la riproduzione di quel suono|

### Riproduci musica
<!--- suggest_start audio.playMusic --->
##### audio.playMusic( nome, volume, ripetizione )
Riproduce la musica data, con le impostazioni di riproduzione opzionali date.
<!--- suggest_end --->

##### argomenti
|Argomento|Descizione|
|-|-|
|nome|Il nome della musica (dalla scheda musicale del tuo progetto) da riprodurre|
|volume|[opzionale] Il volume di uscita per questa riproduzione musicale, che va da 0 a 1|
|ripetizione|Impostare a 1 (true) se vuoi che la musica vada in loop all'infinito|

La chiamata alla funzione restituisce un oggetto. Questo oggetto vi permette di controllare le impostazioni di riproduzione mentre la musica viene riprodotta:

##### esempio
```
mia_musica = audio.playMusic("nomedellamusica")
mia_musica.setVolume(0.5)
```

|Funzioni di controllo|Descizione|
|-|-|
|mia_musica.setVolume(volume)|Cambia il volume di riproduzione della musica (valore che va da 0 a 1)|
|mia_musica.stop()|Ferma la riproduzione di quella musica|
|mia_musica.play()|Riprende la riproduzione se l'hai fermata prima|
|mia_musica.getPosition()|Ritorna la posizione corrente di riproduzione in secondi|
|mia_musica.getDuration()|Ritorna la durata totale della musica in secondi|


<!--- suggest_start audio.beep --->
### audio.beep
Riproduce un suono descritto dalla stringa passata come parametro.

```
audio.beep("C E G")
```
<!--- suggest_end --->
Esempio più dettagliato e spiegazioni nella tabella sottostante:
```
"saw duration 100 tempo 220 span 50 volume 50 loop 4 C2 C F G G G F end"
```

|Comando|Descrizione|
|-|-|
|saw|Indica il tipo di generatore di suono (colore del suono), valori possibili:saw (dente di sega), sine (sinosuidale), square (onda quadra), noise (rumore)|
|duration|La durata seguita da un numero di millisecondi indica la durata delle note|
|tempo|seguito da un numero di note al minuto, indica il tempo|
|span|Seguito da un numero tra 1 e 100, indica la percentuale di mantenimento di ogni nota|
|volume|seguito da un numero tra 0 e 100, imposta il volume|
|C| oppure D, E, F ecc. indica una nota da suonare. È possibile indicare anche l'ottava, ad esempio C5 per il C della quinta ottava della tastiera|
|loop|seguito da un numero, indica il numero di volte che la seguente sequenza dovrà essere ripetuta. La sequenza termina con la parola chiave ```end``` esempio: ```loop 4 C4 E G end```; il numero 0 significa che il ciclo deve essere ripetuto indefinitamente|

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Annulla tutti i suoni riprodotti dal *beeper*. Utile per silenziare il suono dopo aver avviato dei loop musicali.
<!--- suggest_end --->

## Metodi per gli sprite
Il tuo programma può accedere agli sprites del tuo progetto, che sono memorizzati in un oggetto predefinito ```sprites```:

```
mysprite = sprites["icon"]
```

Potete quindi accedere a diversi campi e metodi del vostro sprite:

|campo/metodo|descrizione|
|-|-|
|```miosprite.width```|La larghezza dello sprite in pixel|
|```miosprite.height```|L'altezza dello sprite in pixel|
|```miosprite.ready```|1 quando lo sprite è completamente caricato, 0 altrimenti|
|```miosprite.name```|Nome dello sprite|

*Nota: altri campi e metodi nativi potrebbero sembrare disponibili quando si ispeziona un oggetto sprite dalla console. Tali campi e metodi non documentati rischiano di essere tolti in futuro, quindi non fate troppo affidamento su di essi!*

## Metodi di mappa
Il tuo programma può accedere alle mappe del tuo progetto, che sono memorizzate in un oggetto predefinito ```maps```:

```
miamappa = maps["map1"]
```

Potete quindi accedere a diversi campi e metodi della vostra mappa:

|campo/metodo|descrizione|
|-|-|
|```miamappa.width```|La larghezza della mappa in celle|
|```miamappa.height```|L'altezza della mappa in celle|
|```miamappa.block_width```|La larghezza della cella della mappa in pixel|
|```miamappa.block_height```|L'altezza della cella della mappa in pixel|
|```miamappa.ready```|1 quando la mappa è completamente caricata, 0 altrimenti|
|```miamappa.name```|Nome della mappa|
|```miamappa.get(x,y)```|Restituisce il nome dello sprite nella cella (x,y); l'origine delle coordinate è (0,0), situata in basso a sinistra della mappa. Restituisce 0 se la cella è vuota|
|```miamappa.set(x,y,name)```|Imposta un nuovo sprite nella cella (x,y); l'origine delle coordinate è (0,0), situata in basso a sinistra della mappa. Il terzo parametro è il nome dello sprite.
|```miamappa.clone()```|restituisce una nuova mappa che è una copia completa di miamappa.|

*Nota: altri campi e metodi nativi possono attualmente sembrare disponibili quando si ispeziona un oggetto mappa nella console. Tali campi e metodi non documentati rischiano di essere tolti in futuro, quindi non fate troppo affidamento su di essi!*

## Sistema
L'oggetto ```system``` permette di accedere alla funzione ```time``` che restituisce il tempo trascorso in millisecondi (dal 1° gennaio 1970). Ma soprattutto, invocata in vari momenti, permette di misurare le differenze di tempo.

<!--- suggest_start system.time --->
### system.time()
Restituisce il tempo trascorso in millisecondi (dal 1 gennaio 1970)
<!--- suggest_end --->

## Storage
L'oggetto ```storage``` permette la memorizzazione permanente dei dati della tua applicazione. Puoi usarlo per memorizzare i progressi degli utenti, i punteggi più alti o altre informazioni di stato nel tuo gioco o progetto.

<!--- suggest_start storage.set --->
### storage.set( nome , valore )
Memorizza il valore in modo permanente, referenziato dalla stringa ```nome```. Il valore può essere un qualsiasi numero, stringa, lista o oggetto strutturato.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get( name )
Restituisce il valore registrato in modo permanente sotto la stringa di riferimento ```nome```. Restituisce ```0``` quando tale record non esiste.
<!--- suggest_end --->


