# JavaScript

## Настройка

Вы можете выбрать использование языка программирования JavaScript для любого из ваших проектов. Откройте вкладку настроек проекта, нажмите "Показать дополнительные параметры" и выберите JavaScript в качестве языка программирования.

Ваш проект JavaScript microStudio может быть экспортирован в любую среду (HTML5, Windows, Mac, Linux, Android...). Вы также можете использовать любой из API рендеринга для 2D или 3D, а также любую из предложенных дополнительных библиотек.

## Простой пример

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