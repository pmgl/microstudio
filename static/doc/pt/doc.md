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
  screen.fillRect(0, 0, 400, 400, "#000")
  screen.drawSprite("icon", x, y, 20, 20)
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
  screen.drawSprite("icon", 0, 0, 100, 100)
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

Você pode pular as operações restantes de um laço e continuar para a próxima iteração do laço com a usando `continue`. Exemplo:
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

The second enemy will move twice faster because we altered its property velocity before calling function move.

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

# Referência das funções

## Exibir (`screen`)
No *microStudio* a tela é representada pelo objeto predefinido `screen`. Para exibir formas ou imagens na tela, simplesmente chame as funções (também conhecidas como "métodos") neste objeto. Por exemplo:
```
screen.setColor("#FFF")
screen.fillRect(0,0,100,100,100)
```

O código acima define a cor do desenho como `#FFF`, ou seja, branco (veja explicações abaixo). Em seguida, desenha um retângulo preenchido com essa cor, centralizado nas coordenadas 0, 0 da tela (ou seja, o centro da tela), de largura 100 e altura 100.

Para tornar seu trabalho mais fácil, o *microStudio* dimensiona automaticamente as coordenadas da tela, independentemente da resolução real da tela. Por convenção, o menor tamanho de exibição (largura no modo retrato, altura no modo paisagem) é 200. O ponto de origem (0,0) sendo o centro da tela, a menor dimensão é, portanto, graduada de -100 a +100. A maior dimensão será graduada, por exemplo, de -178 a +178 (tela clássica 16:9), de -200 a +200 (tela 2:1, longa, smartphones mais recentes) etc.

![Coordenadas da tela](/doc/img/screen_coordinates.png "Coordenadas da tela")

<small>*Representação do sistema de coordenadas em uma tela 16:9 no modo retrato e no modo paisagem*</small>

### Definir uma cor
<!--- suggest_start screen.setColor --->
##### screen.setColor(cor)
Define a cor a ser usada para chamadas futuras de funções de desenho.

<!--- suggest_end --->
A cor é definida por uma sequência de caracteres, portanto, entre aspas "". É geralmente descrito por seus componentes RGB, ou seja, uma mistura de vermelho, verde e azul. Vários tipos de notações são possíveis:

* "rgb(255,255,255)": (rgb para vermelho (r), verde (g), azul (b)). Um valor para vermelho (r), verde (g) e azul (b) é indicado aqui, variando entre 0 e 255, no máximo. "rgb (255, 255, 255)" é branco, "rgb (255, 0, 0)" é vermelho, "rgb (0, 255, 0)" é verde etc. Para escolher uma cor mais facilmente, ao codificar, clique na cor rgb e mantenha pressionada a tecla Control (Ctrl) para exibir o seletor de cores.
* "#FFF" or "#FFFFFF": esta notação usa hexadecimal para descrever os 3 componentes de vermelho (r), verde (g) e azul (b). Hexadecimal é um sistema de notação numérica na "base 16", ou seja, usando 16 dígitos, de 0 a 9, em seguida, de A a F.
* existem outras notações que não são descritas aqui.

### Limpar a tela
<!--- suggest_start screen.clear --->
##### screen.clear(cor)
Limpa a tela (a preenche com a cor fornecida ou com preto se nenhuma cor for passada como argumento).
<!--- suggest_end --->

### Desenhar formas
<!--- suggest_start screen.fillRect --->
##### screen.fillRect(x, y, largura, altura, cor)
Desenhe um retângulo preenchido, centralizado nas coordenadas x e y, com a largura e altura especificadas. A cor é opcional, caso seja omitida, a última cor utilizada será reaproveitada.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRoundRect --->
##### screen.fillRoundRect(x, y, largura, altura, raio, cor)
Desenha um retângulo arredondado preenchido, centralizado nas coordenadas x e y, com a largura, altura e raio de curvatura especificados. A cor é opcional, caso seja omitida, a última cor utilizada será reaproveitada.
<!--- suggest_end --->

---

