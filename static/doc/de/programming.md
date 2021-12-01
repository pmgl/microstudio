# microScript

**microScript** ist eine einfache Sprache, die von Lua inspiriert ist. Hier sind einige allgemeine Prinzipien, die von microScript verwendet werden:

* die Variablen sind standardmäßig global. Um eine lokale Variable zu definieren, verwenden Sie das Schlüsselwort "local".
* Zeilenumbrüche haben keine besondere Bedeutung, sie werden als Leerzeichen betrachtet.
* in microScript gibt es keinen Wert ```null``, ``nil`` oder ``undefined``. Jede undefinierte oder Null-Variable ist gleich ```0``.
* In microScript gibt es keinen booleschen Typ. ```0``` ist falsch und alles, was nicht ```0``` ist, ist wahr.
* Es gibt keinen Ausführungsfehler oder eine Ausnahme in microScript. Jede Variable, die nicht definiert ist, gibt ```0`` zurück. Das Aufrufen eines Wertes, der keine Funktion ist, als Funktion gibt den Wert selbst zurück.

## Variablen

Eine Variable ist ein Name (oder "Bezeichner"), dem ein Wert zugewiesen werden soll. Sie ermöglicht es also, diesen Wert zu speichern

## Anweisung

Variablen in microScript müssen nicht deklariert werden. Jede Variable, die noch nicht benutzt wurde, kann als existierend betrachtet werden und hat den Wert ```0```.

Um eine Variable zu verwenden, weisen Sie ihr einfach einen Wert mit dem Gleichheitszeichen zu:

```
x = 1
```
Der Wert von x ist nun 1.

### Typen von Werten

*microScript* kennt fünf Arten von Werten: Zahlen, Strings (Text), Listen, Objekte und Funktionen.

#### Zahl
Die Werte vom Typ Number in *microScript* können Ganzzahlen oder Dezimalzahlen sein.

```
pi = 3,1415
x = 1
halb = 1/2
```

#### Zeichenkette
Zeichenketten sind Texte oder Teile von Texten. Sie müssen in Anführungszeichen definiert werden.

```
Tier = "Katze"
print("Hallo "+Tier)
```
#### Liste
Listen können eine Reihe von Werten enthalten:

```
empty_list = []
prime_numbers =[2,3,5,5,7,11,13,17,19]
mixed_list =[1, "cat",[1,2,3]]
```

Sie können auf die Elemente einer Liste über ihren Index zugreifen, d.h. über ihre Position in der Liste ab 0 :

```
Liste = ["Katze", "Hund", "Maus"]
print(Liste[0])
ausdrucken(Liste[1])
print(Liste[2])
```

Es ist auch einfach, eine Liste mit einer ```for-Schleife`` zu durchlaufen:

```
for element in Liste
  print(element)
end
```

#### Objekt
Ein Objekt in *microScript* ist eine Form der assoziativen Liste. Das Objekt hat ein oder mehrere "Felder", die einen Schlüssel und einen Wert haben. Der Schlüssel ist eine Zeichenkette, der Wert kann ein beliebiger Wert *microScript* sein. Die Definition eines Objekts beginnt mit dem Schlüsselwort "object" und endet mit dem Schlüsselwort "end". Zwischen den beiden können mehrere Felder definiert werden. Beispiel:

```
mein_Objekt = Objekt
  x = 0
  y = 0
  name = "Objekt 1"
end
```
Auf die Felder eines Objekts können Sie mit dem Operator ```` zugreifen. ```. Die obige Definition kann also auch geschrieben werden:

```
mein_Objekt.x = 0
mein_objekt.y = 0
mein_Objekt.name = "Objekt 1"
```

Es kann auch mit der Klammer ```[]``` zugegriffen werden. Die obige Definition kann also auch geschrieben werden:

```
mein_Objekt["x"] = 0
mein_Objekt["y"] = 0
mein_Objekt["Name"] = "Objekt 1"
```

Sie können die Liste der Felder eines Objekts mit einer `for-Schleife durchsuchen:

