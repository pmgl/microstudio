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

# microScript

**microScript** es un lenguaje simple inspirado en Lua. Estos son algunos principios generales utilizados por microScript:

* Las variables son globales por defecto. Para definir una variable local, utiliza la palabra clave "local".
* Los saltos de línea no tienen un significado especial, se tratan como espacios.
* No hay ningún valor ```null```, ```nil``` o ```undefined``` en microScript. Cualquier variable indefinida o nula es igual a ```0```.
* En microScript, no hay tipo booleano. ```0``` es falso y todo lo que no sea ```0``` es verdadero.
* No hay errores de ejecución ni excepciones en microScript. Cualquier variable que no esté definida devuelve ```0```. Invocar un valor que no es una función como función devuelve el valor en sí.

## Variables

Una variable es un nombre (o "identificador") al que decides asignarle un valor. Por lo tanto, te permite memorizar este valor

### Declaración

No es necesario declarar las variables en microScript. Se puede suponer que existe cualquier variable que aún no se haya utilizado y tiene el valor ```0```.

Para comenzar a usar una variable, simplemente asígnale un valor con un signo igual:
```
x = 1
```
El valor de x es ahora 1.

### Tipos de valores

*microScript* reconoce cinco tipos de valores: números, cadenas (texto), listas, objetos y funciones.

#### Número
Los valores de tipo Número en *microScript* pueden ser enteros o decimales.

```
pi = 3,1415
x = 1
medio = 1/2
```

#### Cadena de caracteres
Las cadenas son textos o fragmentos de texto. Deben definirse entre comillas.

```
animal = "gato"
print("Hola "+animal)
```
#### Lista
Las listas pueden contener cualquier número de valores:

```
lista_vacia = []
numeros_primos =[2,3,5,5,7,11,13,17,19]
lista_mixta =[1, "gatto",[1,2,3]]
```

Se puede acceder a los elementos de una lista por su índice, es decir, su posición en la lista desde 0:

```
lista = ["gato", "perro", "topo"]
print(lista[0])
print(lista[1])
print(lista[2])
```

También es fácil iterar a través de los elementos de una lista usando un bucle for ```for loop```:

```
for elemento in lista
  print(elemento)
end
```

#### Objeto
Un objeto en *microScript* es un tipo de lista asociativa. El objeto tiene uno o más "campos" que tienen una clave y un valor. La clave es una cadena de caracteres, el valor puede ser cualquier valor válido en *microScript*. Una definición de objeto comienza con la palabra clave "object" y termina con la palabra clave "end". Se pueden definir diferentes campos entre los dos delimitadores. Ejemplo :

```
mi_objeto = object
  x = 0
  y = 0
  nombre = "objeto 1"
end
```
Puedes acceder a los campos de un objeto con el operador ```.```. Por lo tanto, la definición anterior también se puede reescribir como:

```
mi_objeto.x = 0
mi_objeto.y = 0
mi_objeto.nome = "objeto 1"
```

También se puede acceder a los campos mediante corchetes ```[]```. Por lo tanto, la definición anterior es equivalente a:

```
mi_objeto["x"] = 0
mi_objeto["y"] = 0
mi_objeto["nome"] = "objeto 1"
```

Puedes navegar por la lista de campos de un objeto con un bucle ```for```:

```
for campo in mi_objeto
  print(campo +" = " + " + mi_objeto[field])
end
```

Consulta "Clases" para obtener una cobertura más detallada de los objetos.

#### Valor de la función

Un valor puede ser de tipo función. Cuando escribes ```draw = function() ... end```, se crea un valor de función y se asigna a la variable ```draw``` (ver la sección sobre funciones a continuación).

#### Variables locales

Por defecto, las variables declaradas con asignación son globales. Es posible definir una variable local, como parte de una función, utilizando la palabra clave "local":

```
myFunction = function()
  local i = 0
end
```

## Funciones

Una función es una subsecuencia de instrucciones, que realiza trabajo, calcula y, a veces, devuelve un resultado.

### Definir una función

Una función se define con la palabra clave "function" y termina con la palabra clave "end".

```
numeroSucesivo = function(x)
  x+1
end
```

### Llamar a una función

```
print(numeroSucesivo(10))
```

Cuando invoca un valor que no es una función, como una función, simplemente devuelve su valor. Ejemplo :

```
x = 1
x(0)
```

