# Matter.js

## 2D физический движок

Matter.js - это 2D физический движок с открытым исходным кодом, написанный на JavaScript:

Сайт: https://brm.io/matter-js/

Репозиторий Github: https://github.com/liabru/matter-js

Вы можете подключить и использовать Matter.js в своем проекте microStudio, независимо от того, какой язык вы выбрали: microScript, JavaScript, Python, Lua.

## Основы

### Подключение Matter.js

После создания проекта откройте вкладку настроек и нажмите "Показать дополнительные параметры".
Выберите "Matter.js", чтобы подключить библиотеку для вашего проекта. API Matter.js будет отображаться в вашем коде как глобальная переменная `Matter`.

### Инициализация движка

Вы можете создать движок Matter с помощью этой строки:
```
engine = Matter.Engine.create()
```
Чтобы гравитация движка по умолчанию была направлена вниз, ее надо изменить:
```
engine.world.gravity.y = -0.5
```

### Добавление фигур

API иногда требует передачи объектов JavaScript в качестве аргументов, например
`{ isStatic: true }`. Из языка microScript вы передадите эквивалентный объект microScript: `object isStatic = true end`.
Вот так вы можете добавить объект неподвижной земли в ваш мир Matter:

```
ground = Matter.Bodies.rectangle(0, -50, 200, 10, object isStatic=true end)
Matter.Composite.add(engine.world, ground)
```

Затем вы можете добавить движущуюся коробку следующим образом:

```
box = Matter.Bodies.rectangle(0,50,20,20)
Matter.Composite.add(engine.world,box)
```

### Запуск симуляции

В теле вашей функции `update()` вызовите `Matter.Engine.update`:

```
update = function()
  Matter.Engine.update(engine, 1000/60)
end
```

### Рисование фигур

В процессе работы вашей функции `draw()` вы можете нарисовать все фигуры, которые вы добавили в мир.
Вот пример:

```
draw = function()
  screen.clear()
  screen.drawRect(ground.position.x, ground.position.y, 200, 10, "rgb(255, 0, 0)")
  screen.setDrawRotation(box.angle/PI*180)
  screen.drawRect(box.position.x, box.position.y, 20, 20, "#FF0")
  screen.setDrawRotation(0)
end
```

## Документация

### Официальная документация

Ссылка: https://brm.io/matter-js/docs/

Wiki: https://github.com/liabru/matter-js/wiki

### Примеры проектов

https://microstudio.dev/i/gilles/matterjstest/