```
for feld in mein_Objekt
  print(feld +" = " + " + mein_objekt[feld])
end
```

Siehe "Klassen" für eine ausführlichere Behandlung von object

#### Funktionswert

Ein Wert kann vom Typ Funktion sein. Wenn Sie ```draw = function() ... end`` schreiben, wird ein Funktionswert erzeugt und der Variablen ```draw`` zugewiesen (siehe Abschnitt über Funktionen weiter unten).

#### Lokale Variablen

Standardmäßig sind die Variablen, die durch Zuweisung deklariert werden, global. Es ist möglich, eine lokale Variable, als Teil einer Funktion, mit dem Schlüsselwort "local" zu definieren:

```
meineFunktion = Funktion()
  local i = 0
end
```

## Funktionen

Eine Funktion ist eine Unterfolge von Operationen, die eine Aufgabe, eine Berechnung durchführt und manchmal ein Ergebnis zurückgibt.

### Definieren Sie eine Funktion

Eine Funktion wird mit dem Schlüsselwort "function" definiert und endet mit dem Schlüsselwort "end".

```
nächsteZahl = function(s)
  x+1
end
```

### Aufrufen einer Funktion

```
print(nächsteZahl(10))
```

Wenn Sie einen Wert, der keine Funktion ist, als Funktion aufrufen, gibt sie einfach ihren Wert zurück. Beispiel:

```
x = 1
x(0)
```

Der obige Code gibt den Wert 1 zurück, ohne einen Fehler zu erzeugen. Sie können also auch eine Funktion aufrufen, die noch nicht definiert ist (sie hat dann den Wert ```0```), ohne einen Fehler auszulösen. So können Sie schon sehr früh damit beginnen, Ihr Programm mit Unterfunktionen zu strukturieren, die Sie später bearbeiten werden. Ein Beispiel:

```
zeichnen = Funktion()
  zeichneHimmel()
  drawClouds()
  drawTrees()
  drawEnemies()
  drawHero()
end

// Ich kann die obigen Funktionen in meinem eigenen Tempo implementieren.
```

## Bedingungen

### Einfache Bedingung
Eine bedingte Anweisung erlaubt es dem Programm, eine Hypothese zu testen und je nach Testergebnis verschiedene Operationen durchzuführen. In *microScript* werden die Bedingungen wie folgt geschrieben:

```
if Alter<18 then
  print("Kind")
sonst
  print("Erwachsener")
end
```
"if" bedeutet "wenn";
"then" bedeutet "dann";
"else" bedeutet "sonst";
"end" bedeutet "Ende"

Im obigen Beispiel wird **wenn** der Wert der Variable "Alter" kleiner als 18 ist, **dann** die Anweisung ``print("Kind")`` ausgeführt, **andernfalls** wird die Anweisung ``print("Erwachsener")`` ausgeführt.

### Binäre Vergleichsoperatoren
Hier sind die binären Operatoren, die für Vergleiche verwendet werden können:

|Operator|Beschreibung|
|-|-|
|==|```a == b``` ist nur wahr, wenn a gleich b ist
|!=|```a != b``` ist nur wahr, wenn es von b verschieden ist|
|<|```a < b``` ist nur wahr, wenn a streng kleiner als b ist|
|>|```a > b``` ist nur wahr, wenn a strikt größer als b ist|
|<=|```a <= b``` ist nur wahr, wenn a kleiner oder gleich b`` ist
|>=|``a >= b``` ist nur wahr, wenn a größer oder gleich b ist|

### Boolesche Operatoren
|Operator|Beschreibung|
|-|-|
|und|logisches UND: ```a und b`` ist nur wahr, wenn a und b wahr sind|
|oder|logisches ODER: "a oder b" ist nur wahr, wenn a wahr ist oder b wahr ist|
|nicht|logisches NOT: nicht a ist wahr, wenn a falsch ist und falsch, wenn a wahr ist.

