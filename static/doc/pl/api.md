# Function reference

## Display ```screen```

In *microStudio* the screen is represented by the predefined object "screen". To display shapes or images on the screen, simply call functions (also called *methods*) on this object. For example:

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```
The code above defines the drawing color as ```#FFF``` i. e. white (see explanations below). Then it draws a rectangle filled with this color, centered at the coordinates 0.0 of the screen (i.e. the center of the screen), of width 100 and height 100.

To make your work easier, *microStudio* automatically scales the screen coordinates, regardless of the actual display resolution. By convention, the smallest display size (width in portrait mode, height in landscape mode) is 200. The origin point (0,0) being the center of the screen, the smallest dimension is therefore graduated from -100 to +100. The largest dimension will be graduated for example from -178 to +178 (classic 16:9 screen), from -200 to +200 (2:1 screen, longer, more recent smartphones) etc.


![Screen coordinates](/doc/img/screen_coordinates.png "Screen coordinates")

<small>*Drawing coordinate system on a 16:9 screen in portrait mode and in landscape mode*</small>


### Define a color
<!--- suggest_start screen.setColor --->
##### screen.setColor( color)

Defines the color to use for future calls to drawing functions.

<!--- suggest_end --->

The color is defined by a string of characters, so between quotation marks "". It is generally described by its RGB components, i.e. a mixture of Red, Green and Blue. Several types of ratings are possible:

* "rgb(255,255,255)": (rgb for red, green, blue). A value for red, green and blue is indicated here, varying between 0 and 255 maximum. "rgb(255,255,255)" gives white, "rgb(255,0,0)" gives bright red, "rgb(0,255,0)" gives green etc. To choose a color more easily when encoding, click on your rgb color and hold down the Control key to display the color selector.
* "#FFF" or "#FFFFFF": this notation uses hexadecimal, to describe the 3 components of red, green and blue. Hexadecimal is a number notation system in "base 16", i. e. using 16 digits, from 0 to 9 then from A to F.
* other notations exist, which are not described here.

### Clear screen
<!--- suggest_start screen.clear --->
##### screen.clear()
Clears the screen (fills it with black color).
<!--- suggest_end --->

### Drawing shapes
<!--- suggest_start screen.fillRect --->
##### screen.fillRect( x, y, width, height, color)
Draw a filled rectangle, centered at x and y coordinates, with the specified width and height. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRoundRect --->
##### screen.fillRoundRect( x, y, width, height, radius, color)
Draws a filled rounded rectangle, centered at x and y coordinates, with the specified width, height and radius of curvature. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRound --->
##### screen.fillRound( x, y, width, height, color)
Draws a solid round shape (a disc or ellipse depending on the dimensions used), centered at x and y coordinates, with the specified width and height. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

<!--- suggest_start screen.drawRect --->
##### screen.drawRect( x, y, width, height, color)
Draws a rectangle outline, centered at x and y coordinates, with the specified width and height. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRoundRect --->
##### screen.drawRoundRect( x, y, width, height, radius, color)
Draws a rounded rectangle outline, centered at x and y coordinates, with the specified width, height and radius of curvature. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRound --->
##### screen.drawRound( x, y, width, height, color)
Draws a round shape outline, centered at x and y coordinates, with the specified width and height. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

<!--- suggest_start screen.drawLine --->
##### screen.drawLine( x1, y1, x2, y2, color )
Draws a line joining points (x1,y1) and (x2,y2). The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

<!--- suggest_start screen.fillPolygon --->
##### screen.fillPolygon( x1, y1, x2, y2, x3, y3, ... , color )
Fills a polygon defined by the list of point coordinates passed as arguments. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

The function can also accept an array as first argument and a color as second argument. In that case, the array is expected to hold the points coordinates like this: ```screen.fillPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon( x1, y1, x2, y2, x3, y3, ... , color )
Draws a polygon outline, defined by the list of point coordinates passed as arguments. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

The function can also accept an array as first argument and a color as second argument. In that case, the array is expected to hold the points coordinates like this: ```screen.drawPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth( width )
Sets the line width for all subsequent line draw operation (drawLine, drawPolygon, drawRect etc.). The default line width is 1.
<!--- suggest_end --->

