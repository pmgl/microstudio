**microStudio** é um ambiente de desenvolvimento integrado para jogos.
Inclui todas as ferramentas de que você precisa para criar seu primeiro videogame!

**microStudio** oferece todas as seguintes possibilidades:

* um editor de sprite (imagens, em pixel art)
* um editor de mapas (ou seja, mapas ou níveis)
* um editor de código para programar em microScript, uma linguagem simples, mas poderosa
* Operação 100% online, permitindo que você teste seu jogo instantaneamente a qualquer momento durante seu desenvolvimento
* a possibilidade de instalar facilmente o jogo, concluído ou em andamento, em smartphones e tablets
* a capacidade de trabalhar com várias pessoas no mesmo projeto com sincronização instantânea
* Recursos de compartilhamento da comunidade que permitem que você explore os projetos de outras pessoas, aprenda e reutilize tudo o que quiser em seu próprio projeto.

# Início rápido

Você pode começar a explorar projetos feitos por outros usuários, na seção *Explorar*.

Para começar a criar um jogo é necessário criar uma conta. Escolha um apelido (evite usar
seu nome verdadeiro), digite seu endereço de e-mail (necessário em caso de esquecimento da senha; deve ser validado para poder publicar) e vamos lá!

## Primeiro projeto

Você pode criar um novo projeto vazio na seção *Criar* ou escolher um projeto existente na seção *Explorar* e clicar no botão "Clonar" para criar sua própria cópia e começar a personalizá-la.

### Programe

Uma vez que seu projeto foi criado, você está na seção *Código*. É aqui que você pode começar a programar. Tente copiar e colar o código abaixo:

```
draw = function()
  screen.drawSprite ("icon", 0, 0, 100, 100)
end
```

### Execute

Em seguida, clique no botão *Play* (*Executar*) no lado direito da tela. Seu programa é iniciado e você vê que o código acima exibe o ícone do projeto no meio da tela. Altere as coordenadas de exibição (os dígitos 0 e 100) para visualizar a variação da posição e dimensões do ícone.

### Modifique em tempo real

Você pode tornar o seu primeiro programa mais interativo, copiando e colando o código abaixo:

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

Agora, o programa permite que você mova o ícone do projeto com as setas do teclado. O significado das funções `update` e ` draw`, o teste das teclas do teclado com `keyboard`, o desenho feito na tela com `screen` serão explicados em detalhes posteriormente nesta documentação.

Você pode, ainda, ir para a seção *Sprites*, clicar no elemento "icon" e começar a editar a imagem. Ao retornar à seção *Código*, você verá que suas alterações são imediatamente consideradas no programa em execução.

# Explore

A seção principal *Explorar* permite que você descubra projetos criados por outros usuários. Você pode encontrar exemplos de jogos, modelos reutilizáveis, bibliotecas de sprites em diferentes estilos e temas. Se estiver interessado em um projeto específico, você pode cloná-lo, ou seja, criar uma cópia completa que você pode modificar e reutilizar para seus próprios fins.

Se você já abriu um de seus projetos na seção *Criar*, poderá importar cada sprite ou arquivo de origem dos projetos que está explorando para o seu projeto atual. Isso permite que você escolha imagens ou recursos de seu interesse entre os projetos públicos da comunidade e os reutilize para seus próprios fins.

# Crie um projeto

Você pode criar um projeto vazio na seção principal *Criar*. Seu projeto tem várias seções:

* **Código**: é aqui que você cria seus programas e começa a executar, testar e depurar seus projetos.
* **Sprites**: *sprites* são imagens que você pode desenhar e modificar nesta seção. Você pode consultá-los facilmente para exibi-los na tela ao programar o jogo.
* **Mapas**: Mapas são cenas ou níveis que você pode criar ao organizar os *sprites* em uma grade. Você pode mostrá-los facilmente na tela em seu programa.
* **Documentação**: Nesta seção você escreve a documentação do seu projeto; Pode ser um documento de *design*, um tutorial, um guia para reusar seu projeto como um template e etc.
* **Configurações**: Here you can set various options for your project; you can also invite other users to participate in your project with you.
* **Publicação**: Here you can make your project public; don't forget to create a description and add tags.

