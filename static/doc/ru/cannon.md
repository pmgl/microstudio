# Cannon
## 3D физический движок

Cannon.js - это 3D физический движок с открытым исходным кодом, написанный на JavaScript:

Сайт: https://schteppe.github.io/cannon.js/

Github: https://github.com/schteppe/cannon.js

Вы можете включить и использовать Cannon.js в своем проекте microStudio, независимо от того, какой язык вы выбрали: microScript, JavaScript, Python, Lua.

## Основы

### Включение Cannon.js

После создания проекта откройте вкладку настроек и нажмите "Показать дополнительные параметры".
Выберите "Cannon.js", чтобы подключить библиотеку для вашего проекта. API Cannon.js будет отображаться  в вашем коде как глобальная переменная `CANNON`.

### Создание мира

Первым шагом будет создание мира:
```
world = new CANNON.World()
```

Вы также можете установить вектор гравитации:

```
world.gravity.set(0, 0, -10)
```

### Добавление фигур

API иногда требует передавать объекты JavaScript в качестве аргументов, например
`{ mass: 0 , shape: new CANNON.Plane() }`. Из языка microScript вы передадите аналогичный объект microScript: `object mass = 0 shape = new CANNON.Plane() end`.
Вот так вы можете добавить объект неподвижной земли в ваш мир:

```
ground = new CANNON.Body(object
  mass = 0 // когда масса установлена на ноль, объект будет статичным
  shape = new CANNON.Plane()
end)

world.addBody(ground)
```

Затем вы можете добавить движущуюся сферу следующим образом:

```
sphere = new CANNON.Body(object
  mass = 5
  position = new CANNON.Vec3(0,0,200)
  shape = new CANNON.Sphere(5)
end)
world.addBody(sphere)
```

### Запуск симуляции

В теле вашей функции `update()` вызовите `world.step`:

```
update = function()
  world.step(1/60,1/60,10)
end
```

### Рисование

Для того чтобы визуализировать вашу симуляцию, вам придется создать 3D мир, используя BABYLON.js или micro 3D. Вы должны создать визуальные объекты для каждого из ваших физических объектов, добавить их в 3D-сцену и обновлять их положение.


## Документация

### Официальная документация

Ссылка: https://schteppe.github.io/cannon.js/docs/

Демо-версии: https://schteppe.github.io/cannon.js/

### Примеры проектов

https://microstudio.dev/i/gilles/cannondemo/