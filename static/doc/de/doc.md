*Die Übersetzung ist in Arbeit, bitte entschuldigen Sie Fehler.*

**microStudio** ist eine integrierte Entwicklungsumgebung für Videospiele.
Es enthält alle Werkzeuge die Sie zum Erstellen Ihres ersten Videospiels benötigen!
**microStudio** bietet alle folgenden Möglichkeiten:

* einen Sprite-Editor (Bilder, in Pixel-Art)
* einen Map-Editor (d.h. Karten oder Levels)
* einen Code-Editor zum Programmieren in microScript, einer einfachen aber mächtigen Sprache
* 100%iger Online-Betrieb der es Ihnen erlaubt Ihr Spiel zu jedem Zeitpunkt der Entwicklung sofort zu testen
* die Möglichkeit das fertige oder in Entwicklung befindliche Spiel einfach auf Smartphones und Tablets zu installieren
* die Möglichkeit mit mehreren Personen an demselben Projekt zu arbeiten, mit sofortiger Synchronisation
* Community-Sharing-Funktionen die es Ihnen erlauben die Projekte anderer zu erkunden, zu lernen, und alles was Sie möchten für Ihr eigenes Projekt wiederzuverwenden

# Schnellstart

Im Bereich *Erkunden* können Sie damit beginnen Projekte zu erforschen die von anderen Benutzern erstellt wurden.

Um mit dem Erstellen eines Spiels zu beginnen ist es notwendig ein Konto zu erstellen. Wählen Sie einen Nicknamen (vermeiden Sie die Verwendung
Ihren echten Namen), geben Sie Ihre E-Mail-Adresse ein (notwendig falls Sie Ihr Passwort vergessen haben, muss bestätigt werden um publizieren zu können) und los geht's!

## Erstes Projekt

Sie können entweder ein neues, leeres Projekt im Bereich "Erstellen" anlegen oder ein bestehendes Projekt im Bereich "Erkunden" auswählen und auf die Schaltfläche "Klonen" klicken um Ihre eigene Kopie zu erstellen und mit den Anpassungen zu beginnen.

### Code

Nachdem Sie Ihr Projekt erstellt haben befinden Sie sich im Bereich "Code". Hier können Sie mit der Programmierung beginnen. Versuchen Sie, den unten stehenden Code zu kopieren und einzufügen:

```
draw = function()
  screen.drawSprite ("icon",0,0,100,100)
end
```

### Ausführen

Klicken Sie anschließend auf die Schaltfläche "Play" auf der rechten Seite des Bildschirms. Ihr Programm startet und Sie sehen, dass der obige Code das Projektsymbol in der Mitte des Bildschirms anzeigt. Ändern Sie die Anzeigekoordinaten (die Ziffern 0 und 100), um zu sehen wie die Position und die Abmessungen des Symbols variieren.

### Ändern Sie in Echtzeit

Sie können dieses erste Programm nun interaktiver gestalten, indem Sie den folgenden Code kopieren und einfügen:

```
update = function()
  if keyboard.LEFT then x -= 1 end
  if tastatur.RECHTS dann x += 1 end
  if keyboard.UP then y += 1 end
  if keyboard.DOWN then y -= 1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"#000")
  screen.drawSprite("icon",x,y,20,20)
end
```

Diesmal erlaubt Ihnen das Programm das Projektsymbol mit den Tastaturpfeilen zu verschieben. Die Bedeutung der Funktionen ```update``` und ```draw```, das Testen der Tastaturtasten mit ```keyboard```, das Zeichnen auf dem Bildschirm mit ```draw``` werden alle später in dieser Dokumentation ausführlich erklärt.

Sie können auch in den Abschnitt *Sprites* gehen, auf das Element "icon" klicken und mit der Bearbeitung des Bildes beginnen. Wenn Sie in den Abschnitt *Code* zurückkehren, werden Sie sehen dass Ihre Änderungen sofort in dem gerade laufenden Programm berücksichtigt werden.

#Erkunden

Der Hauptbereich *Erkunden* ermöglicht es Ihnen Projekte zu entdecken die von anderen Benutzern erstellt wurden. Sie können Beispiele für Spiele, wiederverwendbare Vorlagen, Sprite-Bibliotheken in verschiedenen Stilen und Themen finden. Wenn Sie sich für ein bestimmtes Projekt interessieren können Sie es klonen, d.h. eine vollständige Kopie davon erstellen die Sie dann verändern und für Ihre eigenen Zwecke wiederverwenden können.

Wenn Sie zuvor eines Ihrer Projekte im Bereich *Erstellen* geöffnet haben können Sie jedes Sprite, oder jede Quelldatei, der Projekte die Sie untersuchen in Ihr aktuelles Projekt importieren. Auf diese Weise können Sie aus den öffentlichen Projekten der Community Bilder oder Funktionen auswählen die Sie interessieren und diese für Ihre eigenen Zwecke wiederverwenden.

# Ein Projekt erstellen

Sie können ein leeres Projekt im Hauptbereich *Erstellen* erstellen. Ihr Projekt hat mehrere Abschnitte:

* **Code**: Hier erstellen Sie Ihre Programme und führen Ihr Projekt aus, um es zu testen und zu debuggen.
* **Sprites**: *Sprites* sind Bilder, die Sie in diesem Abschnitt zeichnen und verändern können. Sie können sich einfach auf sie beziehen, um sie anzuzeigen (auf dem Bildschirm einzufügen), wenn Sie Ihr Spiel programmieren.
* **Maps**: Karten sind Szenen oder Levels die Sie erstellen können indem Sie Ihre Sprites auf einem Raster zusammensetzen. Sie können sie einfach in Ihrem Programm auf dem Bildschirm anzeigen
* **Doku**: Hier können Sie eine Dokumentation für Ihr Projekt schreiben. Das kann ein Dokument zum Spieldesign sein, ein Tutorial, eine Anleitung zur Wiederverwendung Ihres Projekts als Vorlage usw.
* **Optionen**: Hier können Sie verschiedene Optionen für Ihr Projekt einstellen. Sie können auch andere Benutzer einladen um mit Ihnen an Ihrem Projekt zu arbeiten.
* **Publizire**: Hier können Sie Ihr Projekt publizieren machen. Vergessen Sie nicht eine Beschreibung zu erstellen und Tags hinzuzufügen.

