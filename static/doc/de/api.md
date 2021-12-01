# Funktionsreferenz

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
##### screen.setLinearGradient(x1, y1, x2, y2, color1, color2)
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

Genauso wie für Tastendrücke können Sie mit `gamepad.press.<BUTTON>` prüfen, ob eine Taste gerade gedrückt wurde oder mit `gamepad.release.<BUTTON>`, ob eine Taste gerade losgelassen wurde.

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