El código anterior devuelve el valor 1, sin arrojar un error. Por lo tanto, también puede llamar a una función que aún no está definida (entonces ```0```), sin generar un error. Esto le permite comenzar a estructurar su programa de inmediato con subfunciones, en las que trabajará más adelante. Por ejemplo:

```
draw = function()
   dibujarCielo()
   dibujarNubes()
   dibujarárboles()
   dibujarEnemigos()
   dibujarError()
end

// Puedo implementar las funciones anteriores a mi propio ritmo, sin generar ningún error.
```

## Condiciones

### Condición simple
Una declaración condicional permite que el programa pruebe una hipótesis y realice varias operaciones dependiendo del resultado de la prueba. En *microScript*, las condiciones se escriben de la siguiente manera:

```
if edad<18 then
  print("niño")
else
  print("adulto")
end
```
"if" significa "si";
"then" significa "entonces";
"else" significa "de lo contrario";
"end" significa "fin"

En el ejemplo anterior, **si** el valor de la variable edad es menor que 18, **entonces** se ejecutará la instrucción ```print("niño")```, **de lo contrario** ejecutará la declaración ```print("adulto")```.

### Operadores de comparación binarios
Estos son los operadores binarios que se pueden utilizar para las comparaciones:

|Operador|Descripción|
|-|-|
|==|```a == b``` es verdadero solo si a es igual a b|
|!=|```a != b``` es verdadero solo si a es diferente de b|
|<| ```a < b``` es verdadero solo si a es estrictamente menor que b
|>| ```a > b``` es verdadero solo si a es estrictamente mayor que b".
|<=|```a <= b``` es verdadero solo si a es menor o igual que b
|>=|```a >= b``` es verdadero solo si a es mayor o igual que b

### Operadores booleanos
|Operador|Descripción|
|-|-|
|and| Y lógico: ```a y b``` es verdadero solo si a y b son verdaderos
|or| O lógico: ```a o b``` es verdadero solo si a es verdadero o b es verdadero
|not| NO lógico: ```not a``` es verdadero si a es falso y falso si a es verdadero.

### valores booleanos
En microScript, no hay ningún tipo booleano. ```0``` se considera falso y cualquier otro valor es verdadero. Los operadores de comparación devuelven ```1``` cuando es verdadero o ```0``` cuando es falso. Para mayor comodidad, microScript también te permite utilizar estas dos variables predefinidas:

|Variable|Valor|
|-|-|
|true|1|
|false|0|


### Múltiples condiciones

Se pueden probar múltiples hipótesis usando la palabra clave "elsif" (abreviatura de "else if")
```
if edad<10 then
  print("niño")
elsif edad<18 then
  print("adolescente")
elsif edad<30 then
  print("adulto joven")
else
  print("edad muy respetable")
end
```

## Bucles
Los bucles te permiten realizar operaciones repetidas.

### Para bucles
El bucle ```for``` se usa mucho en la programación. Te permite realizar la misma operación en todos los elementos de una lista o serie de valores.
```
for i=1 to 10
  print(i)
end
```
El ejemplo anterior muestra todos los números del 1 al 10 en la consola.

```
for i=0 to 10 by 2
  print(i)
end
```
El ejemplo anterior muestra los números del 0 al 10 en la consola en pasos de 2.
```
lista =[2,3,5,5,7,11]
for numero in lista
  print(numero)
end
```
El ejemplo anterior define una lista y luego muestra cada elemento de la lista en la consola.

### Bucle mientras
El bucle ```while``` le permite realizar operaciones repetidamente hasta obtener un resultado satisfactorio.

```
x = 1
while x*x<100
  print(x*x)
  x = x+1
end
```
El ejemplo anterior imprime el cuadrado de x, luego incrementa x (es decir, suma 1 a x), siempre que el cuadrado de x sea menor que 100.

### Interrupción o continuación del ciclo
Puede salir de un bucle `for` o `while` prematuramente con la instrucción `break`. Ejemplo:
```
while true
  x = x+1
  if x>= 100 then break end
end
```

Puede omitir las operaciones restantes de un ciclo y continuar con la siguiente iteración del ciclo con la instrucción `continue`. Ejemplo:
```
for i=0 to 10000
  if i%10 == 0 then continue end // esto omitirá el procesamiento de múltiplos de 10
  hacerCualquierOperacion(i)
end
```

## Operadores

Aquí está la lista de operadores binarios en *microScript* (excluyendo las comparaciones, ya mencionadas anteriormente)

