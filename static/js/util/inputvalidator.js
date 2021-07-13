this.InputValidator = (function() {
  function InputValidator(fields, button, error, callback) {
    var f, j, len, ref;
    this.fields = fields;
    this.button = button;
    this.error = error;
    this.callback = callback;
    if (!Array.isArray(this.fields)) {
      this.fields = [this.fields];
    }
    this.initial = [];
    ref = this.fields;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      this.initial.push(f.value);
      f.addEventListener("input", (function(_this) {
        return function() {
          return _this.change();
        };
      })(this));
      f.addEventListener("keydown", (function(_this) {
        return function(event) {
          if (event.key === "Enter") {
            return _this.validate();
          } else if (event.key === "Escape" && _this.auto_reset) {
            return _this.reset();
          }
        };
      })(this));
    }
    this.button.addEventListener("click", (function(_this) {
      return function() {
        return _this.validate();
      };
    })(this));
    this.button.style.width = 0;
    if (this.error != null) {
      this.error.style.width = 0;
    }
    this.error_timeout = null;
    this.change_timeout = null;
    this.accept_initial = false;
    this.auto_reset = true;
  }

  InputValidator.prototype.set = function(values) {
    var f, i, j, len, ref;
    if (!Array.isArray(values)) {
      values = [values];
    }
    this.initial = [];
    ref = this.fields;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      f = ref[i];
      this.initial.push(f.value = values[i]);
    }
  };

  InputValidator.prototype.reset = function() {
    var f, i, j, len, ref;
    ref = this.fields;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      f = ref[i];
      f.value = this.initial[i];
      f.blur();
    }
    return this.button.style.width = "0px";
  };

  InputValidator.prototype.update = function() {
    var f, i, j, len, ref;
    ref = this.fields;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      f = ref[i];
      this.initial[i] = f.value;
    }
    return this.button.style.width = "0px";
  };

  InputValidator.prototype.check = function() {
    var f, j, len, ref;
    if (this.regex == null) {
      return true;
    }
    ref = this.fields;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      if (!this.regex.test(f.value)) {
        return false;
      }
    }
    return true;
  };

  InputValidator.prototype.change = function() {
    var change, f, i, j, len, ref;
    if (this.error != null) {
      this.error.style.width = 0;
    }
    change = this.accept_initial;
    ref = this.fields;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      f = ref[i];
      if (f.value !== this.initial[i]) {
        change = true;
      }
    }
    if (change && this.check()) {
      this.button.style.removeProperty("width");
      if (this.change_timeout != null) {
        clearTimeout(this.change_timeout);
      }
      if (this.auto_reset) {
        return this.change_timeout = setTimeout(((function(_this) {
          return function() {
            _this.reset();
            return _this.change_timeout = null;
          };
        })(this)), 10000);
      }
    } else {
      return this.button.style.width = "0px";
    }
  };

  InputValidator.prototype.cancelChange = function() {
    return this.button.style.width = 0;
  };

  InputValidator.prototype.showError = function(text) {
    if (this.error == null) {
      return;
    }
    this.error.innerText = text;
    this.error.style.width = "auto";
    if (this.error_timeout) {
      clearTimeout(this.error_timeout);
    }
    return this.error_timeout = setTimeout(((function(_this) {
      return function() {
        _this.error.style.width = "0";
        return _this.error_timeout = null;
      };
    })(this)), 5000);
  };

  InputValidator.prototype.validate = function() {
    var f;
    if (this.change_timeout != null) {
      clearTimeout(this.change_timeout);
    }
    this.callback((function() {
      var j, len, ref, results;
      ref = this.fields;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        f = ref[j];
        results.push(f.value);
      }
      return results;
    }).call(this));
    return this.button.style.width = "0px";
  };

  return InputValidator;

})();