### Boolesche Werte
In microScript gibt es keinen booleschen Typ. ```0``` wird als falsch angesehen und jeder andere Wert ist wahr. Vergleichsoperatoren geben ```1`` für wahr oder ```0`` für falsch zurück. Der Einfachheit halber können Sie in MicroScript auch diese beiden vordefinierten Variablen verwenden:

|Variable|Wert|
|-|-|
|true|1|
|false|0|


### Mehrere Bedingungen

Es ist möglich, mehrere Hypothesen mit dem Schlüsselwort "elsif" (Kurzform von "else if") zu testen
```
if Alter<10 then
  print("Kind")
elsif Alter<18 then
  print("Jugendlicher")
elsif Alter<30 then
  print("junger Erwachsener")
sonst
  print("sehr respektables Alter")
end
```

## Schleifen
Mit den Schleifen können wiederholte Behandlungen durchgeführt werden.

### For-Schleife
Die ```for```-Schleife ist in der Programmierung weit verbreitet. Sie erlaubt es, die gleiche Behandlung an allen Elementen einer Liste oder einer Reihe von Werten auszuführen.

```
for i=1 bis 10
  print(i)
end
```
Das obige Beispiel zeigt in der Konsole jede Zahl von 1 bis 10 an.

```
for i=0 bis 10 durch 2
  print(i)
end
```
Das obige Beispiel zeigt die Zahlen von 0 bis 10 in der Konsole in 2er-Schritten an.

```
list =[2,3,5,5,7,11]
for Zahl in Liste
  print(Zahl)
end
```
Das obige Beispiel definiert eine Liste und gibt dann jedes Element in der Liste aus.

### While-Schleife
Die ```While``-Schleife erlaubt es, Operationen so lange zu wiederholen, bis ein zufriedenstellendes Ergebnis erzielt wird.

```
x = 1
while x*x<100
  print(x*x)
  x = x+1
end
```
Das obige Beispiel gibt das Quadrat von x aus und inkrementiert dann x (d. h. addiert 1 zu x), solange das Quadrat von x kleiner als 100 ist.

### Schleife abbrechen oder fortsetzen
Sie können eine `for`- oder `while`-Schleife mit der Anweisung `break` vorzeitig beenden. Beispiel:

```
while true
  x = x+1
  if x>= 100 then break end
end
```

Mit der Anweisung `continue` können Sie die restlichen Operationen einer Schleife überspringen und mit der nächsten Iteration der Schleife fortfahren. Beispiel:

```
for i=0 bis 10000
  if i%10 == 0 then continue end // damit wird die Verarbeitung von Vielfachen von 10 übersprungen
  doSomeProcessing(i)