<!--- suggest_start screen.fillRound --->
##### screen.fillRound(x, y, largura, altura, cor)
Desenha uma forma redonda sólida (um disco ou elipse dependendo das dimensões usadas), centralizado nas coordenadas x  y, com a largura e altura especificadas. A cor é opcional, caso seja omitida, a última cor utilizada será reaproveitada.
<!--- suggest_end --->

<!--- suggest_start screen.drawRect --->
##### screen.drawRect(x, y, largura, altura, cor)
Desenha um contorno de retângulo, centralizado nas coordenadas x e y, com a largura e altura especificadas. A cor é opcional, caso seja omitida, a última cor utilizada será reaproveitada.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRoundRect --->
##### screen.drawRoundRect(x, y, largura, altura, raio, cor)
Desenha um contorno de retângulo arredondado, centralizado nas coordenadas x e y, com a largura, altura e raio de curvatura especificados. A cor é opcional, caso seja omitida, a última cor utilizada será reaproveitada.
<!--- suggest_end --->

---

<!--- suggest_start screen.drawRound --->
##### screen.drawRound(x, y, largura, altura, cor)
Desenha um contorno de forma redonda, centralizado nas coordenadas x e y, com a largura e altura especificadas. A cor é opcional, caso seja omitida, a última cor utilizada será reaproveitada.
<!--- suggest_end --->

<!--- suggest_start screen.drawLine --->
##### screen.drawLine(x1, y1, x2, y2, cor)
Desenha uma linha que une os pontos (x1, y1) e (x2, y2). A cor é opcional, caso seja omitida, a última cor utilizada será reaproveitada.
<!--- suggest_end --->

<!--- suggest_start screen.fillPolygon --->
##### screen.fillPolygon(x1, y1, x2, y2, x3, y3, ... , cor)
Preenche um polígono definido pela lista de coordenadas de pontos passadas como argumentos. A cor é opcional, caso seja omitida, a última cor utilizada será reaproveitada.
<!--- suggest_end --->

Esta função também pode aceitar um vetor como primeiro argumento e uma cor como segundo argumento. Nesse caso, espera-se que o array mantenha as coordenadas dos pontos como este: `screen.fillPolygon([x1, y1, x2, y2, x3, y3, ...], cor)`. 

<!--- suggest_start screen.drawPolygon --->
##### screen.drawPolygon(x1, y1, x2, y2, x3, y3, ... , cor)
Desenha um contorno de polígono, definido pela lista de coordenadas de pontos passadas como argumentos. A cor é opcional, caso seja omitida, a última cor utilizada será reaproveitada.
<!--- suggest_end --->

Esta função também pode aceitar um vetor como primeiro argumento e uma cor como segundo argumento. Nesse caso, espera-se que o array mantenha as coordenadas dos pontos como este: `screen.drawPolygon([x1, y1 , x2, y2, x3, y3, ...], cor)`.

<!--- suggest_start screen.drawPolyline --->
##### screen.drawPolyline(x1, y1, x2, y2, x3, y3, ... , cor)
O mesmo que `drawPolygon`, exceto que o caminho do desenho não será fechado automaticamente.
<!--- suggest_end --->

<!--- suggest_start screen.setLineWidth --->
##### screen.setLineWidth(largura)
Define a largura da linha para todas as operações subsequentes de desenho de linha (`drawLine`, `drawPolygon`, `drawRect` etc.). A largura padrão da linha é 1.
<!--- suggest_end --->

<!--- suggest_start screen.setLineDash --->
##### screen.setLineDash(vetor_de_valores)
Define o estilo do traçado de linha para todas as operações subsequentes de desenho de linha (`drawLine`, `drawPolygon`, `drawRect` etc.). O argumento deve ser uma matriz de valores positivos, definindo o comprimento das linhas e lacunas.

#### example
```
screen.setLineDash([2,4])
```
<!--- suggest_end --->

### Exibir *sprites* e mapas

