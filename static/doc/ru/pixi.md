# Pixi.js
## Ускоренный 2D-рендеринг

Pixi.js - это JavaScript API с открытым исходным кодом для ускоренного 2D-рендеринга, использующий возможности графического процессора через WebGL.

Сайт: https://pixijs.com/

Github: https://github.com/pixijs/pixijs

## Основы

### Подключение Pixi.js

После создания проекта откройте вкладку настроек, нажмите "Показать дополнительные настройки" и выберите Pixi.js в качестве "Графической библиотеки".

### Создание сцены

Сцена или "stage"(этап) - это обычный контейнер Pixi:

```
stage = new PIXI.Container()
```

### Создание спрайта

```
my_sprite = PIXI.Sprite.from("mysprite")
stage.addChild(my_sprite)
```

### Обновление

Вы можете легко изменить положение, масштаб или вращение вашего спрайта:

```
  my_sprite.x += 1
  my_sprite.scale.y = 2
  my_sprite.rotation = PI/4
```

### Визуализация

Чтобы отобразить вашу сцену, в вашей реализации `draw()`, вызовите `screen.render`, передав этап для визуализации в качестве аргумента:

```
draw = function()
  screen.render(stage)
end
```

## Документация

### Официальная документация

https://pixijs.download/dev/docs/index.html

### Примеры

https://microstudio.dev/i/gilles/pixitest/