## Código

Nesta seção, você programa e testa seu projeto. Um arquivo de código fonte é criado automaticamente para seu projeto. Você pode adicionar outros para dividir as funcionalidades de seu projeto em vários subconjuntos.

O funcionamento de um programa microStudio é baseado em sua implementação de 3 funções essenciais:

* a função `init` onde você inicializa as suas variáveis
* a função `update` onde você anima seus objetos e escaneia as entradas
* a função `draw` onde você desenha na tela

<!--- help_start init = function --->
### Função `init()`

A função `init` é chamada apenas uma vez quando o programa é lançado. Ela é útil, em particular, para definir o estado inicial das variáveis globais que podem ser usadas no resto do programa.
<!--- help_end --->
##### exemplo

```
init = function()
  status = "bem-vindo"
  level = 1
  position_x = 0
  position_y = 0
end
```

### Função `update()`
<!--- help_start update = function --->
A função `update` é chamada 60 vezes por segundo. O corpo desta função é o melhor lugar para programar a lógica e a física do jogo: mudanças de estado, movimentos do *sprite* ou inimigo, detecção de colisão, teclado, avaliação das entradas de toque ou do controle, etc.
<!--- help_end --->

##### exemplo

```
update = function()
  if keyboard.UP then y = y+1 end
end
```

O código acima aumenta o valor da variável y em 1 a cada 60 segundos se a tecla `UP` no teclado for pressionada (seta para cima).

<!--- help_start draw = function --->
### Função `draw()`

A função `draw` é chamada tantas vezes quanto a tela puder ser atualizada. É aqui que você tem que desenhar sua cena na tela, por exemplo, preenchendo um grande retângulo colorido (para apagar a tela), depois desenhando alguns *sprites* ou formas em cima dela.
<!--- help_end --->

##### exemplo

```
draw = function()
  // preenche a tela com a cor preta
  screen.fillRect(0, 0, screen.width, screen.width, screen.height, "rgb(0,0,0)")
  // Desenha o sprite "icon" no centro da tela, no tamanho 100x100
  screen.drawSprite("icon",0,0,100,100)
end
```

Na maioria dos casos, `draw` é chamado 60 vezes por segundo. Mas alguns computadores ou tablets podem atualizar suas telas 120 vezes por segundo ou até mais. Também pode acontecer que o dispositivo que executa o programa esteja sobrecarregado e não possa atualizar a tela 60 vezes por segundo, neste caso, a função `draw` será chamada com menos freqüência. É por isso que `update` e `draw` são duas funções separadas: não importa o que aconteça, `update` será chamada 60 vezes por segundo; e quando `draw` é chamada, é hora de redesenhar a tela.

### Execução

Na seção *Código*, a parte direita da tela permite que você veja seu programa em ação, enquanto continua a modificar seu código-fonte. Para iniciar o programa, basta clicar no botão <i class="fa fa-play"></i>. Você pode interromper a execução de seu programa a qualquer momento, clicando no botão <i class="fa fa-pause"></i>.

### Console

Durante a execução do seu programa, você pode usar o console para executar comandos simples em *microScript*. Por exemplo, você pode simplesmente digitar o nome de uma variável para descobrir seu valor atual.

##### examples
Saber o valor atual da variável *position_x*
```
> position_x
34
>
```
Modificar o valor de *position_x*
```
> position_x = -10
-10
>
```
Chamar a função *draw()* para visualizar a mudança em *position_x* e seus efeito no desenho na tela (assumindo que a execução esteja em pausa)
```
> draw()
>
```

### Rastreios

No código do seu programa, você pode enviar texto para ser mostrado no console a qualquer momento, usando a função `print()`.

##### example

```
draw = function()
  // a implementação de draw()

  print(position_x)
end
```

## Sprites

