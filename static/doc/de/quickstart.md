*Die Übersetzung ist in Arbeit, bitte entschuldige Fehler.*

**microStudio** ist eine integrierte Entwicklungsumgebung für Videospiele.
Es enthält alle Werkzeuge die Du zum Erstellen Deines ersten Videospiels benötigen!

**microStudio** bietet alle folgenden Möglichkeiten:
* einen Sprite-Editor (Bilder, in Pixel-Art)
* einen Map-Editor (d.h. Karten oder Levels)
* einen Code-Editor zum Programmieren in microScript (einer einfachen aber mächtigen Sprache, basierend auf Lua), Python, Lua und JavaScript
* 100%iger Online-Betrieb der es Dir erlaubt Dein Spiel zu jedem Zeitpunkt der Entwicklung sofort zu testen
* die Möglichkeit das fertige oder in Entwicklung befindliche Spiel einfach auf Smartphones und Tablets zu installieren
* die Möglichkeit mit mehreren Personen an demselben Projekt zu arbeiten, mit sofortiger Synchronisation
* Community-Sharing-Funktionen die es Dir erlaubt die Projekte anderer zu erkunden, zu lernen, und alles was Du möchtest für Dein eigenes Projekt wiederzuverwenden

# Schnellstart

Im Bereich *Erkunden* kannst Du damit beginnen Projekte zu erforschen die von anderen Benutzern erstellt wurden.

Um mit dem Erstellen eines Spiels zu beginnen ist es empfehlenswert, aber nicht notwendig ein Konto zu erstellen. Wähle einen Spitznamen (vermeide die Verwendung
deines echten Namen), gib Deine E-Mail-Adresse ein (notwendig falls Du Dein Passwort vergessen hast, muss bestätigt werden um publizieren zu können) und los geht's!

## Erstes Projekt

Du kannst entweder ein neues, leeres Projekt im Bereich "Erstellen" anlegen oder ein bestehendes Projekt im Bereich "Erkunden" auswählen und auf die Schaltfläche "Klonen" klicken um Deine eigene Kopie zu erstellen und mit den Anpassungen zu beginnen.

### Code

Nachdem Du Dein Projekt erstellt hast befindest Du dich im Bereich "Code". Hier kannst Du mit der Programmierung beginnen. Versuch, den unten stehenden Code zu kopieren und einzufügen:

```
draw = function()
  screen.drawSprite ("icon",0,0,100,100)
end
```

### Ausführen

Klicke anschließend auf die Schaltfläche "Play" auf der rechten Seite des Bildschirms. Dein Programm startet und Du siehst, dass der obige Code das Projektsymbol in der Mitte des Bildschirms anzeigt. Ändere die Anzeigekoordinaten und die Größe
(die Ziffern 0 und 100), um zu sehen wie die Position und die Abmessungen des Symbols variieren.

### Ändern Sie in Echtzeit

Du kannst dieses erste Programm nun interaktiver gestalten, indem Du den folgenden Code kopierst und einfügst:

```
update = function()
  if keyboard.LEFT then x -= 1 end
  if keyboard.RIGHT then x += 1 end
  if keyboard.UP then y += 1 end
  if keyboard.DOWN then y -= 1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"#000")
  screen.drawSprite("icon",x,y,20,20)
end
```

Diesmal erlaubt Dir das Programm das Projektsymbol mit den Tastaturpfeilen zu verschieben. Die Bedeutung der Funktionen ```update``` und ```draw```, das Testen der Tastaturtasten mit ```keyboard```, das Zeichnen auf dem Bildschirm mit ```draw``` werden alle später in dieser Dokumentation ausführlich erklärt.

Du kannst auch in den Abschnitt *Sprites* gehen, auf das Element "icon" klicken und mit der Bearbeitung des Bildes beginnen. Wenn Du in den Abschnitt *Code* zurückkehrst, wirst Du sehen, dass Deine Änderungen sofort in dem gerade laufenden Programm berücksichtigt werden.

#Erkunden