### Operaciones
|Función|Descripción|
|-|-|
|+|Suma|
|-|Resta|
|*|Multiplicación|
|/|División|
|%|Módulo: ```x % y``` es igual al resto de la división de x por y|
|^|Potencia: ```x ^ y``` es igual a x elevado a la potencia de y o ```pow(x,y)```|

## Funciones predefinidas

### Funciones
|Función|Descripción|
|-|-|
|max(a,b)|Devuelve el mayor de a y b|
|min(a,b)|Devuelve el número más pequeño entre a y b|
|round(a)|Devuelve el valor redondeado al valor entero más próximo|
|flor(a)|Devuelve el valor redondeado al entero más cercano|
|ceil(a)|Devuelve el valor redondeado|
|abs(a)|Devuelve el valor absoluto de a|
|sqrt(a)|Devuelve la raíz cuadrada de a|
|pow(a,b)|Devuelve a elevado a b (otra notación posible: ```a ^ b```)|
|PI|Constante es igual al número Pi|
|log(a)|Devuelve el logaritmo natural de a|
|exp(a)|Devuelve el número de Euler elevado a la potencia de a|

#### Funciones trigonométricas en radianes
|Función|Descripción|
|-|-|
|sin(a)|Devuelve el seno de a (a en radianes)|
|cos(a)|Devuelve el coseno de a (a en radianes)|
|tan(a)|Devuelve la tangente de a (a en radianes)|
|acos(a)|Devuelve el arcocoseno de a (resultado en radianes)|
|asin(a)|Devuelve el arcoseno de a (resultado en radianes)|
|atan(a)|Devuelve el arcotangente de a (resultado en radianes)|
|atan2(y,x)|Devuelve el arcotangente de y/x (resultado en radianes)|

#### Funciones trigonométricas en grados
|Función|Descripción|
|-|-|
|sind(a)|Devuelve el seno de a (a en grados)|
|cosd(a)|Devuelve el coseno de a (a en grados)|
|tand(a)|Devuelve la tangente de a (a en grados)|
|acosd(a)|Devuelve el arcocoseno de a (resultado en grados)|
|asind(a)|Devuelve el arcoseno de a (resultado en grados)|
|atand(a)|Devuelve el arcotangente de a (resultado en grados)|
|atan2d(y,x)|Devuelve el arco tangente de y/x (resultado en grados)|

### Números al azar
El objeto random se utiliza para generar números pseudoaleatorios. Es posible inicializar el generador con la función ```seed``` para obtener la misma secuencia de números cada vez que se ejecuta, o por el contrario una secuencia diferente cada vez.

|Función|Descripción|
|-|-|
|```random.next()```|Devuelve un nuevo número aleatorio entre 0 y 1|
|```random.nextInt(a)```|Devuelve un nuevo entero aleatorio entre 0 y a-1|
|```random.seed(a)```|Restablece la secuencia de números aleatorios usando el valor a ; si usas la misma semilla dos veces, obtendrás la misma secuencia de números aleatorios. Si a == 0, el generador de números aleatorios se inicializa... aleatoriamente y por lo tanto no reproducible|

## Operaciones con cadenas

|Operación|Descripción|
|-|-|
|```cadena1 + cadena2```|El operador + se puede usar para concatenar cadenas|
|```string.length```|El campo ```length``` contiene la longitud de la cadena.|
|```string.substring(i1,i2)```|Devuelve una subcadena de la cadena de caracteres, comenzando en el índice i1 y terminando en el índice i2 |
|```string.startsWith(s)``` |Devuelve verdadero si la cadena comienza exactamente con ```s```|
|```string.endsWith(s)```|Devuelve verdadero si la cadena termina exactamente con ```s```|
|```string.indexOf(s)``` |Devuelve el índice de la primera aparición de ```s``` en ```string```, o -1 si ```string``` es no contiene ninguna ocurrencia |
|```string.lastIndexOf(s)```|Devuelve el índice de la última aparición de ```s``` en ```string```, o -1 si ```string``` lo hace no contiene ninguna ocurrencia |
|```string.replace(s1,s2)```|Devuelve una nueva cadena donde la primera aparición de ```s1``` (si existe) se reemplaza con ```s2```|
|```string.toUpperCase()```|Devuelve la cadena convertida a mayúsculas |
|```string.toLowerCase()```|devuelve la cadena convertida a minúsculas|
|```string.split(s)```|La función split divide la cadena en una lista de subcadenas, utilizando la subcadena de separación pasada como argumento. Luego devuelve una lista de subcadenas encontradas |


