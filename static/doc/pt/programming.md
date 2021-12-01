# microScript
**microScript** é uma linguagem simples inspirada em Lua. Aqui estão alguns princípios gerais usados em *microScript*:

* as variáveis são globais por padrão. Para definir uma variável local, use a palavra reservada "local".
* quebras de linha não tem um significado particular, são consideradas espaços.
* em *microScript* não há valores `null`, `nil` ou `undefined`. Qualquer variável de valor indefinido ou nulo é igual a `0`.
* em *microScript*, não há um tipo Booleano. `0` é *false* e tudo que não é `0` é *true*.
* não há erro de execução ou exceção em *microScript*. Qualquer variável não definida retorna `0`. Invocar um valor que não é uma função como uma função retorna o próprio valor.

## Variáveis
Uma variável é um nome (ou "identificador") ao qual se decide atribuir um valor. Tornando possível, o armazenamento desse valor.

### Declaração
Variáveis em *microScript* não precisam ser declaradas. Qualquer variável que ainda não tenha sido utilizada pode ser considerada existente e tem o valor `0`.

Para começar a usar uma variável, basta atribuir-lhe um valor com o sinal de igual:
```
x = 1
```
O valor de x agora é 1.

### Tipos de valores
*microScript* reconhece cinco tipos de valores: números, *strings* (texto), listas, objetos e funções.

#### Número
Os valores do tipo Número em *microScript* podem ser inúmeros inteiros ou decimais.
```
pi = 3.1415
x = 1
half = 1/2
```

#### *String*
*Strings* são textos ou partes de textos. Devem ser definidos entre aspas.
```
animal = "gato"
print("Olá " + animal)
```

#### Listas
Listas podem conter uma série de valores.
```
empty_list = []
prime_numbers =[2,3,5,5,7,11,13,17,19]
mixed_list =[1,"gato",[1,2,3]]
```

Você pode acessar os elementos da listas pelo seu índice, por exemplo, sua posição na lista a partir de 0:
```
list = ["gato", "cachorro", "rato"]
print(list[0])
print(list[1])
print(list[2])
```

Também é facil navegar por uma lista usando o laço `for`:
```
for element in list
  print(element)
end
```

#### Objeto
Um objeto em *microScript* é uma forma de lista associativa. O objeto tem um ou mais "campos" que têm uma chave e um valor. A chave é uma *string* de caracteres, o valor pode ser qualquer valor *microScript*. A definição de um objeto inicia com a palavra reservada *object* e termina com a palavra reservada *end*. Entre os dois podem ser definidos vários campos. Exemplo:
```
my_object = object
  x = 0
  y = 0
  name = "objeto 1"
end
```

Você pode acessar os campos de um objeto com o operator `.`. A definição acima também pode ser escrita da seguinte forma:
```
my_object.x = 0
my_object.y = 0
my_object.name = "objeto 1"
```

Também pode ser acessado com colchetes `[]`. A definição acima também pode, portanto, ser escrita como se segue:
```
my_object["x"] = 0
my_object["y"] = 0
my_object["nome"] = "objeto 1"
```

Você pode navegar pela lista de campos de um objeto com um laço `for`:
```
for field in my_object
  print(field +" = " + " + my_object[field])
end
```

Veja "Classes" para uma cobertura mais aprofundada do objeto.

#### Valor de função
Um valor pode ser do tipo função. Ao escrever `draw = function() ... end`, um valor de função é criado e atribuído à variável `draw` (ver seção sobre funções abaixo).

#### Variáveis locais
Por padrão, as variáveis declaradas pela atribuição são globais. É possível definir uma variável local, como parte de uma função, usando a palavra reservada *local*:
```
myFunction = function()
  local i = 0
end
```

## Funções
Uma função é uma subsequência de operações, que realizam uma tarefa, um cálculo e às vezes retorna um resultado.

### Definindo uma função
A function is defined with the keyword "function" and ends with the keyword "end".
Uma função é definida pela palavra reservada *function* e termina com a palavra reservada *end*.
```
nextNumber = function(s)
  x+1
end
```

