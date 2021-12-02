# Riferimento alle funzioni

## Visualizzare nello schermo ```screen```.

In *microStudio* lo schermo è rappresentato dall'oggetto predefinito "screen". Per visualizzare forme o immagini sullo schermo, basta chiamare funzioni (chiamate anche *metodi*) di questo oggetto. Per esempio:

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```
Il codice qui sopra definisce il colore del disegno come ``#FFF``` cioè bianco (vedi spiegazione più sotto). Poi disegna un rettangolo riempito di questo colore, centrato sulle coordinate 0.0 dello schermo (cioè il centro dello schermo), di larghezza 100 e altezza 100.

Per facilitare il vostro lavoro, *microStudio* scala automaticamente le coordinate dello schermo, indipendentemente dalla risoluzione effettiva del display. Per convenzione, la dimensione più piccola dello schermo (larghezza in modalità verticale, altezza in modalità orizzontale) è 200. Essendo il punto di origine (0,0) il centro dello schermo, la dimensione più piccola è quindi graduata da -100 a +100. La dimensione più grande sarà graduata per esempio da -178 a +178 (schermo classico 16:9), oppure da -200 a +200 (schermo 2:1, smartphone più lunghi e recenti) ecc.


![Coordinate dello schermo](/doc/img/screen_coordinates.png "Coordinate dello schermo")

<small>*Sistema di coordinate di disegno su uno schermo 16:9 in modalità verticale e in modalità orizzontale*</small>


### Definire un colore
<!--- suggest_start screen.setColor --->
##### screen.setColor( colore)

Definisce il colore da usare per le sucessive chiamate alle funzioni di disegno.

<!--- suggest_end --->

Il colore è definito da una stringa di caratteri, quindi tra virgolette "". È generalmente descritto dalle sue componenti RGB, cioè una miscela di Rosso, Verde e Blu. Sono possibili diversi tipi di classificazione:

* "rgb(255,255,255)": (rgb per rosso, verde, blu). Qui viene indicato un valore per il rosso, il verde e il blu che varia tra 0 e 255 massimo. "rgb(255,255,255)" dà il bianco, "rgb(255,0,0)" dà il rosso vivo, "rgb(0,255,0)" dà il verde ecc. Per scegliere più facilmente un colore durante la codifica, clicca sul tuo colore rgb e tieni premuto il tasto Control per visualizzare il selettore di colori.
* "#FFF" o "#FFFFFF": questa notazione usa l'esadecimale, per descrivere le 3 componenti del rosso, del verde e del blu. L'esadecimale è un sistema di notazione numerica in "base 16", cioè utilizzando 16 cifre, da 0 a 9 quindi da A a F.
* esistono altre notazioni, che non sono descritte qui.

### Cancella lo schermo
<!--- suggest_start screen.clear --->
##### screen.clear(colore)
Cancella lo schermo (lo riempie con il colore fornito, o con il nero se nessun colore è passato come argomento).
<!--- suggest_end --->