## Code

In diesem Bereich programmieren und testen Sie Ihr Projekt. Eine Quellcodedatei wird automatisch für Ihr Projekt erstellt. Sie können weitere hinzufügen, um die Funktionalitäten Ihres Projekts in verschiedene Teilbereiche aufzuteilen.

Der Betrieb eines microStudio-Programms basiert auf Ihrer Implementierung von 3 wesentlichen Funktionen:

* die Funktion ```init``, in der Sie Ihre Variablen initialisieren
* die Funktion ```Update``, in der Sie Ihre Objekte animieren und die Einträge abfragen
* die Funktion ```draw``, mit der Sie auf dem Bildschirm zeichnen

<!--- help_start init = function --->
### Funktion ```init()```

Die init-Funktion wird nur einmal beim Start des Programms aufgerufen. Sie ist vor allem nützlich, um den Anfangszustand von globalen Variablen zu definieren, die im restlichen Programm verwendet werden können.
<!--- help_end --->
##### Beispiel
```
init = function()
  status = "willkommen"
  level = 1
  stellung_x = 0
  position_y = 0
end
```

### Funktion ```Update()```
<!--- help_start update = function --->
Die Funktion ```update``` wird 60 mal pro Sekunde aufgerufen. Der Körper dieser Funktion ist der beste Ort, um die Logik und Physik des Spiels zu programmieren: Zustandsänderungen, Sprite- oder Feindbewegungen, Kollisionserkennung, Tastatur, Auswertung von Touch- oder Gamepad-Eingaben, etc.
<!--- help_end --->

##### Beispiel
```
update = function()
  if keyboard.UP then y = y+1 end
end
```

Der obige Code erhöht den Wert der Variablen y alle 60stel Sekunden um 1, wenn die Taste ```UP`` auf der Tastatur gedrückt wird (Pfeil nach oben).

<!--- help_start draw = function --->
### Funktion ```Zeichnen()```
Die Funktion ```draw`` wird so oft aufgerufen, wie der Bildschirm aufgefrischt werden kann. Hier müssen Sie Ihre Szene auf den Bildschirm zeichnen, zum Beispiel indem Sie ein großes farbiges Rechteck ausfüllen (um den Bildschirm zu löschen) und dann ein paar Sprites oder Formen darauf zeichnen.
<!--- help_end --->

##### Beispiel
```
draw = function()
  // füllt den Bildschirm mit Schwarz
  screen.fillRect(0,0,screen.width,screen.width,screen.height, "rgb(0,0,0)")
  // das Sprite "icon" in der Mitte des Bildschirms zeichnen, in der Größe 100x100
  screen.drawSprite("icon",0,0,100,100)
end
```

In den meisten Fällen wird ```draw`` 60 mal pro Sekunde aufgerufen. Aber manche Computer oder Tablets können ihre Bildschirme 120 Mal pro Sekunde oder sogar mehr aktualisieren. Es kann auch vorkommen, daß das Gerät, auf dem das Programm läuft, überlastet ist und den Bildschirm nicht 60 mal pro Sekunde auffrischen kann. In diesem Fall wird die Funktion ```draw`` weniger oft aufgerufen. Das ist der Grund, warum ```update`` und ```draw`` zwei getrennte Funktionen sind: egal was passiert, ```update`` wird genau 60 mal pro Sekunde aufgerufen; und wenn ```draw`` aufgerufen wird, ist es Zeit, den Bildschirm neu zu zeichnen.

###Ausführung

Im Bereich "Code" können Sie im rechten Teil des Bildschirms Ihr Programm in Aktion sehen, während Sie weiterhin den Quellcode ändern. Um das Programm zu starten, klicken Sie einfach auf die Schaltfläche <i class="fa-play"></i>. Sie können die Ausführung Ihres Programms jederzeit unterbrechen, indem Sie auf die Schaltfläche <i class="fa-pause"></i> klicken.

### Konsole

Während der Ausführung Ihres Programms können Sie die Konsole nutzen, um einfache Befehle in *microScript* auszuführen. So können Sie z. B. einfach den Namen einer Variablen eingeben, um deren aktuellen Wert zu erfahren.

##### Beispiele
Den aktuellen Wert der Variable position_x erfahren
```
> position_x
34
>
```
Position ändern wert_x
```
> Position_x = -10
-10
>
```
Rufen Sie die Funktion draw() auf, um die Änderung von position_x und deren Auswirkung auf die Zeichnung auf dem Bildschirm zu sehen (unter der Annahme, dass die Ausführung pausiert ist)
```
> draw()
>
```

### Traces

In Ihrem Programmcode können Sie mit der Funktion ```print()``` jederzeit Text zur Anzeige auf der Konsole senden.

##### Beispiel
```
zeichnen = function()
  // Ihre Zeichnungsimplementierung()

  print(position_x)
