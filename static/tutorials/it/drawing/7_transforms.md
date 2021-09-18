<!-- 1. Forme (Rect, Round, RoundRect) -->
<!-- 2. Colori -->
<!-- 3. Linee, Poligoni -->
<!-- 4. Testo -->
<!-- 5. Sprite e mappe -->
<!-- 6. Gradienti -->
<!-- 7. Rotazione, scalatura, trasparenza -->


# Tutorial

:project Tutorial: Disegno

## Trasparenza

:position 50,50,40,40

### Trasparenza

Puoi impostare le tue operazioni di disegno per avere una certa trasparenza usando
la funzione ```screen.setAlpha```. Usando questa funzione, definirai effettivamente l'opacità
delle tue successive chiamate di disegno. L'opacità va da 0 a 1, dove 0 è completamente trasparente e
1 è completamente opaco. Potete quindi disegnare forme semitrasparenti usando:

```
screen.setAlpha(0.5)
screen.fillRect(0,0,50,50,"rgb(255,255,255)")
screen.fillRect(20,20,50,50,"rgb(255,255,255)")
```

## Trasparenza

:position 50,50,40,40

### Trasparenza

Dopo aver impostato un certo livello di trasparenza attraverso ```screen.setAlpha```, ricordati di resettare
l'opacità al suo valore di default, o continuerà ad avere un impatto sulle chiamate di disegno successive:

```
screen.setAlpha(1) // resetta l'opacità a 1
```

## Rotazione

:position 50,50,40,40

### Rotazione

Puoi impostare una quantità di rotazione prima di disegnare forme, sprites o mappe, usando ```screen.setDrawRotation(angle)```.
L'argomento angle è espresso in gradi. L'origine della rotazione per ciascuna delle successive chiamate di disegno sarà
sarà il centro del tuo rettangolo, sprite, mappa ecc.

```
screen.setDrawRotation(45)
screen.fillRect(0,0,100,100,"rgb(255,255,255)")
```

Non dimenticare di resettare la rotazione a 0 dopo questo:

```
screen.setDrawRotation(0)
```

## Scalatura

:position 50,50,40,40

### Scalatura

Puoi impostare una quantità di scala, specialmente prima di disegnare sprites o mappe, usando ``screen.setDrawScale(xscale,yscale)``.
I due argomenti sono il fattore di scala per l'asse x e il fattore di scala per l'asse y. Questo può essere usato per esempio per
capovolgere uno sprite per farlo guardare a sinistra invece che a destra. Esempio:

```
screen.setDrawScale(-1,1) // l'asse x sarà invertito
screen.drawSprite("sprite",0,0,100)
screen.setDrawScale(1,1) // ripristina il valore predefinito 1,1
```

## Corso finito

### Hai finito questo corso!

È il momento di giocare con tutte le funzioni di disegno. Datti un obiettivo di un paesaggio che vorresti disegnare
(con forme, sprites o entrambi). Provate a codificarlo. Tornate a uno di questi tutorial quando avete bisogno di controllare alcune delle funzioni
esposte qui. Anche la documentazione è sempre lì per aiutare!

