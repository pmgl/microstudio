# Tutorial

:project Programmazione

## Liste ##

:overlay

:posizione 30,30,40,40

:navigate projects.code.console

### Liste

In qualsiasi linguaggio di programmazione, è utile poter raccogliere
informazioni in liste. Le liste sono modificabili (si possono aggiungere elementi alla lista
e rimuoverli). Il tutorial sui cicli spiegherà come eseguire un compito
per tutti gli elementi di una lista.

## Definizione di una lista

:navigate projects.code.console

:position 55,30,40,40

### Creazione di una lista

In *microScript*, una lista è definita come segue:

```
numeri_primi = [1,3,5,7,11,13,17]
animali = [ "Gatto", "Cane", "Coniglio" ]
```

Notate che le parentesi quadre sono usate per delimitare la lista e le virgole per separare
gli elementi della lista. Gli elementi di una lista possono essere qualsiasi
valore *microScript*: numeri, testi, funzioni, liste (!), oggetti.

## Lista vuoto

:navigate projects.code.console

:position 55,30,40,40

### Lista vuota

Una lista vuota è definita come segue:

```
lista = []
```

## Aggiungere un elemento

:navigate projects.code.console

:position 55,30,40,40

### Aggiungere un elemento


Puoi aggiungere elementi con la funzione membro "push".

```
lista.push("elemento 1")
```

La funzione push aggiunge l'elemento alla fine della lista.

## Inserire un elemento

:navigate projects.code.console

:position 55,30,40,40

### Inserire un elemento

Puoi inserire un elemento all'inizio di una lista usando la funzione membro "insert".

```
lista.insert("elemento 2")
```

## Lunghezza di una lista

:navigate projects.code.console

:position 55,30,40,40

### Lunghezza di una lista

La lunghezza di una lista (il numero di elementi) può essere ricavata con il campo membro ```length```:

```
print( "La lunghezza della lista è " + lista.length )
```

## Accesso agli elementi della lista

:navigate projects.code.console

:position 55,30,40,40

### Accesso agli elementi

Gli elementi di una lista sono indicizzati a partire da 0. Si può quindi accedere
ad ogni elemento di una lista usando i loro indici:

```
lista[0]
lista[1]
```

## Modificare un elemento

:navigate projects.code.console

:position 55,30,40,40

### Modifica un elemento

Puoi modificare un elemento della lista facendo riferimento ad esso con il suo indice:

```
lista[0] = "altro elemento"
```

Se l'elemento non esiste ancora, viene creato:

```
lista[2] = "nuovo elemento"
```

## Per conoscere l'indice di un elemento

:navigate projects.code.console

:position 55,30,40,40

### Indice dell'elemento

L'indice di un elemento, cioè la sua posizione nella lista, può essere trovato con la funzione
membro "indexOf" :

```
lista.indexOf("nuovo elemento")
```

## Rimuovere un elemento

:navigate projects.code.console

:position 55,30,40,40

### Rimuovere un elemento

Puoi rimuovere un elemento dalla lista se conosci il suo indice:

```
lista.remove(1) 
```

(rimuove l'elemento all'indice 1, che in realtà è il secondo elemento!)

## Liste

:navigate projects.code.console

:position 55,30,40,40

### Liste

Le liste sono uno strumento molto potente! Vedrai più avanti in questo corso come possono lavorare insieme nei loop.
Passiamo al prossimo tutorial.

