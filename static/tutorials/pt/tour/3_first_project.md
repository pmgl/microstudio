# Tutorial

:project Tutorial: First project

## Primeiro Projeto

:position 30,30,40,40

:overlay

### Primeiro Projeto

Seu primeiro projeto já está criado! Você criará um personagem e programará o microStudio para exibi-lo na tela e fará com que ele possa ser movido pressionando as teclas de seta do teclado do computador.

## Criar um *Sprite*

### Criar um *Sprite*

Click **Sprites** to open the sprites editor.
Cliquem em **Sprites** para abrir o editor de *sprites*.

:highlight #projectview .sidemenu #menuitem-sprites

:auto

## Criar um *Sprite* 2

### Criar um *Sprite*

Clique no botão "Adicionar Sprite" para criar um novo *sprite*.

:navigate projects.sprites

:highlight #create-sprite-button

:auto

## Pinte seu *Sprite*

:navigate projects.sprites

:position 0,50,30,40

### Desenhe seu Personagem

Use as ferramentas de desenho no lado direito da tela para desenhar seu personagem. Você pode usar o tempo que precisar para esta tarefa!

Quando seu sprite estiver pronto, vá para a próxima etapa.

## Código 1

### Código

Agora clique em **Código**, iremos programar um pouco!

:highlight #projectview .sidemenu #menuitem-code

:auto

## Código

:navigate projects.code

:position 55,30,45,40

### Código

O código do seu projeto já está preenchido com a definição de três funções: ```init```, ```update``` e ```draw```. Trabalharemos no conteúdo da função ```draw```. Adicione a linha abaixo, entre as linhas ```draw = function()``` e a linha ```end```:

```
  screen.drawSprite("sprite", 0, 0, 20)
```

Seu código ficará assim:

```
draw = function()
  screen.drawSprite("sprite",0,0,20)
end
```

## Executar

:navigate projects.code

:position 55,55,45,40

### Execute seu Programa

Vamos fazer um teste! Clique no botão *Play* para executar seu programa.

:highlight #run-button

:auto

## Executar

:navigate projects.code

:position 55,55,45,40

### Executando

Seu personagem agora é exibido no centro da tela de visualização da execução. A linha de código que adicionamos chama a função ```drawSprite``` no objeto ``` screen```. A chamada é feita com parâmetros: o nome do *sprite* para exibir: "sprite " (certifique-se de que é realmente o nome do *sprite* que você criou), coordenadas x e y do ponto onde exibi-lo (0, 0 é o centro da tela) e o tamanho da exibição(20).

Você pode brincar com essas coordenadas para alterar a posição de desenho do *sprite*. Você notará que suas alterações são refletidas em tempo real na tela de visualização da execução.

## Adicione um Fundo

:navigate projects.code

### Adicione uma Cor de Fundo

Acima de nossa linha ```screen.drawSprite (...)```, adicionaremos a seguinte linha:

```
  screen.fillRect(0, 0, 400, 400, "#468")
```

```fillRect``` significa "preencher um retângulo". O parâmetro ```"#468"``` representa uma cor cinza-azulada. Clique nele e pressione CTRL, um seletor de cores aparecerá. Escolha a cor que mais gosta!

## Controle o Personagem

:navigate projects.code

### Controle o Personagem

Para controlar a posição de desenho do personagem, usaremos duas variáveis, ```x``` e ```y```.
Vamos mudar a linha de código que desenha o sprite, da seguinte maneira:

```
  screen.drawSprite("sprite", x, y, 20)
```

O personagem será desenhado nas coordenadas ```x```, ```y```.

## Controle

:navigate projects.code

### Controle o Personagem

Tudo o que precisamos agora é alterar o valor de ```x``` e ```y``` quando as teclas de seta do teclado são pressionadas. Insira a seguinte linha entre ```update = function ()``` e ```end```:

```
  if keyboard.LEFT then x = x - 1 end
```

Seu código completo agora será parecido com este:

```
init = function()
end

update = function()
  if keyboard.LEFT then x = x-1 end
end

draw = function()
  screen.fillRect(0,0,400,400,"rgb(140,198,110)")
  screen.drawSprite("sprite",x,y,20)
end
```

## Controle o Personagem

:navigate projects.code

### Controle o Personagem

Clique na tela visualização de execução e pressione a tecla de seta para a esquerda no teclado do computador. Você deverá ver o personagem se movendo para a esquerda!

Por que: a linha de código que adicionamos verifica se a tecla de seta para a esquerda está pressionada (```keyboard.LEFT```) e quando for o caso, o valor de ```x``` é reduzido em 1.

Sabendo que os outros identificadores de teclas de seta são *RIGHT*, *UP* e *DOWN*, adicione três linhas ao seu código para garantir que seu personagem possa se mover em todas as direções.

(Solução no próximo passo)

## Controle o Personagem

:navigate projects.code

### Controle o Personagem

Aqui está o código completo da função ```update``` para mover o personagem em todas as 4 direções com as teclas de seta do teclado:

```
update = function()
  if keyboard.LEFT then x = x - 1 end
  if keyboard.RIGHT then x = x + 1 end
  if keyboard.UP then y = y + 1 end
  if keyboard.DOWN then y = y - 1 end
end
```

## Fim

Este tutorial acabou. Agora você pode aprender mais sobre programação em *microScript*, iniciando o curso de Programação.
