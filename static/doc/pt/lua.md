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

As entradas do usuário podem ser verificadas em microStudio verificando os campos nas interfaces `keyboard`,` touch`, `mouse` ou` gamepad`. Por exemplo, para verificar se a tecla `A` está pressionada, você pode verificar` keyboard.A`. Na verdade, este campo pode ter três status diferentes:
* se você não pressionou `A` ainda na sessão atual,` keyboard.A` é *undefined*
* `keyboard.A` é igual a` 1` (`true` em microScript) se você estiver pressionando-o no momento
* `keyboard.A` é igual a` 0` (`false` em microScript) se tiver pressionado antes e não estiver pressionando no momento

Para verificar esses campos em Lua, é recomendado verificar a igualdade com `1`:

```
  if keyboard.A == 1 then
    -- do something when A is pressed
  end
```

### Instanciando classes

Especialmente ao usar bibliotecas gráficas alternativos ou bibliotecas opcionais, você pode ter que instanciar objetos JavaScript como se estivesse usando o operador `new` em JavaScript.
Para fazer isso, basta chamar `new (classe, argumentos)` na classe que deseja instanciar:

```
  light = new(BABYLON.HemisphericLight, "light", BABYLON.Vector3.new(0, 1, 0), scene)
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