### Display sprites and maps

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite( sprite, x, y, width, height)

Draws one of the sprites you created in the *Sprites* section on the screen. The first parameter is a string that corresponds to the name of the sprite to be displayed, for example ```"icon"```. Then follow the x,y coordinates where to display the sprite (the sprite will be centered on these coordinates). Then the width and height of the display.
<!--- suggest_end --->

```
screen.drawSprite("icon",0,50,50,50)
```
The height can be omitted, as in the example above. In this case the height will be calculated according to the width and proportions of the sprite.

##### Animated sprites

Animated sprites will automatically draw the correct frame according to animation settings. You can set the current frame of a sprite (e.g. to restart the animation) this way:

```
sprites["sprite1"].setFrame(0) // 0 is the index of the first frame
```

You can also draw a specific animation frame of your sprite, by appending "." and the index of the requested frame:

```
screen.drawSprite("sprite1.0",0,50,50,50)
```

The example above draws the frame 0 of sprite "sprite1".

<!--- suggest_start screen.drawSpritePart --->
##### screen.drawSpritePart( sprite, part_x, part_y, part_width, part_height, x, y, width, height)

Draws part of a sprite on the screen. The first parameter is a string that corresponds to the name of the sprite to be displayed, for example ```"icon"```. The next 4 parameters define the coordinate of a sub-rectangle of the sprite to actually be painted on screen (coordinate 0,0 is the top-left corner of the sprite). The last 4 parameters are the same as for ```drawSprite```.
<!--- suggest_end --->

```
screen.drawSpritePart("icon",4,4,8,8,0,50,50,50)
```
The height can be omitted, as in the example above. In this case the height will be calculated according to the width and proportions of the sprite part.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap( map , x , y , width , height )
Draws one of the maps you created in the *Maps* section on the screen. The first parameter is a string that corresponds to the name of the map to be displayed, for example ```map1```. Then follow the x,y coordinates where to display the map (the map will be centered on these coordinates). Then the width and height of the display.
<!--- suggest_end --->

```
screen.drawMap("map1",0,0,300,200)
```

### Display text

<!--- suggest_start screen.drawText --->
##### screen.drawText( text, x, y, size, &lt;color&gt; )
Draws text on the screen. The first parameter is the text to be displayed, then the x and y coordinates where the text will be centered, then the size (height) of the text. The last parameter is the drawing color, it can be omitted, in this case the last defined color will be reused.
<!--- suggest_end --->

