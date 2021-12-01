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