Der Hauptbereich *Erkunden* ermöglicht es Dir Projekte zu entdecken die von anderen Benutzern erstellt wurden. Du kannst Beispiele für Spiele, wiederverwendbare Vorlagen, Sprite-Bibliotheken in verschiedenen Stilen und Themen finden. Wenn Du dich für ein bestimmtes Projekt interessierst kannst Du es klonen, d.h. eine vollständige Kopie davon erstellen die Du dann verändern und für Deine eigenen Zwecke wiederverwenden kannst.

Wenn Du zuvor eines Deiner Projekte im Bereich *Erstellen* geöffnet haben kannst Du jeden Sprite, oder jede Quelldatei, der Projekte die Du untersuchst in Dein aktuelles Projekt importieren. Auf diese Weise kannst Du aus den öffentlichen Projekten der Gemeinschaft Bilder oder Funktionen auswählen die Dich interessieren und diese für Deine eigenen Zwecke wiederverwenden.

# Ein Projekt erstellen

Du kannst ein leeres Projekt im Hauptbereich *Erstellen* erstellen. Dein Projekt hat mehrere Abschnitte:

* **Code**: Hier erstellst Du Deine Programme und führst Dein Projekt aus, um es zu testen und zu debuggen.
* **Sprites**: *Sprites* sind Bilder, die Du in diesem Abschnitt zeichnen und verändern kannst. Du kannst dich einfach auf sie beziehen, um sie anzuzeigen (auf dem Bildschirm einzufügen), wenn Du Dein Spiel programmierst.
* **Maps**: Karten sind Szenen oder Levels die Du erstellen kannst indem Du Deine Sprites auf einem Raster zusammensetzt. Du kannst sie einfach in Deinem Programm auf dem Bildschirm anzeigen
* **Doku**: Hier kannst Du eine Dokumentation für Dein Projekt schreiben. Das kann ein Dokument zum Spieldesign sein, ein Tutorial, eine Anleitung zur Wiederverwendung Deines Projektes als Vorlage usw.
* **Optionen**: Hier kannst Du verschiedene Optionen für Dein Projekt einstellen. Du kannst auch andere Benutzer einladen um mit Dir an Deinem Projekt zu arbeiten.
* **Publiziere**: Hier kannst Du Dein Projekt öffentlich machen. Vergiss nicht eine Beschreibung zu erstellen und Stichworte hinzuzufügen.

## Code

In diesem Bereich programmierst und testest Du Dein Projekt. Eine Quellcodedatei wird automatisch für Dein Projekt erstellt. Du kannst auch weitere hinzufügen, um die Funktionalitäten Deines Projekts in verschiedene Teilbereiche aufzuteilen.

Der Betrieb eines microStudio-Programms basiert auf Deiner Implementierung von 3 wesentlichen Funktionen:

* die Funktion ```init``, in der Du Deine Variablen und Objekte initialisierst
* die Funktion ```update``, in der Du Deine Objekte animierst und die Einträge abfragst
* die Funktion ```draw``, mit der Du auf dem Bildschirm zeichnest

<!--- help_start init = function --->
### Funktion ```init()```

Die init-Funktion wird nur einmal beim Start des Programms aufgerufen. Sie ist vor allem nützlich, um den Anfangszustand von globalen Variablen zu definieren, die im restlichen Programm verwendet werden können.
<!--- help_end --->
##### Beispiel
```
init = function()
  status = "willkommen"
  level = 1
  position_x = 0
  position_y = 0
end
```

### Funktion ```Update()```
<!--- help_start update = function --->
Die Funktion ```update``` wird maximal 60 Mal pro Sekunde aufgerufen. Diese Funktion ist der beste Ort, um die Logik und Physik des Spiels zu programmieren: Zustandsänderungen, Sprite- oder Feindbewegungen, Kollisionserkennung, Tastatur, Auswertung von Touch- oder Gamepad-Eingaben, etc.
<!--- help_end --->

##### Beispiel
```
update = function()
  if keyboard.UP then y += 1 end
end
```

Der obige Code erhöht den Wert der Variablen y alle 60stel Sekunden um 1, wenn die Taste ```UP`` auf der Tastatur gedrückt wird (Pfeil nach oben).

