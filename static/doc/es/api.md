# Referencia de funciones

## Mostrar la pantalla ```screen```.

En *microStudio*, la pantalla está representada por el objeto predeterminado "screen". Para mostrar formas o imágenes en la pantalla, simplemente llama a las funciones (también llamadas *métodos*) de este objeto. Por ejemplo:

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```
El código anterior define el color del dibujo como ``#FFF```, es decir, blanco (explicación a continuación). Luego dibuja un rectángulo relleno con este color, centrado en las coordenadas de pantalla 0.0 (es decir, el centro de la pantalla), con un ancho de 100 y una altura de 100.

Para facilitarte el trabajo, *microStudio* escala automáticamente las coordenadas de la pantalla, independientemente de la resolución real de la pantalla. Por convención, la dimensión de pantalla más pequeña (ancho en modo vertical, altura en modo horizontal) es 200. Dado que el punto de origen (0,0) es el centro de la pantalla, la dimensión más pequeña se escala de -100 a + 100. El tamaño más grande se graduará, por ejemplo, de -178 a +178 (pantalla clásica de 16:9), o de -200 a +200 (pantalla de 2:1, smartphones más antiguos y más recientes), etc.

![Coordenadas de pantalla](/doc/img/screen_coordinates.png "Coordenadas de pantalla")

<small>*Dibujando un sistema de coordenadas en una pantalla de 16:9 en modo vertical y en modo horizontal*</small>

### Definir un color
<!--- suggest_start screen.setColor --->
##### screen.setColor(color)

Define el color que se utilizará para llamadas posteriores a las funciones de pintura.

<!--- suggest_end --->

El color está definido por una cadena de caracteres, por lo tanto, entre comillas "". Generalmente se describe por sus componentes RGB, es decir, una mezcla de rojo, verde y azul. Son posibles varios tipos de clasificación:

* "rgb(255,255,255)": (rgb para rojo, verde, azul). Aquí se especifica un valor para rojo, verde y azul que varía entre 0 y 255 como máximo. "rgb(255,255,255)" da blanco, "rgb(255,0,0)" da rojo brillante, "rgb(0,255,0)" da verde, etc. Para facilitar la elección de un color al codificar, haz clic en su color rgb y manten pulsada la tecla Control para que aparezca el selector de color.
* "#FFF" o "#FFFFFF": esta notación utiliza hexadecimal para describir los 3 componentes de rojo, verde y azul. Hexadecimal es un sistema de notación numérica en "base 16", es decir, que utiliza 16 dígitos, del 0 al 9 y luego de la A a la F.
* existen otras notaciones que no se describen aquí.

### Limpiar la pantalla
<!--- suggest_start screen.clear --->
##### screen.clear(colore)
Borra la pantalla (la llena con el color proporcionado o con negro si no se pasa ningún color como argumento).
<!--- suggest_end --->

### Dibujar formas
<!--- suggest_start screen.fillRect --->
##### screen.fillRect( x, y, ancho, alto, color)
Dibuja un rectángulo relleno de color, centrado en las coordenadas x e y, con el ancho y la altura especificados. El color es opcional, si se omite se reutilizará el último color utilizado.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRoundRect --->
##### screen.fillRoundRect( x, y, ancho, alto, radio, color)
Dibuja un rectángulo redondeado lleno de color, centrado en las coordenadas x e y, con el ancho, la altura y el radio de curvatura especificados. El color es opcional, si se omite se reutilizará el último color utilizado.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRound --->
##### screen.fillRound( x, y, ancho, alto, color)
Dibuja una forma redondeada sólida (un disco o una elipse según el tamaño utilizado), centrada en las coordenadas x e y, con el ancho y la altura especificados. El color de relleno es opcional, si se omite se reutilizará el último color utilizado.
<!--- suggest_end --->