<!--- suggest_start screen.drawSprite --->
##### screen.drawSprite(*sprite*, x, y, largura, altura)
Desenha um dos sprites que você criou na seção *Sprites*. O primeiro parâmetro é uma *string* que corresponde ao nome do sprite a ser exibido, por exemplo "icon". Em seguida, as coordenadas x, y onde o *sprite* será exibido (o *sprite* será centralizado nessas coordenadas). Em seguida, a largura e a altura.
<!--- suggest_end --->
```
screen.drawSprite("icon", 0, 50, 50, 50)
```
A altura pode ser omitida. Neste caso, a altura será calculada de acordo com a largura e proporções do sprite.

##### *Sprites* animados
*Sprites* animados desenharão automaticamente o quadro correto de acordo com as configurações de animação. Você pode definir o quadro atual de um *sprite* (por exemplo, para reiniciar a animação) desta forma:
```
sprites["sprite1"].setFrame(0) // 0 é o índice do primeiro quadro de animação
```

Você também pode desenhar um quadro de animação específico do seu sprite, acrescentando "." e o índice do quadro solicitado:
```
screen.drawSprite("sprite1.0",0,50,50,50)
```

The example above draws the frame 0 of sprite "sprite1".
O exemplo acima desenha o quadro 0 do *sprite* "sprite1".

<!--- suggest_start screen.drawSpritePart --->
##### screen.drawSpritePart(sprite, parte_x, parte_y, parte_largura, parte_altura, x, y, largura, altura)
Desenha parte de um *sprite* na tela. O primeiro parâmetro é uma *string* que corresponde ao nome do *sprite* a ser exibido, por exemplo "*icon*". Os próximos 4 parâmetros definem as coordenadas de um sub-retângulo do *sprite* a ser realmente pintado na tela (a coordenada 0,0 é o canto superior esquerdo do sprite). Os últimos 4 parâmetros são iguais aos de `drawSprite`.
<!--- suggest_end --->
```
screen.drawSpritePart("icon", 4, 4, 8, 8, 0, 50, 50, 50)
```
A altura pode ser omitida. Neste caso, a altura será calculada de acordo com a largura e proporções do sprite.

---

<!--- suggest_start screen.drawMap --->
##### screen.drawMap(mapa, x, y, largura, altura)
Desenha um dos mapas que você criou na seção *Mapas*. O primeiro parâmetro é uma *string* que corresponde ao nome do mapa a ser exibido, por exemplo `mapa1`. Em seguida, as coordenadas x, y para exibir o mapa (o mapa será centralizado nessas coordenadas). Em seguida, a largura e a altura.
<!--- suggest_end --->
```
screen.drawMap("mapa1", 0, 0, 300, 200)
```

### Exibir texto

<!--- suggest_start screen.drawText --->
##### screen.drawText(texto, x, y, tamanho, cor)
Desenha texto na tela. O primeiro parâmetro é o texto a ser exibido, depois as coordenadas x e y onde o texto será centralizado e, a seguir, o tamanho (altura) do texto. O último parâmetro é a cor, ela pode ser omitida, neste caso a última cor definida será reaproveitada.
<!--- suggest_end --->
```
screen.drawText("Olá!", 0, 0, 30, "#FFF")
```

<!--- suggest_start screen.drawTextOutline --->
##### screen.drawTextOutline(texto, x, y, tamanho, cor)
Desenha o contorno do texto. Desenhar um contorno em uma cor diferente pode ser feito após um `drawText` para aumentar o contraste. A espessura do contorno pode ser definida com `screen.setLineWidth`.
<!--- suggest_end --->
```
screen.drawTextOutline("Olá!", 0, 0, 30, "#F00")
```

---

<!--- suggest_start screen.setFont --->
##### screen.setFont(nome_da_fonte)
Define a fonte a ser utilizada em chamadas futuras a `drawText`.

**Fontes disponíveis na versão atual**: AESystematic, Alkhemikal, AlphaBeta, Arpegius, Awesome, BitCell, Blocktopia, Comicoro, Commodore64, DigitalDisco, Edunline, EnchantedSword, EnterCommand, Euxoi, FixedBold, GenericMobileSystem, GrapeSoda, JupiterCrash, Kapel, KiwiSoda, Litebulb8bit, LycheeSoda, MisterPixel, ModernDos, NokiaCellPhone, PearSoda, PixAntiqua, PixChicago, PixelArial, PixelOperator, Pixellari, Pixolde, PlanetaryContact, PressStart2P, RainyHearts, RetroGaming, Revolute, Romulus, Scriptorium, Squarewave, Thixel, Unbalanced, UpheavalPro, VeniceClassic, ZXSpectrum, Zepto
<!--- suggest_end --->
```
screen.setFont("BitCell")
```

