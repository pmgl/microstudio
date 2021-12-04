# Matter.js

## Macanismo de física 2D

Matter.js é um mecanismo de física 2D de código aberto escrito em JavaScript:

Website: https://brm.io/matter-js/

Repositório no Github: https://github.com/liabru/matter-js

Você pode habilitar e usar Matter.js em seu projeto microStudio, em qualquer linguagem que tenha escolhido: microScript, JavaScript, Python, Lua.

## Básico

### Habilitando Matter.js

Depois de criar seu projeto, abra a guia de configurações e clique em "Mostrar opções avançadas". Marque "Matter.js" para habilitar a biblioteca para seu projeto. A API Matter.js será exposta ao seu código como uma variável global `Matter`.

### Inicializado o mecanismo

Você pode criar um mecanismo Matter com essa linha:
```
engine = Matter.Engine.create()
```
Para obter a gravidade padrão do motor para baixo, defina (**incompleto?**)

### Adicionando formas

A API às vezes requer que você passe objetos JavaScript como argumentos, por exemplo `{isStatic: true}`. No microScript, você passará o objeto microScript equivalente: `object isStatic = true end`. É assim que você pode adicionar um objeto de solo fixo ao seu mundo Matter:

```
ground = Matter.Bodies.rectangle(0,-50,200,10,object isStatic=true end)
Matter.Composite.add(engine.world,ground)
```

Você pode então adicionar uma caixa móvel da seguinte maneira:
```
box = Matter.Bodies.rectangle(0,50,20,20)
Matter.Composite.add(engine.world,box)
```

### Executando a simulação

No corpo da sua função `update()`, apenas chame `Matter.Engine.update`:

```
update = function()
  Matter.Engine.update(engine,1000/60)
end
```

### Desenhando suas formas

No decorrer de sua função `draw ()`, você pode desenhar todas as formas que adicionou ao mundo. Eis um exemplo:

```
draw = function()
  screen.clear()
  screen.drawRect(ground.position.x,ground.position.y,200,10,"rgb(255,0,0)")
  screen.setDrawRotation(box.angle/PI*180)
  screen.drawRect(box.position.x,box.position.y,20,20,"#FF0")
  screen.setDrawRotation(0)
end
```

## Documentação

### Documentação oficial

Referência: https://brm.io/matter-js/docs/

Wiki: https://github.com/liabru/matter-js/wiki

### Projetos de Exemplo

https://microstudio.dev/i/gilles/matterjstest/