### Chamando uma função
```
print(nextNumber(10))
```

Quando você invoca uma valor que não é uma função como se fosse uma função, ele simplesmente retornar seu valor. Por exemplo:
```
x = 1
x(0)
```

O código acima retorna o valor 1, sem gerar um erro. Assim, você pode até invocar uma função que ainda não esteja declarada (seu valor serpa `0`), sem gerar nenhum erro. Isso permite a você estruturar seu programa bem cedo com sub-funções, as quais você trabalhará mais tarde. Por exemplo:
```
draw = function()
  drawSky()
  drawClouds()
  drawTrees()
  drawEnemies()
  drawHero()
end

// Pode implementar as funções acima quando necessário.
```

## Condicionais

### Condicional simples
Uma declaração condicional permite que o programa teste uma hipótese e realize operações diferentes dependendo do resultado do teste. Em *microScript*, as condições são escritas da seguinte forma:
```
if age < 18 then
  print("criança")
else
  print("adulto")
end
```

"if" significa "se";
"then" significa "então";
"else" significa "caso contrário";
"end" means "fim"

No exemplo acima, **se** o valor da variável *age* for menor que 18, **então** a instrução `print("criança")` será executada, **caso contrário** a instrução `print("adulto")` será executada.

### Operadores de comparação binária
Eis os operadores binários que podem ser usados para fazer comparações:

|Operador|Descrição|
|-|-|
|==|`a == b` *true* apenas se `a` for igual a `b`|
|!=|`a != b` *true* apenas se `a` for diferente de `b`|
|<|`a < b` *true* apenas se `a` for menor que `b`|
|>|`a > b` *true* apenas se `a` for maior que `b`|
|<=|`a <= b` *true* apenas se `a` for menor ou igual a `b`|
|>=|`a >= b` *true* apenas se `a` for maior ou igual a `b`|

### Operadores booleanos
|Operador|Descrição|
|-|-|
|and|E lógico: `a and b` será *true* apenas se `a` e `b` são *true*|
|or|OU lógico: `a or b` será *true* apenas se `a` for *true* ou `b` for *true*|
|not|NÃO lógico: `not a` será *true* se `a` for *false* e será *false* se `a` for *true*|

### Valores booleanos
Em *microScript*, não há um tipo booleano. `0` é considerado *false* e qualquer outro valor, *true*. Operadores de comparação retornam `1` para *true* ou `0` para *false*. Por conveniência, *microScript* também permite usar estas duas variáveis predefinidas:

|Variável|Valor|
|-|-|
|*true*|1|
|*false*|0|

### Condicional múltipla
It is possible to test multiple hypotheses using the keyword "elsif" (contraction of "else if")
É possível testar múltiploas hipóteses usando a palavra reservada `elsif` (contração de "*else if*")
```
if age<10 then
  print("criança")
elsif age<18 then
  print("adolescente")
elsif age<30 then
  print("adulto jovem")
else
  print("idade muito respeitável")
end
```

## Laços
Os laços permitem a realização de tarefas repetitivas.

### Laço *for*
O laço `for` é amplamente utilizado na programação. Ele permite que o mesmo tratamento seja realizado em todos os elementos de uma lista ou série de valores.
```
for i=1 to 10
  print(i)
end
```

O exemplo acima mostra cada número de 1 a 10 no console.
```
for i=0 to 10 by 2
  print(i)
end
```

O exemplo acima mostrada os números de 0 a 10, de dois em dois, no console.
```
list = [2,3,5,5,7,11]
for number in list
  print(number)
end
```

O exemplo acima define uma lista e mostra cada item da mesma.

### Laço *while*
O laço `while` permite que operações sejam realizadas repetidamente até que um resultado satisfatório seja obtido.
```
x = 1
while x*x<100
  print(x*x)
  x = x+1
end
```

O exemplo acima imprime o quadrado de `x`, depois incrementa `x` (ou seja, adiciona 1 a `x`), desde que o quadrado de `x` seja inferior a 100.

