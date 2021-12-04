# micro 3D
## API de renderização 3D

micro 3D é uma API 3D simplificada, criada com base no Babylon.js. Atualmente é bem restrita, mas crescerá no futuro. Se você está procurando uma API 3D estável e completa com recursos, procure em Babylon.js.

## Básico

### Habilitando micro 3D

Depois de criar seu projeto, abra a guia de configurações, clique em "Mostrar configurações avançadas" e escolha **micro 3D** como "Biblioteca gráfica".

### Cena

Criando uma nova cena:

```
scene = new M3D.Scene()
scene.setBackground("rgb(9,0,28)")
```

### Adicionando objetos

Adicionando um box simples:

```
box = new M3D.Box()
box.position.set(0,20,0)
box.setColor("rgb(255,192,0)")
```

### Adicionando luzes

Adicionando uma luz direcional:

```
light = new M3D.DirectionalLight(new M3D.Vector3(-1,-.5,1))
light.setColor("rgb(255,217,198)")
```

### Configurando a câmera:

Configurando a câmera:

```
camera = new M3D.Camera()
```

### Renderização

Em sua função `draw()`, apenas chame `screen.render`, passando sua cena e câmera como argumento:

```
draw = function()
  screen.render(scene, camera)
end
```

## Exemplos

https://microstudio.dev/i/gilles/m3dtest/
