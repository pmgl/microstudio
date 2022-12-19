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