<!--- suggest_start screen.drawRect --->
##### screen.drawRect( x, y, ancho, alto, color)
Dibuja el contorno de un rectángulo, centrado en las coordenadas x e y, con el ancho y el alto especificados. El color es opcional, si se omite se reutilizará el último color utilizado.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRoundRect --->
##### screen.drawRoundRect( x, y,ancho, alto, radio, color)
Dibuja un contorno de rectángulo redondeado, centrado en las coordenadas x e y, con el ancho, la altura y el radio de curvatura especificados. El color es opcional, si se omite se reutilizará el último color utilizado.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRound --->
##### screen.drawRound( x, y, ancho, alto, color)
Dibuja el contorno de una forma redondeada, centrada en las coordenadas x e y, con el ancho y alto especificados. El color es opcional, si se omite se reutilizará el último color utilizado.
<!--- suggest_end --->

<!--- suggest_start screen.drawLine --->
##### screen.drawLine( x1, y1, x2, y2, color )
Dibuja una línea que una los puntos (x1,y1) y (x2,y2). El color es opcional, si se omite se reutilizará el último color utilizado.
<!--- suggest_end --->

<!--- suggest_start screen.fillPolygon --->
##### screen.fillPolygon( x1, y1, x2, y2, x3, y3, ... , color )
Rellena un polígono definido por la lista de coordenadas de puntos pasadas como argumentos. El color es opcional, si se omite se reutilizará el último color utilizado.
<!--- suggest_end --->

La función también puede tomar una matriz como primer argumento y un color como segundo argumento. En ese caso, se espera que la matriz contenga las coordenadas de los puntos como en este ejemplo: ```screen.fillPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )```.

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon( x1, y1, x2, y2, x3, y3, ... , color )
Dibuja un contorno de polígono, definido por la lista de coordenadas de puntos pasadas como argumentos. El color es opcional, si se omite se reutilizará el último color utilizado.
<!--- suggest_end --->

La función también puede tomar una matriz como primer argumento y un color como segundo argumento. En ese caso, se espera que la matriz contenga las coordenadas de los puntos como en este ejemplo: ```screen.drawPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )``` .

<!--- suggest_start screen.drawPolyline --->
##### screen.drawPolyline( x1, y1, x2, y2, x3, y3, ... ,color )
Equivalente a `drawPolygon`, excepto que la ruta de dibujo no se cerrará automáticamente.
<!--- suggest_end --->

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth( longitud )
Establece el ancho de línea para todas las operaciones de dibujo de línea posteriores (drawLine, drawPolygon, drawRect, etc.). El ancho de línea predeterminado es 1.
<!--- suggest_end --->

<!--- suggest_start screen.setLineDash --->
##### screen.setLineDash( matriz_de_valores)
Establece el estilo de trazo de línea para todas las operaciones de dibujo de línea posteriores (drawLine, drawPolygon, drawRect, etc.). El argumento debe ser una matriz de valores positivos, que definen la longitud de las líneas y los espacios en blanco.

#### ejemplo
```
screen.setLineDash([2,4])
```
<!--- suggest_end --->

### Ver sprites y mapas

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite( sprite, x, y, ancho, alto)

Dibuja en la pantalla uno de los sprites que creaste en la sección *Sprites*. El primer parámetro es una cadena que corresponde al nombre del sprite a mostrar, por ejemplo ``"icon"``. A continuación las coordenadas x, y donde mostrar el sprite (el sprite estará centrado en estas coordenadas). Finalmente, el ancho y alto del elemento.
<!--- suggest_end --->

```
screen.drawSprite("icon",0,50,50,50)
```
La altura se puede omitir, como en el ejemplo anterior. En este caso, la altura se calculará en función del ancho y la relación de aspecto del sprite.

##### Sprites animados

Los sprites animados dibujarán automáticamente el fotograma correcto de acuerdo con la configuración de animación. Puede configurar el fotograma actual de un sprite (por ejemplo, para reiniciar la animación) de esta manera:
```
sprites["sprite1"].setFrame(0) // 0 es el índice del primer frame
```

También puedes dibujar un fotograma de animación específico de tu sprite agregando "." y el índice de frame requerido:

```
screen.drawSprite("sprite1.0",0,50,50,50)
```