## Operaciones de lista
|Operación|Descripción|
|-|-|
|```list.length```|Contiene la longitud de la lista (número de elementos de la lista).|
|```list.push(item)```|Agrega un elemento al final de la lista|
|```list.insert(item)```|Insertar un elemento al principio de la lista|
|```list.insertAt(item,index)```|Insertar un elemento en la lista en el índice dado|
|```list.indexOf(item)```|Devuelve la posición del elemento en la lista (0 para el primer elemento, 1 para el segundo elemento...). Devuelve -1 cuando el elemento no está en la lista|
|```list.contains(item)```|Devuelve 1 (verdadero) cuando ```item``` está en la lista, o 0 (falso) cuando el ítem no se encuentra en la lista |
|```list.removeAt(index)```| Elimina el elemento en la posición ```index```|
|```list.removeElement(item)```|Elimina el ```item``` de la lista, si está en la lista|
|```list1.concat(list2)```|Devuelve una nueva lista obtenida al concatenar list2 a list1|

## Ordenar una lista

Puede ordenar los elementos de una lista usando la función ```list.sortList(funcion_de_comparacion)```. La ```función de comparación``` que proporcione debe tomar dos argumentos (a los que llamaremos ```a``` y ```b```) y debe devolver:

|Valor de retorno|cuando|
|-|-|
|un número negativo|cuando ```a``` debe ordenarse antes de ```b``` (a es menor que b)|
|cero|cuando ```a``` y ```b``` están en la misma posición con respecto al orden de clasificación deseado |
|un número positivo|cuando ```a``` debe ordenarse después de ```b``` (a es mayor que b)|

##### ejemplo

El siguiente ejemplo asume que la lista contiene *puntos*, cada punto tiene un rango de coordenadas de ```x```. Queremos ordenar los puntos desde el valor más pequeño de point.x hasta el valor más grande de point.x:
```
comparar = function(punto1,punto2)
  return punto1.x - punto2.x
end

list.sortList(comparar)
```

Ten en cuenta que podrías acortar el código anterior de esta manera:

```
list.sortList(function(punto1,punto2) punto1.x - punto2.x end)
```

Siempre que no se proporcione una función de comparación, los elementos de la lista se ordenarán en orden alfabético.

## Comentarios

Los comentarios en *microScript* se pueden agregar después de una doble barra inclinada: ```//```; todo lo que sigue hasta el siguiente salto de línea se ignora cuando se analiza el programa para la compilación.

##### ejemplo
```
miFuncion = ()
  // mis notas sobre el propósito de la función miFuncion
end
```

## Clases

Una clase en un lenguaje de programación se refiere a algún tipo de modelo o plantilla para crear objetos. Una clase define propiedades y funciones predeterminadas que constituyen el estado y el comportamiento estándar de todos los objetos que se crearán a partir de ella. Puedes crear instancias de objetos derivados de una clase, que heredarán todas las propiedades de la clase. El uso de clases y sus objetos derivados en un programa se denomina programación orientada a objetos (POO).

Para ilustrar estos conceptos, veamos cómo puedes usar clases para manejar enemigos en tu juego:

### Definir una clase

Comenzaremos creando una clase ```Enemigo``` que será compartida por todos nuestros objetos enemigos. Cada enemigo tendrá una ```posicion``` (en pantalla). Tendrá puntos de salud ```vida```, se moverá a cierta velocidad ```movimiento```:

```
Enemigo = class
  constructor = function(posicion)
    this.posicion = posicion
  end

  vida = 10
  movimiento = 1

  mover = function()
    posicion += movimiento
  end

  golpear = function(danyo)
    vida -= danyo
  end
end
```

En microScript, las clases y los objetos son conceptos muy similares y se pueden usar casi indistintamente. La definición de clase termina con la palabra clave ```end```. La primera propiedad que definimos en la clase anterior es la función "constructora". Esta función se llama cuando se crea una instancia de objeto de la clase. Establece la propiedad *posición* del objeto. ```this``` se refiere a la instancia del objeto en la que se llamará a la función, por lo que establecer ```this.posicion``` significa que el objeto establece la propiedad de ubicación en sí mismo.

### Crear instancias de objetos a partir de una clase