Os *sprites* são imagens que podem se mover na tela. A ferramenta de desenho no *microStudio* permite criar *sprites*, que podem então ser usados no código do programa para exibi-los na tela na posição e tamanho desejados.

### Criar um sprite

Cada projeto tem um *sprite* padrão, chamado "icon", que atuará como ícone da aplicação. Você pode criar novos sprites clicando em *Adicionar um sprite*. Você pode renomeá-los como desejar e definir seu tamanho em pixels (largura x altura).

### Opções para desenho

*microStudio* oferece as funções clássicas de desenho: lápis, preencher, borracha, clarear, escurecer, suavizar, aumentar o contraste, alterar a saturação.

A ferramenta de conta-gotas pode ser usada a qualquer momento pressionando a tecla [Alt] no teclado.

As opções *tile* e simetria ajudarão você a criar *sprites* "repetíveis" ou *sprites* com um ou dois eixos de simetria.

##### Dica

Você pode importar arquivos de imagem para seu projeto microStudio. Para isso, arraste e solte arquivos PNG ou JPG (até 256x256 pixels em tamanho) para a lista de sprites.

## Mapas

Um mapa no microStudio é uma grade para a montagem de *sprites*. Ela permite a montagem de uma decoração ou a criação de um nível.

### Criar um mapa

Os mapas podem ser criados e renomeados tais como os *sprites*. É possível modificar o tamanho da grade (em número de células). Cada célula pode ser pintada com um *sprite*. É possível modificar o tamanho do *pixel* de cada célula, que deve geralmente refletir o tamanho dos *sprites* usados para pintar a grade.

## Configurações

A aba *Configurações* permite que você personalize alguns elementos de seu projeto.

### Opções

Você pode definir o título de seu projeto, seu identificador (usado para criar sua URL, ou seja, seu endereço na internet).

Você pode especificar se seu projeto deve ser usado no modo retrato ou paisagem. Esta escolha será levada em consideração ao instalar seu aplicativo em um smartphone ou tablet.

Você também pode especificar as proporções desejadas para a área de exibição na tela. Esta é uma opção para garantir que o aplicativo sempre tenha boa aparência quando instalado em dispositivos com telas de diferentes proporções.

### Usuários

A seção usuários permite que você convide amigos para participar de seu projeto. Você deve conhecer o apelido do amigo que você deseja convidar. Uma vez convidado, se ele aceitar seu convite, terá acesso total ao seu projeto e poderá fazer quaisquer mudanças que desejar (modificar, adicionar, apagar sprites, mapas, códigos, etc.). Entretanto, a modificação das opções do projeto e da lista de participantes é reservada ao proprietário do projeto.

## Publique

*microStudio* oferece algumas opções para publicar ou exportar seu projeto. Você pode exportar seu projeto como um aplicativo HTML5 autônomo, para distribuição on-line, em seu site ou em plataformas de distribuição de jogos. Você também pode tornar seu projeto público no *microStudio* permitindo que a comunidade brinque com ele, comente, explore o código-fonte e os ativos... Mais opções de exportação estão planejadas para o futuro.

### Torne o projeto público

Para tornar seu projeto acessível a todos (somente leitura), clique em "Tornar meu projeto público". Uma vez que seu projeto seja público, ele será exibido na aba de exploração do site do microStudio. Qualquer visitante poderá executar o jogo, visualizar e reutilizar o código-fonte e outros componentes do seu projeto.

Seu jogo tem uma *URL* permanente na forma `https://microstudio.io/author_nickname/game_id/`. É claro que você pode distribuir o *link* para qualquer pessoa ou você pode adicionar seu jogo ao seu site existente, incorporando-o em um *iframe*.

### Exportar para HTML5