end
```
## Sprites

Sprites sind Bilder, die sich auf dem Bildschirm bewegen können. Mit dem Zeichenwerkzeug in *microStudio* können Sie Sprites erstellen, die dann im Programmcode verwendet werden können, um sie an der gewünschten Position und Größe auf dem Bildschirm anzuzeigen.

### Ein Sprite erstellen
Jedes Projekt verfügt über ein Standard-Sprite, genannt "Icon", das als Symbol der Anwendung dient. Sie können neue Sprites erstellen, indem Sie auf *Add a sprite* klicken. Sie können sie nach Belieben umbenennen und ihre Größe in Pixeln (Breite x Höhe) festlegen.

### Zeichnungsoptionen
*microStudio* bietet die klassischen Zeichenfunktionen: Bleistift, Füllen, Radiergummi, Aufhellen, Abdunkeln, Weichzeichnen, Kontrast erhöhen, Sättigung ändern.

Das Pipettenwerkzeug kann jederzeit durch Drücken der [Alt]-Taste auf der Tastatur verwendet werden.

Die Optionen *Kachel* und Symmetrie helfen Ihnen, "wiederholbare" Sprites oder Sprites mit einer oder zwei Symmetrieachsen zu erstellen.

##### Tipp
Sie können Bilddateien in Ihr microStudio-Projekt importieren. Ziehen Sie dazu PNG- oder JPG-Dateien (bis zu einer Größe von 256x256 Pixel) per Drag & Drop in die Liste der Sprites.

## Karten
Eine Map in microStudio ist ein Raster zum Zusammenstellen von Sprites. Damit können Sie ein Dekor zusammenstellen oder einen Level erstellen.

### Erstellen einer Map
Maps können genau wie Sprites erstellt und umbenannt werden. Es ist möglich, die Größe des Rasters (in Anzahl der Zellen) zu verändern. Jede Zelle kann mit einem Sprite bemalt werden. Es ist möglich, die Pixelgröße jeder Zelle zu ändern, die im Allgemeinen die Größe der Sprites widerspiegeln sollte, die zum Malen des Rasters verwendet werden.


## Einstellungen
Auf der Registerkarte *Einstellungen* können Sie einige Elemente Ihres Projekts anpassen.

### Optionen
Sie können den Titel Ihres Projekts festlegen, seinen Bezeichner (mit dem die URL, d.h. die Internetadresse, erstellt wird).

Sie können festlegen, ob Ihr Projekt im Hoch- oder Querformat verwendet werden soll. Diese Wahl wird berücksichtigt, wenn Ihre Anwendung auf einem Smartphone oder Tablet installiert wird.

Sie können auch die gewünschten Proportionen für den Anzeigebereich auf dem Bildschirm angeben. Dies ist eine Option, um sicherzustellen, dass die Anwendung immer gut aussieht, wenn sie auf Geräten mit Bildschirmen unterschiedlicher Proportionen installiert wird.

### Benutzer

Im Bereich "Benutzer" können Sie Freunde zur Teilnahme an Ihrem Projekt einladen. Sie müssen den Spitznamen des Freundes kennen, den Sie einladen möchten. Sobald ein Freund eingeladen ist, hat er, wenn er Ihre Einladung annimmt, vollen Zugriff auf Ihr Projekt und kann alle gewünschten Änderungen vornehmen (Sprites, Maps, Code usw. ändern, hinzufügen, löschen). Die Änderung der Projektoptionen und der Teilnehmerliste ist jedoch dem Projektbesitzer vorbehalten.

## Veröffentlichen

*microStudio* bietet einige Optionen zum Veröffentlichen oder Exportieren Ihres Projekts. Sie können Ihr Projekt als eigenständige HTML5-App exportieren, um es online, auf Ihrer Website oder auf Spielevertriebsplattformen zu verteilen. Sie können Ihr Projekt auch auf *microStudio* öffentlich machen, so dass die Community damit spielen, es kommentieren, den Quellcode und die Assets erkunden kann... Weitere Exportoptionen sind für die Zukunft geplant.

### Projekt öffentlich machen

Um Ihr Projekt für alle zugänglich zu machen (schreibgeschützt), klicken Sie auf "Mein Projekt öffentlich machen". Sobald Ihr Projekt öffentlich ist, wird es auf der Registerkarte "Exploration" der Microstudio-Website angezeigt. Jeder Besucher kann das Spiel ausführen, den Quellcode und andere Komponenten Ihres Projekts anzeigen und wiederverwenden.

Ihr Spiel hat eine permanente URL in der Form ```https://microstudio.io/author_nickname/game_id/``. Sie können den Link natürlich an jeden weitergeben oder Sie können Ihr Spiel in Ihre bestehende Website einfügen, indem Sie es in einen iframe einbetten.

### Exportieren nach HTML5

Um Ihr komplettes Projekt in eine eigenständige HTML5-App zu exportieren, klicken Sie auf "Export to HTML5". Dies löst den Download eines ZIP-Archivs aus, das alle Dateien enthält, die zum Ausführen Ihres Spiels erforderlich sind: Sprites, einige JavaScript-Dateien, Icons und eine Haupt-HTML-Datei "index.html". Ihr Spiel kann lokal ausgeführt werden (Doppelklick auf die Datei index.html) oder Sie können es auf Ihre bestehende Website hochladen. Es ist auch bereit, auf vielen Online-Spiele-Vertriebsplattformen veröffentlicht zu werden, die HTML5-Spiele akzeptieren (wir schlagen im HTML5-Export-Panel ein paar vor).