end
```

*# Operatoren

Hier ist die Liste der binären Operatoren in *microScript* (ohne Vergleiche, die bereits oben erwähnt wurden)


|Beschreibung|Beschreibung|
|-|-|
|+|Zusatz|
|-|Subtraktion|
|*|Multiplikation|
|/|Division|
|%|Modulo : ```x % y`` ist gleich dem Rest der Division von x durch y``
|^|Potenz: ```x ^ y``` ist gleich x hoch bei Potenz y ist ```Potenz(x,y)````

## Vordefinierte Funktionen

## Funktionen
|Funktion|Beschreibung|
|-|-|
|max(a,b)|Gibt die größte Zahl von a oder b zurück
|min(a,b)|Returnt die kleinste Zahl von a oder b
|round(a)|Returnt den Wert a gerundet auf den nächsten ganzzahligen Wert|
|floor(a)|Returnt den Wert a abgerundet auf die niedrigste ganze Zahl|
|Gibt den Wert a aufgerundet zurück
|abs(a)|Gibt den absoluten Wert von a zurück
|sqrt(a)|Gibt die Quadratwurzel aus a zurück
|pow(a,b)|Retourniert a hoch b (andere mögliche Schreibweise: ```a ^ b```)|
|PI|Konstante ist gleich der Zahl Pi|
|log(a)|Gibt den natürlichen Logarithmus von a zurück
|exp(a)|Gibt die Eulersche Zahl hoch a zurück

#### Trigonometrische Funktionen im Bogenmaß
|Funktion|Beschreibung
|-|-|
|sin(a)|Returnt den Sinus von a (a im Bogenmaß)|
|cos(a)|Returnt den Kosinus von a (a im Bogenmaß)|
|tan(a)|Gibt den Tangens von a zurück (a im Bogenmaß)|
|acos(a)|Returnt den Arcuscosinus von a (Ergebnis im Bogenmaß)|
|asin(a)|Returnt den Arcussinus von a (Ergebnis im Bogenmaß)|
Gibt den Arcustangens von a zurück (Ergebnis im Bogenmaß)|atan(a)|gibt den Arcustangens von a zurück (Ergebnis im Bogenmaß)|
|atan2(y,x)|Returnt den Arcustangens von y/x (Ergebnis im Bogenmaß)|

#### Trigonometrische Funktionen in Grad
|Funktion|Beschreibung|
|-|-|
|sind(a)|Returnt den Sinus von a (a in Grad)|
|cosd(a)|Returnt den Kosinus von a (a in Grad)|
|tand(a)|Returnt den Tangens von a (a in Grad)|
|acosd(a)|Returnt den Arcuscosinus von a (Ergebnis in Grad)|
|asind(a)|Returnt den Arcussinus von a (Ergebnis in Grad)|
Gibt den Arcustangens von a zurück (Ergebnis in Grad)|atand(a)|gibt den Arcustangens von a zurück (Ergebnis in Grad)|
Gibt den Arcustangens von y/x zurück (Ergebnis in Grad)|atan2d(y,x)|Gibt den Arcustangens von y/x zurück (Ergebnis in Grad)|

### Zufallszahlen
Das random-Objekt dient zur Erzeugung von Pseudo-Zufallszahlen. Es ist möglich, den Generator mit der Funktion ```Seed`` zu initialisieren, um bei jeder Ausführung die gleiche Zahlenfolge zu erhalten, oder im Gegenteil jedes Mal eine andere Zahlenfolge.

|Beschreibung|Beschreibung|
|-|-|
|```random.next()```|Erzeugt eine neue Zufallszahl zwischen 0 und 1|
|```random.nextInt(a)```|Liefert eine neue ganzzahlige Zufallszahl zwischen 0 und a-1|
|```random.seed(a)```|Setzt die Zufallszahlenfolge mit dem Wert a zurück; wenn Sie den gleichen Initialisierungswert zweimal verwenden, erhalten Sie die gleiche Zufallszahlenfolge. Wenn a == 0 ist, wird der Zufallszahlengenerator ... zufällig initialisiert und ist daher nicht reproduzierbar|

## String-Operationen

|Operation|Beschreibung|
|-|-|
|```Zeichenkette1 + Zeichenkette2``|Der +-Operator kann zum Verketten von Zeichenketten verwendet werden.
|```string.length```Feld behält die Länge der Zeichenkette bei.|``string.substring``
|```string.substring(i1,i2)```|Gibt eine Teilzeichenkette der Zeichenkette zurück, beginnend bei Index i1 und endend bei Index i2|
|```string.startsWith(s)```|Gibt zurück, ob Zeichenkette genau mit `````` beginnt
|```string.endsWith(s)```|Gibt zurück, ob String genau mit `````` endet
|```string.indexOf(s)```|Gibt den Index des ersten Vorkommens von `````` in ````string``` zurück, oder -1, wenn ````string``` kein solches Vorkommen enthält|
|```string.lastIndexOf(s)```|Gibt den Index des letzten Vorkommens von `````` in ``````` zurück, oder -1, wenn ````````` kein solches Vorkommen enthält|
|```string.replace(s1,s2)```|Gibt eine neue Zeichenkette zurück, in der das erste Vorkommen von ````1`` (falls vorhanden) durch ````2``` ersetzt wird|
|```string.toUpperCase()```|Gibt die in Großbuchstaben umgewandelte Zeichenkette zurück|
|```string.toLowerCase()```|Gibt die in Kleinbuchstaben umgewandelte Zeichenkette zurück|
|```string.split(s)```|Die Split-Funktion zerlegt die Zeichenkette in eine Liste von Teilzeichenketten, indem sie nach der als Argument angegebenen Trennzeichenkette sucht und diese Liste zurückgibt|


