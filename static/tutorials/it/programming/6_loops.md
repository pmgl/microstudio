# Tutorial

:project Programmazione

## I cicli

:overlay

:posizione 30,30,40,40

:navigate projects.code.console

### I cicli

Un loop/ciclo è uno speciale schema di programmazione che permette di ripetere un insieme di istruzioni
molte volte. I cicli possono essere utili per eseguire un trattamento
su tutti gli elementi di una lista, o per ripetere un lavoro finché
una particolare condizione è soddisfatta.

## ```for``` loop

:navigate projects.code.console

:position 55,30,40,40

### ```for``` loop

La parola chiave ```for``` permette di creare un ciclo con una variabile il cui valore
cambierà ad ogni ripetizione del ciclo. Per esempio:

```
for i=1 to 10
  print(i)
end
```

Nel ciclo di cui sopra, la variabile ```i``` assumerà successivamente i valori
1, 2, 3... fino a 10. Per ognuno di questi valori, la funzione ```print(i)``` sarà
invocata. Così come una ```funzione``` od un ```if```, un ciclo deve essere chiuso con
la parola chiave ```end```.

## Ciclo ```for``` loop

:navigate projects.code.console

:position 55,30,40,40

### Incremento

La parola chiave ```by``` permette di definire l'*incremento* usato per ogni iterazione,
cioè di quanto deve essere aumentato il valore della variabile di iterazione:

```
for i=1 to 10 by 2
  print(i)
end
```

Copiate l'esempio precedente e vedete il risultato. Potete anche provare altri
valori.

## Incremento

:navigate projects.code.console

:position 55,30,40,40

### Incremento

Ecco come fare un vero e proprio conto alla rovescia!

```
for i=10 to 0 by -1
  print(i)
end
```

## Iterazione su una lista

:navigate projects.code.console

:position 55,30,40,40

### Iterazione su una lista

Ecco come eseguire un'elaborazione ripetuta su tutti gli elementi di una lista con
```for``` seguito dalla parola chiave ```in```:

```
lista = [ "cane", "gatto", "topo" ]

for animale in lista
  print(animale)
end
```

Questo si chiama *iterare* su una lista.

## Finché

:navigate projects.code.console

:position 55,30,40,40

### Ripeti fino a che(...)

L'istruzione ```while``` permette di ripetere una sequenza di operazioni finché una
condizione rimane vera. Per esempio:

```
i = 1

while i<1000
  print(i)
  i = i*2
end
```

Le operazioni nel ciclo di cui sopra saranno ripetute finché la variabile i rimane
inferiore a 1000. Non appena la condizione non è più soddisfatta, l'esecuzione esce dal ciclo
e continua l'esecuzione del resto del programma.


## Attenzione

:navigate projects.code.console

:position 55,30,40,40

### Attenzione

Quando scrivi un ciclo ```for``` o ```while```, non dimenticare di chiuderlo
con la parola chiave ```end```. Chiedetevi anche la condizione di stop:
il mio ciclo si fermerà ad un certo punto? Fate attenzione a non creare un ciclo infinito,
come quello che segue:

```
i = 1

while i<1000
  print(i)
end
```

Nell'esempio di cui sopra, il ciclo non si fermerà mai, poiché nulla
cambia il valore di ```i``` nel corpo del ciclo. *microScript* vi avvertirà
con un errore di time-out.