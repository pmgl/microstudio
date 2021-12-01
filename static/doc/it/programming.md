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
stampa("Ciao "+animale)
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