Vamos a crear dos objetos enemigos derivados de nuestra clase:

```
enemigo_1 = new Enemigo(50)
enemigo_2 = new Enemigo(100)
```

El operador ```new``` se utiliza para crear una nueva instancia de un objeto derivado de una clase. El argumento que pasemos aquí estará dirigido a la función constructora de nuestra clase. Por lo tanto, hemos creado una instancia del enemigo en la posición 50 y otra instancia del enemigo en la posición 100.

Ambos enemigos comparten la misma velocidad (movimiento) y puntos de golpe (vida). Sin embargo, podemos optar por establecer una velocidad de movimiento diferente para el segundo enemigo:

```
enemigo_2.movimiento = 2
```

Ahora podemos hacer que nuestros enemigos se muevan llamando:

```
enemigo_1.mover()
enemigo_2.mover()
```

El segundo enemigo se moverá el doble de rápido porque alteramos la velocidad de movimiento a través de su propiedad antes de llamar a la función movi.

### Herencia

Podemos hacer que una clase herede de otra clase. Por ejemplo, si quisiéramos crear una variante de nuestro Enemigo, podríamos hacer lo siguiente:
```
Boss = class extends Enemigo
  constructor = function(posicion)
    super(posicion)
    vida = 50
  end

  mover = function()
    super()
    vida += 1
  end
end
```

Creamos una nueva clase ```Boss``` extendiendo la clase ```Enemigo```. Nuestra nueva clase comparte todas las propiedades de Enemigo, excepto que reemplaza algunas de estas propiedades con sus propios valores. Al llamar a ```super(posicion)``` en el constructor de nuestra nueva clase, nos aseguramos de que también se llame al constructor de nuestra clase principal Enemigo.

Hemos creado un nuevo comportamiento de ```mover``` para nuestro Jefe, que anula el comportamiento predeterminado del Enemigo. En esta nueva función, llamamos a ```super()``` para mantener el comportamiento predeterminado que se definió en la clase Enemigo; pero luego aumentamos el valor de ```vida```, esto implica que nuestros Jefes recuperarán puntos de vida mientras se mueven.

Ahora podemos crear una instancia de nuestro Boss en la posición 120:

```
boss_final = new Boss(120)
```

##### Nota

* espacio variable: cuando se llama a una función en un objeto (como ```enemigo_1.mover()```), las variables a las que se hace referencia en el cuerpo de las funciones llamadas son las propiedades del objeto. Por ejemplo, en el cuerpo de la función mover, ```posicion += 1``` incrementará la propiedad ```posicion``` del propio objeto.

* A veces es necesario usar ```this``` para asegurarnos de que nos estamos refiriendo correctamente a una propiedad de nuestro objeto. Para esto, en el constructor de nuestra clase Enemigo, usamos ```this.posicion = posicion```, porque ```posicion``` también se refiere al argumento de la función y por lo tanto "oculta" la propiedad de nuestro objeto.

* ```super()``` se puede usar en una función adjunta a un objeto o clase, para invocar la función con el mismo nombre que la clase principal.


# Referencia de función

## Mostrar la ```screen```.

En *microStudio*, la pantalla está representada por el objeto "screen" predeterminado. Para mostrar formas o imágenes en la pantalla, simplemente llame a las funciones (también llamadas *métodos*) de este objeto. Por ejemplo:

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```
El código anterior define el color del dibujo como ```#FFF```, es decir, blanco (vea la explicación a continuación). Luego dibuja un rectángulo relleno con este color, centrado en las coordenadas de pantalla 0.0 (es decir, el centro de la pantalla), con un ancho de 100 y una altura de 100.

Para facilitar tu trabajo, *microStudio* escala automáticamente las coordenadas de la pantalla, independientemente de la resolución real de la pantalla. Por convención, la dimensión de pantalla más pequeña (ancho en modo vertical, altura en modo horizontal) es 200. Dado que el punto de origen (0,0) es el centro de la pantalla, la dimensión más pequeña se escala de -100 a + 100. El tamaño más grande se graduará, por ejemplo, de -178 a +178 (pantalla clásica de 16:9), o de -200 a +200 (pantalla de 2:1, smartphones más antiguos y más recientes), etc.
![Coordenadas de pantalla](/doc/img/screen_coordinates.png "Coordenadas de pantalla")

<small>*Sistema de coordenadas de dibujo en una pantalla de 16:9 en modo vertical y en modo horizontal*</small>


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