### Disegno di forme
<!--- suggest_start screen.fillRect --->
##### screen.fillRect( x, y, larghezza, altezza, colore)
Disegna un rettangolo riempito di colore, centrato sulle coordinate x e y, con la larghezza e l'altezza specificate. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRoundRect --->
##### screen.fillRoundRect( x, y, larghezza, altezza, raggio, colore)
Disegna un rettangolo arrotondato riempito di colore, centrato sulle coordinate x e y, con la larghezza, l'altezza e il raggio di curvatura specificati. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRound --->
##### screen.fillRound( x, y, larghezza, altezza, colore)
Disegna una forma rotonda solida (un disco o un'ellisse a seconda delle dimensioni utilizzate), centrata nelle coordinate x e y, con la larghezza e l'altezza specificate. Il colore di riempimento è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

<!--- suggest_start screen.drawRect --->
##### screen.drawRect( x, y, larghezza, altezza, colore)
Disegna il contorno di un rettangolo, centrato sulle coordinate x e y, con la larghezza e l'altezza specificate. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRoundRect --->
##### screen.drawRoundRect( x, y, larghezza, altezza, raggio, colore)
Disegna un contorno di rettangolo arrotondato, centrato sulle coordinate x e y, con la larghezza, l'altezza e il raggio di curvatura specificati. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRound --->
##### screen.drawRound( x, y, larghezza, altezza, colore)
Disegna il contorno di una forma rotonda, centrata alle coordinate x e y, con la larghezza e l'altezza specificate. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

<!--- suggest_start screen.drawLine --->
##### screen.drawLine( x1, y1, x2, y2, colore )
Disegna una linea che unisce i punti (x1,y1) e (x2,y2). Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore usato.
<!--- suggest_end --->

<!--- suggest_start screen.fillPolygon --->
##### screen.fillPolygon( x1, y1, x2, y2, x3, y3, ... , colore )
Riempie un poligono definito dall'elenco di coordinate di punti passati come argomenti. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

La funzione può anche accettare un array come primo argomento e un colore come secondo argomento. In tal caso, ci si aspetta che l'array contenga le coordinate dei punti come in questo esempio: ```screen.fillPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon( x1, y1, x2, y2, x3, y3, ... , colore )
Disegna un contorno di poligono, definito dall'elenco di coordinate di punti passati come argomenti. Il colore è opzionale, se viene omesso, verrà riutilizzato l'ultimo colore utilizzato.
<!--- suggest_end --->

La funzione può anche accettare un array come primo argomento e un colore come secondo argomento. In tal caso, ci si aspetta che l'array contenga le coordinate dei punti come in questo esempio: ```screen.drawPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolyline --->
##### screen.drawPolyline( x1, y1, x2, y2, x3, y3, ... , colore )
Equivalente a `drawPolygon`, eccetto che il percorso di disegno non sarà chiuso automaticamente.
<!--- suggest_end --->

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth( larghezza )
Imposta la larghezza della linea per tutte le successive operazioni di disegno di linee (drawLine, drawPolygon, drawRect ecc.). La larghezza di linea predefinita è 1.
<!--- suggest_end --->

<!--- suggest_start screen.setLineDash --->
##### screen.setLineDash( array_di_valori )
Imposta lo stile del tratto di linea per tutte le successive operazioni di disegno di linee (drawLine, drawPolygon, drawRect ecc.). L'argomento deve essere un array di valori positivi, che definiscono la lunghezza delle linee e degli spazi vuoti.

#### esempio
```
screen.setLineDash([2,4])
```
<!--- suggest_end --->


### Visualizza sprites e mappe

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite( sprite, x, y, larghezza, altezza)

Disegna sullo schermo uno degli sprite che hai creato nella sezione *Sprites*. Il primo parametro è una stringa che corrisponde al nome dello sprite da visualizzare, per esempio ``"icon"``. Poi seguono le coordinate x,y dove visualizzare lo sprite (lo sprite sarà centrato su queste coordinate). Poi la larghezza e l'altezza della visualizzazione.
<!--- suggest_end --->

```
screen.drawSprite("icon",0,50,50,50)
```
L'altezza può essere omessa, come nell'esempio precedente. In questo caso l'altezza sarà calcolata in base alla larghezza e alle proporzioni dello sprite.

##### Sprites animati

Gli sprite animati disegneranno automaticamente il frame corretto secondo le impostazioni dell'animazione. È possibile impostare il fotogramma corrente di uno sprite (ad esempio per riavviare l'animazione) in questo modo:

```
sprites["sprite1"].setFrame(0) // 0 è l'indice del primo frame
```

Potete anche disegnare un fotogramma di animazione specifico del vostro sprite, aggiungendo "." e l'indice del fotogramma richiesto:

```
screen.drawSprite("sprite1.0",0,50,50,50)
```

L'esempio qui sopra disegna il fotogramma 0 dello sprite "sprite1".

<!--- suggest_start screen.drawSpritePart --->
##### screen.drawSpritePart( sprite, part_x, part_y, part_width, part_height, x, y, larghezza, altezza)

