this.Watcher = (function() {
  function Watcher(runtime) {
    this.runtime = runtime;
    this.vm = this.runtime.vm;
  }

  Watcher.prototype.update = function() {
    if (this.watching_variables) {
      return this.step();
    }
  };

  Watcher.prototype.watch = function(variables) {
    this.watching = true;
    this.watching_variables = variables;
    this.exclusion_list = [this.vm.context.global.screen, this.vm.context.global.system, this.vm.context.global.keyboard, this.vm.context.global.audio, this.vm.context.global.gamepad, this.vm.context.global.touch, this.vm.context.global.mouse, this.vm.context.global.sprites, this.vm.context.global.maps, this.vm.context.global.sounds, this.vm.context.global.music, this.vm.context.global.assets, this.vm.context.global.asset_manager, this.vm.context.global.fonts, this.vm.context.global.storage];
    if (this.vm.context.global.Function != null) {
      this.exclusion_list.push(this.vm.context.global.Function);
    }
    if (this.vm.context.global.String != null) {
      this.exclusion_list.push(this.vm.context.global.String);
    }
    if (this.vm.context.global.List != null) {
      this.exclusion_list.push(this.vm.context.global.List);
    }
    if (this.vm.context.global.Number != null) {
      this.exclusion_list.push(this.vm.context.global.Number);
    }
    if (this.vm.context.global.Object != null) {
      this.exclusion_list.push(this.vm.context.global.Object);
    }
    if (this.vm.context.global.Image != null) {
      this.exclusion_list.push(this.vm.context.global.Image);
    }
    if (this.vm.context.global.Sound != null) {
      this.exclusion_list.push(this.vm.context.global.Sound);
    }
    if (this.vm.context.global.Sprite != null) {
      this.exclusion_list.push(this.vm.context.global.Sprite);
    }
    if (this.vm.context.global.Map != null) {
      this.exclusion_list.push(this.vm.context.global.Map);
    }
    if (this.vm.context.global.random != null) {
      this.exclusion_list.push(this.vm.context.global.random);
    }
    if (this.vm.context.global.print != null) {
      this.exclusion_list.push(this.vm.context.global.print);
    }
    return this.step();
  };

  Watcher.prototype.stop = function() {
    return this.watching = false;
  };

  Watcher.prototype.step = function(variables) {
    var index, j, len, res, v, value, vs;
    if (variables == null) {
      variables = this.watching_variables;
    }
    if (!this.watching) {
      return;
    }
    res = {};
    for (j = 0, len = variables.length; j < len; j++) {
      v = variables[j];
      if (v === "global") {
        value = this.vm.context.global;
      } else {
        vs = v.split(".");
        value = this.vm.context.global;
        index = 0;
        while (index < vs.length && (value != null)) {
          value = value[vs[index++]];
        }
      }
      if ((value != null) && this.exclusion_list.indexOf(value) < 0) {
        res[v] = this.exploreValue(value, 1, 10);
      }
    }
    return this.runtime.listener.postMessage({
      name: "watch_update",
      data: res
    });
  };

  Watcher.prototype.exploreValue = function(value, depth, array_max) {
    var i, j, key, len, res, v;
    if (depth == null) {
      depth = 1;
    }
    if (array_max == null) {
      array_max = 10;
    }
    if (value == null) {
      return {
        type: "number",
        value: 0
      };
    }
    if (typeof value === "function" || value instanceof Program.Function || (typeof Routine !== "undefined" && Routine !== null) && value instanceof Routine) {
      return {
        type: "function",
        value: ""
      };
    } else if (typeof value === "object") {
      if (Array.isArray(value)) {
        if (depth === 0) {
          return {
            type: "list",
            value: "",
            length: value.length
          };
        }
        res = [];
        for (i = j = 0, len = value.length; j < len; i = ++j) {
          v = value[i];
          if (i >= 100) {
            break;
          }
          if (this.exclusion_list.indexOf(v) < 0) {
            res[i] = this.exploreValue(v, depth - 1, array_max);
          }
        }
        return res;
      } else {
        if (depth === 0) {
          v = "";
          if (value.classname) {
            v = "class " + value.classname;
          }
          if ((value["class"] != null) && (value["class"].classname != null)) {
            v = value["class"].classname;
          }
          return {
            type: "object",
            value: v
          };
        }
        res = {};
        for (key in value) {
          v = value[key];
          if (this.exclusion_list.indexOf(v) < 0) {
            res[key] = this.exploreValue(v, depth - 1, array_max);
          }
        }
        return res;
      }
    } else if (typeof value === "string") {
      return {
        type: "string",
        value: value.length < 43 ? value : value.substring(0, 40) + "..."
      };
    } else if (typeof value === "number") {
      return {
        type: "number",
        value: isFinite(value) ? value : 0
      };
    } else if (typeof value === "boolean") {
      return {
        type: "number",
        value: value ? 1 : 0
      };
    } else {
      return {
        type: "unknown",
        value: value
      };
    }
  };

  return Watcher;

})();
