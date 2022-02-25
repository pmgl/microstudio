# Tutorial

:project Урок: Создание игры

## Игра окончена

:position 50,50,40,40

### Игра окончена

В предыдущем уроке мы договорились установить новую переменную *gameover* в 1, когда игрок попадает в лезвие. Как только *gameover* будет установлена, нам нужно:

* остановить игру
* подождать 5 секунд
* перезапустить игру

Мы остановим игру, пропустив весь наш код в функции *update*. Мы подождем 5
секунд, увеличивая значение gameover в функции update, пока оно не достигнет 300.
Мы перезапустим игру, снова вызвав функцию *init*, убедившись, что она правильно сбросит все, что нам нужно.

## Игра окончена

### Игра окончена

Итак, изменим содержимое функции *update* следующим образом:

```
  if gameover > 0 then
    gameover += 1
    if gameover > 300 then init() end
  else
    // остальное содержимое функции обновления идет здесь
end
```

Функция *init* теперь используется для перезапуска игры через 5 секунд после окончания игры. Чтобы выполнить эту задачу необходимо сбросить *score*, начальную позицию *position* и сбросить значение *gameover* на ноль:

```
init = function()
  blades = [200, 300, 400]
  passed = [0, 0, 0]
  gameover = 0
  score = 0
  position = 0
end
```

## Игра окончена

### Игра окончена

Когда игра закончится, нам понадобится визуальная информация об этом! Для этого мы нарисуем полупрозрачный прямоугольник закрывающий весь игровой интерфейс, и нарисуем текст GAME OVER. Мы добавим это в конец нашей функции *draw*:

```
  if gameover then
    screen.fillRect(0, 0, screen.width, screen.height, "rgba(255,0,0,.5)")
    screen.drawText("GAME OVER", 0, 0, 50, "#FFF")
  end
```

## Ускорение игрового процесса

### Ускорение игрового процесса

Наша игра слишком проста. Давайте сделаем ее сложнее! Мы будем постепенно ускорять героя во время игры.
Для этого мы создадим переменную *speed*, которую инициализируем значением 2 в функции *init*:

```
  speed = 2
```
(в функции init)

Затем мы изменим строку ``position += 2`` в методе *update* следующим образом:

```
  position += speed
  speed += 0.001
```

Таким образом, мы увеличиваем скорость героя во время игрового процесса!

## Готово!

### Готово!

Мы закончили создание нашей игры. Полный код снова приведен ниже. Если вы посмотрите внимательно, то заметите, что мы добавили переменную *running*, цель которой - дождаться, пока игрок коснется экрана / щелкнет мышью, прежде чем запускать игру.

Мы также добавили некоторые звуки, которые воспроизводятся вызовом функции ``audio.beep()``. Вы можете проверить это в коде ниже.

Вы также можете начать добавлять в игру дополнительные функции. Почему бы не добавить летающие объекты, которые нужно избегать при прыжках? Все зависит от вас!

Спасибо, что прочитали это руководство, и удачи вам в работе с microStudio!


```
init = function()
  gameover = 0
  running = 0
  blades = [200, 300, 400]
  passed = [0, 0, 0]
  score = 0
  position = 0
  speed = 2
end

update = function()
  if gameover > 0 then
    gameover += 1
    if gameover > 300 then init() end
  elsif running then
    position += speed
    speed += 0.001

    if touch.touching and hero_y == 0 then
       hero_vy = 7
       audio.beep("square tempo 20000 volume 10 span 100 C4 to C6")
    end

    hero_vy -= 0.3
    hero_y = max(0, hero_y+hero_vy)

    for i=0 to blades.length-1
      if blades[i] < position-120 then
        blades[i] = position+280+random.next()*200
        passed[i] = 0
      end
      if abs(position-blades[i]) < 10 then
        if hero_y < 10 then
          running = 0
          gameover = 1
          audio.beep("saw tempo 10000 volume 50 span 50 C2 to C4 to C2 to C4")
        elsif not passed[i] then
          passed[i] = 1
          score += 1
          audio.beep("saw tempo 960 volume 50 span 20 C6")
        end
      end
    end
  else
    if touch.touching then running = 1 end
  end
end

draw = function()
  screen.clear("rgb(57, 0, 57)")

  for i=-6 to 6 by 1
    screen.drawSprite("wall", i*40-position%40, -80, 40)
  end

  screen.drawSprite("hero", -80,-50+hero_y,20)
  for i=0 to blades.length-1
    screen.drawSprite("blade", blades[i]-position-80, -50, 20)
  end

  screen.drawText(score, 120, 80, 20, "#FFF")
  if gameover then
    screen.fillRect(0, 0, screen.width, screen.height, "rgba(255,0,0,.5)")
    screen.drawText("GAME OVER", 0, 0, 50, "#FFF")
  elsif not running then
    screen.drawText("READY?", 0, 30, 50, "#FFF")
  end
end
```