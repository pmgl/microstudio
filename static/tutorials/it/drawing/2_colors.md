<!-- 1. Forme (Rect, Round, RoundRect) -->
<!-- 2. Colori -->
<!-- 3. Linee, Poligoni -->
<!-- 4. Testo -->
<!-- 5. Sprite e mappe -->
<!-- 6. Gradienti -->
<!-- 7. Rotazione, scalatura, trasparenza -->


# Tutorial

:project Tutorial: Disegno

## Colori

:position 50,50,40,40

### Colori

Lo schermo del tuo computer può visualizzare quasi tutti i colori mescolando un po' di rosso, un po' di
Verde e un po' di Blu. Lo chiamiamo quindi il modello di colore RGB. In microStudio, un colore
è dato come un valore di stringa, che può essere conforme a diversi formati. Cominciamo
con questo:

```
screen.fillRect(0,0,50,50,"rgb(255,255,255)")
```

Il colore usato sopra ```"rgb(255,255,255)"``` è il bianco, espresso come colore RGB.
Il valore per rosso, verde e blu è impostato a 255, che è il valore massimo accettato
(i valori accettati vanno da 0 a 255). Se massimizzi e mischi il rosso, il verde e il blu, ti ritrovi
con il colore bianco.

## Colori

### Colori RGB

Prova a cambiare i valori di rosso, verde e blu manualmente e vedi i colori che ottieni. Qui
sono alcuni esempi:

```
// massimo rosso e zero verde e blu; questo è il rosso pieno
screen.fillRect(0,0,50,50,"rgb(255,0,0)") 
```

```
// massimo rosso e verde dà il giallo puro
screen.fillRect(0,0,50,50,"rgb(255,255,0)") 
```

```
// rosso = verde = blu vi darà una tonalità di grigio
screen.fillRect(0,0,50,50,"rgb(128,128,128)") 
```

Prova altri colori! Puoi anche usare il color picker (tieni premuto CTRL) e vedere come
il colore scelto si traduce in codice.

## Colori

### Omettere il colore

microStudio vi permette di omettere i colori in tutte le vostre chiamate di disegno. Quando omesso, riutilizzerà
il colore che è stato usato per ultimo. Puoi anche chiamare ```setColor``` per definire un nuovo colore da usare per le successive
chiamate di disegno.

```
screen.setColor("rgb(0,255,255)")  // ciano
screen.fillRect(0,0,50,50)
```

## Trasparenza

### Trasparenza

Puoi rendere i tuoi colori parzialmente trasparenti. A seconda del valore di opacità, il contenuto
che è già stato disegnato sotto la tua forma rimarrà parzialmente visibile. Il valore di opacità
può variare da 0 (completamente trasparente) a 1 (completamente opaco). Ecco un esempio di un mezzo
bianco opaco:

```
screen.setColor("rgba(255,255,255,0.5)")
```

Notate la "a" aggiunta facendo "rgba" e il parametro aggiuntivo dopo i tre componenti del colore.
"a" sta per "canale alfa" che è il nome del canale di trasparenza quando un'immagine
è codificata.

## Altri formati

### Altri formati

microStudio accetta tutti i formati di colore HTML/CSS. Significa che puoi usare RGB hex (come ```"#FF00FF"```),
HSL, ecc. Questo non sarà trattato in questo tutorial però, se vuoi saperne di più
puoi consultare questa pagina:

https://developer.mozilla.org/en-US/docs/Web/CSS/color_value





