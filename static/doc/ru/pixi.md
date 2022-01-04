# Pixi.js
## Ускоренный 2D-рендеринг

Pixi.js - это JavaScript API с открытым исходным кодом для ускоренного 2D-рендеринга, использующего возможности GPU через WebGL.

Сайт: https://pixijs.com/

Github: https://github.com/pixijs/pixijs

## Основы

### Включение Pixi.js

После создания проекта откройте вкладку настроек, нажмите "Показать дополнительные настройки" и выберите Pixi.js в качестве "Графической библиотеки".

### Создание сцены

Сцена или "стадия" - это обычный Pixi Container:

```
stage = new PIXI.Container()
```

### Создание спрайта

```
my_sprite = PIXI.Sprite.from("mysprite")
stage.add(my_sprite)
```

### Обновление

Вы можете легко изменить положение, масштаб или вращение вашего спрайта:

```
  my_sprite.x += 1
  my_sprite.scale.y = 2
  my_sprite.rotation = PI/4
```

### Рендеринг

Для рендеринга сцены, в вашей реализации `draw()`, просто вызовите `screen.render`, передав сцену для рендеринга в качестве аргумента:

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