Disegna parte di uno sprite sullo schermo. Il primo parametro è una stringa che corrisponde al nome dello sprite da visualizzare, per esempio ```"icon"```. I prossimi 4 parametri definiscono la coordinata di un sotto-rettangolo dello sprite da disegnare effettivamente sullo schermo (la coordinata 0,0 è l'angolo in alto a sinistra dello sprite). Gli ultimi 4 parametri sono gli stessi della funzione ```drawSprite```.
<!--- suggest_end --->

```
screen.drawSpritePart("icon",4,4,8,8,0,50,50,50)
```
L'altezza può essere omessa, come nell'esempio precedente. In questo caso l'altezza sarà calcolata in base alla larghezza e alle proporzioni della parte di sprite.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap( map , x , y , larghezza , altezza )
Disegna sullo schermo una delle mappe che hai creato nella sezione *Maps*. Il primo parametro è una stringa che corrisponde al nome della mappa da visualizzare,
per esempio ```mappa1```. Poi seguono le coordinate x,y dove visualizzare la mappa (la mappa sarà centrata su queste coordinate). In sucessione poi, la larghezza e l'altezza della visualizzazione.
<!--- suggest_end --->

```
screen.drawMap("map1",0,0,300,200)
```

### Display text

<!--- suggest_start screen.drawText --->
##### screen.drawText( testo, x, y, dimensione, &lt;colore&gt; )
Disegna un testo sullo schermo. Il primo parametro è il testo da visualizzare, poi le coordinate x e y dove il testo sarà centrato, poi la dimensione (altezza) del testo. L'ultimo parametro è il colore del disegno, può essere omesso, in questo caso verrà riutilizzato l'ultimo colore definito.
<!--- suggest_end --->

```
screen.drawText("Ciao!",0,0,30, "#FFF")
```

<!--- suggest_start screen.drawTextOutline --->
##### screen.drawTextOutline( text, x, y, size, &lt;colore&gt; )
Disegna il contorno del testo. Il disegnare il contorno di un colore diverso può essere fatto dopo un ```drawText``` per aumentare il contrasto del testo stesso. Lo spessore del contorno può essere impostato con ```screen.setLineWidth```.
<!--- suggest_end --->

```
screen.drawTextOutline("Ciao!",0,0,30, "#F00")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont( font_name )
Definisce il font da usare per le future chiamate a ```drawText```.

**Fonts disponibili nella versione corrente**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->

```
screen.setFont("BitCell")
```

**Suggerimento**: la variabile globale ```fonts``` è un array di tutti i font disponibili in microStudio

<!--- suggest_start screen.loadFont --->
##### screen.loadFont( font_name )
Avvia il caricamento di un font. Utile insieme a `screen.isFontReady`.
<!--- suggest_end --->

```
screen.loadFont("DigitalDisco")
```
<!--- suggest_start screen.isFontReady --->
##### screen.isFontReady( font_name )
Restituisce 1 (vero) se il dato font è caricato e pronto per essere usato. Assicurati di chiamare prima `screen.loadFont` o il tuo font potrebbe non essere mai caricato.
<!--- suggest_end --->
Potete omettere l'argomento della funzione, nel qual caso controlla se il font corrente è caricato e pronto per essere usato (font di default, o un altro font che avete impostato con la vostra ultima chiamata a `screen.setFont( font_name )``).

```
if screen.isFontReady() then
  // possiamo usare il font predefinito
  screen.drawText("MIO TESTO",0,0,50)
end

screen.loadFont("DigitalDisco") // avvia il caricamento del font DigitalDisco

if screen.isFontReady("DigitalDisco") then  // controlla che DigitalDisco sia caricato
  screen.setFont("DigitalDisco") // imposta il font DigitalDisco per la scrittura
  screen.drawText("QUALCHE ALTRO TESTO",0,50,20) // scrivi il testo con il font caricato
end
```

<!--- suggest_start screen.textWidth --->
##### screen.textWidth( testo, dimensione )
Restituisce la larghezza del testo impostato quando verrà disegnato sullo schermo con la dimensione data.
<!--- suggest_end --->

```
larghezza = screen.textWidth( "Il mio testo", 20 )
```

