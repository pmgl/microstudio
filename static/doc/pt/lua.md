# Lua

## Configurando

Você pode escolher usar a linguagem de programação Lua para qualquer um de seus projetos. Abra a guia de configurações do projeto, clique em "Mostrar opções avançadas" e selecione Lua como Linguagem de Programação.

Seu projeto microStudio em Lua pode ser exportado para qualquer plataforma (HTML5, Windows, Mac, Linux, Android...). Você também pode usar qualquer uma das APIs de renderização para 2D ou 3D, bem como qualquer uma das bibliotecas opcionais propostas.

## Dicas

### Chamando métodos de objetos

Tenha cuidado ao chamar funções de objeto (métodos) em Lua, você deve usar `:` ao invés de `.` como no exemplo:

```
screen:clear()
screen:drawSprite("icon",x,y,50)
```

### Verificando entradas de usuário

User inputs can be scanned in microStudio by checking fields in `keyboard`, `touch`, `mouse` or `gamepad` interfaces. For example, to check if the key `A` is pressed, you can check `keyboard.A`. This field can actually have 3 different statuses:
* if you haven't pressed `A` yet in the current session, `keyboard.A` is *undefined*
* `keyboard.A` is equal to `1` (`true` in microScript) if you are currently pressing it
* `keyboard.A` is equal to `0` (`false` in microScript) if have pressed it before and are not currently pressing it

To check for such fields in Lua, it is recommended to check equality with `1`:

```
  if keyboard.A == 1 then
    -- do something when A is pressed
  end
```

### Instanciando classes

Especially when using alternative graphics libs or optional libs, you may have to
instantiate JavaScript objects as if you were using the `new` operator in JavaScript.
To do this, simply call `new(class, arguments)` on the class you want to instantiate:

```
  light = new( BABYLON.HemisphericLight, "light", BABYLON.Vector3.new(0, 1, 0), scene)
```

## Exemplo simples

```
init = function()
  x = 0
  y = 0
end

update = function()
  if keyboard.LEFT == 1 then x = x-1 end
  if keyboard.RIGHT == 1 then x = x+1 end
  if keyboard.UP == 1 then y = y+1 end
  if keyboard.DOWN == 1 then y = y-1 end
end

draw = function()
  screen:clear()
  screen:drawSprite("icon",x,y,50)
end
```