## Listenoperationen
|Operation|Beschreibung|
|-|-|
|```list.length```Erhält die Länge der Liste (Anzahl der Elemente in der Liste).|
|```list.push(element)```|Hängt das Element an das Ende der Liste an|
|```list.insert(element)```|Fügt ein Element an den Anfang der Liste ein|
|```list.insertAt(element,index)```|Fügt ein Element am angegebenen Index in die Liste ein|
|```list.indexOf(element)```|Gibt die Position des Elements in der Liste zurück (0 für das erste Element, 1 für das zweite Element ...). Gibt -1 zurück, wenn das Element nicht in der Liste gefunden wird.
|```list.contains(element)```|Returnt 1 (true), wenn ```Element`` in der Liste ist, oder 0 (false), wenn das Element nicht in der Liste gefunden werden kann|
|```list.removeAt(index)```|Entfernt das Element an der Position ```index``` aus der Liste
|```list.removeElement(element)```|Entfernt aus der Liste ```Element``, falls es in der Liste gefunden werden kann|
|```list1.concat(list2)```|Gibt eine neue Liste zurück, die durch Anhängen von list2 an list1 entsteht|


## Kommentare

Kommentare in *microScript* können nach einem doppelten Schrägstrich eingefügt werden: ```//```; alles, was bis zum nächsten Zeilenumbruch folgt, wird bei der Analyse des Programms ignoriert.

##### Beispiel
```
myFunction = ()
  // meine Anmerkungen zur Rolle der Funktion myFunction
end
```

## Klassen

Eine Klasse in einer Programmiersprache ist eine Art Blaupause oder Vorlage für die Erstellung von Objekten. Eine Klasse definiert Standardeigenschaften und -funktionen, die den Standardzustand und das Standardverhalten aller Objekte darstellen, die aus ihr erzeugt werden. Sie können von einer Klasse abgeleitete Objektinstanzen erstellen, die alle von den Eigenschaften der Klasse erben. Die Verwendung von Klassen und ihren abgeleiteten Objekten in einem Programm wird als objektorientierte Programmierung (OOP) bezeichnet.

Um diese Konzepte zu veranschaulichen, werden wir sehen, wie Sie Klassen verwenden können, um Gegner in Ihrem Spiel zu verwalten:

### Definieren Sie eine Klasse

Wir werden damit beginnen, eine Klasse ```Feind``` zu erstellen, die von allen unseren Feindobjekten gemeinsam genutzt wird. Jeder Feind wird eine Position (auf dem Bildschirm) haben. Er wird Lebenspunkte ```Hp`` haben, sich mit einer bestimmten ``Geschwindigkeit`` bewegen:

```
Feind = Klasse
  constructor = function(position)
    this.position = Position
  end

  hp = 10
  geschwindigkeit = 1

  move = function()
    position += geschwindigkeit
  end

  hit = function(Schaden)
    hp -= Schaden
  end
