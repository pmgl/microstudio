# Python

## Configurando

Você pode escolher usar a linguagem de programação Python para qualquer um de seus projetos. Abra a guia de configurações do projeto, clique em "Mostrar opções avançadas" e selecione Python como Linguagem de Programação.

Seu projeto microStudio em Python pode ser exportado para qualquer plataforma (HTML5, Windows, Mac, Linux, Android ...). Você também pode usar qualquer uma das APIs de renderização para 2D ou 3D, bem como qualquer uma das bibliotecas opcionais propostas.

## Dicas

### Verificando entradas de usuário

As entradas do usuário podem ser escaneadas no microStudio verificando os campos nas interfaces `keyboard`,` touch`, `mouse` ou` gamepad`. Por exemplo, para verificar se a tecla `A` está pressionada, você pode verificar` keyboard.A`. Na verdade, este campo pode ter três status diferentes:
* se você não pressionou `A` ainda na sessão atual,` keyboard.A` é *undefined*
* `keyboard.A` é igual a` 1` (`true` em microScript) se você estiver pressionando-o no momento
* `keyboard.A` é igual a` 0` (`false` em microScript) se tiver pressionado antes e não estiver pressionando no momento

Para verificar esses campos no Python sem erros, você precisa checar se o campo está realmente definido antes de verificar seu valor:

```
  if hasattr(keyboard,"A"):
    if keyboard.A:
      doSomething()
```

Aqui está uma função auxiliar que pode ser útil: 

```
def checkInput(obj,val):
  if hasattr(obj,val):
    return obj[val] != 0
  return 0
```

### Instanciando classes

Especialmente ao usar bibliotecas gráficas alternativos ou bibliotecas opcionais, você pode ter que instanciar objetos JavaScript como se estivesse usando o operador `new` em JavaScript.
Para fazer isso, basta chamar `.new` na classe que deseja instanciar:

```
  light = BABYLON.HemisphericLight.new("light", BABYLON.Vector3.new(0, 1, 0), scene)
```

## Exemplo simples

```
def init():
  global x,y
  x = 0
  y = 0

def checkInput(obj,val):
  if hasattr(obj,val):
    return obj[val] != 0
  return 0

def update():
  global x,y
  if checkInput(keyboard,"LEFT"):
    x = x-1
  if checkInput(keyboard,"RIGHT"):
    x = x+1
  if checkInput(keyboard,"UP"):
    y = y+1
  if checkInput(keyboard,"DOWN"):
    y = y-1
  pass

def draw():
  global x,y
  screen.clear()
  screen.drawSprite("icon",x,y,30)
  pass
```