**Dica**: a variável global `fonts` é um vetor com todas as fontes disponíveis no microStudio

<!--- suggest_start screen.textWidth --->
##### screen.textWidth(texto, tamanho)
Retorna a largura do texto fornecido quando desenhado na tela com o tamanho informado.
<!--- suggest_end --->
```
width = screen.textWidth("Meu Texto", 20)
```

### Parâmetros de desenho
<!--- suggest_start screen.setAlpha --->
##### screen.setAlpha
Define o nível geral de opacidade para todas as funções de desenho chamadas posteriormente. O valor 0 equivale a uma transparência total (elementos invisíveis) e o valor 1 corresponde a uma opacidade total (os elementos desenhados ocultam totalmente o que está abaixo).
<!--- suggest_end --->
```
screen.setAlpha(0.5) // os próximos elementos desenhados serão semitransparentes
```

Ao usar esta função para desenhar alguns elementos com um pouco de transparência, não se esqueça de redefinir o parâmetro alfa para seu valor padrão:
```
screen.setAlpha(1) // o valor padrão, opacidade total
```

---

<!--- suggest_start screen.setLinearGradient --->
##### screen.setLinearGradient(x1, y1, x2, y2, cor1, cor2)
Define a cor do desenho como um gradiente linear de cores. `x1 e y1` são as coordenadas do ponto inicial do gradiente. `x2 e y2` são as coordenadas do ponto final do gradiente. `cor1` é a cor inicial (consulte` setColor` para os valores das cores). `cor2` é a cor de chegada.
<!--- suggest_end --->
```
screen.setLinearGradient(0, 100, 0, -100, "#FFF", "#F00")
screen.fillRect(0, 0, screen.width, screen.height)
```

O exemplo acima cria um gradiente de branco a vermelho, de cima para baixo da tela, em seguida preenche a tela com esse gradiente.

---

<!--- suggest_start screen.setRadialGradient --->
##### screen.setRadialGradient( x, y, raio, cor1, cor2)
Define a cor do desenho como um gradiente radial de cores, ou seja, um gradiente na forma de um círculo. `x` e` y` são as coordenadas do centro do círculo. `raio` é o raio. `cor1` é a cor no centro do círculo (consulte` setColor` para os valores das cores). `cor2` é a cor no perímetro do círculo.
<!--- suggest_end --->
```
screen.setRadialGradient(0, 0, 100, "#FFF", "#F00")
screen.fillRect(0, 0, screen.width, screen.height)
```

O exemplo acima cria um gradiente de branco no centro da tela, para o vermelho na borda da tela, em seguida preenche a tela com esse gradiente.

---

<!--- suggest_start screen.setTranslation --->
##### screen.setTranslation(tx, ty)
Define a interpretação das coordenadas da tela para as operações de desenho subsequentes.
<!--- suggest_end --->
```
screen.setTranslation(50, 50)
screen.fillRect(0, 0, 20, 20)
```

O retângulo do exemplo acima, será desenhado com o centro nas coordenadas 50, 50

Não se esqueça de redefinir a interpreação das coordenadas para 0,0 sempre que precisar parar de deslocar as operações de desenho.
```
screen.setTranslation(0, 0)
```

<!--- suggest_start screen.setDrawRotation --->
##### screen.setDrawRotation(ângulo)
Define um ângulo de rotação para as próximas operações de desenho. O ângulo é expresso em graus.
<!--- suggest_end --->
```
screen.setDrawRotation(45)
screen.drawSprite ("icon", 0, 0, 100)
```

O exemplo acima mostra o ícone do projeto, inclinado 45 graus.

