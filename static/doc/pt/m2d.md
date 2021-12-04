# micro 2D
## Renderização 2D acelerada

micro 2D é uma API simplificada para renderização 2D acelerada. É baseado em Pixi.js. Atualmente é bem restrita, mas crescerá no futuro. Se você estiver procurando por uma API 2D estável e com recursos completos, procure Pixi.js.

### Cena

Configurando a cena:

```
scene = new M2D.Scene()
```

### Adicionando sprites

```
sprite = new M2D.Sprite("icon",32,32)
scene.add(sprite)
```

### Configurando a câmera

```
camera = new M2D.Camera()
```

### Renderização

Em sua função `draw()`, apenas chame `screen.render`, passando sua cena e câmera como argumentos:

```
screen.render(scene, camera)
```

## Exemplos

https://microstudio.dev/i/gilles/m2dtest/
