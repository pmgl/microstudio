# Tutorial

:project Programmazione

## Oggetti

:overlay

:posizione 30,30,40,40

:navigate projects.code.console

### Oggetti

Gli oggetti in microScript possono essere paragonati agli oggetti della vita reale. Un oggetto è
un'entità che ha un insieme di proprietà. Può essere assegnato ad una variabile, passato
come argomento di una funzione, ecc.

Le proprietà di un oggetto possono essere viste come sotto-variabili, variabili che sono interne
all'oggetto.

## Oggetto

:navigate projects.code.console

:position 55,30,40,40

### Creare un oggetto

La creazione di un oggetto inizia con la parola chiave ```object```. La definizione dell'oggetto
viene chiusa con ```end```:

```
miaSedia = object
  gambe = 4
  colore = "bianco"
  materiale = "legno"
end
```

Copia il codice qui sopra. Puoi cambiare le proprietà e aggiungerne alcune per adattarle alla tua sedia.

## Accesso alle proprietà dell'oggetto

:navigate projects.code.console

:position 55,30,40,40

### Accesso alle proprietà dell'oggetto

Una volta creato il vostro oggetto, potete accedere alle sue proprietà come segue:

```
miaSedia.gambe
miaSedia.materiale
```

Copiate l'esempio precedente e vedete il risultato. Potete anche provare altre
proprietà.

## Imposta le proprietà dell'oggetto

:navigate projects.code.console

:position 55,30,40,40

### Impostare le proprietà dell'oggetto

Puoi cambiare le proprietà e impostarne di nuove all'oggetto sedia:

```
miaSedia.colore = "red"
miaSedia.ruote = 5
```

Controlla come appare ora il tuo oggetto, basta digitare:

```
miaSedia
```

## Imposta le proprietà dell'oggetto

:navigate projects.code.console

:position 55,30,40,40

### Altri modi per accedere alle proprietà degli oggetti

Si può anche accedere alle proprietà degli oggetti usando le parentesi e un valore stringa che contiene
il nome della proprietà:

```
miaSedia["colore"] = "blu"
```

Anche questo è permesso:

```
proprieta_da_cambiare = "colore"
miaSedia[proprieta_da_cambiare] = "giallo"
```

Si noti che a differenza delle variabili, le proprietà possono essere qualsiasi valore di stringa, quindi accenti, spazi o
caratteri speciali sono ammessi nei loro nomi. Quindi va bene scrivere:

```
miaSedia["% di legno"] = 50
```

Ma per come funziona l'analisi della sintassi del codice, non vi sarebbe permesso di scrivere questo:

```
miaSedia.% di legno = 50 // questo non ha senso per il parser di sintassi microScript
```

## Tipi di proprietà

:navigate projects.code.console

:position 55,30,40,40

### Tipo di proprietà

Le proprietà di un oggetto possono essere qualsiasi valore microScript valido: stringa, numero, lista, oggetto, funzione.
Continuiamo a giocare con gli oggetti:

```
miaStanza = object
  mobili = []
  dimensione = "abbastanza grande"
end
```

Ora possiamo "collegare" i nostri due oggetti:

```
miaStanza.mobili.push(miaSedia)
miaSedia.posizione = miaStanza
```

## Funzione membro

:navigate projects.code.console

:position 55,30,40,40

### Funzione membro

Si può impostare una proprietà dell'oggetto come una funzione:

```
miaStanza.aggiungiMobile = function(mobile)
  mobili.push(mobile)
end
```

Notate che quando la funzione sarà chiamata esplicitamente *sull'oggetto*, opererà
nell'ambito dell'oggetto. Quindi la variabile ```mobili``` sopra si riferisce correttamente alla proprietà
```miaStanza.mobili```. Chiamiamo quindi

```
miaStanza.aggiungiMobile(object
  nome = "tavolo"
  gambe = 4
end)
```

Ora possiamo controllare:

```
miaStanza.mobili[0]
miaStanza.mobili[1]
```


## Iterazione

:navigate projects.code.console

:position 55,30,40,40

### Iterazione sulle proprietà dell'oggetto

Si può iterare sulle proprietà dell'oggetto con un ciclo ```for``` come segue:

```
for prop in miaSedia
  print(prop + " = " + miaSedia[prop])
end
```

Il codice qui sopra stamperà il nome e il valore di tutte le proprietà del nostro
oggetto memorizzato nella variabile ```miaSedia```.

## Fine

:navigate projects.code.console

:position 55,30,40,40

### Fine!

Abbiamo raggiunto la fine di questo corso di programmazione. Quando cercate ulteriori dettagli,
assicuratevi di guardare nella scheda della documentazione di microStudio. Potete anche rilanciare
uno o l'altro di questi brevi tutorial ogni volta che ne sentite il bisogno.

E' ora di costruire il vostro primo progetto microStudio! Potreste voler controllare il tutorial
"Primo progetto", o visitare la sezione Esplora per controllare altri progetti e vedere come
sono stati codificati.

