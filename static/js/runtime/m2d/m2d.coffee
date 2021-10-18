@M2D = {}

@M2D.Scene =
  constructor: ()->
    this.children = []
    this.stage = new PIXI.Container()

@M2D.Camera =
  constructor: ()->
    this.height = 200
    this.width = 0


@M2D.Group =
  constructor: (x)->
    this.x = x



@M2D.Sprite =
  constructor: (x)->
    this.x = x