end
```

In MicroScript sind Klassen und Objekte sehr ähnliche Konzepte und können fast austauschbar verwendet werden. Die Klassendefinition endet daher mit dem Schlüsselwort ```end``. Die erste Eigenschaft, die wir in der obigen Klasse definiert haben, ist die Funktion "constructor". Diese Funktion wird aufgerufen, wenn eine Objektinstanz der Klasse erzeugt wird. Sie wird die Eigenschaft *Position* des Objekts setzen. ``this``` bezieht sich auf die Objektinstanz, auf der die Funktion aufgerufen wird, also bedeutet das Setzen von ``this.position``, dass das Objekt die Eigenschaft Position auf sich selbst setzt.

### Erzeugen von Objektinstanzen aus einer Klasse

Erzeugen wir zwei Feindobjekte, die von unserer Klasse abgeleitet sind:

```
feind_1 = new Feind(50)
feind_2 = new Feind(100)
```

Der Operator ```new`` wird verwendet, um eine neue Objektinstanz zu erzeugen, die von einer Klasse abgeleitet ist. Das Argument, das wir hier übergeben, richtet sich an die Konstruktorfunktion unserer Klasse. Wir haben also eine Feindinstanz an Position 50 und eine weitere Feindinstanz an Position 100 erzeugt.

Beide Feinde haben die gleiche Geschwindigkeit bzw. die gleichen Lebenspunkte (hp). Wir können jedoch dem zweiten Feind eine andere Geschwindigkeit zuweisen:

```
feind_2.geschwindigkeit = 2
```

Wir können nun unsere Feinde durch den Aufruf bewegen:

```
feind_1.move()
feind_2.move()
```

Der zweite Feind wird sich doppelt so schnell bewegen, weil wir seine Eigenschaft velocity vor dem Aufruf der Funktion move geändert haben.

### Vererbung

Wir können eine Klasse von einer anderen Klasse erben lassen. Wenn wir zum Beispiel eine Variation unseres Feindes erstellen wollen, könnten wir wie folgt vorgehen:

```
Boss = class extends Enemy
  constructor = function(position)
    super(position)
    hp = 50
  end

  move = function()
    super()
    hp += 1
  end
end
```

Wir haben eine neue Klasse ```Boss`` erstellt, indem wir die Klasse ```Enemy`` erweitert haben. Unsere neue Klasse teilt alle Eigenschaften von ,,Enemy``, nur dass sie einige dieser Eigenschaften durch eigene Werte ersetzt. Der Aufruf von ```super(position)```` im Konstruktor unserer neuen Klasse stellt sicher, dass auch der Konstruktor unserer Elternklasse Enemy aufgerufen wird.

Wir haben ein neues Verhalten ```Bewegen`` für unseren Boss erstellt, das das Standardverhalten von Enemy überschreibt. In dieser neuen Funktion rufen wir ```super()```` auf, um das Standardverhalten, das in der Klasse Enemy definiert wurde, beizubehalten; wir erhöhen dann den Wert von ```hp``, was bedeutet, daß unsere Bosse beim Bewegen wieder Lebenspunkte erhalten.

Wir können nun eine Instanz unseres Bosses an Position 120 erzeugen:

```
der_endliche_boss = new Boss(120)
```

##### Hinweise

* Variablenraum: Wenn eine Funktion auf einem Objekt aufgerufen wird (wie ```Feind_1.move()```), sind die Variablen, auf die im Körper der aufgerufenen Funktionen verwiesen wird, die Eigenschaften des Objekts. Zum Beispiel wird im Körper der move-Funktion ```Position += 1`` die Eigenschaft ```Position`` des Objekts selbst inkrementieren.

* Manchmal ist es notwendig, ```this`` zu verwenden, um sicherzustellen, dass wir uns korrekt auf eine Eigenschaft unseres Objekts beziehen. Deshalb verwenden wir im Konstruktor unserer Klasse Enemy ```this.position = position``, weil ```position`` sich auch auf das Argument der Funktion bezieht und somit die Eigenschaft unseres Objektes "versteckt".

* ```super()```` kann in einer Funktion verwendet werden, die an ein Objekt oder eine Klasse angehängt ist, um die gleichnamige Funktion der Elternklasse aufzurufen.
