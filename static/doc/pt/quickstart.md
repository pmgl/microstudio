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
* **Configurações**: Aqui você pode escolher várias opções para o seu projeto; Você pode convidar outros usuários para participarem em seu projeto.
* **Publicação**: Aqui você pode tornar o seu projeto público; Não esqueça de criar uma descrição e adicionar *tags*.

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

##### exemplo
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
