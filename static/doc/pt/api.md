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

#### exemplo
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

Não esqueça de redefinir o fator de escala para 1, 1 após usá-lo!
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

##### exemplo
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

Da mesma forma que o teclado, você pode usar `gamepad.press.<BOTÃO>` para verificar se um botão acabou de ser pressionado ou `gamepad.release.<BOTÃO>` para verificar se um botão acabou de ser liberado.

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
|volume|[opcional] O volume de saída para esta reprodução de som, variando de 0 a 1|
|tom|[opcional] O tom de saída para esta reprodução de som, 1 é o tom padrão|
|distribuição|[opcional] A configuração da distribuição para esta reprodução de som, variando de -1 (esquerda) a 1 (direita)|
|laço|[opcional] Defina como 1 (`true`) se quiser que o som fique em laço indefinidamente|

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
Toca a música informada com configurações de reprodução fornecidas opcionais.
<!--- suggest_end --->

##### argumentos
|Argumento|Descrição|
|-|-|
|nome| O nome da música (da guia de músicas do seu projeto) a ser reproduzida|
|volume|[opcional] O volume de saída para esta reprodução de música, variando de 0 a 1|
|loop|[opcional] Defina como 1 (`true`) se quiser que a música fique em laço indefinidamente|

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
