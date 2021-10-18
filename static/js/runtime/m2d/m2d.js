this.M2D = {};

this.M2D.Scene = {
  constructor: function() {
    this.children = [];
    return this.stage = new PIXI.Container();
  }
};

this.M2D.Camera = {
  constructor: function() {
    this.height = 200;
    return this.width = 0;
  }
};

this.M2D.Group = {
  constructor: function(x) {
    return this.x = x;
  }
};

this.M2D.Sprite = {
  constructor: function(x) {
    return this.x = x;
  }
};
