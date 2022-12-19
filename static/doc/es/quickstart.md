**microStudio** es un entorno integrado de desarrollo de videojuegos.
¡Incluye todas las herramientas que necesitas para crear tu primer videojuego!
**microStudio** te ofrece todas estas posibilidades:

* un editor de sprites (imágenes, en pixel art)
* un editor de mapas (es decir, mapas o niveles)
* un editor de código para programar en microScript, un lenguaje simple pero potente
* Trabajo 100% online que te permite probar tu juego al instante en cualquier momento durante su desarrollo
* la capacidad de instalar fácilmente el juego, terminado o en construcción, en smartphones y tablets
* la capacidad de trabajar con varias personas en el mismo proyecto con sincronización instantánea
* Funciones para compartir en la comunidad, que te permiten explorar los proyectos de los demás, aprender y reutilizar todo lo que desees para tu propio proyecto.

# Inicio rápido

Puedes comenzar explorando proyectos realizados por otros usuarios, en la sección *Explorar*.

Puedes comenzar a crear como invitado o crear una cuenta directamente. Elige un nick (evita usar
tu nombre real), ingresa tu dirección de correo electrónico (obligatoria en caso de pérdida de contraseña; también debe ser validada para poder publicar) y ¡adelante!

## Primer proyecto

Puedes crear un nuevo proyecto vacío en la sección Crear, o elegir un proyecto existente en la sección Explorar y hacer clic en el botón "Clonar" para crear tu copia y comenzar a personalizarla.

### Código

Una vez creado tu proyecto, te encontrarás en la sección "Código". Aquí es donde puedes empezar a programar. Intenta copiar y pegar el siguiente código:

```
draw = function()
  screen.drawSprite ("icon",0,0,100,100)
end
```

### Ejecutar

A continuación haz clic en el botón Ejecutar en el lado derecho de la pantalla. Se iniciará tu programa y verás como el código anterior muestra el icono del proyecto en el centro de la pantalla. Cambia las coordenadas de visualización (los dígitos 0 y 100) para ver cómo varía la posición y el tamaño del icono.

### Editar en tiempo real

Después puedes hacer que este primer programa sea más interactivo copiando y pegando el código siguiente:

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

Esta vez el programa te permite mover el icono del proyecto con las flechas del teclado. Entraremos en detalles más adelante en esta documentación.

También puedes ir a la sección Sprites, hacer clic en el elemento "icono" y comenzar a editar la imagen. Cuando regreses a la sección Código, verás que tus cambios se aplican instantáneamente al programa en ejecución.

# Explorar

La sección principal *Explorar* te permite descubrir proyectos creados por otros usuarios. Puedes encontrar ejemplos de juegos, plantillas reutilizables, bibliotecas de sprites en diferentes estilos y temas. Si estás interesado en un proyecto en particular, puedes clonarlo, es decir, crear una copia completa para luego modificarla y reutilizar para tus propios fines.

Si has abierto previamente uno de tus proyectos en la sección Crear, podrás importar cualquier objeto o archivo fuente de los proyectos que estás explorando en tu proyecto actual. Esto te permite elegir imágenes o funciones que te interesen entre los proyectos públicos de la comunidad y reutilizarlas para tus propios propósitos.

# Crear un proyecto

Puedes crear un proyecto vacío en la sección *Crear* principal. Tu proyecto tiene varias secciones:

* **Código**: aquí es donde creas tus programas y comienzas a ejecutar tu proyecto para probarlo y depurarlo.
* **Sprites**: *sprites* son imágenes que puedes dibujar y modificar en esta sección. Puedes consultarlos fácilmente para verlos (pegarlos en la pantalla) al programar tu juego.
* **Mapas**: Los mapas son escenas o niveles que creas al ensamblar tus sprites en una cuadrícula. Puedes mostrarlos fácilmente en la pantalla de tu programa
* **Doc**: aquí puedes escribir documentación para tu proyecto; puede ser un documento de diseño de juego, un tutorial, una guía para reutilizar tu diseño como plantilla, etc.
* **Opciones**: Aquí puedes configurar varias opciones para tu proyecto; también puedes invitar a otros usuarios a participar en tu proyecto.
* **Publicar**: Aquí puedes hacer público tu proyecto; no olvides crear una descripción y agregar algunas etiquetas.