Para exportar seu projeto completo para um aplicativo HTML5 autônomo, clique em "Exportar para HTML5". Isto aciona o download de um arquivo ZIP, contendo todos os arquivos necessários para executar seu jogo: sprites, alguns arquivos JavaScript, ícones e um arquivo HTML principal "index.html". Seu jogo pode ser executado localmente (clique duas vezes no arquivo index.html) ou você pode carregá-lo em seu site. Ele também está pronto para ser publicado em muitas plataformas de distribuição de jogos online que aceitam jogos HTML5 (sugerimos algumas no painel de exportação HTML5).

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
my_object["name"] = "object 1"
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
maFunction = function()
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

In the example above, **if** the value of the age variable is less than 18, **then** the instruction ``print("child")`` will be executed, **else** the instruction `print("adult")` will be executed.

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
O exemplo acuma define uma lista e mostra cada item da lista.

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

You can skip the remaining operations of a loop and continue to the next iteration of the loop with the statement `continue`. Example:

Você pode pular as operações restantes de um laço e continuar para a próxima iteração do laço com a usando `continue`. Exemplo:

```
for i=0 to 10000
  if i%10 == 0 then continue end // isso irá pular o processamento dos múltiplos de 19
  doSomeProcessing(i)
end
```

## Operadores

Here is the list of binary operators in *microScript* (excluding comparisons, already mentioned above)

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
|exp(a)|Returna o número de Euler elevado a `a`|

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

A class in a programming language refers to a kind of blueprint or template for creating objects. A class defines default properties and functions which constitute the default state and behavior of all objects that will be created from it. You can create object instances derived from a class, which will all inherit from the properties of the class. Using classes and their derived objects in a program is called object-oriented programming (OOP).

To illustrate these concepts, we will see how you can use classes to manage enemies in your game:

### Definindo uma classe

We will start by creating a class `Enemy` that will be shared by all our enemies objects. Each enemy will have a position (on screen). It will have health points `hp`, move at a certain `velocity`:

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

In microScript, classes and objects are very similar concepts and can almost be used interchangeably. The class definition thus ends with keyword `end`. The first property we defined in the class above is the function "constructor". This function is called when a object instance of the class is created. It will set the property *position* of the object. `this` refers to the object instance on which the function will be called, thus setting `this.position` means the object sets the property position on itself.

### Crie instâncias de objeto de uma classe

Let's create two enemies objects derived from our class:

```
enemy_1 = new Enemy(50)
enemy_2 = new Enemy(100)
```

The operator `new` is used to create a new object instance derived from a class. The argument we pass here will is aimed at the constructor function of our class. We thus have created an enemy instance at position 50 and another enemy instance at position 100.

Both enemies share the same velocity or health points (hp). However, we may choose to set a different velocity to the second enemy:

```
enemy_2.velocity = 2
```

We can now make our enemies move by calling:

```
enemy_1.move()
enemy_2.move()
```

The second enemy will move twice faster because we altered its property velocity before calling function move.

### Herança

We can make a class inherit from another class. For example, if we want to create a variation of our Enemy, we could do as follows:

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

We have created a new class `Boss` by extending the class `Enemy`. Our new class shares all properties from Enemy, except that it replaces some of these properties by its own values. Calling `super(position)` in the constructor of our new class ensures that the constructor of our parent class Enemy is also called.

We created a new behavior `move` for our Boss, which overrides the default behavior of Enemy. In this new function, we call `super()` in order to keep the default behavior that was defined in the class Enemy ; we then increment the value of `hp`, which implies that our Bosses will regain health points when moving.

We can now create an instance of our Boss at position 120:

```
the_final_boss = new Boss(120)
```

##### notas

* variables space: when a function is called on an object (like `enemy_1.move()`), the variables referred to in the body of the called functions are the properties of the object. For example, in the body of the move function, `position += 1` will increment the property `position` of the object itself.

* It is sometimes necessary to use `this` to ensure we are correctly referring to a property of our object. This is why, in the constructor of our class Enemy, we use `this.position = position`, because `position` also refers to the argument of the function and thus "hides" the property of our object.

* `super()` can be used in a function attached to an object or a class, to invoke the equally named function of the parent class.


# Referência das funções

## Display `screen`

