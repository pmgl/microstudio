this.ValueTool = (function() {
  function ValueTool(editor, x, y, value, callback) {
    var max, min;
    this.editor = editor;
    this.x = x;
    this.y = y;
    this.value = value;
    this.callback = callback;
    this.tool = document.createElement("div");
    this.tool.classList.add("value-tool");
    this.tool.addEventListener('contextmenu', function(event) {
      return event.preventDefault();
    });
    max = Math.max(100, Math.abs(this.value * 2));
    min = -max;
    this.slider = document.createElement("input");
    this.slider.type = "range";
    this.slider.min = min;
    this.slider.max = max;
    this.slider.value = this.value;
    this.slider.addEventListener("input", (function(_this) {
      return function(event) {
        return _this.callback(_this.slider.value);
      };
    })(this));
    this.tool.appendChild(this.slider);
    this.y = Math.max(0, this.y - 60) + document.querySelector("#editor-view .ace_content").getBoundingClientRect().y;
    this.x = Math.max(0, this.x - 150) + document.querySelector("#editor-view .ace_content").getBoundingClientRect().x;
    this.tool.style = "z-index: 20;top:" + this.y + "px;left:" + this.x + "px;";
    document.getElementById("editor-view").appendChild(this.tool);
    this.tool.addEventListener("mousedown", function(event) {
      return event.stopPropagation();
    });
  }

  ValueTool.prototype.dispose = function() {
    return document.getElementById("editor-view").removeChild(this.tool);
  };

  return ValueTool;

})();

this.ColorValueTool = (function() {
  function ColorValueTool(editor, x, y, value, callback) {
    var canvas, context, data, div, err;
    this.editor = editor;
    this.x = x;
    this.y = y;
    this.value = value;
    this.callback = callback;
    this.tool = document.createElement("div");
    this.tool.classList.add("value-tool");
    this.tool.addEventListener('contextmenu', function(event) {
      return event.preventDefault();
    });
    try {
      canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      context = canvas.getContext("2d");
      context.fillStyle = this.value;
      context.fillRect(0, 0, 1, 1);
      data = context.getImageData(0, 0, 1, 1);
    } catch (error) {
      err = error;
    }
    div = document.createElement("div");
    div.classList.add("colortext");
    this.input = document.createElement("input");
    this.input.spellcheck = false;
    this.input.addEventListener("input", (function(_this) {
      return function(event) {
        return _this.colortextChanged();
      };
    })(this));
    this.copy = document.createElement("i");
    this.copy.classList.add("fa");
    this.copy.classList.add("fa-copy");
    this.copy.addEventListener("click", (function(_this) {
      return function(event) {
        _this.copy.classList.remove("fa-copy");
        _this.copy.classList.add("fa-check");
        setTimeout((function() {
          _this.copy.classList.remove("fa-check");
          return _this.copy.classList.add("fa-copy");
        }), 3000);
        return navigator.clipboard.writeText("\"" + _this.input.value + "\"");
      };
    })(this));
    this.picker = new ColorPicker(this);
    this.tool.appendChild(this.picker.canvas);
    this.tool.appendChild(div);
    div.appendChild(this.copy);
    div.appendChild(this.input);
    if (data != null) {
      this.picker.colorPicked(data.data);
    }
    this.y = Math.max(0, this.y - 200) + document.querySelector("#editor-view .ace_content").getBoundingClientRect().y;
    this.x = Math.max(0, this.x + 75) + document.querySelector("#editor-view .ace_content").getBoundingClientRect().x;
    this.tool.style = "z-index: 20;top:" + this.y + "px;left:" + this.x + "px;";
    document.getElementById("editor-view").appendChild(this.tool);
    this.started = true;
    this.tool.addEventListener("mousedown", function(event) {
      return event.stopPropagation();
    });
  }

  ColorValueTool.prototype.colortextChanged = function() {
    this.picker.color = this.input.value;
    return this.picker.colorPicked(this.input.value);
  };

  ColorValueTool.prototype.setColor = function(color) {
    this.color = color;
    if (this.started) {
      this.callback(this.color);
    }
    return this.input.value = this.color;
  };

  ColorValueTool.prototype.dispose = function() {
    return document.getElementById("editor-view").removeChild(this.tool);
  };

  return ColorValueTool;

})();
