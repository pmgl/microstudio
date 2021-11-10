<!-- 1. Shapes (Rect, Round, RoundRect) -->
<!-- 2. Colors -->
<!-- 3. Lines, Polygons -->
<!-- 4. Text -->
<!-- 5. Sprites and Maps -->
<!-- 6. Gradients -->
<!-- 7. Rotating, Scaling, Transparency -->


# Tutorial

:project Tutorial: Drawing

## Text

:position 50,50,40,40

### Drawing text

You can draw text by calling ```screen.drawText```. As drawing text requires that
microStudio loads fonts in the background, for better results we will be drawing
text from the draw() function:

```
draw = function()
  screen.clear()
  screen.drawText("Some Text",0,0,20,"rgb(255,255,255)")
end
```

The first argument is a string holding the text you want to draw. The two next
arguments are the x,y coordinates where to draw the text. The text will be centered
on this point. The 4th parameter is the size of the text (height of the characters).
The optional 5th parameter is the color (when omitted, the last used color will be reused).

## Font


### Font

You can use a different font by calling ```screen.setFont```:

```
draw = function()
  screen.clear()
  screen.setFont("Awesome")
  screen.drawText("Some other Text",0,0,20,"rgb(255,255,255)")
end
```

## Available fonts

### Available fonts

microStudio includes a set of nice bitmap-style fonts. To get the full list:

* when your program is already running, have a peek at variable ```global.fonts``` in the console ; it retains the full list of available fonts.
* run this demo showcasing all the fonts: https://microstudio.io/gilles/fonts/

## Font list

### Font list

This tutorial is finished! We have reproduced the list of available fonts below.
You can move on to the next tutorial, about drawing sprites and maps.

#### List of available fonts

AESystematic

Alkhemikal

AlphaBeta

Arpegius

Awesome

BitCell

Blocktopia

Comicoro

Commodore64

DigitalDisco

Edunline

EnchantedSword

EnterCommand

Euxoi

FixedBold

GenericMobileSystem

GrapeSoda

JupiterCrash

Kapel

KiwiSoda

Litebulb8bit

LycheeSoda

MisterPixel

ModernDos

NokiaCellPhone

PearSoda

PixAntiqua

PixChicago

PixelArial

PixelOperator

Pixellari

Pixolde

PlanetaryContact

PressStart2P

RainyHearts

RetroGaming

Revolute

Romulus

Scriptorium

Squarewave

Thixel

Unbalanced

UpheavalPro

VeniceClassic

ZXSpectrum

Zepto