### *Break* e *continue*
Você pode sair de um laço `for` ou `while` prematuramente quando utilizar `break`. Exemplo:
```
while true
  x = x+1
  if x >= 100 then break end
end
```

Você pode pular as operações restantes de um laço e continuar para a próxima iteração do laço usando `continue`. Exemplo:
```
for i=0 to 10000
  if i%10 == 0 then continue end // isso irá pular o processamento dos múltiplos de 19
  doSomeProcessing(i)
end
```

## Operadores
Aqui está a lista de operadores binários em *microScript* (excluindo comparações, já mencionadas acima)

|Operador|Descrição|
|-|-|
|+|Adição|
|-|Subtração|
|*|Multiplicação|
|/|Divisão|
|%|Módulo: `x % y` é igual ao resto da divisão de `x` por `y`|
|^|Potência: `x ^ y` é igual a `x` elevado a `y`, tal como `pow(x,y)`|

## Funções predefinidas

### Funções
|Função|Descrição|
|-|-|
|max(a,b)|Retorna o maior número entre as opções `a` ou `b`|
|min(a,b)|Retorna o menor número entre as opções `a` ou `b`|
|round(a)|Retorna o valor um arredondado para o valor inteiro mais próximo|
|floor(a)|Retorna o valor um arredondado para baixo|
|ceil(a)|Retorna o valor um arredondado para cima|
|abs(a)|Retorna o valor absoluto de `a`|
|sqrt(a)|Retorna a raiz quadrada de `a`|
|pow(a,b)|Retorna `a` elevado a `b` (outra notação possível: `a ^ b`)|
|PI|Constante que é igual ao valor de *Pi*|
|log(a)|Retorna o logarítmo natural de a|
|exp(a)|Retorna o número de Euler elevado a `a`|

#### Funções trigonométricas em radianos
|Função|Descrição|
|-|-|
|sin(a)|Retorna o seno de `a` (`a` em radianos)|
|cos(a)|Retorna o cosseno de `a`(`a` em radianos)|
|tan(a)|Retorna tangente de `a` (`a` em radianos)|
|acos(a)|Retorna o arco cosseno de `a` (resultado em radianos)|
|asin(a)|Retorna o arco seno de `a` (resultado em radianos)|
|atan(a)|Retorna o arco tangente de `a` (resultado em radianos)|
|atan2(y,x)|Retorna o arco tangente de y/x (resultado em radianos)|

#### Funções trigonométricas em graus
|Função|Descrição|
|-|-|
|sind(a)|Retorna o seno de `a` (`a` em graus)|
|cosd(a)|Retorna o cosseno de `a` (`a` em graus)|
|tand(a)|Retorna tangente de `a` (`a` em graus)|
|acosd(a)|Retorna o arco cosseno de `a` (resultado em graus)|
|asind(a)|Retorna o arco seno de `a` (resultado em graus)|
|atand(a)|Retorna o arco tangente de `a` (resultado em graus)|
|atan2d(y,x)|Retorna o arco tangente de y/x (resultado em graus)|

### Números aleatórios
O objeto `random` é usado para gerar números pseudo-aleatórios. É possível inicializar o gerador com a função `seed` para obter a mesma sequência de números em cada execução, ou ao contrário, uma sequência diferente a cada vez.

|Função|Description|
|-|-|
|`random.next()`|Retorna um novo número aleatório entre 0 e 1|
|`random.nextInt(a)`|Retorna um novo número inteiro aleatório entre 0 e `a`|
|`random.seed(a)`|Redefine a sequência de números aleatórios usando o valor `a`; Se você usar o mesmo valor de inicialização duas vezes, obterá a mesma sequência de números aleatórios. Se a == 0, o gerador de número aleatório é inicializado ... aleatoriamente e, portanto, não reproduzível|