In *microStudio* the screen is represented by the predefined object "screen". To display shapes or images on the screen, simply call functions (also called *methods*) on this object. For example:

```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```
The code above defines the drawing color as `#FFF` i. e. white (see explanations below). Then it draws a rectangle filled with this color, centered at the coordinates 0.0 of the screen (i.e. the center of the screen), of width 100 and height 100.

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
##### screen.clear(color)
Clears the screen (fills it with the provided color, or with black if no color is passed as argument).
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

The function can also accept an array as first argument and a color as second argument. In that case, the array is expected to hold the points coordinates like this: `screen.fillPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )`.

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon( x1, y1, x2, y2, x3, y3, ... , color )
Draws a polygon outline, defined by the list of point coordinates passed as arguments. The color is optional, if it is omitted, the last color used will be reused.
<!--- suggest_end --->

The function can also accept an array as first argument and a color as second argument. In that case, the array is expected to hold the points coordinates like this: `screen.drawPolygon( [ x1, y1 , x2, y2, x3, y3 ... ], color )`.

<!--- suggest_start screen.drawPolyline --->
##### screen.drawPolyline( x1, y1, x2, y2, x3, y3, ... , color )
Same as `drawPolygon` except that the drawing path will not be automatically closed.
<!--- suggest_end --->

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth( width )
Sets the line width for all subsequent line draw operation (drawLine, drawPolygon, drawRect etc.). The default line width is 1.
<!--- suggest_end --->

<!--- suggest_start screen.setLineDash --->
##### screen.setLineDash( array_of_values )
Sets the line dash style for all subsequent line draw operation (drawLine, drawPolygon, drawRect etc.). The argument must be an array of positive values, defining the length of lines and gaps.

#### example
```
screen.setLineDash([2,4])
```
<!--- suggest_end --->


### Display sprites and maps

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite( sprite, x, y, width, height)

Draws one of the sprites you created in the *Sprites* section on the screen. The first parameter is a string that corresponds to the name of the sprite to be displayed, for example `"icon"`. Then follow the x,y coordinates where to display the sprite (the sprite will be centered on these coordinates). Then the width and height of the display.
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

Draws part of a sprite on the screen. The first parameter is a string that corresponds to the name of the sprite to be displayed, for example `"icon"`. The next 4 parameters define the coordinate of a sub-rectangle of the sprite to actually be painted on screen (coordinate 0,0 is the top-left corner of the sprite). The last 4 parameters are the same as for `drawSprite`.
<!--- suggest_end --->

```
screen.drawSpritePart("icon",4,4,8,8,0,50,50,50)
```
The height can be omitted, as in the example above. In this case the height will be calculated according to the width and proportions of the sprite part.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap( map , x , y , width , height )
Draws one of the maps you created in the *Maps* section on the screen. The first parameter is a string that corresponds to the name of the map to be displayed, for example `map1`. Then follow the x,y coordinates where to display the map (the map will be centered on these coordinates). Then the width and height of the display.
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

<!--- suggest_start screen.drawTextOutline --->
##### screen.drawTextOutline( text, x, y, size, &lt;color&gt; )
Draws the outline of the text. Drawing an outline in a different color can be done after a `drawText` to increase the contrast. The thickness of the outline can be set with `screen.setLineWidth`.
<!--- suggest_end --->

