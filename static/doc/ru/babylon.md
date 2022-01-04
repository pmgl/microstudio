# Babylon.js
## API 3D-рендеринга

Babylon.js - это движок 3D-рендеринга с открытым исходным кодом, основанный на WebGL.

Сайт: https://www.babylonjs.com/

Github: https://github.com/BabylonJS/Babylon.js

## Основы

### Включение Babylon.js

После создания проекта откройте вкладку настроек, нажмите "Показать дополнительные настройки" и выберите Babylon.js в качестве "Графической библиотеки".

### Сцена

Создание новой сцены:

```
scene = new BABYLON.Scene()
```

### Добавление объектов

Добавление простой коробки:

```
box = BABYLON.MeshBuilder.CreateBox("box", object end, scene)
box.position.set(0,20,0)
```

### Добавление света

Добавление полусферического света:

```
light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
```

### Настройка камеры

Настраиваем камеру:

```
camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -100), scene)
```

### Рендеринг

В функции `draw()` вызовите `screen.render`, передав вашу сцену в качестве аргумента:

```
draw = function()
  screen.render(scene)
end
```

## Документация

### Официальная документация

https://doc.babylonjs.com/

### Примеры

* https://microstudio.dev/i/JimB007/babylonstarter/
* https://microstudio.dev/i/gilles/babylontest/
* https://microstudio.dev/i/JimB007/babylonparticles/