## Código

En esta sección, puedes programar y probar tu proyecto. Se crea automáticamente un archivo de código fuente para el proyecto. Puedes agregar más para dividir la funcionalidad de tu proyecto en varios subconjuntos.

El funcionamiento de un programa de microStudio se basa en la implementación de 3 funciones esenciales:

* la función ```init``` donde se inicializan las variables
* la función ```update``` donde los objetos se animan y los elementos se actualizan
* la función ```draw``` donde dibujas en la pantalla

<!--- help_start init = function --->
### La función ```init()```

La función init se llama solo una vez cuando se inicia el programa. Es especialmente útil para definir el estado inicial de las variables globales que se pueden utilizar en el resto del programa.
<!--- help_end --->
##### ejemplo
```
init = function()
  status = "bienvenido"
  nivel = 1
  posicion_x = 0
  posicion_y = 0
end
```

### Función ```update()```
<!--- help_start update = function --->
La función ```update``` se llama 60 veces por segundo. El cuerpo de esta función es el mejor lugar para programar la lógica y la física del juego: cambios de estado, movimientos de sprites o enemigos, detección de colisiones, lectura del teclado, evaluación de entradas táctiles o del gamepad, etc.
<!--- help_end --->

##### ejemplo
```
update = function()
  if keyboard.UP then y = y+1 end
end
```

El código anterior aumenta el valor de la variable y en 1 cada 60-avo de segundo si se presiona la tecla ```UP``` en el teclado (flecha hacia arriba).

<!--- help_start draw = function --->
### Función ```draw()```
La función ```draw``` se llama cada vez que se actualiza la pantalla. Este es el momento en el que debes dibujar tu escena en la pantalla, por ejemplo, rellenándola con un gran rectángulo de color (para limpiar la pantalla) y luego dibujando algunos sprites o formas en ella.
<!--- help_end --->

##### ejemplo
```
draw = function()
  // pinta la pantalla de negro
  screen.fillRect(0,0,screen.width,screen.width,screen.height, "rgb(0,0,0)")
  // dibuja el sprite "con" en el centro de la pantalla, con un tamaño de 100x100
  screen.drawSprite("icon",0,0,100,100)
end
```

En la mayoría de los casos, la función ```draw``` se llama 60 veces por segundo. Pero algunos ordenadores o tablets pueden actualizar sus pantallas 120 veces por segundo o incluso más. También puede suceder que el dispositivo que ejecuta el programa esté sobrecargado y no pueda actualizar la pantalla 60 veces por segundo, en cuyo caso la función ```draw``` se llamará con menos frecuencia. Esta es la razón por la cual ```update``` y ```draw``` son dos funciones separadas: pase lo que pase, ```update``` se llamará exactamente 60 veces por segundo; y cuando se llama a ```draw```, es momento de volver a dibujar la pantalla.

### Ejecución

La sección "Código", en el lado derecho de la pantalla, te permite ver tu programa en acción, mientras continúas editando su código fuente. Para iniciar el programa, simplemente haz clic en el botón <i class="fa fa-play"></i>. Puedes interrumpir la ejecución de tu programa en cualquier momento haciendo clic en el botón <i class="fa fa-pause"></i>.

### Consola

Mientras ejecutas tu programa, puedes usar la consola para ejecutar comandos simples en *microScript*. Por ejemplo, puedes simplemente introducir el nombre de una variable para averiguar su valor actual.

##### ejemplos
Conocer el valor actual de la variable posicion_x
```
> posicion_x
34
>
```
Cambia el valor a posicion_x
```
> posicion_x = -10
-10
>
```
Llamar a la función draw() para ver el cambio de posicion_x y su efecto en el dibujo en la pantalla (suponiendo que la ejecución esté en pausa)
```
>draw()
>
```

### Trazas

Puedes enviar texto en el código de tu programa para que se muestren mensajes en la consola en cualquier momento, usando la función ```print()```.