```
screen.drawTextOutline("Hello!",0,0,30, "#F00")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont( font_name )
Defines the font to use for future calls to `drawText`.

**Available fonts in current version**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->

```
screen.setFont("BitCell")
```

**Tip**: the global variable `fonts` is an array of all available fonts in microStudio


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
Defines the drawing color as a linear gradient of color, i. e. a gradient. `x1 and y1` are the coordinates of the starting point of the gradient. `x2 and y2` are the coordinates of the ending point of the gradient. `color1` is the starting color (see `setColor` for the color values). "Color2" is the arrival color.
<!--- suggest_end --->

```
screen.setLinearGradient(0,100,0,-100, "#FFF", "#F00")
screen.fillRect(0,0,screen.width,screen.height)
```
The above example creates a gradient from white to red, from top to bottom of the screen, and then fills the screen with this gradient.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient( x, y, radius, color1, color2)
Defines the drawing color as a radial gradient of color, i.e. a gradient in the shape of a circle. `x` and `y` are the coordinates of the center of the circle. `radius` is the radius of the circle. `color1` is the color at the center of the circle (see `setColor` for the color values). `color2` is the color at the perimeter of the circle.
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
Defines a scale factor for drawing the next elements on the screen. `x` defines the scale factor on the x-axis and `y` the scale factor on the y-axis. A value of 2 will display twice as much. A value of -1 allows, for example, to flip a sprite (mirror), horizontally (x) or vertically (y).
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

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setBlending( blending )
Defines how subsequent drawing operations will be composed with the underlying, already drawn image. Can be set to `normal` or `additive`.

You can also use any of the compositing modes defined in the HTML5 Canvas specification with `setBlending`, for reference see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation

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

To make your program interactive, you need to know if and where the user presses a key on the keyboard, joystick, touches the touch screen. *microStudio* allows you to know the status of these different control interfaces, via the objects `keyboard` (for the keyboard), `touch` (for the touch screen / mouse), `mouse` (for mouse pointer / touch screen) `gamepad` (for the controller).

##### Note
The object `system.inputs` retains useful information on which input methods are available on the host system:

|Field|Value|
|-|-|
|system.inputs.keyboard|1 if the system is believed to have a physical keyboard, 0 otherwise|
|system.inputs.mouse|1 if the system has a mouse, 0 otherwise|
|system.inputs.touch|1 if the system has a touch screen, 0 otherwise|
|system.inputs.gamepad|1 if there is at least 1 gamepad connected to the system, 0 otherwise (the gamepad may appear connected only when the user has performed an action on it)|


### Keyboard inputs
<!--- suggest_start keyboard --->
Keyboard inputs can be tested using the `keyboard` object.
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

To test special characters such as +, - or even parentheses, you must use the following syntax: `keyboard["("]`, `keyboard["-"]`.

##### Test whether a key was just pressed
In the context of the function `update()`, you can check if a keyboard key was just pressed by the user using `keyboard.press.<KEY>`.

Example:

```
if keyboard.press.A then
  // Do something once, just as the user presses the key A
