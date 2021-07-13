this.Keyboard = (function() {
  function Keyboard() {
    document.addEventListener("keydown", (function(_this) {
      return function(event) {
        return _this.keydown(event);
      };
    })(this));
    document.addEventListener("keyup", (function(_this) {
      return function(event) {
        return _this.keyup(event);
      };
    })(this));
    this.keyboard = {
      press: {},
      release: {}
    };
    this.previous = {};
  }

  Keyboard.prototype.convertCode = function(code) {
    var c, i, j, low, ref, res;
    res = "";
    low = false;
    for (i = j = 0, ref = code.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      c = code.charAt(i);
      if (c === c.toUpperCase() && low) {
        res += "_";
        low = false;
      } else {
        low = true;
      }
      res += c.toUpperCase();
    }
    return res;
  };

  Keyboard.prototype.keydown = function(event) {
    var code, key;
    event.preventDefault();
    code = event.code;
    key = event.key;
    this.keyboard[this.convertCode(code)] = 1;
    this.keyboard[key.toUpperCase()] = 1;
    return this.updateDirectional();
  };

  Keyboard.prototype.keyup = function(event) {
    var code, key;
    code = event.code;
    key = event.key;
    this.keyboard[this.convertCode(code)] = 0;
    this.keyboard[key.toUpperCase()] = 0;
    return this.updateDirectional();
  };

  Keyboard.prototype.updateDirectional = function() {
    this.keyboard.UP = this.keyboard.KEY_W || this.keyboard.ARROW_UP;
    this.keyboard.DOWN = this.keyboard.KEY_S || this.keyboard.ARROW_DOWN;
    this.keyboard.LEFT = this.keyboard.KEY_A || this.keyboard.ARROW_LEFT;
    return this.keyboard.RIGHT = this.keyboard.KEY_D || this.keyboard.ARROW_RIGHT;
  };

  Keyboard.prototype.update = function() {
    var key;
    for (key in this.keyboard.press) {
      this.keyboard.press[key] = 0;
    }
    for (key in this.keyboard.release) {
      this.keyboard.release[key] = 0;
    }
    for (key in this.previous) {
      if (this.previous[key] && !this.keyboard[key]) {
        this.keyboard.release[key] = 1;
      }
    }
    for (key in this.keyboard) {
      if (key === "press" || key === "release") {
        continue;
      }
      if (this.keyboard[key] && !this.previous[key]) {
        this.keyboard.press[key] = 1;
      }
    }
    for (key in this.previous) {
      this.previous[key] = 0;
    }
    for (key in this.keyboard) {
      if (key === "press" || key === "release") {
        continue;
      }
      this.previous[key] = this.keyboard[key];
    }
  };

  return Keyboard;

})();
