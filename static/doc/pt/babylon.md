# Babylon.js

## API de renderização 3D

Babylon.js é um *mecanismo* de renderização 3D de código aberto baseado em WebGL.

Website: https://www.babylonjs.com/

Github: https://github.com/BabylonJS/Babylon.js

## Básico

### Habilitando Babylon.js

Depois de criar seu projeto, abra a guia de configurações, clique em "Mostrar configurações avançadas" e escolha Babylon.js como "Biblioteca gráfica".

### Cena

Criando uma nova cena:

```
scene = new BABYLON.Scene()
```

### Adicionando objetos

Adicionando um box simples:

```
box = BABYLON.MeshBuilder.CreateBox("box", object end, scene)
box.position.set(0,20,0)
```

### Adicionando luzes

Adicionando uma luz hemisférica:

```
light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
```

### Configurando a câmera

Configurando a câmera:

```
camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -100), scene)
```

### Renderização

Em sua função `draw()`, apenas chame `screen.render`, passando sua cena como argumento:

```
draw = function()
  screen.render(scene)
end
```

## Documentação

### Documentação oficial

https://doc.babylonjs.com/

### Exemplos

https://microstudio.dev/i/gilles/babylontest/
