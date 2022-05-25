this.Gamepad = (function() {
  function Gamepad(listener, index) {
    var error, pads;
    this.listener = listener;
    this.index = index != null ? index : 0;
    try {
      if (navigator.getGamepads != null) {
        pads = navigator.getGamepads();
        if (this.index < pads.length && (pads[this.index] != null)) {
          this.pad = pads[this.index];
        }
      }
    } catch (error1) {
      error = error1;
      console.error(error);
    }
    this.buttons_map = {
      0: "A",
      1: "B",
      2: "X",
      3: "Y",
      4: "LB",
      5: "RB",
      8: "VIEW",
      9: "MENU",
      10: "LS",
      11: "RS",
      12: "DPAD_UP",
      13: "DPAD_DOWN",
      14: "DPAD_LEFT",
      15: "DPAD_RIGHT"
    };
    this.triggers_map = {
      6: "LT",
      7: "RT"
    };
    this.status = {
      press: {},
      release: {}
    };
    this.previous = {
      global: {},
      0: {},
      1: {},
      2: {},
      3: {}
    };
  }

  Gamepad.prototype.update = function() {
    var angle, err, i, j, k, key, l, len, len1, len2, m, n, o, pad, pad_count, pads, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, value, x, y;
    try {
      pads = navigator.getGamepads();
    } catch (error1) {
      err = error1;
      return;
    }
    pad_count = 0;
    for (i = j = 0, len = pads.length; j < len; i = ++j) {
      pad = pads[i];
      if (pad == null) {
        break;
      }
      pad_count++;
      if (!this.status[i]) {
        this.status[i] = {
          press: {},
          release: {}
        };
      }
      ref = this.buttons_map;
      for (key in ref) {
        value = ref[key];
        if (pad.buttons[key] != null) {
          this.status[i][value] = pad.buttons[key].pressed ? 1 : 0;
        }
      }
      ref1 = this.triggers_map;
      for (key in ref1) {
        value = ref1[key];
        if (pad.buttons[key] != null) {
          this.status[i][value] = pad.buttons[key].value;
        }
      }
      if (pad.axes.length >= 2) {
        x = pad.axes[0];
        y = -pad.axes[1];
        r = Math.sqrt(x * x + y * y);
        angle = Math.floor(((Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * 360);
        this.status[i].LEFT_STICK_ANGLE = angle;
        this.status[i].LEFT_STICK_AMOUNT = r;
        this.status[i].LEFT_STICK_UP = y > .5;
        this.status[i].LEFT_STICK_DOWN = y < -.5;
        this.status[i].LEFT_STICK_LEFT = x < -.5;
        this.status[i].LEFT_STICK_RIGHT = x > .5;
      }
      if (pad.axes.length >= 4) {
        x = pad.axes[2];
        y = -pad.axes[3];
        r = Math.sqrt(x * x + y * y);
        angle = Math.floor(((Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * 360);
        this.status[i].RIGHT_STICK_ANGLE = angle;
        this.status[i].RIGHT_STICK_AMOUNT = r;
        this.status[i].RIGHT_STICK_UP = y > .5;
        this.status[i].RIGHT_STICK_DOWN = y < -.5;
        this.status[i].RIGHT_STICK_LEFT = x < -.5;
        this.status[i].RIGHT_STICK_RIGHT = x > .5;
      }
    }
    ref2 = this.buttons_map;
    for (key in ref2) {
      value = ref2[key];
      this.status[value] = 0;
      for (k = 0, len1 = pads.length; k < len1; k++) {
        pad = pads[k];
        if (pad == null) {
          break;
        }
        if ((pad.buttons[key] != null) && pad.buttons[key].pressed) {
          this.status[value] = 1;
        }
      }
    }
    ref3 = this.triggers_map;
    for (key in ref3) {
      value = ref3[key];
      this.status[value] = 0;
      for (l = 0, len2 = pads.length; l < len2; l++) {
        pad = pads[l];
        if (pad == null) {
          break;
        }
        if (pad.buttons[key] != null) {
          this.status[value] = pad.buttons[key].value;
        }
      }
    }
    this.status.UP = 0;
    this.status.DOWN = 0;
    this.status.LEFT = 0;
    this.status.RIGHT = 0;
    this.status.LEFT_STICK_UP = 0;
    this.status.LEFT_STICK_DOWN = 0;
    this.status.LEFT_STICK_LEFT = 0;
    this.status.LEFT_STICK_RIGHT = 0;
    this.status.RIGHT_STICK_UP = 0;
    this.status.RIGHT_STICK_DOWN = 0;
    this.status.RIGHT_STICK_LEFT = 0;
    this.status.RIGHT_STICK_RIGHT = 0;
    this.status.LEFT_STICK_ANGLE = 0;
    this.status.LEFT_STICK_AMOUNT = 0;
    this.status.RIGHT_STICK_ANGLE = 0;
    this.status.RIGHT_STICK_AMOUNT = 0;
    this.status.RT = 0;
    this.status.LT = 0;
    for (i = m = 0, ref4 = pad_count - 1; m <= ref4; i = m += 1) {
      this.status[i].UP = this.status[i].DPAD_UP || this.status[i].LEFT_STICK_UP || this.status[i].RIGHT_STICK_UP;
      this.status[i].DOWN = this.status[i].DPAD_DOWN || this.status[i].LEFT_STICK_DOWN || this.status[i].RIGHT_STICK_DOWN;
      this.status[i].LEFT = this.status[i].DPAD_LEFT || this.status[i].LEFT_STICK_LEFT || this.status[i].RIGHT_STICK_LEFT;
      this.status[i].RIGHT = this.status[i].DPAD_RIGHT || this.status[i].LEFT_STICK_RIGHT || this.status[i].RIGHT_STICK_RIGHT;
      if (this.status[i].UP) {
        this.status.UP = 1;
      }
      if (this.status[i].DOWN) {
        this.status.DOWN = 1;
      }
      if (this.status[i].LEFT) {
        this.status.LEFT = 1;
      }
      if (this.status[i].RIGHT) {
        this.status.RIGHT = 1;
      }
      if (this.status[i].LEFT_STICK_UP) {
        this.status.LEFT_STICK_UP = 1;
      }
      if (this.status[i].LEFT_STICK_DOWN) {
        this.status.LEFT_STICK_DOWN = 1;
      }
      if (this.status[i].LEFT_STICK_LEFT) {
        this.status.LEFT_STICK_LEFT = 1;
      }
      if (this.status[i].LEFT_STICK_RIGHT) {
        this.status.LEFT_STICK_RIGHT = 1;
      }
      if (this.status[i].RIGHT_STICK_UP) {
        this.status.RIGHT_STICK_UP = 1;
      }
      if (this.status[i].RIGHT_STICK_DOWN) {
        this.status.RIGHT_STICK_DOWN = 1;
      }
      if (this.status[i].RIGHT_STICK_LEFT) {
        this.status.RIGHT_STICK_LEFT = 1;
      }
      if (this.status[i].RIGHT_STICK_RIGHT) {
        this.status.RIGHT_STICK_RIGHT = 1;
      }
      if (this.status[i].LT) {
        this.status.LT = this.status[i].LT;
      }
      if (this.status[i].RT) {
        this.status.RT = this.status[i].RT;
      }
      if (this.status[i].LEFT_STICK_AMOUNT > this.status.LEFT_STICK_AMOUNT) {
        this.status.LEFT_STICK_AMOUNT = this.status[i].LEFT_STICK_AMOUNT;
        this.status.LEFT_STICK_ANGLE = this.status[i].LEFT_STICK_ANGLE;
      }
      if (this.status[i].RIGHT_STICK_AMOUNT > this.status.RIGHT_STICK_AMOUNT) {
        this.status.RIGHT_STICK_AMOUNT = this.status[i].RIGHT_STICK_AMOUNT;
        this.status.RIGHT_STICK_ANGLE = this.status[i].RIGHT_STICK_ANGLE;
      }
    }
    for (i = n = ref5 = pad_count; n <= 3; i = n += 1) {
      delete this.status[i];
    }
    this.count = pad_count;
    this.updateChanges(this.status, this.previous.global);
    for (i = o = 0, ref6 = pad_count - 1; o <= ref6; i = o += 1) {
      this.updateChanges(this.status[i], this.previous[i]);
    }
  };

  Gamepad.prototype.updateChanges = function(current, previous) {
    var key;
    for (key in current.press) {
      current.press[key] = 0;
    }
    for (key in current.release) {
      current.release[key] = 0;
    }
    for (key in previous) {
      if (previous[key] && !current[key]) {
        current.release[key] = 1;
      }
    }
    for (key in current) {
      if (key === "press" || key === "release") {
        continue;
      }
      if (current[key] && !previous[key]) {
        current.press[key] = 1;
      }
    }
    for (key in previous) {
      previous[key] = 0;
    }
    for (key in current) {
      if (key === "press" || key === "release") {
        continue;
      }
      previous[key] = current[key];
    }
  };

  return Gamepad;

})();
