# Pixi.js
## Renderização 2D acelerada

Pixi.js é uma API JavaScript de código aberto para renderização 2D acelerada, aproveitando os benefícios da GPU por meio de WebGL.

Website: https://pixijs.com/

Github: https://github.com/pixijs/pixijs

## Básico

### Habilitando Pixi.js

Depois de criar seu projeto, abra a guia de configurações, clique em "Mostrar configurações avançadas" e escolha Pixi.js como "Biblioteca gráfica".

### Criando um stage

A cena ou "stage" é um Container Pixi normal:

```
stage = new PIXI.Container()
```

### Criando um sprite

```
my_sprite = PIXI.Sprite.from("mysprite")
stage.addChild(my_sprite)
```

### Atualizando

Você pode facilmente alterar a posição, escala ou rotação do seu sprite:

```
  my_sprite.x += 1
  my_sprite.scale.y = 2
  my_sprite.rotation = PI/4
```

### Renderização

Para renderizar sua cena, na sua implementação de `draw()`, apenas chame `screen.render`, passando o `stage` para o método `render` como um argumento:

```
draw = function()
  screen.render(stage)
end
```

## Documentação

### Documentação oficial

https://pixijs.download/dev/docs/index.html

### Exemplos

https://microstudio.dev/i/gilles/pixitest/