**microScript

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
Sie können die Liste der Felder eines Objekts mit einer ```for-Schleife`` durchsuchen:

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
maFunktion = Funktion()
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


## Funktionsreferenz

## ``Bildschirm'' anzeigen

In *microStudio* wird der Bildschirm durch das vordefinierte Objekt "screen" dargestellt. Um Formen oder Bilder auf dem Bildschirm darzustellen, rufen Sie einfach Funktionen (auch *Methoden* genannt) auf diesem Objekt auf. Ein Beispiel:

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```
Der obige Code definiert die Zeichenfarbe als ```#FFF``, d. h. weiß (siehe Erläuterungen unten). Dann zeichnet er ein mit dieser Farbe gefülltes Rechteck, zentriert an den Koordinaten 0,0 des Bildschirms (d. h. der Mitte des Bildschirms), mit der Breite 100 und der Höhe 100.


Um Ihnen die Arbeit zu erleichtern, skaliert *microStudio* die Bildschirmkoordinaten automatisch, unabhängig von der tatsächlichen Bildschirmauflösung. Die kleinste Anzeigegröße (Breite im Hochformat, Höhe im Querformat) ist per Konvention 200. Da der Ursprungspunkt (0,0) die Mitte des Bildschirms ist, wird die kleinste Abmessung also von -100 bis +100 gestaffelt. Die größte Dimension wird z. B. von -178 bis +178 (klassischer 16:9-Bildschirm), von -200 bis +200 (2:1-Bildschirm, längere, neuere Smartphones) usw. gestaffelt.


![Bildschirmkoordinaten](/doc/img/screen_coordinates.png "Bildschirmkoordinaten")

<small>*Zeichnungskoordinatensystem auf einem 16:9-Bildschirm im Hochformat und im Querformat*</small>


### Definieren Sie eine Farbe
<!--- suggest_start screen.setColor --->
##### screen.setColor( color)

Definiert die Farbe, die für zukünftige Aufrufe von Zeichenfunktionen verwendet werden soll.

<!--- suggest_end --->

Die Farbe wird durch eine Zeichenkette definiert, also zwischen Anführungszeichen "". Sie wird im Allgemeinen durch ihre RGB-Komponenten beschrieben, d. h. eine Mischung aus Rot, Grün und Blau. Es sind mehrere Arten von Bewertungen möglich:

* "rgb(255,255,255)": (rgb für rot, grün, blau). Hier wird ein Wert für Rot, Grün und Blau angegeben, der zwischen 0 und maximal 255 liegt. "rgb(255,255,255)" ergibt Weiß, "rgb(255,0,0)" ergibt Hellrot, "rgb(0,255,0)" ergibt Grün usw. Um beim Kodieren eine Farbe einfacher auszuwählen, klicken Sie auf Ihre rgb-Farbe und halten Sie die Strg-Taste gedrückt, um den Farbwähler anzuzeigen.
* "#FFF" oder "#FFFFFF": Diese Notation verwendet Hexadezimal, um die 3 Komponenten von Rot, Grün und Blau zu beschreiben. Hexadezimal ist ein Zahlennotationssystem zur "Basis 16", d. h. mit 16 Ziffern, von 0 bis 9 und dann von A bis F.
* Es existieren weitere Notationen, die hier nicht beschrieben werden.

### Bildschirm löschen
<!--- suggest_start screen.clear --->
##### screen.clear()
Löscht den Bildschirm (füllt ihn mit schwarzer Farbe).
<!--- suggest_end --->

### Zeichnen von Formen
<!--- suggest_start screen.fillRect --->
##### screen.fillRect( x, y, width, height, color)
Zeichnet ein gefülltes Rechteck, zentriert an den Koordinaten x und y, mit der angegebenen Breite und Höhe. Die Farbe ist optional, wenn sie weggelassen wird, wird die zuletzt verwendete Farbe wieder verwendet.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRoundRect --->
##### screen.fillRoundRect( x, y, width, height, radius, color)
Zeichnet ein gefülltes, abgerundetes Rechteck, zentriert an den Koordinaten x und y, mit der angegebenen Breite, Höhe und dem angegebenen Krümmungsradius. Die Farbe ist optional, wenn sie weggelassen wird, wird die zuletzt verwendete Farbe wieder verwendet.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRound --->
##### screen.fillRound( x, y, Breite, Höhe, Farbe)
Zeichnet eine solide runde Form (eine Scheibe oder Ellipse, je nach den verwendeten Abmessungen), zentriert an den Koordinaten x und y, mit der angegebenen Breite und Höhe. Die Farbe ist optional, wenn sie weggelassen wird, wird die zuletzt verwendete Farbe wieder verwendet.
<!--- suggest_end --->

<!--- suggest_start screen.drawRect --->
##### screen.drawRect( x, y, Breite, Höhe, Farbe)
Zeichnet einen Rechteckumriss, zentriert an den Koordinaten x und y, mit der angegebenen Breite und Höhe. Die Farbe ist optional, wenn sie weggelassen wird, wird die zuletzt verwendete Farbe wieder verwendet.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRoundRect --->
##### screen.drawRoundRect( x, y, Breite, Höhe, Radius, Farbe)
Zeichnet einen abgerundeten Rechteckumriss, zentriert an den Koordinaten x und y, mit der angegebenen Breite, Höhe und dem angegebenen Krümmungsradius. Die Farbe ist optional, wenn sie weggelassen wird, wird die zuletzt verwendete Farbe wieder verwendet.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRound --->
##### screen.drawRound( x, y, Breite, Höhe, Farbe)
Zeichnet einen runden Umriss, zentriert an den Koordinaten x und y, mit der angegebenen Breite und Höhe. Die Farbe ist optional, wenn sie weggelassen wird, wird die zuletzt verwendete Farbe wieder verwendet.
<!--- suggest_end --->

<!--- suggest_start screen.drawLine --->
##### screen.drawLine( x1, y1, x2, y2, color )
Zeichnet eine Linie, die die Punkte (x1,y1) und (x2,y2) verbindet. Die Farbe ist optional, wenn sie weggelassen wird, wird die zuletzt verwendete Farbe wieder verwendet.
<!--- suggest_end --->

<!--- suggest_start screen.fillPolygon --->
##### screen.fillPolygon( x1, y1, x2, y2, x3, y3, ... , Farbe )
Füllt ein Polygon, das durch die als Argumente übergebene Liste von Punktkoordinaten definiert ist. Die Farbe ist optional, wenn sie weggelassen wird, wird die zuletzt verwendete Farbe wieder verwendet.
<!--- suggest_end --->

Die Funktion kann auch ein Array als erstes Argument und eine Farbe als zweites Argument akzeptieren. In diesem Fall wird erwartet, dass das Array die Koordinaten der Punkte wie folgt enthält: ```screen.fillPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon( x1, y1, x2, y2, x3, y3, ... , color )
Zeichnet einen Polygonumriß, definiert durch die Liste der als Argumente übergebenen Punktkoordinaten. Die Farbe ist optional, wenn sie weggelassen wird, wird die zuletzt verwendete Farbe wiederverwendet.
<!--- suggest_end --->