Não se esqueça de redefinir o ângulo de rotação para 0 depois de usá-lo!
```
screen.setDrawRotation(0) // retorna o ângulo de rotação para o valor padrão
```

<!--- suggest_start screen.setDrawScale --->
##### screen.setDrawScale(x, y)
Define um fator de escala para desenhar os próximos elementos na tela. `x` define o fator de escala no eixo x e `y` o fator de escala no eixo y. Um valor de 2 será exibido em uma escala duas vezes maior. Um valor de -1 permite, por exemplo, espelhar um *sprite* horizontalmente (x) ou verticalmente (y).
<!--- suggest_end --->
```
screen.setDrawScale(1, -1)
screen.drawSprite ("icon", 0, 0, 100)
```
O exemplo acima mostra o ícone do projeto, espelhado verticalmente.

Não esqueça de redefinir o falor de escala para 1, 1 após usá-lo!
```
screen.setDrawScale(1,1) // retorna o fator de escala para o seu valor padrão.
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setDrawAnchor(âncora_x, âncora_y)
Por padrão, todas as operações de desenho consideram suas coordenadas como o centro da forma a ser desenhada. Você pode mudar isso chamando
`screen.setDrawAnchor (âncora_x, âncora_y)` para especificar um ponto de ancoragem diferente para formas de desenho. 

<!--- suggest_end --->
No eixo x, o ponto de ancoragem pode ser definido como -1 (lado esquerdo da forma), 0 (centro da forma), 1 (lado direito da forma) ou qualquer valor intermediário. No eixo y, o ponto de ancoragem pode ser definido como -1 (parte inferior da forma), 0 (centro da forma), 1 (parte superior da forma) ou qualquer valor intermediário.

Exemplos
```
screen.setDrawAnchor(-1, 0) // útil para alinhar o texto à esquerda
screen.setDrawAnchor(-1, -1) // suas coordenadas de desenho agora são interpretadas como o canto inferior esquerdo de sua forma
screen.setDrawAnchor(0, 0) // valor padrão, todas as formas serão desenhadas centralizadas em suas coordenadas
```

<!--- suggest_start screen.setDrawAnchor --->
##### screen.setBlending(*blending*)
Define como as operações de desenho subsequentes serão compostas com a imagem subjacente já desenhada. Pode ser definido como `normal` ou `additive`.

Você também pode usar qualquer um dos modos de composição definidos na especificação HTML5 Canvas com `setBlending`, para referência, consulte https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation

<!--- suggest_start screen.width --->
##### screen.width
O campo "largura" do objeto `screen` contém a largura atual da tela como seu valor (sempre 200 se a tela estiver em modo retrato, veja *coordenadas da tela*).
<!--- suggest_end --->

<!--- suggest_start screen.height --->
##### screen.height
O campo "altura" do objeto `screen` contém a altura atual da tela como seu valor (sempre 200 se a tela estiver em modo paisagem, veja *coordenadas da tela*).
<!--- suggest_end --->

<!--- suggest_start screen.setCursorVisible --->
##### screen.setCursorVisible(visibilidade)
Você pode usar essa função para mostrar ou esconder o cursor do *mouse*.
<!--- suggest_end --->


## Entradas, controle
Para tornar seu programa interativo, você precisa saber se e onde o usuário pressiona uma tecla no teclado, joystick, toca a tela sensível ao toque. * microStudio * permite saber o estado dessas diferentes interfaces de controle, através dos objetos `keyboard` (para o teclado), `touch` (para a tela de toque / mouse), `mouse` (para ponteiro do mouse / tela de toque) `gamepad` (para o controle).

##### Nota
O objeto `system.inputs` retém informações úteis sobre quais métodos de entrada estão disponíveis no sistema *host*:

|Campo|Valor|
|-|-|
|system.inputs.keyboard|1 se o sistema tiver um teclado físico, caso contrário 0|
|system.inputs.mouse|1 se o sistema tiver um mouse, caso contrário 0|
|system.inputs.touch|1 se o sistema tiver uma tela sensível ao toque, caso contrário 0|
|system.inputs.gamepad|1 se houver pelo menos 1 controle conectado ao sistema, caso contrário 0 (o controle pode aparecer conectado ao sistema apenas quando o usuário executar alguma ação no mesmo)|

### Entradas por teclado
<!--- suggest_start keyboard --->
Entradas feitas pelo teclado podem ser testadas usando o objeto `keyboard`.
<!--- suggest_end --->

##### example
```
if keyboard.A then
  // a tecla A foi pressionada