##### ejemplo
```
draw = function()
  // tu implementación del método draw()

  print (posicion_x)
end
```
## Sprites

Los sprites son imágenes que pueden moverse por la pantalla. La herramienta de dibujo en *microStudio* te permite crear sprites, que luego puedes usar en tu código para mostrarlos en la pantalla en la posición y el tamaño deseados.

### Crea un objeto
Cada proyecto tiene un sprite predeterminado, llamado "icon", que actuará como un icono de aplicación. Puedes crear nuevos sprites haciendo clic en *Agregar un sprite*. Puedes renombrarlos como quieras y definir su tamaño en píxeles (ancho x alto).

### Opciones de dibujo
*microStudio* ofrece las funciones de dibujo clásicas: lápiz, relleno, borrador, aclarar, oscurecer, suavizar, aumentar el contraste, cambiar la saturación.

La herramienta Cuentagotas se puede usar en cualquier momento presionando la tecla [Alt] en el teclado.

Las opciones *tile* y simetría te ayudarán a crear sprites "repetitivos" o sprites con uno o dos ejes de simetría.

##### Sugerencia
Puedes importar archivos de imagen a tu proyecto de microStudio. Para hacer esto, arrastra y suelta archivos PNG o JPG (hasta 256x256 píxeles de tamaño) en la lista de sprites.

## Mapas
Un mapa en microStudio es una cuadrícula para ensamblar sprites. Permite construir una decoración o crear un nivel.

### Crear un mapa
Los mapas se pueden crear y renombrar como los sprites. Puedes cambiar el tamaño de la cuadrícula (en número de celdas). Cada celda se puede dibujar con un sprite. Puedes cambiar el tamaño de píxel de cada celda, que generalmente debería reflejar el tamaño de los sprites utilizados para dibujar la cuadrícula.


## Ajustes
La pestaña *Configuración* te permite personalizar algunos elementos de tu proyecto.

### Opciones
Puedes definir el título de tu proyecto, tu identificador (utilizado para crear tu URL, es decir, tu dirección de Internet).

Puedes especificar si tu proyecto debe usarse en modo vertical u horizontal. Esta opción estará activa al instalar la aplicación en un smartphone o tablet.

También puedes especificar la relación de aspecto deseada para el área de visualización en la pantalla. Esta es una opción para garantizar que la aplicación siempre se vea bien cuando se instala en dispositivos con pantallas de diferente relación de aspecto.

### Usuarios

La sección de usuarios te permite invitar a amigos a participar en tu proyecto. Necesitas saber el nick del amigo que deseas invitar. Una vez que se invita a un amigo, si aceptas su invitación, tendrá acceso completo a tu proyecto y podrá hacer todas las modificaciones que desee (editar, agregar, eliminar sprites, mapas, código, etc.). Sin embargo, editar las opciones del proyecto y La lista de participantes está reservada para el propietario del proyecto.

## Publicar

*microStudio* ofrece algunas opciones para publicar o exportar tu proyecto. Puedes exportar tu proyecto como una aplicación HTML5 independiente, para distribución online, a tu web, o a plataformas de distribución de juegos. También puedes hacer público tu proyecto en *microStudio*, lo que permite que la comunidad lo reproduzca, comente, explore el código fuente y los recursos... Están planificadas más opciones de exportación para el futuro.

### Hacer público el proyecto

Para que tu proyecto sea accesible para todos (solo lectura), haz clic en "Hacer público mi proyecto". Una vez que tu proyecto sea público, aparecerá en la pestaña del explorador del sitio de microstudio. Cualquier visitante podrá ejecutar el juego, ver y reutilizar el código fuente y otros componentes de su proyecto.

Tu juego tiene una URL permanente en el formulario
```https://microstudio.io/nickname/game_id/```. Por supuesto, puedes distribuir el enlace a cualquier persona o puedes agregar tu juego a un sitio web existente incrustándolo en un iframe.

### Exportar a HTML5

Para exportar tu proyecto completo a una aplicación HTML5 independiente, haz clic en "Exportar a HTML5". Esto genera la descarga de un archivo ZIP que contiene todos los archivos necesarios para ejecutar el juego.