El ejemplo anterior dibuja el fotograma 0 del sprite "sprite1".

<!--- suggest_start screen.drawSpritePart --->
##### screen.drawSpritePart( sprite, part_x, part_y, part_width, part_height, x, y, ancho, alto)

Dibuja parte de un sprite en la pantalla. El primer parámetro es una cadena que corresponde al nombre del sprite a mostrar, por ejemplo ```"icon"```. Los siguientes 4 parámetros definen la coordenada de un sub-rectángulo del sprite para dibujar en la pantalla (la coordenada 0,0 es la esquina superior izquierda del sprite). Los últimos 4 parámetros son los mismos que para la función ```drawSprite```.
<!--- suggest_end --->

```
screen.drawSpritePart("icon",4,4,8,8,0,50,50,50)
```
La altura se puede omitir, como en el ejemplo anterior. En este caso, la altura se calculará en función del ancho y la relación de aspecto de la parte del sprite.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap( map , x , y , ancho, alto)
Dibuja en la pantalla uno de los mapas que creaste en la sección *Mapas*. El primer parámetro es una cadena que corresponde al nombre del mapa a mostrar,
por ejemplo ```map1```. A continuacion las coordenadas x,y donde mostrar el mapa (el mapa estará centrado en estas coordenadas). Finalmente, el ancho y el alto de la pantalla.
<!--- suggest_end --->

```
screen.drawMap("map1",0,0,300,200)
```

### Mostrar Texto

<!--- suggest_start screen.drawText --->
##### screen.drawText( testo, x, y, tamaño, &lt;color&gt; )
Dibujar texto en la pantalla. El primer parámetro es el texto a mostrar, a continuación las coordenadas x e y donde se centrará el texto, y luego el tamaño (alto) del texto. El último parámetro es el color del dibujo, que se puede omitir. En tal caso se reutilizará el último color definido.
<!--- suggest_end --->

```
screen.drawText("Hola!",0,0,30, "#FFF")
```

<!--- suggest_start screen.drawTextOutline --->
##### screen.drawTextOutline( text, x, y, size, &lt;color&gt; )
Dibuja el contorno del texto. Se puede dibujar el contorno en un color diferente después de ejecutar ```drawText``` para aumentar el contraste del texto en sí. El grosor del contorno se puede configurar con ```screen.setLineWidth```.
<!--- suggest_end --->

```
screen.drawTextOutline("Hola!",0,0,30, "#F00")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont( font_name )
Define la fuente a usar para futuras llamadas a ```drawText```.

**Fuentes disponibles en la versión actual**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->

```
screen.setFont("BitCell")
```

**Consejo**: La variable global ```fonts``` es un array con todas las fuentes disponibles en microStudio

<!--- suggest_start screen.loadFont --->
##### screen.loadFont( font_name )
Solicita la carga de una fuente. Útil junto con `screen.isFontReady`.
<!--- suggest_end --->

```
screen.loadFont("DigitalDisco")
```
<!--- suggest_start screen.isFontReady --->
##### screen.isFontReady( font_name )
Devuelve 1 (verdadero) si la fuente dada está cargada y lista para usarse. Asegúrate de ejecutar primero `screen.loadFont` o la fuente nunca se cargará.
<!--- suggest_end --->
Puede omitir el argumento de la función, en cuyo caso verifica si la fuente actual está cargada y lista para usarse (fuente predeterminada u otra fuente que configuró con su última llamada a `screen.setFont(font_name)``).

```
if screen.isFontReady() then
  // podemos usar la fuente predeterminada
  screen.drawText("MI TEXTO",0,0,50)
end

screen.loadFont("DigitalDisco") // comienza a cargar la fuente DigitalDisco

if screen.isFontReady("DigitalDisco") then  // comprobar que DigitalDisco está cargada
  screen.setFont("DigitalDisco") // establece la fuente DigitalDisco para escribir
  screen.drawText("ALGÚN OTRO TEXTO",0,50,20) // escribe el texto con la fuente cargada
end
```

