# Tutorial

:project Programmazione

## Condizioni

:overlay

:posizione 30,30,40,40

:navigate projects.code.console

### Condizioni

Le condizioni o *dichiarazioni condizionali*
sono l'opportunità per il programma di prendere decisioni.
Si tratta di testare un'ipotesi e fare
operazioni diverse a seconda che il risultato sia vero o falso.


## Vocabolario

:navigate projects.code.console

:position 55,30,40,40

### Vocabolario

Le dichiarazioni condizionali sono costruite con le parole chiave ```if```,
```then```, ```else```, ```end```.


## Condizione semplice

:navigate projects.code.console

:position 55,30,40,40

### Condizione semplice

Definiamo la seguente funzione:

```
test = function(numero)
  if numero<0 then
    print( "il numero è negativo" )
  end
end
```

Questa funzione accetta un numero come argomento. Verifica *se* il numero è minore di
zero. Se è vero, *allora* viene eseguita l'istruzione ```print("il numero è negativo")```.
Il primo "end" chiude la condizione "if". Il secondo "end" chiude la definizione della
nostra funzione.

## Condizione semplice

:navigate projects.code.console

:position 55,30,40,40

### Condizione semplice

Testiamo la nostra funzione! Prova per esempio :

```
test(10)
test(-5)
test(0)
test(-100)
```

## Condizione semplice

:navigate projects.code.console

:position 55,30,40,40

### Che altro?

La parola chiave ```else``` ti permette di eseguire una sequenza di operazioni quando la condizione
testata dall'istruzione "if" è falsa. Per esempio:

```
test = function(numero)
  if numero<0 then
    print( "il numero è negativo" )
  else
    print( "il numero è positivo" )
  end
end
```

## Condizione semplice

:navigate projects.code.console

:position 55,30,40,40

### Positivo o negativo?

Testiamo di nuovo alcuni valori:

```
test(1)
test(-15)
```

## Condizione semplice

:navigate projects.code.console

:position 55,30,40,40

### Altre opzioni?

*microScript* propone un'ultima parola chiave ```elsif``` che è una contrazione di *else*
e *if*. Significa letteralmente "and else if" e permette quindi una serie di test
per isolare più di due possibilità diverse. Per esempio:

```
test = function(numero)
  if numero<0 then
    print( "il numero è negativo" )
  elsif numero == 0 allora
    print( "il numero è zero")
  else
    print( "Il numero è positivo" )
  end
end
```

## Condizione semplice

:navigate projects.code.console

:position 55,30,40,40

### Altre possibilità

Il nostro codice è ora in grado di differenziare 3 casi: numero negativo, zero, o nessuno di 
di questi, cioè il numero è strettamente maggiore di zero (strettamente positivo). Mettiamolo alla prova!

```
test(0)
test(-15)
test(12)
```

## Condizione semplice

:navigate projects.code.console

:position 55,30,40,40

### Controlla il tuo codice!

Quando scrivi un'espressione condizionale, fai attenzione a non dimenticare
la parola chiave ```then``` dopo ogni ```if``` e ogni ```elsif```.

Inoltre, non dimenticare di *chiudere* l'espressione condizionale con ```end```. Ogni
```if``` dovrebbe avere esattamente una ```end``` corrispondente.