### Parametri di disegno
<!--- suggest_start screen.setAlpha --->
##### screen.setAlpha(opacità)
Definisce il livello di opacità generale per tutte le funzioni di disegno richiamate in seguito. Il valore 0 equivale a una trasparenza totale (elementi invisibili) e il valore 1 corrisponde a un'opacità totale (gli elementi disegnati nascondono totalmente ciò che sta sotto).
<!--- suggest_end --->

```
screen.setAlpha(0.5) // i prossimi elementi disegnati saranno semi-trasparenti
```

Quando usate questa funzione per disegnare alcuni elementi con un po' di trasparenza, non dimenticate di resettare il parametro alfa al suo valore predefinito quando non è più necessario:

```
screen.setAlpha(1) // il valore predefinito, opacità totale
```

---

<!--- suggest_start screen.setLinearGradient --->
##### screen.setLinearGradient(x1, y1, x2, y2, colore1, colore2)
Definisce il colore del disegno come un gradiente lineare di colore, cioè un gradiente. ```x1 e y1``` sono le coordinate del punto di partenza del gradiente. ```x2 e y2``` sono le coordinate del punto finale del gradiente. ```colore1``` è il colore di partenza (vedi ```setColor``` per i valori del colore). ```colore2``` è il colore di arrivo.
<!--- suggest_end --->