## Operações com *strings*
|Operação|Descrição|
|-|-|
|`string1 + string2`|O operador `+` pode ser usado para concatenar *strings*.|
|`string.length`|Campo que retém o comprimento da *string*.|
|`string.substring(i1,i2)`|Retorna a *substring* da *string*, iniciando no índice `i1` e terminando no índice `i2`|
|`string.startsWith(s)`|Retorna se a *string* inicia exatamente por `s`|
|`string.endsWith(s)`|Retorna se a *string* termina exatamente por `s`|
|`string.indexOf(s)`|Retorna o índice da primeira ocorrência de `s` na *string*, ou -1 se a *string* não contiver nenhuma ocorrência|
|`string.lastIndexOf(s)`|Retorna o índice da última ocorrência de `s` na *string*, ou -1 se a *string* não contiver nenhuma ocorrência|
|`string.replace(s1,s2)`|Retorna uma nova *string* em que a primeira ocorrência de `s1` (se houver) é substituída por` s2`|
|`string.toUpperCase()`|Retorna a *string* convertida para maiúsculas|
|`string.toLowerCase()`|Retorna a *string* convertida para minúsculas|
|`string.split(s)`|A função *split* divide a *string* em uma lista de *substrings*, procurando pela *substring* separadora fornecida como argumento e retorna uma lista|

## Operações com listas
|Operação|Descrição|
|-|-|
|`lista.length`|Retém a comprimento da lista (número de elementos na lista)|
|`lista.push(elemento)`|Adiciona um elemento ao fim da lista|
|`lista.insert(elemento)`|Insere um elemento no início da lista|
|`lista.insertAt(elemento, índice)`|Insere um elemento na lista no índice informado|
|`lista.indexOf(elemento)`|Retorna a posição do elemento na lista (0 para o primeiro elemento, 1 para o segundo elemento...). Retorna -1 quando o elemento não é encontrado na lista|
|`lista.contains(elemento)`|Retorna 1 (*true*) quando o `elemento` está na lista, ou 0 (*false*) quando o `elemento` não pode ser encontrado na lista|
|`lista.removeAt(índice)`|Remove da lista o elemento da posição `índice`|
|`lista.removeElement(elemento)`|Remove da lista `elemento`, se o mesmo puder ser encontrado na lista|
|`lista1.concat(lista2)`|Retorna uma nova lista concatenando `lista2` a `lista1`|

## Ordenando uma lista
Você pode ordenar os elementos de uma lista usando a função `lista.sortList (compareFunction)`. A `compareFunction` que você fornece tem que aceitar dois argumentos (que chamaremos de ` a` e `b`) e deve retornar:
|Valor de retorno|Quando|
|-|-|
|um número negativo|quando `a` for ordenado antes de `b`(`a` é menor que `b`)|
|zeroquando `a` e `b` tem posição igual em relação ao critério de comparação|
|um número positivo|quando `a` for ordenado após `b` (`a` é maior que `b`)|

##### exemplo
O exemplo abaixo assume que a lista contém *pontos*, cada ponto tendo um campo de coordenada `x`. Queremos classificar os pontos do menor valor de point.x para o maior valor de point.x:
```
compare = function(ponto1,ponto2)
  return ponto1.x - ponto2.x
end

list.sortList(compare)
```

Perceba que você pode tornar o código acima mais curto:
```
list.sortList(function(ponto1, ponto2) ponto1.x - ponto2.x end)
```

Sempre que uma função de comparação não for fornecida, os elementos da lista serão classificados de acordo com a ordem alfabética.

## Comentários
Comentários em *microScript* podem ser adicionados após uma barra dupla: `//`; tudo o que segue até a próxima quebra de linha é ignorado ao analisar o programa.

##### exemplo
```
myFunction = ()
  // Minhas notas sobre o funcionamento da função myFunction
end
```

## Classes
Uma classe em uma linguagem de programação se refere a um tipo de projeto ou modelo para a criação de objetos. Uma classe define propriedades e funções padrão que constituem o estado e comportamento padrão de todos os objetos que serão criados a partir dela. Você pode criar instâncias de objeto derivadas de uma classe, que herdarão todas as propriedades da classe. O uso de classes e seus objetos derivados em um programa é chamado de programação orientada a objetos (POO) ou em inglês *object-oriented programming (OOP)*.