end
```

##### Test whether a key was just released
In the context of the function `update()`, you can check if a keyboard key was just released by the user using `keyboard.release.<KEY>`.

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

The mouse inputs can be tested with the `mouse` object (which also reports touch events).
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

In the same way as for keyboard key presses, you can use `gamepad.press.<BUTTON>` to check whether a button was just pressed or `gamepad.release.<BUTTON>` to check whether a button was just released.

## Sounds

*microStudio* currently allows you to play sounds and music you have imported to your project (as WAV files and MP3 files) or to create sounds programmatically using the legacy *beeper*.

### Play Sound
<!--- suggest_start audio.playSound --->
##### audio.playSound( name, volume, pitch, pan, loop )
Plays the given sound, with optional given playback settings.
<!--- suggest_end --->

##### arguments
|Argument|Description|
|-|-|
|name|The name of the sound (from the sounds tab of your project) to play|
|volume|[optional] The output volume for this sound playback, ranging from 0 to 1|
|pitch|[optional] The output pitch for this sound playback, 1 is the default pitch|
|pan|[optional] The pan setting for this sound playback, ranging from -1 (left) to 1 (right)|
|loop|[optional] Set to 1 (true) if you want the sound to loop indefinitely|

The function call returns an object. This object allows you to control the playback settings while the sound is being played:

##### example
```
my_sound = audio.playSound("soundname")
my_sound.setVolume(0.5)
```

|Control functions|description|
|-|-|
|my_sound.setVolume(volume)|Changes the playback volume of the sound (value ranging from 0 to 1)|
|my_sound.setPitch(pitch)|Changes the pitch of the sound (1 is default pitch)|
|my_sound.setPan(pan)|Changes the pan setting of the sound (value ranging from -1 to 1)|
|my_sound.stop()|Stops the playback of that sound|

### Play Music
<!--- suggest_start audio.playMusic --->
##### audio.playMusic( name, volume, loop )
Plays the given music, with optional given playback settings.
<!--- suggest_end --->

##### arguments
|Argument|Description|
|-|-|
|name|The name of the music (from the music tab of your project) to play|
|volume|[optional] The output volume for this music playback, ranging from 0 to 1|
|loop|[optional] Set to 1 (true) if you want the music to loop indefinitely|

The function call returns an object. This object allows you to control the playback settings while the music is being played:

##### example
```
my_music = audio.playMusic("musicname")
my_music.setVolume(0.5)
```

|Control functions|description|
|-|-|
|my_music.setVolume(volume)|Changes the playback volume of the music (value ranging from 0 to 1)|
|my_music.stop()|Stops the playback of that music|
|my_music.play()|Resumes the playback is you stopped it before|
|my_music.getPosition()|Returns the current playback position in seconds|
|my_music.getDuration()|Returns the total music duration in seconds|


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
|loop|followed by a number, indicates the number of times the following sequence will have to be repeated. The sequence ends with the keyword `end` example: `loop 4 C4 E G end`; the number 0 means that the loop must be repeated indefinitely.

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Cancels all sounds being played by the *beeper*. Useful for muting the sound after having started music loops.
<!--- suggest_end --->

## Sprite methods
Your program can access your project's sprites, which are stored in a predefined object `sprites`:

```
mysprite = sprites["icon"]
```

You can then access different fields and methods of your sprite:

|field/method|description|
|-|-|
|`mysprite.width`|The width of the sprite in pixels|
|`mysprite.height`|The height of the sprite in pixels|
|`mysprite.ready`|1 when the sprite is fully loaded, 0 otherwise|
|`mysprite.name`|Name of the sprite|

*Note: other fields and native methods may currently seem available when you inspect a sprite object in the console. Such undocumented fields and methods may break in the future, thus do not rely too much on them!*

## Map methods
Your program can access your project's maps, which are stored in a predefined object `maps`:

```
mymap = maps["map1"]
```

You can then access different fields and methods of your map:

|field/method|description|
|-|-|
|`mymap.width`|The width of the map in cells|
|`mymap.height`|The height of the map in cells|
|`mymap.block_width`|The width of the map cell in pixels|
|`mymap.block_height`|The height of the map cell in pixels|
|`mymap.ready`|1 when the map is fully loaded, 0 otherwise|
|`mymap.name`|Name of the map|
|`mymap.get(x,y)`|Returns the name of the sprite in cell (x,y) ; coordinates origin is (0,0), located at the bottom left of the map. Returns 0 if cell is empty|
|`mymap.set(x,y,name)`|Sets a new sprite in cell (x,y) ; coordinates origin is (0,0), located at the bottom left of the map. Third parameter is the name of the sprite.|
|`mymap.clone()`|Returns a new map which is a full copy of mymap.|

*Note: other fields and native methods may currently seem available when you inspect a map object in the console. Such undocumented fields and methods may break in the future, thus do not rely too much on them!*

## System
The object `system` allows to access the function `time`, which returns the elapsed time in milliseconds (since January 1st, 1970). But above all, invoked at various times, it makes it possible to measure time differences.

<!--- suggest_start system.time --->
### system.time()
Returns the elapsed time in milliseconds (since January 1, 1970)
<!--- suggest_end --->

## Storage
The `storage` object allows for the permanent storage of your application data. You can use it to store user progress, highscores or other status information about your game or project.

<!--- suggest_start storage.set --->
### storage.set( name , value )
Stores your value permanently, referenced by the string `name`. The value can be any number, string, list or structured object.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get( name )
Returns the value permanently recorded under reference string `name`. Returns `0` when no such record exists.
<!--- suggest_end --->