```
screen.drawText("Hello!",0,0,30, "#FFF")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont( font_name )
Defines the font to use for future calls to ```drawText```.

**Available fonts in current version**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->

```
screen.setFont("BitCell")
```

**Tip**: the global variable ```fonts``` is an array of all available fonts in microStudio


<!--- suggest_start screen.textWidth --->
##### screen.textWidth( text, size )
Returns the width of the given text when drawn on screen with given size.
<!--- suggest_end --->

```
width = screen.textWidth( "My Text", 20 )
```

### Drawing parameters
<!--- suggest_start screen.setAlpha --->
##### screen.setAlpha
Defines the overall opacity level for all drawing functions called up later. The value 0 is equivalent to a total transparency (invisible elements) and the value 1 corresponds to a total opacity (the drawn elements totally hide what is below).
<!--- suggest_end --->

```
screen.setAlpha(0.5) // the next drawn elements will be semi-transparent
```

When you use this function to draw some elements with a little transparency, don't forget to reset the alpha parameter to its default value:

```
screen.setAlpha(1) // the default value, total opacity
```

---

<!--- suggest_start screen.setLinearGradient --->
##### screen.setLinearGradient(x1, y1, x2, y2, color1, color2)
Defines the drawing color as a linear gradient of color, i. e. a gradient. ```x1 and y1``` are the coordinates of the starting point of the gradient. ```x2 and y2``` are the coordinates of the ending point of the gradient. ```color1``` is the starting color (see ```setColor``` for the color values). "Color2" is the arrival color.
<!--- suggest_end --->

```
screen.setLinearGradient(0,100,0,-100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
The above example creates a gradient from white to red, from top to bottom of the screen, and then fills the screen with this gradient.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient( x, y, radius, color1, color2)
Defines the drawing color as a radial gradient of color, i.e. a gradient in the shape of a circle. ```x``` and ```y``` are the coordinates of the center of the circle. ```radius``` is the radius of the circle. ```color1``` is the color at the center of the circle (see ```setColor``` for the color values). ```color2``` is the color at the perimeter of the circle.
<!--- suggest_end --->

```
screen.setRadialGradient(0,0,100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
The above example creates a gradient of white in the center of the screen, towards the red on the edges of the screen, then fills the screen with this gradient.

---

<!--- suggest_start screen.setTranslation --->
##### screen.setTranslation( tx, ty )
Defines the translation of the screen coordinates for the subsequent drawing operations.
<!--- suggest_end --->

```
screen.setTranslation(50,50)
screen.fillRect(0,0,20,20)
```
The rectangle in the above example will be drawn with an offset of 50,50

Don't forget to reset the translation to 0,0 whenever you need to stop translating draw operations.
```
screen.setTranslation(0,0)
```

<!--- suggest_start screen.setDrawRotation --->
##### screen.setDrawRotation( angle)
Defines a rotation angle for the next drawing operations. The angle is expressed in degrees.
<!--- suggest_end --->

```
screen.setDrawRotation(45)
screen.drawSprite ("icon",0,0,100)
```
The example above shows the project icon, tilted 45 degrees.

Don't forget to reset the rotation angle to 0 after using it!
```
screen.setDrawRotation(0) // returns the rotation angle to its default value
```

<!--- suggest_start screen.setDrawScale --->
##### screen.setDrawScale( x, y)
Defines a scale factor for drawing the next elements on the screen. ```x``` defines the scale factor on the x-axis and ```y``` the scale factor on the y-axis. A value of 2 will display twice as much. A value of -1 allows, for example, to flip a sprite (mirror), horizontally (x) or vertically (y).
<!--- suggest_end --->

```
screen.setDrawScale(1,-1)
screen.drawSprite ("icon",0,0,100)
```
The example above shows the project icon, returned vertically.

Don't forget to reset the scale factor to 1.1 after using it!
```
screen.setDrawScale(1,1) // returns the scale factor to its default value.
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setDrawAnchor( anchor_x, anchor_y )
By default, all drawing operations consider your coordinates to be the center of the shape to draw. You can change this by calling
`screen.setDrawAnchor( anchor_x, anchor_y )` to specify a different anchor point for drawing shapes.

<!--- suggest_end --->
On the x axis, the anchor point can be set to -1 (left side of your shape), 0 (center of your shape), 1 (right side of your shape) or any intermediary value. On the y axis, the anchor point can be set to -1 (bottom side of your shape), 0 (center of your shape), 1 (top of your shape) or any intermediary value.

Examples
```
screen.setDrawAnchor(-1,0) // useful to align text on the left
screen.setDrawAnchor(-1,-1) // your drawing coordinates are now interpreted as the bottom left corner of your shape.
screen.setDrawAnchor(0,0) // default value, all shapes will be drawn centered on your coordinates
```

<!--- suggest_start screen.width --->
##### screen.width
The "width" field of the object screen has the current screen width as its value (always 200 if the screen is in portrait mode, see *screen coordinates*).
<!--- suggest_end --->

<!--- suggest_start screen.height --->
###### screen.height
The "height" field of the object screen has the current height of the screen as its value (always 200 if the screen is in landscape mode, see *screen coordinates*).
<!--- suggest_end --->

<!--- suggest_start screen.setCursorVisible --->
##### screen.setCursorVisible( visible )
You can use this function to show or hide the mouse cursor.
<!--- suggest_end --->


## Inputs, control

To make your program interactive, you need to know if and where the user presses a key on the keyboard, joystick, touches the touch screen. *microStudio* allows you to know the status of these different control interfaces, via the objects ```keyboard``` (for the keyboard), ```touch``` (for the touch screen / mouse), ```mouse``` (for mouse pointer / touch screen) ```gamepad``` (for the controller).

##### Note
The object ```system.inputs``` retains useful information on which input methods are available on the host system:

|Field|Value|
|-|-|
|system.inputs.keyboard|1 if the system is believed to have a physical keyboard, 0 otherwise|
|system.inputs.mouse|1 if the system has a mouse, 0 otherwise|
|system.inputs.touch|1 if the system has a touch screen, 0 otherwise|
|system.inputs.gamepad|1 if there is at least 1 gamepad connected to the system, 0 otherwise (the gamepad may appear connected only when the user has performed an action on it)|


### Keyboard inputs
<!--- suggest_start keyboard --->
Keyboard inputs can be tested using the ```keyboard``` object.
<!--- suggest_end --->

##### example
```
if keyboard.A then
  // the A key is currently pressed
end
```

Note that when you test your project, in order for keyboard events to reach the execution window, it is necessary to click in it first.

The code below shows the ID of each keyboard key pressed. It can be useful for you to establish the list of identifiers you will need for your project.

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
*microStudio* creates for you some useful generic codes, such as UP, DOWN, LEFT and RIGHT that react to both the arrow keys and ZQSD / WASD depending on your keyboard layout.

To test special characters such as +, - or even parentheses, you must use the following syntax: ```keyboard["("]```, ```keyboard["-"]```.

##### Test whether a key was just pressed
In the context of the function ```update()```, you can check if a keyboard key was just pressed by the user using ```keyboard.press.<KEY>```.

Example:

```
if keyboard.press.A then
  // Do something once, just as the user presses the key A
end
```

##### Test whether a key was just released
In the context of the function ```update()```, you can check if a keyboard key was just released by the user using ```keyboard.release.<KEY>```.

Example:

```
if keyboard.release.A then
  // Do something once, just as the user releases the key A
end
```


<!--- suggest_start touch --->
### Touch inputs

The touch inputs can be tested with the "touch" object (which also reports the state of the mouse).
<!--- suggest_end --->

|Field|Value|
|-|-|
|touch.touching|Is true if the user touches the screen, false if not|
|touch.x|Position x where the screen is touched|
|touch.y|Position y where the screen is touched|
|touch.touches|In case you need to take into account multiple touch points simultaneously, touch.touches is a list of currently active touch points|
|touch.press|true if a finger just started touching the screen|
|touch.release|true if the finger just left the screen|

```
if touch.touching
  // the user touches the screen
else
 // the user does not touch the screen
end
```

```
draw = function()
  for t in touch.touches
    screen.drawSprite("icon",t.x,t.y,50)
  end
end
```
The example above shows the project icon at each active touch point on the screen.  

<!--- suggest_start mouse --->
### Mouse inputs

The mouse inputs can be tested with the ```mouse``` object (which also reports touch events).
<!--- suggest_end --->

|Field|Value|
|-|-|
|mouse.x|Position x of the mouse pointer|
|mouse.y|Position y of the mouse pointer|
|mouse.pressed|1 if any button of the mouse is pressed, 0 otherwise|
|mouse.left|1 if left mouse button is pressed, 0 otherwise|
|mouse.right|1 if right mouse button is pressed, 0 otherwise|
|mouse.middle|1 if middle mouse button is pressed, 0 otherwise|
|mouse.press|true if a mouse button was just pressed|
|mouse.release|true if a mouse button was just released|

### Controller inputs (gamepad)
<!--- suggest_start gamepad --->
The status of the buttons and joysticks on the controller (gamepad) can be tested using the "gamepad" object.
<!--- suggest_end --->

##### example
```
if gamepad.UP then y += 1 end
```

**Tip**: To get a complete list of the fields of the "gamepad" object, simply type "gamepad" in the console when your program is running.

In the same way as for keyboard key presses, you can use ```gamepad.press.<BUTTON>``` to check whether a button was just pressed or ```gamepad.release.<BUTTON>``` to check whether a button was just released.

## Sounds

*microStudio* will soon have a dedicated section to create sounds and music. In the meantime, it is possible to use the *beeper* to add sound to your creations in a simple way.

<!--- suggest_start audio.beep --->
### audio.beep
Plays a sound described by the string passed as a parameter.

```
audio.beep("C E G")
```
<!--- suggest_end --->
More detailed example and explanations in the table below:
```
"saw duration 100 span 50 duration 500 volume 50 span 50 loop 4 C2 C F G G G F end"
```

|Command|Description|
|-|-|
|saw|indicates the type of sound generator (sound color), possible values: saw, sine, square, noise|
|duration|followed by a number of milliseconds indicates the duration of the notes|
|tempo|followed by a number of notes per minute, indicates the tempo|
|span|followed by a number between 1 and 100, indicates the percentage of keeping each note|
|volume|followed by a number between 0 and 100, sets the volume|
|C|or D, E, F etc. indicates a note to be played. It is possible to indicate the octave also, example C5 for the C of the 5th octave of the keyboard.|
|loop|followed by a number, indicates the number of times the following sequence will have to be repeated. The sequence ends with the keyword ```end``` example: ```loop 4 C4 E G end```; the number 0 means that the loop must be repeated indefinitely.

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Cancels all sounds being played by the *beeper*. Useful for muting the sound after having started music loops.
<!--- suggest_end --->

## Sprite methods
Your program can access your project's sprites, which are stored in a predefined object ```sprites```:

```
mysprite = sprites["icon"]
```

You can then access different fields and methods of your sprite:

|field/method|description|
|-|-|
|```mysprite.width```|The width of the sprite in pixels|
|```mysprite.height```|The height of the sprite in pixels|
|```mysprite.ready```|1 when the sprite is fully loaded, 0 otherwise|
|```mysprite.name```|Name of the sprite|

*Note: other fields and native methods may currently seem available when you inspect a sprite object in the console. Such undocumented fields and methods may break in the future, thus do not rely too much on them!*

## Map methods
Your program can access your project's maps, which are stored in a predefined object ```maps```:

```
mymap = maps["map1"]
```

You can then access different fields and methods of your map:

|field/method|description|
|-|-|
|```mymap.width```|The width of the map in cells|
|```mymap.height```|The height of the map in cells|
|```mymap.block_width```|The width of the map cell in pixels|
|```mymap.block_height```|The height of the map cell in pixels|
|```mymap.ready```|1 when the map is fully loaded, 0 otherwise|
|```mymap.name```|Name of the map|
|```mymap.get(x,y)```|Returns the name of the sprite in cell (x,y) ; coordinates origin is (0,0), located at the bottom left of the map. Returns 0 if cell is empty|
|```mymap.set(x,y,name)```|Sets a new sprite in cell (x,y) ; coordinates origin is (0,0), located at the bottom left of the map. Third parameter is the name of the sprite.|
|```mymap.clone()```|Returns a new map which is a full copy of mymap.|

*Note: other fields and native methods may currently seem available when you inspect a map object in the console. Such undocumented fields and methods may break in the future, thus do not rely too much on them!*

## System
The object ```system``` allows to access the function ```time```, which returns the elapsed time in milliseconds (since January 1st, 1970). But above all, invoked at various times, it makes it possible to measure time differences.

<!--- suggest_start system.time --->
### system.time()
Returns the elapsed time in milliseconds (since January 1, 1970)
<!--- suggest_end --->

## Storage
The ```storage``` object allows for the permanent storage of your application data. You can use it to store user progress, highscores or other status information about your game or project.

<!--- suggest_start storage.set --->
### storage.set( name , value )
Stores your value permanently, referenced by the string ```name```. The value can be any number, string, list or structured object.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get( name )
Returns the value permanently recorded under reference string ```name```. Returns ```0``` when no such record exists.
<!--- suggest_end --->