```
screen.setLinearGradient(0,100,0,-100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
L'esempio precedente crea un gradiente dal bianco al rosso, dall'alto al basso dello schermo, e poi riempie lo schermo con questo gradiente.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient( x, y, raggio, colore1, colore2)
Definisce il colore del disegno come un gradiente radiale di colore, cioè un gradiente a forma di cerchio. ```x``` e ```y``` sono le coordinate del centro del cerchio. ```raggio``` è il raggio del cerchio. ```colore1``` è il colore al centro del cerchio (vedi ```setColor``` per i valori dei colori). ```colore2``` è il colore sul perimetro del cerchio.
<!--- suggest_end --->

```
screen.setRadialGradient(0,0,100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
L'esempio precedente crea un gradiente di bianco al centro dello schermo, verso il rosso sui bordi dello schermo, poi riempie lo schermo con questo gradiente.

---

<!--- suggest_start screen.setTranslation --->
##### screen.setTranslation( tx, ty )
Definisce la traslazione delle coordinate dello schermo per le successive operazioni di disegno.
<!--- suggest_end --->

```
screen.setTranslation(50,50)
screen.fillRect(0,0,20,20)
```
Il rettangolo nell'esempio precedente sarà disegnato con un offset di 50,50

Non dimenticate di resettare la traslazione a 0,0 ogni volta che avete bisogno di interrompere la traslazione delle sucessive operazioni di disegno.
```
screen.setTranslation(0,0)
```

<!--- suggest_start screen.setDrawRotation --->
##### screen.setDrawRotation(angolo)
Definisce un angolo di rotazione per le prossime operazioni di disegno. L'angolo è espresso in gradi.
<!--- suggest_end --->

```
screen.setDrawRotation(45)
screen.drawSprite ("icon",0,0,100)
```
L'esempio qui sopra mostra l'icona del progetto, inclinata di 45 gradi.

Non dimenticare di resettare l'angolo di rotazione a 0 dopo averlo usato!
```
screen.setDrawRotation(0) // ripristina l'angolo di rotazione al suo valore predefinito
```

<!--- suggest_start screen.setDrawScale --->
##### screen.setDrawScale( x, y)
Definisce un fattore di scala per disegnare i prossimi elementi sullo schermo. ```x``` definisce il fattore di scala sull'asse ```x``` e ```y``` il fattore di scala sull'asse y. Un valore di 2 visualizzerà i disegni sucessivi con il doppio della dimensione. Un valore di -1 permette, per esempio, di capovolgere uno sprite (specchio), orizzontalmente (x) o verticalmente (y).
<!--- suggest_end --->

```
screen.setDrawScale(1,-1)
screen.drawSprite ("icon",0,0,100)
```
L'esempio qui sopra mostra l'icona del progetto, capovolta verticalmente.

Non dimenticare di resettare il fattore di scala a (1,1) dopo averlo usato!
```
screen.setDrawScale(1,1) // ripristina il fattore di scala al suo valore predefinito.
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setDrawAnchor( ancoraggio_x, ancoraggio_y )
Per impostazione predefinita, tutte le operazioni di disegno considerano le vostre coordinate come il centro della forma da disegnare. Puoi cambiare questo comportamento chiamando
`screen.setDrawAnchor( ancoraggio_x, ancoraggio_y )`per specificare un punto di ancoraggio diverso per disegnare le forme.

<!--- suggest_end --->
Sull'asse x, il punto di ancoraggio può essere impostato a -1 (lato sinistro della tua forma), 0 (centro della tua forma), 1 (lato destro della tua forma) o qualsiasi valore intermedio. Sull'asse y, il punto di ancoraggio può essere impostato a -1 (lato inferiore della tua forma), 0 (centro della tua forma), 1 (parte superiore della tua forma) o qualsiasi valore intermedio.

Esempi
```
screen.setDrawAnchor(-1,0) // utile per allineare il testo a sinistra
screen.setDrawAnchor(-1,-1) // le vostre coordinate di disegno sono ora interpretate come l'angolo inferiore sinistro della vostra forma.
screen.setDrawAnchor(0,0) // valore predefinito, tutte le forme saranno disegnate centrate sulle vostre coordinate
```

<!--- suggest_start screen.setBlending --->
##### screen.setBlending( blending )
Definisce come le successive operazioni di disegno saranno composte con l'immagine sottostante, già disegnata. Può essere impostato su `normal` (normale) o `additive` (additivo).

Puoi anche usare qualsiasi modalità di composizione definita nella specifica HTML5 Canvas con `setBlending`, per riferimento vedi https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation

<!--- suggest_start screen.width --->
##### screen.width
Il campo "width" dell'oggetto schermo ha come valore la larghezza attuale dello schermo (sempre 200 se lo schermo è in modalità verticale, vedi *coordinate schermo*).
<!--- suggest_end --->

<!--- suggest_start screen.height --->
##### screen.height
Il campo "altezza" dell'oggetto schermo ha come valore l'altezza attuale dello schermo (sempre 200 se lo schermo è in modalità paesaggio, vedi *coordinate schermo*).
<!--- suggest_end --->

<!--- suggest_start screen.setCursorVisible --->
##### screen.setCursorVisible( visibile )
Potete usare questa funzione per mostrare o nascondere il cursore del mouse.
<!--- suggest_end --->


## Ingressi, controllo

Per rendere il vostro programma interattivo, avete bisogno di sapere se e dove l'utente preme un tasto sulla tastiera, il joystick, o i tocchi del touch screen. *microStudio* ti permette di conoscere lo stato di queste diverse interfacce di controllo, tramite gli oggetti ```keyboard``` (per la tastiera), ```touch``` (per il touch screen / mouse), ```mouse``` (per il puntatore del mouse / touch screen) ```gamepad``` (per il controller o joypad).

##### Nota
L'oggetto ```system.inputs``` contiene informazioni utili su quali metodi di input sono disponibili sul sistema host:

|Campo|Valore|
|-|-|
|system.inputs.keyboard|1 se si rileva che il sistema abbia una tastiera fisica, 0 altrimenti|
|system.inputs.mouse|1 se il sistema ha un mouse, 0 altrimenti|
|system.inputs.touch|1 se il sistema ha un touch screen, 0 altrimenti|
|system.inputs.gamepad|1 se c'è almeno 1 gamepad collegato al sistema, 0 altrimenti (il gamepad appare collegato solo quando l'utente ha eseguito un'azione su di esso)|


### Ingressi da tastiera
<!--- suggest_start keyboard --->
Gli input da tastiera possono essere testati usando l'oggetto ```keyboard```.
<!--- suggest_end --->

##### esempio
```
if keyboard.A allora
  // il tasto A è attualmente premuto
end
```

Notate che mentre provate il vostro progetto, affinché gli eventi della tastiera si propaghino fino alla finestra di esecuzione, è necessario cliccare prima su di essa.

Il codice qui sotto mostra l'ID di ogni tasto della tastiera premuto. Può esservi utile per stabilire l'elenco degli identificatori di cui avrete bisogno per il vostro progetto.

```
draw = function()
  screen.clear()
  local y = 80
  for key in keyboard
    if keyboard[key] then
      screen.drawText(key,0,y,15, "#FFF")
      y -= 20
    end
  end
end
```

*microStudio* crea per voi alcuni utili codici generici, come UP, DOWN, LEFT e RIGHT che reagiscono sia ai tasti freccia che a ZQSD / WASD a seconda del layout della vostra tastiera.

Per testare i caratteri speciali come +, - o anche le parentesi, devi usare la seguente sintassi: ```keyboard["("]```, ```keyboard["-"]```.

##### Verifica se un tasto è stato appena premuto
Nel contesto della funzione ```update()```, potete controllare se un tasto della tastiera è stato appena premuto dall'utente usando ```keyboard.press.<KEY>```.

Esempio:

```
if keyboard.press.A then
  // Fai qualcosa una volta, proprio quando l'utente preme il tasto A
end
```

##### Verificare se un tasto è stato appena rilasciato
Nel contesto della funzione ```update()```, potete controllare se un tasto della tastiera è stato appena rilasciato dall'utente usando ```keyboard.release.<KEY>```.

Esempio:

```
if keyboard.release.A then
  // Fai qualcosa una volta, proprio quando l'utente rilascia il tasto A
end
```


<!--- suggest_start touch --->
### Ingressi touch

Gli input tattili possono essere testati con l'oggetto "touch" (che riporta anche lo stato del mouse).
<!--- suggest_end --->

|Campo|Valore|
|-|-|
|touch.touching|è vero se l'utente sta toccando lo schermo, falso se non lo sta toccando|
|touch.x|Posizione x in cui lo schermo viene toccato|
|touch.y|Posizione y in cui lo schermo viene toccato|
|touch.touches|Nel caso in cui si debba tener conto di più punti di contatto simultaneamente, touch.touches è una lista dei punti di contatto attualmente attivi|
|touch.press|vero se un dito ha appena iniziato a toccare lo schermo|
|touch.release|vero se il dito ha appena rilasciato lo schermo|

```
if touch.touching
  // l'utente sta toccando lo schermo
else
 // l'utente non sta toccando lo schermo
end
```

```
draw = function()
  for t in touch.touches
    screen.drawSprite("icon",t.x,t.y,50)
  end
end
```
L'esempio qui sopra mostra l'icona del progetto in ogni punto di contatto attivo sullo schermo.  

<!--- suggest_start mouse --->
### Ingressi del mouse

Gli input del mouse possono essere testati con l'oggetto ```mouse``` (che riporta anche eventi touch).
<!--- suggest_end --->

|Campo|Valore|
|-|-|
|mouse.x|Posizione x del puntatore del mouse|
|mouse.y|Posizione y del puntatore del mouse|
|mouse.pressed|1 se un qualsiasi pulsante del mouse è premuto, 0 altrimenti|
|mouse.left|1 se il tasto sinistro del mouse è premuto, 0 altrimenti|
|mouse.right|1 se il tasto destro del mouse è premuto, 0 altrimenti|
|mouse.middle|1 se il pulsante centrale del mouse è premuto, 0 altrimenti|
|mouse.press|vero se un pulsante del mouse è stato appena premuto|
|mouse.release|vero se un pulsante del mouse è stato appena rilasciato|

### Ingressi del controller (gamepad)
<!--- suggest_start gamepad --->
Lo stato dei pulsanti e dei joystick del controller (gamepad) può essere testato utilizzando l'oggetto "gamepad".
<!--- suggest_end --->

##### esempio
```
if gamepad.UP then y += 1 end
```

**Suggerimento**: Per ottenere una lista completa dei campi dell'oggetto "gamepad", digitate semplicemente "gamepad" nella console quando il vostro programma è in esecuzione.

Come per la pressione dei tasti della tastiera, puoi usare ```gamepad.press.<BUTTON>``` per controllare se un pulsante è stato appena premuto o ```gamepad.release.<BUTTON>``` per controllare se un pulsante è stato appena rilasciato.

## Suoni

*microStudio* attualmente vi permette di riprodurre suoni e musica che avete importato nel vostro progetto (come file WAV e MP3) o di creare suoni programmaticamente usando il tradizionale *beeper*.

### Riproduci un suono
<!--- suggest_start audio.playSound --->
##### audio.playSound( nome, volume, intonazione, panoramica, ripetizione )
Riproduce il suono dato, con le impostazioni di riproduzione opzionali date.
<!--- suggest_end --->

##### argomenti
|Argomento|Descrizione|
|-|-|
|nome|Il nome del suono (dalla scheda sounds del tuo progetto) da riprodurre|
|volume|[opzionale] Il volume di uscita per questa riproduzione sonora, che va da 0 a 1|
|intonazione|[opzionale] Il tono di uscita per questa riproduzione del suono, 1 è il tono predefinito|
|panoramica|[opzionale] L'impostazione di pan per questa riproduzione del suono, che va da -1 (sinistra) a 1 (destra)|
|ripetizione|Impostare a 1 (true) se volete che il suono venga ripetuto all'infinito|

La chiamata alla funzione restituisce un oggetto. Questo oggetto vi permette di controllare le impostazioni di riproduzione mentre il suono viene riprodotto:

##### esempio
```
mio_suono = audio.playSound("nomedelsuono")
mio_suono.setVolume(0.5)
```

|Funzioni di controllo|Descrizione|
|-|-|
|mio_suono.setVolume(volume)|Cambia il volume di riproduzione del suono (valore che va da 0 a 1)|
|mio_suono.setPitch(intonazione)|Cambia l'intonazione del suono (1 è il pitch predefinito)|
|mio_suono.setPan(panoramica)|Cambia l'impostazione di panoramicità stereofonica del suono (valore che va da -1 a 1)|
|mio_suono.stop()|Ferma la riproduzione di quel suono|

### Riproduci musica
<!--- suggest_start audio.playMusic --->
##### audio.playMusic( nome, volume, ripetizione )
Riproduce la musica data, con le impostazioni di riproduzione opzionali date.
<!--- suggest_end --->

##### argomenti
|Argomento|Descizione|
|-|-|
|nome|Il nome della musica (dalla scheda musicale del tuo progetto) da riprodurre|
|volume|[opzionale] Il volume di uscita per questa riproduzione musicale, che va da 0 a 1|
|ripetizione|Impostare a 1 (true) se vuoi che la musica vada in loop all'infinito|

La chiamata alla funzione restituisce un oggetto. Questo oggetto vi permette di controllare le impostazioni di riproduzione mentre la musica viene riprodotta:

##### esempio
```
mia_musica = audio.playMusic("nomedellamusica")
mia_musica.setVolume(0.5)
```

|Funzioni di controllo|Descizione|
|-|-|
|mia_musica.setVolume(volume)|Cambia il volume di riproduzione della musica (valore che va da 0 a 1)|
|mia_musica.stop()|Ferma la riproduzione di quella musica|
|mia_musica.play()|Riprende la riproduzione se l'hai fermata prima|
|mia_musica.getPosition()|Ritorna la posizione corrente di riproduzione in secondi|
|mia_musica.getDuration()|Ritorna la durata totale della musica in secondi|


<!--- suggest_start audio.beep --->
### audio.beep
Riproduce un suono descritto dalla stringa passata come parametro.

```
audio.beep("C E G")
```
<!--- suggest_end --->
Esempio più dettagliato e spiegazioni nella tabella sottostante:
```
"saw duration 100 tempo 220 span 50 volume 50 loop 4 C2 C F G G G F end"
```

|Comando|Descrizione|
|-|-|
|saw|Indica il tipo di generatore di suono (colore del suono), valori possibili:saw (dente di sega), sine (sinosuidale), square (onda quadra), noise (rumore)|
|duration|La durata seguita da un numero di millisecondi indica la durata delle note|
|tempo|seguito da un numero di note al minuto, indica il tempo|
|span|Seguito da un numero tra 1 e 100, indica la percentuale di mantenimento di ogni nota|
|volume|seguito da un numero tra 0 e 100, imposta il volume|
|C| oppure D, E, F ecc. indica una nota da suonare. È possibile indicare anche l'ottava, ad esempio C5 per il C della quinta ottava della tastiera|
|loop|seguito da un numero, indica il numero di volte che la seguente sequenza dovrà essere ripetuta. La sequenza termina con la parola chiave ```end``` esempio: ```loop 4 C4 E G end```; il numero 0 significa che il ciclo deve essere ripetuto indefinitamente|

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Annulla tutti i suoni riprodotti dal *beeper*. Utile per silenziare il suono dopo aver avviato dei loop musicali.
<!--- suggest_end --->

## Metodi per gli sprite
Il tuo programma può accedere agli sprites del tuo progetto, che sono memorizzati in un oggetto predefinito ```sprites```:

```
mysprite = sprites["icon"]
```

Potete quindi accedere a diversi campi e metodi del vostro sprite:

|campo/metodo|descrizione|
|-|-|
|```miosprite.width```|La larghezza dello sprite in pixel|
|```miosprite.height```|L'altezza dello sprite in pixel|
|```miosprite.ready```|1 quando lo sprite è completamente caricato, 0 altrimenti|
|```miosprite.name```|Nome dello sprite|

*Nota: altri campi e metodi nativi potrebbero sembrare disponibili quando si ispeziona un oggetto sprite dalla console. Tali campi e metodi non documentati rischiano di essere tolti in futuro, quindi non fate troppo affidamento su di essi!*

## Metodi di mappa
Il tuo programma può accedere alle mappe del tuo progetto, che sono memorizzate in un oggetto predefinito ```maps```:

```
miamappa = maps["map1"]
```

Potete quindi accedere a diversi campi e metodi della vostra mappa:

|campo/metodo|descrizione|
|-|-|
|```miamappa.width```|La larghezza della mappa in celle|
|```miamappa.height```|L'altezza della mappa in celle|
|```miamappa.block_width```|La larghezza della cella della mappa in pixel|
|```miamappa.block_height```|L'altezza della cella della mappa in pixel|
|```miamappa.ready```|1 quando la mappa è completamente caricata, 0 altrimenti|
|```miamappa.name```|Nome della mappa|
|```miamappa.get(x,y)```|Restituisce il nome dello sprite nella cella (x,y); l'origine delle coordinate è (0,0), situata in basso a sinistra della mappa. Restituisce 0 se la cella è vuota|
|```miamappa.set(x,y,name)```|Imposta un nuovo sprite nella cella (x,y); l'origine delle coordinate è (0,0), situata in basso a sinistra della mappa. Il terzo parametro è il nome dello sprite.
|```miamappa.clone()```|restituisce una nuova mappa che è una copia completa di miamappa.|

*Nota: altri campi e metodi nativi possono attualmente sembrare disponibili quando si ispeziona un oggetto mappa nella console. Tali campi e metodi non documentati rischiano di essere tolti in futuro, quindi non fate troppo affidamento su di essi!*

## Sistema
L'oggetto ```system``` permette di accedere alla funzione ```time``` che restituisce il tempo trascorso in millisecondi (dal 1° gennaio 1970). Ma soprattutto, invocata in vari momenti, permette di misurare le differenze di tempo.

<!--- suggest_start system.time --->
### system.time()
Restituisce il tempo trascorso in millisecondi (dal 1 gennaio 1970)
<!--- suggest_end --->

## Storage
L'oggetto ```storage``` permette la memorizzazione permanente dei dati della tua applicazione. Puoi usarlo per memorizzare i progressi degli utenti, i punteggi più alti o altre informazioni di stato nel tuo gioco o progetto.

<!--- suggest_start storage.set --->
### storage.set( nome , valore )
Memorizza il valore in modo permanente, referenziato dalla stringa ```nome```. Il valore può essere un qualsiasi numero, stringa, lista o oggetto strutturato.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get( name )
Restituisce il valore registrato in modo permanente sotto la stringa di riferimento ```nome```. Restituisce ```0``` quando tale record non esiste.
<!--- suggest_end --->
