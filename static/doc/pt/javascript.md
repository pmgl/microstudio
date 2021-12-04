# JavaScript

## Configurando

Você pode escolher usar a linguagem de programação JavaScript para qualquer um de seus projetos. Abra a guia de configurações do projeto, clique em "Mostrar opções avançadas" e selecione JavaScript como Linguagem de Programação.

Seu projeto microStudio em JavaScript pode ser exportado para qualquer plataforma (HTML5, Windows, Mac, Linux, Android ...). Você também pode usar qualquer uma das APIs de renderização para 2D ou 3D, bem como qualquer uma das bibliotecas opcionais propostas.

## Exemplo simples

```
init = function() {
  x = 0 ;
  y = 0 ;
}

update = function() {
  if (keyboard.LEFT) { x = x-1 ; }
  if (keyboard.RIGHT) { x = x+1 ; }
  if (keyboard.UP) { y = y+1 ; }
  if (keyboard.DOWN) { y = y-1 ; }
}

draw = function() {
  screen.clear()
  screen.drawSprite("icon",x,y,50)
}
```