Die Funktion kann auch ein Array als erstes Argument und eine Farbe als zweites Argument akzeptieren. In diesem Fall wird erwartet, dass das Array die Koordinaten der Punkte wie folgt enthält: ```screen.drawPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth( width )
Setzt die Linienbreite für alle nachfolgenden Linienzeichenoperationen (drawLine, drawPolygon, drawRect etc.). Die Standard-Linienbreite ist 1.
<!--- suggest_end --->

### Sprites und Maps anzeigen

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite( sprite, x, y, width, height)

Zeichnet eines der Sprites, die Sie im Abschnitt *Sprites* erstellt haben, auf den Bildschirm. Der erste Parameter ist eine Zeichenkette, die dem Namen des anzuzeigenden Sprites entspricht, z.B. ```Icon"```. Dann folgen die x,y-Koordinaten, wo das Sprite angezeigt werden soll (das Sprite wird auf diesen Koordinaten zentriert). Dann die Breite und Höhe der Anzeige.
<!--- suggest_end --->

```
screen.drawSprite("icon",0,50,50,50)
```
Die Höhe kann, wie im obigen Beispiel, weggelassen werden. In diesem Fall wird die Höhe anhand der Breite und der Proportionen des Sprites berechnet.

##### Animierte Sprites

Animierte Sprites zeichnen automatisch den richtigen Frame entsprechend der Animationseinstellungen. Sie können den aktuellen Frame eines Sprites (z.B. um die Animation neu zu starten) auf diese Weise setzen:

```
sprites["sprite1"].setFrame(0) // 0 ist der Index des ersten Frames
```

Sie können auch einen bestimmten Animationsframe Ihres Sprites zeichnen, indem Sie "." und den Index des gewünschten Frames anhängen:

```
screen.drawSprite("sprite1.0",0,50,50,50)
```

Das obige Beispiel zeichnet das Frame 0 des Sprites "sprite1".

<!--- suggest_start screen.drawSpritePart --->
##### screen.drawSpritePart( sprite, part_x, part_y, part_width, part_height, x, y, width, height)

Zeichnet einen Teil eines Sprites auf den Bildschirm. Der erste Parameter ist ein String, der dem Namen des anzuzeigenden Sprites entspricht, zum Beispiel ```Icon``. Die nächsten 4 Parameter definieren die Koordinate eines Sub-Rechtecks des Sprites, das tatsächlich auf den Bildschirm gemalt werden soll (Koordinate 0,0 ist die linke obere Ecke des Sprites). Die letzten 4 Parameter sind die gleichen wie bei ```drawSprite```.
<!--- suggest_end --->

```
screen.drawSpritePart("icon",4,4,8,8,0,50,50,50)
```
Die Höhe kann, wie im obigen Beispiel, weggelassen werden. In diesem Fall wird die Höhe entsprechend der Breite und den Proportionen des Sprite-Teils berechnet.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap( map , x , y , width , height )
Zeichnet eine der Karten, die Sie im Abschnitt *Maps* erstellt haben, auf den Bildschirm. Der erste Parameter ist eine Zeichenkette, die dem Namen der anzuzeigenden Karte entspricht, zum Beispiel ```Map1``. Dann folgen die x,y-Koordinaten, wo die Karte angezeigt werden soll (die Karte wird auf diesen Koordinaten zentriert). Dann die Breite und Höhe der Anzeige.
<!--- suggest_end --->

```
screen.drawMap("map1",0,0,300,200)
```

### Text anzeigen

<!--- suggest_start screen.drawText --->
##### screen.drawText( text, x, y, size, &lt;color&gt; )
Zeichnet Text auf den Bildschirm. Der erste Parameter ist der anzuzeigende Text, dann die x- und y-Koordinaten, wo der Text zentriert werden soll, dann die Größe (Höhe) des Textes. Der letzte Parameter ist die Zeichenfarbe, er kann weggelassen werden, in diesem Fall wird die zuletzt definierte Farbe wieder verwendet.
<!--- suggest_end --->

```
screen.drawText("Hallo!",0,0,30, "#FFF")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont( font_name )
Definiert die Schriftart, die bei zukünftigen Aufrufen von ```drawText`` verwendet werden soll.

**Verfügbare Schriftarten in der aktuellen Version**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->

```
screen.setFont("BitCell")
```

**Tip**: die globale Variable ```Fonts`` ist ein Array aller in microStudio verfügbaren Schriftarten


<!--- suggest_start screen.textWidth --->
##### screen.textWidth( text, size )
Gibt die Breite des angegebenen Textes zurück, wenn er auf dem Bildschirm mit der angegebenen Größe gezeichnet wird.
<!--- suggest_end --->

```
width = screen.textWidth( "Mein Text", 20 )
```

### Zeichnungsparameter
<!--- suggest_start screen.setAlpha --->
##### screen.setAlpha
Definiert den Gesamtdeckungsgrad für alle später aufgerufenen Zeichenfunktionen. Der Wert 0 entspricht einer totalen Transparenz (unsichtbare Elemente) und der Wert 1 entspricht einer totalen Opazität (die gezeichneten Elemente verdecken vollständig, was darunter liegt).
<!--- suggest_end --->

```
screen.setAlpha(0.5) // die nächsten gezeichneten Elemente werden halbtransparent sein
```

Wenn Sie diese Funktion verwenden, um einige Elemente mit ein wenig Transparenz zu zeichnen, vergessen Sie nicht, den Alpha-Parameter auf seinen Standardwert zurückzusetzen:

```
screen.setAlpha(1) // der Standardwert, totale Deckkraft
```

---

<!--- suggest_start screen.setLinearGradient --->
##### screen.setLinearGradient( x1, y1, x2, x2, y2, color1, color 2)
Definiert die Zeichenfarbe als linearen Farbverlauf, d. h. einen Gradienten. ```x1 und y1`` sind die Koordinaten des Startpunktes des Farbverlaufs. ```x2 und y2`` sind die Koordinaten des Endpunktes des Farbverlaufs. ```Farbe1`` ist die Startfarbe (siehe ```setColor``` für die Farbwerte). "Farbe2" ist die Ankunftsfarbe.
<!--- suggest_end --->

