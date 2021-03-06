# Tutorial

:project Урок: Создание игры

## Лезвия

:position 50,50,40,40

### Лезвия

Теперь мы добавим некоторые препятствия, которые наш герой должен избегать, прыгая. Мы назовем их лезвия, но вы можете придумать их как угодно, если они выглядят достаточно опасно!

Откройте вкладку спрайтов, нажмите "Добавить спрайт", чтобы создать новый спрайт, не забудьте переименовать его в "blade" чтобы он правильно работал с остальной частью этой серии уроков. Нарисуйте свой опасный клинок!

## Инициализация лезвий

### Инициализация лезвия

Теперь, когда ваш спрайт "blade" готов, мы создадим набор лезвий с помощью кода, отобразим их и заставим их возрождаться впереди героя после того, как они исчезли позади него.

Мы инициализируем два массива в теле функции ``init``. Первый массив, ``blades``, будет содержат положение наших трех лезвий. Второй массив, ``passed``, будет использоваться для записи того, когда определенное лезвие было успешно перепрыгнуто нашим героем.

```
init = function()
  blades = [200, 300, 400]
  passed = [0, 0, 0]
end
```

## Создание "поведения" лезвий

### Создание "поведения" лезвий

Когда наш герой бежит по стене, лезвия будут двигаться к нему и исчезать позади него.
После исчезновения мы повторно используем одно и то же лезвие и заставим его возродиться впереди героя в немного случайном месте. Код ниже проходит по нашему списку лезвий и делает именно это. Он должен быть вставить в тело функции ``update``.

```
  for i=0 to blades.length-1
    if blades[i] < position-120 then
      blades[i] = position+280+random.next()*200
      passed[i] = 0
    end
  end
```

При возрождении лезвия впереди пользователя, мы также обнуляем значение в списке ``passed``, позже вы поймете, почему.

## Отображение лезвий

### Отображение лезвий

Теперь мы должны отобразить клинки на экране. Для этого добавьте приведенный ниже код в тело нашей функции ``draw``.
Этот код проходит по позициям лезвий и рисует спрайт "blade" в их местоположении.

```
  for i=0 to blades.length-1
    screen.drawSprite("blade", blades[i]-position-80, -50, 20)
  end
```

Координата x для рисования спрайта вычисляется как разница между положением лезвия и глобальной переменной *position*.
Таким образом, когда позиция лезвия равна позиции героя, оба будут отрисованы в одном и том же месте.

## Тестирование столкновений с лезвиями

### Тестирование столкновений с клинками

Теперь мы проверим, сталкивается ли герой с лезвием или перепрыгивает через него. Для каждого лезвия мы проверим разницу между положением лезвия и положением героя. Если абсолютное значение разницы достаточно мало, мы можем считать, что они перекрываются. Теперь, если вертикальная позиция героя достаточно высока, герой прыгает и на самом деле не задет лезвием.
Вот как это переводится в код, который нужно вставить в *цикл for* в теле функции *update*:

```
    if abs(position-blades[i]) < 10 then
      if hero_y < 10 then
        gameover = 1
      elsif not passed[i] then
        passed[i] = 1
        score += 1
      end
    end
```

В приведенном выше коде мы установили переменную ``gameover`` в 1, когда герой ударяется о лезвие. Мы будем использовать ее позже.
Мы также увеличиваем новую переменную ``score``. Мы просто подсчитываем, сколько лезвий прошло мимо игрока и используем это как счет.

Вот полный код цикла *for* внутри функции *update*:

```
  for i=0 to blades.length-1
    if blades[i] < position-120 then
      blades[i] = position+280+random.next()*200
      passed[i] = 0
    end
    if abs(position-blades[i]) < 10 then
      if hero_y < 10 then
        gameover = 1
      elsif not passed[i] then
        passed[i] = 1
        score += 1
      end
    end
  end
```

## Отображение результата

### Отображение счета

Итак, мы записали счет, а как насчет его отображения? Давайте добавим это в
тело функции *draw*:

```
    screen.drawText(score, 120, 80, 20, "#FFF")
```

## Конец

### Конец

Наша игра почти завершена! В следующем уроке мы будем управлять игрой по ходу дела и посмотрим как перезапустить новую игру. Вот полный код, как он должен выглядеть на данный момент:

```
init = function()
  blades = [200, 300, 400]
  passed = [0, 0, 0]
end

update = function()
  position += 2

  if touch.touching and hero_y == 0 then
     hero_vy = 7
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
        gameover = 1
      elsif not passed[i] then
        passed[i] = 1
        score += 1
      end
    end
  end
end

draw = function()
  screen.clear("rgb(57, 0, 57)")

  for i=-6 to 6 by 1
    screen.drawSprite("wall", i*40-position%40, -80, 40)
  end

  screen.drawSprite("hero", -80, -50+hero_y, 20)

  for i=0 to blades.length-1
    screen.drawSprite("blade", blades[i]-position-80, -50, 20)
  end

  screen.drawText(score, 120, 80, 20, "#FFF")
end
```