# Tutorial

:project Programmazione

## Funzioni ##

:overlay

:posizione 30,30,40,40

:navigate projects.code.console

### Funzioni

Una funzione è un sottoprogramma che esegue un compito ben definito e
che può restituire un risultato. Le funzioni vi permettono di strutturare meglio il vostro
programma.

Durante questo tutorial, non esitate a copiare i vari esempi nella console
o a sperimentare il vostro codice.

## Chiamare una funzione

:navigate projects.code.console

:position 55,30,40,40

### Chiamare una funzione

Per chiamare una funzione (cioè per eseguire il sottoprogramma), si scrive
il suo identificatore poi un elenco di argomenti tra parentesi. Per esempio,
in microScript, la funzione predefinita ```max``` restituisce il maggiore di due
numeri:

```
max(12,17)
```

Ci sono molte altre funzioni predefinite, che troverete elencate
nella documentazione.

## Chiamare una funzione

:navigate projects.code.console

:position 55,30,40,40

### La funzione *print*

La funzione ```print``` scrive sulla console il valore passato come argomento.
Può essere utile per verificare che il programma si comporti come previsto e produca
buoni risultati.

Per esempio:

```
print( "Il massimo tra 12 e 17 è "+ max(12,17) )
```

Ci sono anche altre funzioni utili da conoscere. Ma prima di tutto
impareremo come creare le nostre funzioni.

## Creare una funzione

:navigate projects.code.console

### Definire una funzione

Ecco come definire da soli una funzione che potrete poi utilizzare
nel vostro codice. Scrivete:

```
media = function(x,y)
  return (x+y)/2
end
```

Sopra, assegniamo un valore alla variabile ```media```. Questo valore è
una funzione, che accetta due argomenti ```x``` e ```y```. Il sottoprogramma è molto semplice,
restituisce il risultato del calcolo ```(x+y)/2```. Per *terminare* la definizione della funzione, dovete
semplicemente usare la parola chiave ```end```.

## Usare la nostra funzione

:navigate projects.code.console

### Usare la nostra funzione

Ora possiamo usare la nostra funzione "media". Scrivete:

```
media(14,16)
```

oppure

```
media(10,13)
```

## Argomenti

:navigate projects.code.console

### Valori passati come argomenti

I valori passati come argomenti ad una funzione possono essere qualsiasi *espressione*,
cioè un numero, una variabile, un calcolo, un'altra chiamata di funzione. Possiamo quindi scrivere :

```
media( 10+2 , 8+5 )
```

o ancora:

```
media( media( 5,18 ) , media( 11,20 ) )
```

## Variabili locali

:navigate projects.code.console

### Variabile locale

Una funzione può usare variabili locali. Come ci dice il loro nome, queste variabili esistono solo
nel contesto della funzione in cui sono definite, e sono probabilmente sconosciute al di fuori di essa. La loro *visibilità*, o *portata*,
è limitata al corpo della funzione.

Per esempio:

```
sommaQuadrati = function(a,b)
  local somma = 0
  somma = somma + a*a
  somma = somma + b*b
  return somma
end
```

## Variabili locali

:navigate projects.code.console

### Variabile locale

La nostra funzione "sommaQuadrati" restituisce la somma dei valori al quadrato dei suoi due argomenti. Proviamo così:

```
sommaQuadrati(3,4)
```

Viene visualizzato il risultato restituito dalla funzione. Ora controlliamo il valore della variabile ```somma``` :

```
somma
```

Essendo usciti dal contesto di esecuzione della funzione, la variabile locale ```somma``` non è più
definita e quindi ha il valore di default ```0```. Non esiste nel *contesto globale*.
Controlliamo subito:

```
global
```

Abbiamo appena visualizzato il contesto globale, cioè il contenuto della memoria del computer.
Possiamo vedere lì tutte le variabili che abbiamo definito, in particolare le funzioni che abbiamo
abbiamo creato in questo tutorial.

## Fine

:navigate projects.code.console

### Funzioni

Abbiamo appena imparato le basi delle funzioni! Ora discuteremo
nei prossimi capitoli di questo corso:

* Come creare e usare le liste
* Come fare scelte con le condizioni "if".
* Come ripetere i compiti con i cicli "for" e "while".