<!--- suggest_start screen.textWidth --->
##### screen.textWidth( texto, dimension)
Devuelve el ancho del texto establecido cuando se dibujará en la pantalla con el tamaño dado.
<!--- suggest_end --->

```
ancho = screen.textWidth( "Mi texto", 20 )
```

### Parámetros de dibujo
<!--- suggest_start screen.setAlpha --->
##### screen.setAlpha(opacidad)
Define el nivel de opacidad general para todas las funciones de dibujo llamadas posteriormente. El valor 0 corresponde a una transparencia total (elementos invisibles) y el valor 1 corresponde a una opacidad total (los elementos dibujados ocultan completamente lo que hay debajo).
<!--- suggest_end --->

```
screen.setAlpha(0.5) // los siguientes elementos dibujados serán semitransparentes
```

Cuando utilices esta función para dibujar algunos elementos con cierta transparencia, no olvides restablecer el parámetro alfa a su valor predeterminado cuando ya no sea necesario:

```
screen.setAlpha(1) // el valor predefinido, opacidad total
```

---

<!--- suggest_start screen.setLinearGradient --->
##### screen.setLinearGradient(x1, y1, x2, y2, color1, color2)
Define el color del dibujo como un degradado de color lineal. ```x1 e y1``` son las coordenadas del punto de inicio del gradiente. ```x2 e y2``` son las coordenadas del punto final del gradiente. ```color1``` es el color inicial (ver ```setColor``` para los valores de color). ```color2``` es el color objetivo.
<!--- suggest_end --->