end
```

Observe que ao testar seu projeto, para que os eventos de teclado cheguem à janela de execução, é necessário clicar primeiro nele.

O código abaixo mostra o ID de cada tecla do teclado pressionada. Pode ser útil para você estabelecer a lista de identificadores que você precisará para seu projeto.
```
draw = function()
  screen.clear()
  local y = 80
  for key in keyboard
    if keyboard[key] then
      screen.drawText(key, 0, y, 15, "#FFF")
      y -= 20
    end
  end
end
```

*microStudio* cria para você alguns códigos genéricos úteis, como *UP*, *DOWN*, *LEFT* e *RIGHT* que reagem às teclas de seta e ZQSD / WASD dependendo do layout do seu teclado.

Para testar caracteres especiais como +, - ou mesmo parênteses, você deve usar a seguinte sintaxe: `keyboard["("]`, `keyboard["-"]`.

##### Testar se uma tecla acabou de ser pressionada
No contexto da função `update()`, você pode verificar se uma tecla foi pressionada pelo usuário usando `keyboard.press.<TECLA>`.

Exemplo:
```
if keyboard.press.A then
  // Faça algo, assim que o usuário pressionar a tecla A
end
```

##### Testar se uma tecla acabou de ser liberada
No contexto da função `update()`,você pode verificar se uma tecla foi liberada pelo usuário usando `keyboard.release.<TECLA>`.

Exemplo:
```
if keyboard.release.A then
  // Faça algo, assim que o usuário liberar a tecla A
end
```


<!--- suggest_start touch --->
### Entradas por toque
Entradas feitas por toque podem ser testadas usando o objeto `touch` (que também informa o estado do mouse).
<!--- suggest_end --->

|Campo|Valor|
|-|-|
|touch.touching|`true` se o usuário tocar a tela, caso contrário `false`|
|touch.x|Posição x quando a tela é tocada|
|touch.y|Posição y quando a tela é tocada|
|touch.touches|Caso você precise levar em consideração vários pontos de contato simultaneamente, `touch.touches` é uma lista de pontos de contato ativos no momento|
|touch.press|`true` se a tela acabou de ser tocada|
|touch.release|`true` se a tela deixou de ser tocada|
```
if touch.touching then
  // o usuário tocou na tela
else
 // o usuário não tocou na tela
end
```

```
draw = function()
  for t in touch.touches
    screen.drawSprite("icon", t.x, t.y, 50)
  end