Para ilustrar esses conceitos, veremos como você pode usar classes para gerenciar os inimigos em seu jogo:

### Definindo uma classe
Começaremos criando uma classe `Enemy` que será compartilhada por todos os nossos objetos inimigos. Cada inimigo terá uma posição (na tela). Ele terá pontos de vida `hp`, e se moverá a uma certa `velocity`:
```
Enemy = class
  constructor = function(position)
    this.position = position
  end

  hp = 10
  velocity = 1

  move = function()
    position += velocity
  end

  hit = function(damage)
    hp -= damage
  end
end
```

No *microScript*, classes e objetos são conceitos muito semelhantes e quase podem ser usados de forma intercambiável. A definição da classe, portanto, termina com a palavra-chave `end`. A primeira propriedade que definimos na classe acima é a função *construtor*. Esta função é chamada quando uma instância de objeto da classe é criada. Isso definirá a propriedade *position* do objeto. `this` se refere à instância do objeto na qual a função será chamada, portanto, definir` this.position` significa que o objeto define a posição da propriedade em si mesmo.

### Crie instâncias de objeto de uma classe
Vamos criar dois inimigos derivados da nossa classe:
```
enemy_1 = new Enemy(50)
enemy_2 = new Enemy(100)
```

O operador `new` é usado para criar uma nova instância de objeto derivada de uma classe. O argumento que passamos aqui é voltado para a função construtora de nossa classe. Assim, criamos uma instância inimiga na posição 50 e outra instância inimiga na posição 100.

Ambos os inimigos compartilham a mesma velocidade ou pontos de vida (HP). No entanto, podemos escolher definir uma velocidade diferente para o segundo inimigo:
```
enemy_2.velocity = 2
```

Agora podemos fazer nossos inimigos se moverem chamando:
```
enemy_1.move()
enemy_2.move()
```

O segundo inimigo se moverá duas vezes mais rápido porque alteramos sua propriedade `velocity` antes de chamar a função de movimento.

### Herança
Podemos fazer uma classe herdar de outra classe. Por exemplo, se quisermos criar uma variação de nosso `Enemy`, podemos fazer o seguinte:

```
Boss = class extends Enemy
  constructor = function(position)
    super(position)
    hp = 50
  end

  move = function()
    super()
    hp += 1
  end
end
```

Criamos uma nova classe `Boss` ampliando a classe` Enemy`. Nossa nova classe compartilha todas as propriedades do Inimigo, exceto que ela substitui algumas dessas propriedades por seus próprios valores. Chamar `super (position)` no construtor de nossa nova classe garante que o construtor de nossa classe pai `Enemy` também seja chamado.

Criamos um novo comportamento `move` para nosso chefe, que substitui o comportamento padrão do Inimigo. Nesta nova função, chamamos `super ()` para manter o comportamento padrão que foi definido na classe `Enemy`; então incrementamos o valor de `hp`, o que implica que nossos chefes irão recuperar pontos de saúde ao se moverem.

Podemos agora criar uma instância do nosso `Boss` na posição 120:
```
the_final_boss = new Boss(120)
```

##### notas
* espaço de variáveis: quando uma função é chamada em um objeto (como `enemy_1.move()`), as variáveis referidas no corpo das funções chamadas são as propriedades do objeto. Por exemplo, no corpo da função `move`, `position += 1` irá incrementar a propriedade `position` do próprio objeto.

* Às vezes é necessário usar `this` para garantir que estamos nos referindo corretamente a uma propriedade do nosso objeto. É por isso que, no construtor de nossa classe `Enemy`, usamos `this.position = position`, pois `position` também se refere ao argumento da função e, portanto, "mascara" a propriedade do nosso objeto.

* `super()` pode ser usado em uma função anexada a um objeto ou classe, para invocar a função igualmente nomeada da classe pai.
