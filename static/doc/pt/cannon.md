# Cannon

## Mecanismo de física 3D

Cannon.js é um mecanismo de física 3D de código aberto escrito em JavaScript:

Website: https://schteppe.github.io/cannon.js/

Reposítório no Github: https://github.com/schteppe/cannon.js

Você pode habilitar e usar Cannon.js em seu projeto microStudio, m qualquer linguagem que tenha escolhido: microScript, JavaScript, Python, Lua.

## Básico

### Habilitando Cannon.js

Depois de criar seu projeto, abra a guia de configurações e clique em "Mostrar opções avançadas". Marque "Cannon.js" para habilitar a biblioteca para seu projeto. A API Cannon.js será exposta ao seu código como uma variável global `CANNON`.

### Criando o mundo

O primeiro passo é criar o mundo:
```
world = new CANNON.World()
```

Você também pode definir o vetor de gravidade:
```
world.gravity.set(0, 0, -10)
```

### Adicionando formas

A API às vezes requer que você passe objetos JavaScript como argumentos, por exemplo `{mass: 0, shape: new CANNON.Plane ()}`. No microScript, você passará o objeto microScript equivalente: `object mass = 0 shape = new CANNON.Plane () end`.
É assim que você adiciona um objeto de solo fixo ao seu mundo:

```
ground = new CANNON.Body(object
  mass = 0  // quando a massa é definida como zero, o objeto ficará estático
  shape = new CANNON.Plane()
end)

world.addBody(ground)
```

Você pode adicionar uma esfera móvel da seguinte maneira:

```
sphere = new CANNON.Body(object
  mass = 5
  position = new CANNON.Vec3(0,0,200)
  shape = new CANNON.Sphere(5)
end)
world.addBody(sphere)
```

### Executando a simulação

No corpo da sua função `update()`, apenas chame `world.step`:

```
update = function()
  world.step(1/60,1/60,10)
end
```

### Desenhando

In order to visualize your simulation, you will have to create a 3D world using
BABYLON.js or micro 3D. You will create visual objects for each one of your physical objects,
add them to the 3D scene and update their positions.


## Documentação

### Documentação oficial

Referência: https://schteppe.github.io/cannon.js/docs/

Demos: https://schteppe.github.io/cannon.js/

### Projetos de exemplo

https://microstudio.dev/i/gilles/cannondemo/