<!--- help_start draw = function --->
### Funktion ```draw()```
Die Funktion ```draw`` wird so oft aufgerufen, wie der Bildschirm aufgefrischt werden kann. Hier musst Du Deine Szene auf den Bildschirm zeichnen, zum Beispiel indem Du ein großes farbiges Rechteck ausfüllst (als Hintergrund) und dann ein paar Sprites oder Formen darauf zeichnest.
<!--- help_end --->

##### Beispiel
```
draw = function()
  // füllt den Bildschirm mit Schwarz
  screen.fillRect(0,0,screen.width,screen.height, "rgb(0,0,0)")
  // das Sprite "icon" in der Mitte des Bildschirms zeichnen, in der Größe 100x100
  screen.drawSprite("icon",0,0,100,100)
end
```

In den meisten Fällen wird ```draw``` 60 mal pro Sekunde aufgerufen. Aber manche Computer oder Tablets können ihre Bildschirme mehr als 60 Mal pro Sekunde aktualisieren. Es kann auch vorkommen, dass das Gerät, auf dem das Programm läuft, überlastet ist und den Bildschirm nicht 60 Mal pro Sekunde auffrischen kann. In diesem Fall wird die Funktion ```draw``` weniger oft aufgerufen. Das ist der Grund, warum ```update``` und ```draw``` zwei getrennte Funktionen sind: egal was passiert, ```update``` wird genau 60 Mal pro Sekunde aufgerufen; und wenn ```draw``` aufgerufen wird, ist es Zeit, den Bildschirm neu zu zeichnen.

###Ausführung

Im Bereich "Code" kannst Du im rechten Teil des Bildschirms Dein Programm in Aktion sehen, während Du weiterhin den Quellcode änderst. Um das Programm zu starten, klicke einfach auf die Schaltfläche <i class=" fas fa-play"></i>. Du kannst die Ausführung Deines Programms jederzeit unterbrechen, indem Du auf die Schaltfläche <i class="fas fa-pause"></i> klickst.

### Konsole

Während der Ausführung Deines Programms kannst Du die Konsole nutzen, um einfache Befehle in *microScript* auszuführen. So kannst Du z.B. einfach den Namen einer Variablen eingeben, um deren aktuellen Wert zu erfahren.

##### Beispiele
Den aktuellen Wert der Variable position_x erfahren
```
> position_x
34
>
```
Position ändern wert_x
```
> position_x = -10
-10
>
```
Rufe die Funktion draw() auf, um die Änderung von position_x und deren Auswirkung auf die Zeichnung auf dem Bildschirm zu sehen (unter der Annahme, dass die Ausführung pausiert ist)
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

Sprites sind Bilder, die sich auf dem Bildschirm bewegen können. Mit dem Zeichenwerkzeug in *microStudio* kannst Du Sprites erstellen, die dann im Programmcode verwendet werden können, um sie an der gewünschten Position und Größe auf dem Bildschirm anzuzeigen.

### Ein Sprite erstellen
Jedes Projekt verfügt über einen Standard-Sprite, genannt "Icon", das als Symbol der Anwendung dient. Du kannst neue Sprites erstellen, indem Du auf *Add a sprite* klickst. Du kannst sie nach Belieben umbenennen und ihre Größe in Pixeln (Breite x Höhe) festlegen.

### Zeichnungsoptionen
*microStudio* bietet die klassischen Zeichenfunktionen: Bleistift, Füllen, Radiergummi, Aufhellen, Abdunkeln, Weichzeichnen, Kontrast erhöhen, Sättigung ändern.

Das Pipettenwerkzeug kann jederzeit durch Drücken der [Alt]-Taste auf der Tastatur verwendet werden.

Die Optionen *Kachel* und *Symmetrie* helfen Dir, "wiederholbare" Sprites oder Sprites mit einer oder zwei Symmetrieachsen zu erstellen.

##### Tipp
Du kannst Bilddateien in Dein microStudio-Projekt importieren. Ziehe dazu PNG- oder JPG-Dateien per Drag & Drop in die Liste der Sprites.

## Karten
Eine Map in microStudio ist ein Raster zum Zusammenstellen von Sprites. Damit kannst Du ein Dekor zusammenstellen oder einen Level erstellen.

### Erstellen einer Map
Maps können genau wie Sprites erstellt und umbenannt werden. Es ist möglich, die Größe des Rasters (in Anzahl der Zellen) zu verändern. Jede Zelle kann mit einem Sprite bemalt werden. Es ist möglich, die Pixelgröße jeder Zelle zu ändern, die im Allgemeinen die Größe der Sprites widerspiegeln sollte, die zum Malen des Rasters verwendet werden.


## Einstellungen
Auf der Registerkarte *Optionen* kannst Du einige Elemente Deines Projekts anpassen.

### Optionen
Du kannst den Titel Deines Projekts festlegen, seinen Bezeichner (mit dem die URL, d.h. die Internetadresse, erstellt wird).

Du kannst festlegen, ob Dein Projekt im Hoch- oder Querformat verwendet werden soll. Diese Wahl wird berücksichtigt, wenn Deine Anwendung auf einem Smartphone oder Tablet installiert wird.

Du kannst auch die gewünschten Proportionen für den Anzeigebereich auf dem Bildschirm angeben. Dies ist eine Option, um sicherzustellen, dass die Anwendung immer gut aussieht, wenn sie auf Geräten mit Bildschirmen unterschiedlicher Proportionen installiert wird.

### Benutzer

Im Bereich *Benutzer* klannst Du Freunde zur Teilnahme an Deinem Projekt einladen. Du musst den Spitznamen des Freundes kennen, den Du einladen möchtest. Sobald ein Freund eingeladen ist, hat er, wenn er Deine Einladung annimmt, vollen Zugriff auf Dein Projekt und kann alle gewünschten Änderungen vornehmen (Sprites, Maps, Code usw. ändern, hinzufügen, löschen). Die Änderung der Projektoptionen und der Teilnehmerliste ist jedoch dem Projektbesitzer vorbehalten.

## Veröffentlichen

*microStudio* bietet einige Optionen zum Veröffentlichen oder Exportieren Deines Projekts. Du kannst Dein Projekt als eigenständige HTML5-App exportieren, um es online, auf Ihrer Website oder auf Spielevertriebsplattformen (z.B. itch.io, poki.com u.s.w.) zu verteilen. Außerdem gibt es die Option, Deine Spiele für Android, Windows, macOS und Linux zu exprtieren.
Du kannst Dein Projekt auch auf *microStudio* öffentlich machen, so dass die Community damit spielen, es kommentieren, den Quellcode sehen und die Assets erkunden kann...

### Projekt öffentlich machen

Um Dein Projekt für alle zugänglich zu machen (schreibgeschützt), klicke auf *publiziere*. Sobald Dein Projekt öffentlich ist, wird es auf der Registerkarte *Erkunden* der microStudio-Website angezeigt. Jeder Besucher kann das Spiel ausführen, den Quellcode und andere Komponenten Deines Projekts anzeigen und wiederverwenden.

Dein Spiel hat eine permanente URL in der Form ```https://microstudio.io/autor_spitzname/spiel_id/```. Du kannst den Link natürlich an jeden weitergeben oder Du kannst Dein Spiel in Deine bestehende Website einfügen, indem Du es in einen iframe einbettest.

### Exportieren nach HTML5

Um Dein komplettes Projekt in eine eigenständige HTML5-App zu exportieren, klicke auf *Zu HTML5 exportieren*. Dies löst den Download eines ZIP-Archivs aus, das alle Dateien enthält, die zum Ausführen Deines Spiels erforderlich sind: Sprites, einige JavaScript-Dateien, Icons und eine Haupt-HTML-Datei *index.html*. Dein Spiel kann lokal ausgeführt werden (Doppelklick auf die Datei index.html) oder Du kannst es auf Deine bestehende Website hochladen. Es ist auch bereit, auf vielen Online-Spiele-Vertriebsplattformen veröffentlicht zu werden, die HTML5-Spiele akzeptieren (wir schlagen im HTML5-Export-Panel ein paar vor).