end
```

O exemplo acima mostra o ícone do projeto em cada ponto de toque ativo na tela.

<!--- suggest_start mouse --->
### Entradas por *mouse*
Entradas feitas por *mouse* podem ser testadas usando o objeto `mouse` (que também informa o estado dos eventos de toque).
<!--- suggest_end --->

|Campo|Valor|
|-|-|
|mouse.x|Posição x do ponteiro do *mouse*|
|mouse.y|Posição y do ponteiro do *mouse*|
|mouse.pressed|1 se qualquer botão do *mouse* for pressionado, caso contrário 0|
|mouse.left|1 se o botão esquerdo do *mouse* for pressionado, caso contrário 0|
|mouse.right|1 se o botão direito do *mouse* for pressionado, caso contrário 0|
|mouse.middle|1 se o botão do meio do *mouse* for pressionado, caso contrário 0|
|mouse.press|`true` se um botão do mouse acabou de ser pressionado|
|mouse.release|`true` se um botão do mouse acabou de ser liberado|

### Entradas por controle (*gamepad*)
<!--- suggest_start gamepad --->
O estado dos botões e *joysticks* no controle (*gamepad*) pode ser testado usando o objeto `gamepad`.
<!--- suggest_end --->

##### exemplo
```
if gamepad.UP then y += 1 end
```

**Dica**: Para obter uma lista completa dos campos do objeto `gamepad`, basta digitar "gamepad" no console quando o programa estiver em execução.

Da mesma forma que o teclado, você pode usar `gamepad.press.<BOTÃO>` para verificar se um botão acabou de ser pressionado ou `gamepad.release. <BOTÃO>` para verificar se um botão acabou de ser liberado.

## Sons
Atualmente, o *microStudio* permite que você reproduza sons e músicas importados para o seu projeto (como arquivos WAV e MP3) ou crie sons programaticamente usando o *beeper* legado.

### Tocar som
<!--- suggest_start audio.playSound --->
##### audio.playSound(nome, volume, tom, distribuição, laço)

Reproduz o som informado com configurações de reprodução fornecidas opcionais.
<!--- suggest_end --->

##### argumentos
|Argumento|Descrição|
|-|-|
|nome|O nome do som (da guia de sons do seu projeto) a ser reproduzido|
|volume|[optional] O volume de saída para esta reprodução de som, variando de 0 a 1|
|tom|[optional] O tom de saída para esta reprodução de som, 1 é o tom padrão|
|distribuição|[optional] A configuração da distribuição para esta reprodução de som, variando de -1 (esquerda) a 1 (direita)|
|laço|[optional] Defina como 1 (`true`) se quiser que o som fique em laço indefinidamente|

A chamada de função retorna um objeto. Este objeto permite que você controle as configurações de reprodução enquanto o som está sendo reproduzido:

##### exemplo
```
my_sound = audio.playSound("nome_do_som")
my_sound.setVolume(0.5)
```

|Funções de controle|Descrição|
|-|-|
|my_sound.setVolume(volume)|Muda o volume de reprodução do som (variando de 0 a 1)|
|my_sound.setPitch(tom)|Muda o tom do som (1 é o tom padrão)|
|my_sound.setPan(distribuição)|Muda a distribuição sonora (o valor deve estar entre -1 e 1)|
|my_sound.stop()|Para a reprodução do som|

### Tocar música
<!--- suggest_start audio.playMusic --->
##### audio.playMusic(nome, volume, laço)
Plays the given music, with optional given playback settings.
Toca a música informada com configurações de reprodução fornecidas opcionais. 
<!--- suggest_end --->

##### argumentos
|Argumento|Descrição|
|-|-|
|nome| O nome da música (da guia de músicas do seu projeto) a ser reproduzida|
|volume|[optional] O volume de saída para esta reprodução de música, variando de 0 a 1|
|loop|[optional] Defina como 1 (`true`) se quiser que a música fique em laço indefinidamente|

The function call returns an object. This object allows you to control the playback settings while the music is being played:
A chamada de função retorna um objeto. Este objeto permite que você controle as configurações de reprodução enquanto a música está sendo reproduzida:

##### exemplo
```
my_music = audio.playMusic("nome_da_música")
my_music.setVolume(0.5)
```

|Funções de controle|descrição|
|-|-|
|my_music.setVolume(volume)|Muda o volume de reprodução da música (variando de 0 a 1)|
|my_music.stop()|Para a reprodução da música|
|my_music.play()|Retoma a reprodução caso você a tenha parado anteriormente|
|my_music.getPosition()|Retorna a posição atual da reprodução em segundos|
|my_music.getDuration()|Retorna a duração total da música em segundos|


<!--- suggest_start audio.beep --->
### audio.beep
Toca um som descrito pela *string* passada como parâmetro.
```
audio.beep("C E G")
```
<!--- suggest_end --->
Exemplo mais detalhado e explicações na tabela abaixo:
```
"saw duration 100 span 50 duration 500 volume 50 span 50 loop 4 C2 C F G G G F end"
```

|Comando|Descrição|
|-|-|
|saw|indica o tipo de gerador de som (cor do som), possíveis valores: *saw*, *sine*, *square*, *noise*|
|duration|seguido por um número de milissegundos indica a duração das notas|
|tempo|seguido por um número de notas por minuto, indica o tempo|
|span|seguido por um número entre 1 e 100, indica o percentual de manutenção de cada nota|
|volume|seguido por um número entre 0 e 100, define o volume|
|C|ou D, E, F etc. indica uma nota a ser tocada. É possível indicar a oitava também, exemplo C5 para o C da 5ª oitava do teclado.|
|loop|seguido por um número, indica o número de vezes que a sequência terá que ser repetida. A sequência termina com a palavra-chave `end`, exemplo:` loop 4 C4 E G end`; o número 0 significa que o loop deve ser repetido indefinidamente.|

<!--- suggest_start audio.cancelBeeps --->
### audio.cancelBeeps
Cancela todos os sons reproduzidos pelo *beeper*. Útil para silenciar o som depois de iniciar os loops de música.
<!--- suggest_end --->

## Métodos de *sprite*
Seu programa pode acessar os *sprites* do seu projeto, que são armazenados em um objeto predefinido `sprites`:
```
mysprite = sprites["icon"]
```

Você pode então acessar diferentes campos e métodos de seu *sprite*:

|campo/método|descrição|
|-|-|
|`mysprite.width`|A largura do *sprite* em pixels|
|`mysprite.height`|A altura do *sprite* em pixels|
|`mysprite.ready`|1 quando o *sprite* está completamente carrecado, caso contrário 0|
|`mysprite.name`|Nome do *sprite*|

*Nota: outros campos e métodos nativos podem parecer disponíveis quando você inspeciona um objeto sprite no console. Esses campos e métodos não documentados podem falhar no futuro, portanto, não confie muito neles!*

## Métodos de mapa
Seu programa pode acessar os mapas de seu projeto, que são armazenados em um objeto predefinido `maps`:
```
mymap = maps["mapa1"]
```

Você pode então acessar diferentes campos e métodos de seu mapa:

|campo/método|descrição|
|-|-|
|`mymap.width`|A largura do mapa em células|
|`mymap.height`|A altura do mapa em células|
|`mymap.block_width`|A largura da célula do mapa em pixels|
|`mymap.block_height`|A altura da célula do mapa em pixels|
|`mymap.ready`|1 quando o mapa está completamente carregado, caso contrário 0|
|`mymap.name`|Nome do mapa|
|`mymap.get(x,y)`|Retorna o nome do *sprite* na célula (x, y); a origem das coordenadas é (0,0), localizada na parte inferior esquerda do mapa. Retorna 0 se a célula estiver vazia|
|`mymap.set(x,y,nome)`|Define um novo sprite na célula (x, y); a origem das coordenadas é (0,0), localizada na parte inferior esquerda do mapa. O terceiro parâmetro é o nome do *sprite*.|
|`mymap.clone()`|Retorna um novo mapa que é uma cópia completa de mymap.|

*Nota: outros campos e métodos nativos podem parecer disponíveis quando você inspeciona um objeto mapa no console. Esses campos e métodos não documentados podem falhar no futuro, portanto, não confie muito neles!*

## Sistema
O objeto `system` permite acessar a função `time`, que retorna o tempo decorrido em milissegundos (desde 1º de janeiro de 1970). Mas, acima de tudo, invocado em vários momentos, permite medir as diferenças de tempo.

<!--- suggest_start system.time --->
### system.time()
Retorna o tempo decorrido em milissegundos (desde 1º de janeiro de 1970)
<!--- suggest_end --->

## Armazenamento
O objeto `storage` permite o armazenamento permanente dos dados do seu aplicativo. Você pode usá-lo para armazenar o progresso do usuário, recordes ou outras informações de status sobre o seu jogo ou projeto.

<!--- suggest_start storage.set --->
### storage.set(nome, valor)
Armazena seu valor permanentemente, referenciado pela string `nome`. O valor pode ser qualquer número, *string*, lista ou objeto estruturado.
<!--- suggest_end --->

<!--- suggest_start storage.get --->
### storage.get(nome)
Retorna o valor registrado permanentemente na *string* de referência `nome`. Retorna `0` quando não existe tal registro.
<!--- suggest_end --->