```
screen.setLinearGradient(0,100,0,-100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
Das obige Beispiel erzeugt einen Farbverlauf von Weiß nach Rot, vom oberen bis zum unteren Rand des Bildschirms, und füllt dann den Bildschirm mit diesem Farbverlauf.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient( x, y, radius, color1, color2)
Definiert die Zeichenfarbe als radialen Farbverlauf, d.h. einen Verlauf in Form eines Kreises. ```x``` und ```y`` sind die Koordinaten des Mittelpunktes des Kreises. ```Radius``` ist der Radius des Kreises. ```Farbe1`` ist die Farbe in der Mitte des Kreises (siehe ```setColor`` für die Farbwerte). ```Farbe2`` ist die Farbe am Umfang des Kreises.
<!--- suggest_end --->

```
screen.setRadialGradient(0,0,100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
Das obige Beispiel erzeugt einen Farbverlauf von Weiß in der Mitte des Bildschirms in Richtung Rot an den Rändern des Bildschirms und füllt dann den Bildschirm mit diesem Farbverlauf.

---

<!--- suggest_start screen.setTranslation --->
##### screen.setTranslation( tx, ty )
Legt die Translation der Bildschirmkoordinaten für die nachfolgenden Zeichenoperationen fest.
<!--- suggest_end --->

```
screen.setTranslation(50,50)
screen.fillRect(0,0,20,20)
```
Das Rechteck im obigen Beispiel wird mit einem Offset von 50,50 gezeichnet

Vergessen Sie nicht, die Verschiebung auf 0,0 zurückzusetzen, wenn Sie die Verschiebung von Zeichenoperationen beenden wollen.
```
screen.setTranslation(0,0)
```

<!--- suggest_start screen.setDrawRotation --->
##### screen.setDrawRotation( angle)
Legt einen Rotationswinkel für die nächsten Zeichenoperationen fest. Der Winkel wird in Grad angegeben.
<!--- suggest_end --->

```
screen.setDrawRotation(45)
screen.drawSprite ("icon",0,0,100)
```
Das obige Beispiel zeigt das Projektsymbol, um 45 Grad gekippt.

Vergessen Sie nicht, den Drehwinkel nach der Benutzung wieder auf 0 zu setzen!
```
screen.setDrawRotation(0) // setzt den Rotationswinkel auf seinen Standardwert zurück
```

<!--- suggest_start screen.setDrawScale --->
##### screen.setDrawScale( x, y)
Definiert einen Skalierungsfaktor für das Zeichnen der nächsten Elemente auf dem Bildschirm. ```x``` definiert den Skalierungsfaktor auf der x-Achse und ```y`` den Skalierungsfaktor auf der y-Achse. Ein Wert von 2 bewirkt eine Verdoppelung der Darstellung. Ein Wert von -1 erlaubt es z.B., ein Sprite zu spiegeln (mirror), horizontal (x) oder vertikal (y).
<!--- suggest_end --->

```
screen.setDrawScale(1,-1)
screen.drawSprite ("icon",0,0,100)
```
Das obige Beispiel zeigt das Projektsymbol, das vertikal ausgegeben wird.

Vergessen Sie nicht, den Skalierungsfaktor nach der Verwendung wieder auf 1,1 zu setzen!
```
screen.setDrawScale(1,1) // setzt den Skalierungsfaktor auf seinen Standardwert zurück.
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setDrawAnchor( anchor_x, anchor_y )
Standardmäßig betrachten alle Zeichenoperationen Ihre Koordinaten als Mittelpunkt der zu zeichnenden Form. Sie können dies ändern, indem Sie
screen.setDrawAnchor( anchor_x, anchor_y )` ändern, um einen anderen Ankerpunkt für das Zeichnen von Formen anzugeben.

<!--- suggest_end --->
Auf der x-Achse kann der Ankerpunkt auf -1 (linke Seite Ihrer Form), 0 (Mitte Ihrer Form), 1 (rechte Seite Ihrer Form) oder einen beliebigen Zwischenwert gesetzt werden. Auf der y-Achse kann der Ankerpunkt auf -1 (Unterseite Ihrer Form), 0 (Mitte Ihrer Form), 1 (Oberseite Ihrer Form) oder einen beliebigen Zwischenwert gesetzt werden.

Beispiele
```
screen.setDrawAnchor(-1,0) // nützlich, um Text links auszurichten
screen.setDrawAnchor(-1,-1) // Ihre Zeichenkoordinaten werden jetzt als die linke untere Ecke Ihrer Form interpretiert.
screen.setDrawAnchor(0,0) // Standardwert, alle Formen werden zentriert auf Ihre Koordinaten gezeichnet
```

<!--- suggest_start screen.width --->
##### screen.width
Das Feld "width" des Objekts screen hat als Wert die aktuelle Bildschirmbreite (immer 200, wenn der Bildschirm im Hochformat ist, siehe *screen coordinates*).
<!--- suggest_end --->

<!--- suggest_start screen.height --->
###### screen.height
Das Feld "height" des Objekts screen hat als Wert die aktuelle Höhe des Bildschirms (immer 200, wenn sich der Bildschirm im Querformat befindet, siehe *screen coordinates*).
<!--- suggest_end --->

<!--- suggest_start screen.setCursorVisible --->
##### screen.setCursorVisible( visible )
Mit dieser Funktion können Sie den Mauszeiger ein- oder ausblenden.
<!--- suggest_end --->


## Eingaben, Steuerung

Um Ihr Programm interaktiv zu gestalten, müssen Sie wissen, ob und wo der Benutzer eine Taste auf der Tastatur oder dem Joystick drückt oder den Touchscreen berührt. *microStudio* ermöglicht es Ihnen, den Status dieser verschiedenen Steuerungsschnittstellen zu kennen, und zwar über die Objekte ```Tastatur`` (für die Tastatur), ```Touch`` (für den Touchscreen / Maus), ```Maus`` (für Mauszeiger / Touchscreen) ```Gamepad`` (für den Controller).

##### Hinweis
Das Objekt ```system.inputs`` hält nützliche Informationen darüber bereit, welche Eingabemethoden auf dem Hostsystem verfügbar sind:

|Field|Value|
|-|-|
|system.inputs.keyboard|1 wenn angenommen wird, dass das System eine physische Tastatur hat, sonst 0|
|system.inputs.mouse|1 wenn das System eine Maus hat, 0 sonst|
|system.inputs.touch|1 wenn das System einen Touchscreen hat, 0 sonst|
|system.inputs.gamepad|1 wenn mindestens ein Gamepad an das System angeschlossen ist, 0 sonst (das Gamepad kann nur angeschlossen erscheinen, wenn der Benutzer eine Aktion darauf ausgeführt hat)|


### Tastatureingaben
<!--- suggest_start keyboard --->
Tastatureingaben können mit dem ```Tastatur``-Objekt getestet werden.
<!--- suggest_end --->

##### Beispiel.
```
if keyboard.A then
  // die Taste A ist gerade gedrückt
end
```

Beachten Sie beim Testen Ihres Projekts, dass es notwendig ist, zuerst in das Ausführungsfenster zu klicken, damit die Tastaturereignisse das Ausführungsfenster erreichen.

Der folgende Code zeigt die ID jeder gedrückten Tastaturtaste an. Er kann für Sie nützlich sein, um die Liste der Bezeichner zu erstellen, die Sie für Ihr Projekt benötigen.

```
draw = function()
  screen.clear()
  local y = 80
  for key in keyboard
    if keyboard[key] then
      screen.drawText(taste,0,y,15, "#FFF")
      y -= 20
    end
  end
end
```
*microStudio* erzeugt für Sie einige nützliche generische Codes, wie UP, DOWN, LEFT und RIGHT, die je nach Tastaturlayout sowohl auf die Pfeiltasten als auch auf ZQSD / WASD reagieren.

Um Sonderzeichen wie +, - oder sogar Klammern zu testen, müssen Sie die folgende Syntax verwenden: ```Tastatur["("]```, ```Tastatur["-"]```.

##### Testen, ob gerade eine Taste gedrückt wurde
Im Kontext der Funktion ```update()``` können Sie mit ```keyboard.press.<KEY>`` prüfen, ob eine Taste der Tastatur gerade vom Benutzer gedrückt wurde.

Beispiel:

```
if keyboard.press.A then
  // Einmalig etwas tun, wenn der Benutzer gerade die Taste A drückt
end
```

##### Testen, ob eine Taste gerade losgelassen wurde
Im Kontext der Funktion ```update()``` können Sie mit ```keyboard.release.<KEY>`` prüfen, ob eine Taste der Tastatur gerade vom Benutzer losgelassen wurde.

Beispiel:

```
if keyboard.release.A then
  // Einmalig etwas tun, wenn der Benutzer gerade die Taste A loslässt
end
```


<!--- suggest_start touch --->
### Touch-Eingänge

Die Touch-Eingänge können mit dem "touch"-Objekt getestet werden (das auch den Zustand der Maus meldet).
<!--- suggest_end --->

|Field|Value|
|-|-|
|touch.touching|Ist true, wenn der Benutzer den Bildschirm berührt, false wenn nicht|
|touch.x|Position x, an der der Bildschirm berührt wird|
|touch.y|Position y, an der der Bildschirm berührt wird
|touch.touches|Falls Sie mehrere Berührungspunkte gleichzeitig berücksichtigen müssen, ist touch.touches eine Liste der aktuell aktiven Berührungspunkte
|touch.press|true wenn ein Finger gerade begonnen hat, den Bildschirm zu berühren|
|touch.release|true wenn der Finger gerade den Bildschirm verlassen hat|

```
if touch.touching
  // der Benutzer berührt den Bildschirm
else
 // der Benutzer berührt den Bildschirm nicht
end
```

```
draw = function()
  for t in touch.touches
    screen.drawSprite("icon",t.x,t.y,50)
  end
end
```
Das obige Beispiel zeigt das Projektsymbol an jedem aktiven Berührungspunkt auf dem Bildschirm.  

<!--- suggest_start mouse --->
### Mauseingänge

Die Mauseingaben können mit dem ```mouse``-Objekt (das auch Touch-Events meldet) getestet werden.
<!--- suggest_end --->

|Field|Value|
|-|-|
|mouse.x|Position x des Mauszeigers
|mouse.y|Position y des Mauszeigers
|mouse.pressed|1 wenn eine beliebige Taste der Maus gedrückt ist, sonst 0|
|mouse.left|1 wenn linke Maustaste gedrückt ist, 0 sonst|
|mouse.right|1 wenn rechte Maustaste gedrückt ist, 0 sonst|
|mouse.middle|1 wenn mittlere Maustaste gedrückt ist, 0 sonst|
|mouse.press|true wenn gerade eine Maustaste gedrückt wurde|
|mouse.release|true wenn eine Maustaste gerade losgelassen wurde|

### Controller-Eingaben (Gamepad)
<!--- suggest_start gamepad --->
Mit dem Objekt "gamepad" kann der Zustand der Tasten und Joysticks am Controller (Gamepad) getestet werden.
<!--- suggest_end --->

##### Beispiel
```
if gamepad.UP then y += 1 end
```

**Tipp**: Um eine vollständige Liste der Felder des "gamepad"-Objekts zu erhalten, geben Sie einfach "gamepad" in die Konsole ein, wenn Ihr Programm läuft.

Genauso wie für Tastendrücke können Sie mit ```gamepad.press.<BUTTON>`` prüfen, ob eine Taste gerade gedrückt wurde oder mit ```gamepad.release.<BUTTON>``, ob eine Taste gerade losgelassen wurde.

## Sounds

*microStudio* wird bald einen eigenen Bereich zum Erstellen von Sounds und Musik haben. In der Zwischenzeit ist es möglich, den *Piepser* zu verwenden, um Ihre Kreationen auf einfache Weise mit Sounds zu versehen.

<!--- suggest_start audio.beep --->
### audio.beep
Spielt einen Ton ab, der durch die als Parameter übergebene Zeichenkette beschrieben wird.

```
audio.beep("C E G")
```
<!--- suggest_end --->
Ausführlicheres Beispiel und Erklärungen in der Tabelle unten:
```
"saw duration 100 span 50 duration 500 volume 50 span 50 loop 4 C2 C F G G G F end"
```

|Befehl|Beschreibung|
|-|-|
|saw| gibt den Typ des Klangerzeugers (Klangfarbe) an, mögliche Werte: saw, sine, square, noise|
|duration|gefolgt von einer Anzahl von Millisekunden gibt die Dauer der Noten an
|tempo|gefolgt von einer Anzahl von Noten pro Minute, gibt das Tempo an
|span|gefolgt von einer Zahl zwischen 1 und 100, gibt den Prozentsatz des Haltens jeder Note an|
|volume|gefolgt von einer Zahl zwischen 0 und 100, stellt die Lautstärke ein
|C|oder D, E, F usw. gibt eine zu spielende Note an. Es ist auch möglich, die Oktave anzugeben, z. B. C5 für das C der 5. Oktave der Tastatur.
|loop|, gefolgt von einer Zahl, gibt an, wie oft die folgende Sequenz wiederholt werden muss. Die Sequenz endet mit dem Schlüsselwort ```Ende`` Beispiel: ```Schleife 4 C4 E G Ende``; die Zahl 0 bedeutet, dass die Schleife unendlich oft wiederholt werden muss.

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Bricht alle Töne ab, die vom *Piepser* gespielt werden. Nützlich, um den Ton stumm zu schalten, nachdem eine Musikschleife gestartet wurde.
<!--- suggest_end --->

## Sprite-Methoden
Ihr Programm kann auf die Sprites Ihres Projekts zugreifen, die in einem vordefinierten Objekt ```Sprites`` gespeichert sind:

```
mysprite = sprites["icon"]
```

Sie können dann auf verschiedene Felder und Methoden Ihres Sprites zugreifen:

|field/method|description|
|-|-|
|```mysprite.width```Die Breite des Sprites in Pixel
|```mysprite.height``|Die Höhe des Sprites in Pixeln|
|```mysprite.ready``|1 wenn das Sprite vollständig geladen ist, sonst 0|
|```mysprite.name``|Name des Sprites

*Hinweis: Andere Felder und native Methoden können derzeit verfügbar erscheinen, wenn Sie ein Sprite-Objekt in der Konsole untersuchen. Solche undokumentierten Felder und Methoden können in Zukunft kaputt gehen, verlassen Sie sich also nicht zu sehr auf sie!

## Map-Methoden
Ihr Programm kann auf die Maps Ihres Projekts zugreifen, die in einem vordefinierten Objekt ```Maps`` gespeichert sind:

```
mymap = maps["map1"]
```

Sie können dann auf verschiedene Felder und Methoden Ihrer Map zugreifen:

|Feld/Methode|Beschreibung|
|-|-|
|```mymap.width``|Die Breite der Karte in Zellen|
|```mymap.height``|Die Höhe der Karte in Zellen|
|```mymap.block_width```Die Breite der Kartenzelle in Pixel|
|```mymap.block_height``|Die Höhe der Kartenzelle in Pixel|
|```mymap.ready``|1 wenn die Karte vollständig geladen ist, sonst 0|
|```mymap.name``|Name der Karte|
|```mymap.get(x,y)```|Gibt den Namen des Sprites in Zelle (x,y) zurück; Koordinatenursprung ist (0,0), unten links in der Karte. Gibt 0 zurück, wenn die Zelle leer ist|
|```mymap.set(x,y,name)```|Setzt ein neues Sprite in Zelle (x,y) ; Koordinatenursprung ist (0,0), befindet sich unten links in der Map. Der dritte Parameter ist der Name des Sprites.
|```mymap.clone()```|Returnt eine neue Map, die eine vollständige Kopie von mymap ist.``

*Hinweis: Andere Felder und native Methoden können derzeit verfügbar erscheinen, wenn Sie ein Map-Objekt in der Konsole untersuchen. Solche undokumentierten Felder und Methoden können in Zukunft kaputt gehen, verlassen Sie sich also nicht zu sehr auf sie!

## System
Das Objekt ```System`` erlaubt den Zugriff auf die Funktion ```time``, die die verstrichene Zeit in Millisekunden (seit dem 1. Januar 1970) zurückgibt. Vor allem aber ermöglicht sie, zu verschiedenen Zeiten aufgerufen, die Messung von Zeitdifferenzen.

<!--- suggest_start system.time --->
### system.time()
Liefert die verstrichene Zeit in Millisekunden (seit 1. Januar 1970)
<!--- suggest_end --->

## Speicherung
Das ````Storage``-Objekt ermöglicht die dauerhafte Speicherung Ihrer Anwendungsdaten. Sie können es verwenden, um den Benutzerfortschritt, Highscores oder andere Statusinformationen über Ihr Spiel oder Projekt zu speichern.

<!--- suggest_start storage.set --->
### storage.set( name , value )
Speichert Ihren Wert dauerhaft, der durch die Zeichenkette ```Name`` referenziert wird. Der Wert kann eine beliebige Zahl, Zeichenkette, Liste oder ein strukturiertes Objekt sein.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get( name )
Liefert den Wert, der unter der Referenzzeichenkette ```Name`` dauerhaft gespeichert ist. Gibt ```0`` zurück, wenn kein solcher Datensatz existiert.
<!--- suggest_end --->