```
screen.setLinearGradient(0,100,0,-100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
El ejemplo anterior crea un degradado de blanco a rojo, de arriba a abajo de la pantalla, y luego llena la pantalla con este degradado.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient( x, y, radio, color1, color2)
Define el color del dibujo como un degradado de color radial, es decir, un degradado en forma de círculo. ```x``` e ```y``` son las coordenadas del centro del círculo. ```radio``` es el radio del círculo. ```color1``` es el color en el centro del círculo (ver ```setColor``` para valores de color). ```color2``` es el color en el perímetro del círculo.
<!--- suggest_end --->

```
screen.setRadialGradient(0,0,100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
El ejemplo anterior crea un degradado de blanco en el centro de la pantalla, hacia el rojo en los bordes de la pantalla, luego llena la pantalla con este degradado.
---

<!--- suggest_start screen.setTranslation --->
##### screen.setTranslation( tx, ty )
Define la traslación de las coordenadas de la pantalla para las operaciones de dibujo posteriores.
<!--- suggest_end --->

```
screen.setTranslation(50,50)
screen.fillRect(0,0,20,20)
```
El rectángulo del ejemplo anterior se dibujará con un desplazamiento de 50,50

No olvides restablecer la traslación a 0,0 cada vez que necesite interrumpir la traslación de las operaciones de dibujo posteriores.
```
screen.setTranslation(0,0)
```

<!--- suggest_start screen.setDrawRotation --->
##### screen.setDrawRotation(angulo)
Define un ángulo de rotación para las próximas operaciones de dibujo. El ángulo se expresa en grados.
<!--- suggest_end --->

```
screen.setDrawRotation(45)
screen.drawSprite ("icon",0,0,100)
```
El ejemplo anterior muestra el icono del proyecto, inclinado 45 grados.

¡No olvides restablecer el ángulo de rotación a 0 después de usarlo!
```
screen.setDrawRotation(0) // restablece el ángulo de rotación a su valor predeterminado
```

<!--- suggest_start screen.setDrawScale --->
##### screen.setDrawScale( x, y)
Define un factor de escala para dibujar los siguientes elementos en la pantalla. ```x``` define el factor de escala en el eje ```x``` e ```y``` el factor de escala en el eje y. Un valor de 2 mostrará los diseños posteriores al doble del tamaño. Un valor de -1 permite, por ejemplo, voltear un sprite (espejo), horizontalmente (x) o verticalmente (y).
<!--- suggest_end --->

```
screen.setDrawScale(1,-1)
screen.drawSprite ("icon",0,0,100)
```
El ejemplo anterior muestra el ícono del proyecto, volteado verticalmente.

¡No olvide restablecer el factor de escala a (1,1) después de usarlo!
```
screen.setDrawScale(1,1) // restablece el factor de escala a su valor predeterminado.
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setDrawAnchor( anclaje_x, anclaje_y )
De forma predeterminada, todas las operaciones de dibujo tratan sus coordenadas como el centro de la forma que se está dibujando. Puedes cambiar este comportamiento ejecutando  `screen.setDrawAnchor( anclaje_x, anclaje_y  )` para especificar un punto de anclaje diferente para dibujar formas.

<!--- suggest_end --->
En el eje x, el punto de anclaje se puede establecer en -1 (lado izquierdo de su forma), 0 (centro de su forma), 1 (lado derecho de su forma) o cualquier valor intermedio. En el eje y, el punto de anclaje se puede establecer en -1 (parte inferior de la forma), 0 (centro de la forma), 1 (parte superior de la forma) o cualquier valor intermedio.

Ejemplos

```
screen.setDrawAnchor(-1,0) // útil para alinear texto a la izquierda
screen.setDrawAnchor(-1,-1) // tus coordenadas de dibujo ahora se interpretan como la esquina inferior izquierda de su forma.
screen.setDrawAnchor(0,0) // por defecto, todas las formas se dibujarán centradas en sus coordenadas
```

<!--- suggest_start screen.setBlending --->
##### screen.setBlending( blending )
Define cómo se compondrán las operaciones de dibujo posteriores con la imagen subyacente, ya dibujada. Se puede establecer en "normal" o "aditivo".

También puede usar cualquier modo de fusión definido en la especificación Canvas de HTML5 con `setBlending`, como referencia, consulte https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation

<!--- suggest_start screen.width --->
##### screen.width
El campo "ancho" del objeto de pantalla tiene como valor el ancho actual de la pantalla (siempre 200 si la pantalla está en modo vertical, consulte *coordenadas de pantalla*).
<!--- suggest_end --->

<!--- suggest_start screen.height --->
##### screen.height
El campo de "altura" del objeto de pantalla tiene el valor de la altura de pantalla actual (siempre 200 si la pantalla está en modo horizontal, consulte *coordenadas de pantalla*).
<!--- suggest_end --->

<!--- suggest_start screen.setCursorVisible --->
##### screen.setCursorVisible( visibile )
Puedes utilizar esta función para mostrar u ocultar el cursor del ratón.
<!--- suggest_end --->


## Entradas, controles

Para que tu programa sea interactivo, necesitas saber si el usuario presiona una tecla en el teclado, el joystick o toca la pantalla táctil y dónde. *microStudio* te permite conocer el estado de estas diferentes interfaces de control, a través de los objetos ```keyboard``` (para teclado), ```touch``` (para pantalla táctil / mouse), ```mouse``` (para puntero de mouse/pantalla táctil) ```gamepad``` (para controlador o joypad).

##### Nota
El objeto ```system.inputs``` contiene información útil sobre qué métodos de entrada están disponibles en el sistema host:
|Campo|Valor|
|-|-|
|system.inputs.keyboard|1 si se encuentra que el sistema tiene un teclado físico, 0 de lo contrario|
|system.inputs.mouse|1 si el sistema tiene un ratón, 0 en caso contrario|
|system.inputs.touch|1 si el sistema tiene pantalla táctil, 0 en caso contrario|
|system.inputs.gamepad|1 si hay al menos 1 gamepad conectado al sistema, 0 en caso contrario (el gamepad aparece conectado solo cuando el usuario ha realizado alguna acción sobre él)|


### Entradas de teclado
<!--- suggest_start keyboard --->
Las entradas de teclado se pueden probar usando el objeto ```keyboard```.
<!--- suggest_end --->

##### ejemplo
```
if keyboard.A then
  // la tecla A está presionada actualmente
end
```

Ten en cuenta que mientras pruebas tu proyecto, para que los eventos del teclado aparezcan en la ventana de ejecución, primero debes hacer clic en él.

El siguiente código muestra el ID de cada tecla del teclado presionada. Puede ayudarte a determinar la lista de identificadores que necesitarás para tu proyecto.
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

*microStudio* crea algunos códigos genéricos útiles para ti, como UP, DOWN, LEFT y RIGHT que reaccionan tanto a las teclas de flecha como a ZQSD / WASD según la disposición de tu teclado.

Para probar caracteres especiales como +, - o incluso paréntesis, debes usar la siguiente sintaxis: ```keyboard["("]```, ```keyboard["-"]```.

##### Comprobar si se acaba de pulsar una tecla
En el contexto de la función ```update()```, puedes verificar si el usuario acaba de presionar una tecla del teclado usando ```keyboard.press.<KEY>```.

Ejemplo:

```
if keyboard.press.A then
  // Hacer algo una vez, justo cuando el usuario presione la tecla A
end
```
##### Comprobar si se acaba de soltar una tecla
En el contexto de la función ```update()```, puedes verificar si el usuario acaba de soltar una tecla del teclado usando ```keyboard.release.<KEY>```.

Ejemplo:
```
if keyboard.release.A then
  // Hacer algo una vez, justo cuando el usuario suelta la tecla A
end
```


<!--- suggest_start touch --->
### Entradas táctiles

Las entradas táctiles se pueden probar con el objeto "touch" (que también informa el estado del mouse).
<!--- suggest_end --->

|Campo|Valor|
|-|-|
|touch.touching|verdadero si el usuario está tocando la pantalla, falso si no está tocando|
|touch.x|Posición x donde se toca la pantalla|
|touch.y|Posición y donde se toca la pantalla|
|touch.touches|En caso de que sea necesario tener en cuenta varios puntos de contacto simultáneamente, touch.touches es una lista de los puntos de contacto actualmente activos|
|touch.press|verdadero si un dedo acaba de empezar a tocar la pantalla|
|touch.release|verdadero si el dedo acaba de soltar la pantalla|

```
if touch.touching
 // el usuario está tocando la pantalla
else
 // el usuario no esta tocando la pantalla
end
```

```
draw = function()
  for t in touch.touches
    screen.drawSprite("icon",t.x,t.y,50)
  end
end
```
El ejemplo anterior muestra el ícono del proyecto en cada punto de contacto activo en la pantalla.

<!--- suggest_start mouse --->
### Entradas de ratón

Las entradas del mouse se pueden probar con el objeto ```mouse``` (que también informa eventos táctiles).
<!--- suggest_end --->

|Campo|Valor|
|-|-|
|mouse.x|posición x del puntero del ratón|
|mouse.y|posición y del puntero del ratón|
|mouse.pressed|1 si se pulsa cualquier botón del ratón, 0 en caso contrario|
|mouse.left|1 si se pulsa el botón izquierdo del ratón, 0 en caso contrario|
|mouse.right|1 si se pulsa el botón derecho del ratón, 0 en caso contrario|
|mouse.middle|1 si se pulsa el botón central del ratón, 0 en caso contrario|
|mouse.press|verdadero si se acaba de pulsar un botón del ratón|
|mouse.release|verdadero si se acaba de soltar un botón del mouse|

### Entradas del controlador (gamepad)
<!--- suggest_start gamepad --->
El estado de los botones y joysticks del controlador (gamepad) se puede probar usando el objeto "gamepad".
<!--- suggest_end --->

##### ejemplo
```
if gamepad.UP then y += 1 end
```

**Consejo**: Para obtener una lista completa de los campos de objeto "gamepad", simplemente escribe "gamepad" en la consola cuando tu programa se esté ejecutando.

Al igual que con las pulsaciones de teclas del teclado, puedes usar ```gamepad.press.<BUTTON>``` para comprobar si se acaba de pulsar un botón, o ```gamepad.release.<BUTTON>``` para comprobar si el botón pulsado ha sido liberado.

## Sonidos

*microStudio* actualmente permite reproducir sonidos y música que hayas importado a tu proyecto (como archivos WAV y MP3) o crear sonidos programáticamente usando el *beeper* tradicional.

### Reproducir un sonido
<!--- suggest_start audio.playSound --->
##### audio.playSound( nombre, volumen, entonacion, panoramica, repeticion )
Reproduce el sonido dado, con la configuración de reproducción opcional dada.
<!--- suggest_end --->

##### parámetros
|Parámetro|Descripción|
|-|-|
|nombre|El nombre del sonido (de la pestaña de sonidos de tu proyecto) para reproducir|
|volumen|[opcional] El volumen de salida para esta reproducción de sonido, que va de 0 a 1|
|entonación|[opcional] El tono de salida para esta reproducción de sonido, 1 es el tono predeterminado|
|panoramica|[opcional] El ajuste de panorama para esta reproducción de sonido, que va de -1 (izquierda) a 1 (derecha)|
|repeticion|Establécelo en 1 (verdadero) si quieres que el sonido se repita indefinidamente|

La llamada a la función devuelve un objeto. Este elemento te permite controlar la configuración de reproducción mientras se reproduce el sonido:

##### ejemplo
```
mi_sonido = audio.playSound("nombredelsonido")
mi_sonido.setVolume(0.5)
```

|Funciones de control|Descripción|
|-|-|
|mi_sonido.setVolume(volumen)|Cambia el volumen de reproducción del sonido (valor que va de 0 a 1)|
|mi_sonido.setPitch(tono)|Cambiar el tono del sonido (1 es el tono predeterminado)|
|mi_sonido.setPan(panoramica)|Cambia la configuración de panorama estéreo del sonido (valor que va de -1 a 1)|
|mi_sonido.stop()|Dejar de reproducir ese sonido|

### Reproducir mésica
<!--- suggest_start audio.playMusic --->
##### audio.playMusic( nombre, volumen, repeticiones )
Reproduce la música dada, con la configuración de reproducción opcional dada.
<!--- suggest_end --->

##### argumentos
|Argumento|Descripción|
|-|-|
|nombre|El nombre de la música (de la pestaña de música de t proyecto) para reproducir|
|volumen|[opcional] El volumen de salida para esta reproducción de música, que va de 0 a 1|
|repetir|Ajústelo a 1 (verdadero) si deseas que la música se reproduzca indefinidamente|

La llamada a la función devuelve un objeto. Este elemento te permite controlar la configuración de reproducción mientras se reproduce la música:

##### ejemplo
```
mi_musica = audio.playMusic("nombredelamusica")
mi_musica.setVolume(0.5)
```

|Funciones de control|Descripción|
|-|-|
|mi_musica.setVolume(volumen)|Cambiar el volumen de reproducción de música (valor de 0 a 1)|
|mi_musica.stop()|Deja de reproducir esa música|
|mi_musica.play()|Reanuda la reproducción si la detuviste antes|
|mi_musica.getPosition()|Devuelve la posición de reproducción actual en segundos|
|mi_musica.getDuration()|Devuelve la duración total de la música en segundos|

<!--- suggest_start audio.beep --->
### audio.beep
Reproduce un sonido descrito por la cadena pasada como parámetro.

```
audio.beep("C E G")
```
<!--- suggest_end --->
Ejemplo más detallado y explicaciones en la siguiente tabla:
```
"saw duration 100 tempo 220 span 50 volume 50 loop 4 C2 C F G G G F end"
```

|Comando|Descripción|
|-|-|
|saw|Indica el tipo de generador de sonido (color del sonido), valores posibles:saw (diente de sierra), sine (sinosuidal), square (onda cuadrada), noise (ruido) |
|duration|La duración seguida de un número de milisegundos indica la duración de las notas|
|tempo|seguido de un número de notas por minuto, indica tempo|
|span|Seguido de un número entre 1 y 100, indica el porcentaje de retención de cada billete|
|volume|seguido de un número entre 0 y 100, establece el volumen|
|C| o D, E, F, etc. indica una nota a tocar. También es posible indicar la octava, por ejemplo C5 para el C de la quinta octava del teclado|
|loop|seguido de un número, indica el número de veces que habrá que repetir la siguiente secuencia. La secuencia termina con la palabra clave ```end``` ejemplo: ```loop 4 C4 E G end```; el número 0 significa que el ciclo debe repetirse indefinidamente|

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Cancela todos los sonidos reproducidos por el *beeper*. Útil para silenciar el sonido después de iniciar bucles de música.
<!--- suggest_end --->

## Métodos para sprites
Tu programa puede acceder a los sprites de su proyecto, que se almacenan en un objeto ```sprites``` predefinido:

```
mysprite = sprites["icon"]
```

Como se muestra a continuación, puedes acceder a varios campos y métodos de su sprite:

|campo/método|descripción|
|-|-|
|```mysprite.width```|El ancho del sprite en píxeles|
|```mysprite.height```|La altura del sprite en píxeles|
|```mysprite.ready```|1 cuando el sprite está completamente cargado, 0 en caso contrario |
|```mysprite.name```|Nombre del sprite|

*Nota: Es posible que otros campos y métodos nativos parezcan estar disponibles al inspeccionar un objeto sprite desde la consola. Dichos campos y métodos no documentados corren el riesgo de ser eliminados en el futuro, ¡así que no confíes demasiado en ellos!*

## Métodos de mapa
Tu programa puede acceder a los mapas de tu proyecto, que están almacenados en un objeto ```maps``` predefinido:

```
mymap = maps["map1"]
```

Como se muestra a continuación, puedes acceder a diferentes campos y métodos de tu mapa:

|campo/método|descripción|
|-|-|
|```mymap.width```|El ancho del mapa en celdas|
|```mymap.height```|La altura del mapa en celdas|
|```mymap.block_width```|El ancho de la celda del mapa en píxeles|
|```mymap.block_height```|La altura de la celda del mapa en píxeles|
|```mymap.ready```|1 cuando el mapa está completamente cargado, 0 en caso contrario|
|```mymap.name```|Nombre del mapa|
|```mymap.get(x,y)```|Devuelve el nombre del sprite en la celda (x,y); el origen de las coordenadas es (0,0), ubicado en la parte inferior izquierda del mapa. Devuelve 0 si la celda está vacía|
|```mymap.set(x,y,name)```|Establece un nuevo sprite en la celda (x,y); el origen de las coordenadas es (0,0), ubicado en la parte inferior izquierda del mapa. El tercer parámetro es el nombre del sprite.
|```mymap.clone()```|devuelve un nuevo mapa que es una copia completa de mymap.|

*Nota: Es posible que otros campos y métodos nativos parezcan estar disponibles actualmente al inspeccionar un objeto de mapa en la consola. Dichos campos y métodos no documentados corren el riesgo de ser eliminados en el futuro, ¡así que no confíes demasiado en ellos!*

## Sistema
El objeto ```system``` permite acceder a la función ```time``` que devuelve el tiempo transcurrido en milisegundos (desde el 1 de enero de 1970). Pero sobre todo, invocada en varios momentos, nos permite medir las diferencias en el tiempo.

<!--- suggest_start system.time --->
### system.time()
Devuelve el tiempo transcurrido en milisegundos (desde el 1 de enero de 1970)
<!--- suggest_end --->

## Storage
El objeto ```storage``` permite el almacenamiento permanente de los datos de su aplicación. Puedes usarlo para almacenar el progreso del usuario, puntuaciones u otra información de estado de tu juego o proyecto.

<!--- suggest_start storage.set --->
### storage.set( name , valor )
Almacena el valor de forma permanente, al que hace referencia la cadena ```name```. El valor puede ser cualquier número, cadena, lista u objeto estructurado.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get( name )
Devuelve el valor almacenado permanentemente bajo la cadena de referencia ```name```. Devuelve ```0``` cuando dicho registro no existe.
<!--- suggest_end --->
