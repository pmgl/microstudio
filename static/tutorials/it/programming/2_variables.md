# Tutorial

:project Programmazione

## Variabili

:overlay

:posizione 30,30,40,40

:navigate projects.code.console

### Variabili

Le variabili sono una parte essenziale dei linguaggi di programmazione. Una variabile
è una posizione nella memoria del computer che contiene un valore e che
è designata da un identificatore scelto dal programmatore.

Durante questo tutorial, non esitate a copiare i vari esempi nella console
o a sperimentare con il vostro codice.

## Variabili

:navigate projects.code.console

:position 55,30,40,40

### Variabili

Le variabili sono lì per rendere il nostro lavoro più facile! Per esempio, ci permettono di 
scrivere :

```
mobili = sedie + tavoli
```

Invece di:

```
memoria_514 = memoria_23 + memoria_1289
```

Quest'ultimo esempio può suonare meglio per un computer ma sarebbe molto più difficile
da leggere per un umano!

## Assegnare un valore ad una variabile

:navigate projects.code.console

### Assegnare un valore ad una variabile

Assegnare un valore ad una variabile significa richiedere che essa contenga un valore. Usiamo il
segno ```=``` per questo, per esempio:

```
miavariabile = 1000
```

In microScript, assegnare semplicemente un valore ad una variabile è sufficiente per definirla
(cioè per avere uno slot di memoria assegnato ad essa). Una variabile che non è stata ancora definita,
quindi che no ha uno slot di memoria riservato, avrà sempre il valore di default ```0```.

## Denominazione delle variabili

:navigate projects.code.console

### Nomina le tue variabili

Ci sono alcune regole per nominare correttamente le tue variabili. In microScript, dovresti
usare solo lettere dell'alfabeto, senza alcun accento. Puoi usarle in maiuscolo o minuscolo.
Altri caratteri permessi includono il carattere "underscore" ```_``` e anche le cifre da 0 a 9
possono essere usate, tranne che nel primo carattere del nome della variabile.


## Denominazione delle variabili

:navigate projects.code.console

### Dai un nome alle tue variabili

Esempi :
```
// variabili nominate correttamente

punteggio = 100
Giocatore_1 = 0

// variabili errate :

2_Giocatoru = 2 // non puoi iniziare con un numero!
mio protagonista = 3 // gli spazi non sono ammessi!
```

## Nome delle variabili

### Nome delle tue variabili

In aggiunta a queste regole, ti consigliamo di scegliere nomi di variabili piuttosto
descrittivi. Renderà più facile la correzione del tuo codice.
Per esempio è meglio usare:

```
numero_di_carote = 25
```

piuttosto che:

```
c = 25
```

## Tipi di valore

:navigate projects.code.console

### Tipi di valore

Le variabili in microScript possono memorizzare diversi tipi di valori:

* Un numero, come 15, 7 o 3.141592
* Un testo, che chiameremo tipo "string" (perché è una *stringa di caratteri*). Esempio: 'Ciao',
"Hai vinto!"...
* Una funzione (studiata più avanti in questo corso). Esempio: ```function x*x end```
* Una lista (studiata nel resto di questo corso). Esempio: ```[1,3,5,7]``` o ```["cane", "gatto", "coniglio"]```.
* Un oggetto (studiato nel resto di questo corso). Esempio: ```object x=1 y=2 end```

## Utilizzo di una variabile

### Usare una variabile

Una variabile può essere usata in qualsiasi *espressione* del programma e sarà poi
sostituita dal suo valore attuale in fase di esecuzione.

```
punteggio = 124
testo = "Il tuo punteggio è "
mostrare = testo + punteggio
print( mostrare )
```

Nell'esempio precedente, la funzione "print" visualizza nella console il valore
che le viene passato come parametro (tra parentesi).

L'operatore ```+```, se usato su una stringa, opera una
concatenazione di stringhe di caratteri (unisce i due frammenti di testo). Il valore
della variabile "mostrare" sopra sarà quindi "Il tuo punteggio è 124".

## Ambito e contesto

:navigate projects.code.console

### Visibilità e contesto

Le variabili che abbiamo definito finora sono globali, vale a dire che
appartengono ad una memoria generale del programma e possono essere utilizzate ovunque nel programma.

Vedremo durante lo studio delle funzioni e degli oggetti che alcune variabili possono avere
una *visibilità* limitata o "ambito". Per esempio una funzione, che è una specie di sottoprogramma,
potrà definire e utilizzare una *variabile locale*, che sarà nota solo nel corpo
della funzione e quindi invisibile altrove.
