# Python

## Настройка

Вы можете выбрать использование языка программирования Python для любого из ваших проектов. Откройте вкладку настроек проекта, нажмите "Показать дополнительные параметры" и выберите Python в качестве языка программирования.

Ваш проект Python microStudio может быть экспортирован в любую среду (HTML5, Windows, Mac, Linux, Android...). Вы также можете использовать любой из API рендеринга для 2D или 3D, а также любую из предложенных дополнительных библиотек.

## Советы

### Проверка пользовательского ввода

Пользовательский ввод может быть отсканирован в microStudio путем проверки полей в интерфейсах `keyboard`, `touch`, `mouse` или `gamepad`. Например, чтобы проверить, нажата ли клавиша `A`, вы можете проверить `keyboard.A`. Это поле может иметь 3 различных состояния:
* если вы еще не нажимали `A` в текущей сессии, `keyboard.A` является *неопределенным*
* `keyboard.A` равно `1` (`true` в microScript), если вы в данный момент нажимаете ее
* `keyboard.A` равно `0` (`false` в microScript), если вы нажимали ее раньше и не нажимаете в данный момент.

Чтобы проверить наличие таких полей в Python без ошибок, вам нужно проверить, определено ли поле на самом деле, прежде чем вы сможете проверить его значение:

```
  if hasattr(keyboard, "A"):
    if keyboard.A:
      doSomething()
```

Вот вспомогательная функция, которая может оказаться полезной:

```
def checkInput(obj, val):
  if hasattr(obj, val):
    return obj[val] != 0
  return 0
```

### Создание экземпляров классов

Особенно при использовании альтернативных графических библиотек или дополнительных библиотек, вам может потребоваться
инициализировать объекты JavaScript, как если бы вы использовали оператор `new` в JavaScript.
Для этого просто вызовите `.new` для класса, который вы хотите инициализировать:

```
  light = BABYLON.HemisphericLight.new("light", BABYLON.Vector3.new(0, 1, 0), scene)
```

## Простой пример


```
def init():
  global x,y
  x = 0
  y = 0

def checkInput(obj, val):
  if hasattr(obj, val):
    return obj[val] != 0
  return 0

def update():
  global x,y
  if checkInput(keyboard, "LEFT"):
    x = x-1
  if checkInput(keyboard, "RIGHT"):
    x = x+1
  if checkInput(keyboard, "UP"):
    y = y+1
  if checkInput(keyboard, "DOWN"):
    y = y-1
  pass

def draw():
  global x,y
  screen.clear()
  screen.drawSprite("icon", x, y, 30)
  pass
```